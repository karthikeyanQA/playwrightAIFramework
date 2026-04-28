#!/usr/bin/env node

/**
 * Playwright Framework MCP Server
 * Enables Claude Code to interact with the test framework
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const FRAMEWORK_ROOT = process.env.FRAMEWORK_ROOT || process.cwd();

class PlaywrightMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'playwright-framework-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupHandlers() {
    // List available resources
    this.server.setRequestHandler('resources/list', async () => {
      return {
        resources: [
          {
            uri: `file://${FRAMEWORK_ROOT}/src/tests`,
            name: 'Test Specifications',
            mimeType: 'application/x-directory',
            description: 'All test files (UI and API tests)',
          },
          {
            uri: `file://${FRAMEWORK_ROOT}/src/pages`,
            name: 'Page Objects',
            mimeType: 'application/x-directory',
            description: 'Page Object Model files',
          },
          {
            uri: `file://${FRAMEWORK_ROOT}/src/utils`,
            name: 'Utilities',
            mimeType: 'application/x-directory',
            description: 'Framework utilities and helpers',
          },
          {
            uri: `file://${FRAMEWORK_ROOT}/test-results/results.json`,
            name: 'Latest Test Results',
            mimeType: 'application/json',
            description: 'Most recent test execution results',
          },
          {
            uri: `file://${FRAMEWORK_ROOT}/logs/combined.log`,
            name: 'Test Logs',
            mimeType: 'text/plain',
            description: 'Combined test execution logs',
          },
          {
            uri: `file://${FRAMEWORK_ROOT}/logs/error.log`,
            name: 'Error Logs',
            mimeType: 'text/plain',
            description: 'Error logs only',
          },
          {
            uri: `file://${FRAMEWORK_ROOT}/allure-results`,
            name: 'Allure Results',
            mimeType: 'application/x-directory',
            description: 'Allure test report data',
          },
          {
            uri: `file://${FRAMEWORK_ROOT}/README.md`,
            name: 'Framework Documentation',
            mimeType: 'text/markdown',
            description: 'Complete framework documentation',
          },
          {
            uri: `file://${FRAMEWORK_ROOT}/playwright.config.ts`,
            name: 'Playwright Configuration',
            mimeType: 'application/typescript',
            description: 'Playwright test configuration',
          },
        ],
      };
    });

    // Read resource content
    this.server.setRequestHandler('resources/read', async (request) => {
      const url = new URL(request.params.uri);
      const filePath = url.pathname;

      try {
        const stats = await fs.stat(filePath);

        if (stats.isDirectory()) {
          // List directory contents
          const files = await fs.readdir(filePath);
          const fileList = files.join('\n');
          return {
            contents: [
              {
                uri: request.params.uri,
                mimeType: 'text/plain',
                text: `Directory contents:\n${fileList}`,
              },
            ],
          };
        } else {
          // Read file content
          const content = await fs.readFile(filePath, 'utf-8');
          return {
            contents: [
              {
                uri: request.params.uri,
                mimeType: 'text/plain',
                text: content,
              },
            ],
          };
        }
      } catch (error) {
        throw new Error(`Failed to read ${filePath}: ${error.message}`);
      }
    });

    // List available tools
    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'run_tests',
            description: 'Run Playwright tests with optional tag or file filter',
            inputSchema: {
              type: 'object',
              properties: {
                tag: {
                  type: 'string',
                  description: 'Test tag to filter (@smoke, @api, @ui, @regression)',
                },
                file: {
                  type: 'string',
                  description: 'Specific test file path to run',
                },
                project: {
                  type: 'string',
                  description: 'Browser project (chromium, firefox, webkit)',
                },
                headed: {
                  type: 'boolean',
                  description: 'Run tests in headed mode',
                  default: false,
                },
              },
            },
          },
          {
            name: 'analyze_test_results',
            description: 'Analyze latest test results and provide summary',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'analyze_failures',
            description: 'Analyze failed tests and provide detailed insights',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_test_logs',
            description: 'Retrieve test execution logs',
            inputSchema: {
              type: 'object',
              properties: {
                lines: {
                  type: 'number',
                  description: 'Number of lines to retrieve (default: 100)',
                  default: 100,
                },
                errorOnly: {
                  type: 'boolean',
                  description: 'Get error logs only',
                  default: false,
                },
              },
            },
          },
          {
            name: 'list_tests',
            description: 'List all available test files',
            inputSchema: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['ui', 'api', 'all'],
                  description: 'Type of tests to list',
                  default: 'all',
                },
              },
            },
          },
          {
            name: 'get_test_coverage',
            description: 'Get overview of test coverage by feature',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Handle tool execution
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'run_tests':
            return await this.runTests(args);
          case 'analyze_test_results':
            return await this.analyzeTestResults();
          case 'analyze_failures':
            return await this.analyzeFailures();
          case 'get_test_logs':
            return await this.getTestLogs(args);
          case 'list_tests':
            return await this.listTests(args);
          case 'get_test_coverage':
            return await this.getTestCoverage();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async runTests(args) {
    const { tag, file, project, headed } = args;
    
    let command = `cd ${FRAMEWORK_ROOT} && npx playwright test`;
    
    if (file) command += ` ${file}`;
    if (tag) command += ` --grep "${tag}"`;
    if (project) command += ` --project=${project}`;
    if (headed) command += ` --headed`;

    try {
      const output = execSync(command, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
      return {
        content: [
          {
            type: 'text',
            text: `Test execution completed:\n\n${output}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Test execution output:\n\n${error.stdout}\n\nErrors:\n${error.stderr}`,
          },
        ],
      };
    }
  }

  async analyzeTestResults() {
    try {
      const resultsPath = path.join(FRAMEWORK_ROOT, 'test-results', 'results.json');
      const results = JSON.parse(await fs.readFile(resultsPath, 'utf-8'));

      const passed = [];
      const failed = [];
      const skipped = [];

      results.suites.forEach(suite => {
        suite.specs.forEach(spec => {
          const test = spec.tests[0];
          if (test.results[0].status === 'passed') {
            passed.push(spec.title);
          } else if (test.results[0].status === 'failed') {
            failed.push({
              title: spec.title,
              error: test.results[0].error?.message || 'Unknown error',
            });
          } else {
            skipped.push(spec.title);
          }
        });
      });

      const summary = {
        total: passed.length + failed.length + skipped.length,
        passed: passed.length,
        failed: failed.length,
        skipped: skipped.length,
        passRate: ((passed.length / (passed.length + failed.length)) * 100).toFixed(2) + '%',
        failedTests: failed,
      };

      return {
        content: [
          {
            type: 'text',
            text: `Test Results Summary:\n\n${JSON.stringify(summary, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `No test results found. Run tests first with run_tests tool.`,
          },
        ],
      };
    }
  }

  async analyzeFailures() {
    try {
      const resultsPath = path.join(FRAMEWORK_ROOT, 'test-results', 'results.json');
      const results = JSON.parse(await fs.readFile(resultsPath, 'utf-8'));

      const failures = [];

      results.suites.forEach(suite => {
        suite.specs.forEach(spec => {
          const test = spec.tests[0];
          if (test.results[0].status === 'failed') {
            failures.push({
              suite: suite.title,
              test: spec.title,
              file: spec.file,
              error: test.results[0].error?.message || 'Unknown error',
              stack: test.results[0].error?.stack,
            });
          }
        });
      });

      if (failures.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No failed tests found! All tests passed. 🎉',
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Failed Tests Analysis (${failures.length} failures):\n\n${JSON.stringify(failures, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Could not analyze failures: ${error.message}`,
          },
        ],
      };
    }
  }

  async getTestLogs(args) {
    const { lines = 100, errorOnly = false } = args;
    const logFile = errorOnly ? 'error.log' : 'combined.log';
    const logPath = path.join(FRAMEWORK_ROOT, 'logs', logFile);

    try {
      const content = await fs.readFile(logPath, 'utf-8');
      const logLines = content.split('\n').slice(-lines).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `Last ${lines} lines from ${logFile}:\n\n${logLines}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Could not read logs: ${error.message}`,
          },
        ],
      };
    }
  }

  async listTests(args) {
    const { type = 'all' } = args;
    const testsDir = path.join(FRAMEWORK_ROOT, 'src', 'tests');

    try {
      let files = [];

      if (type === 'all' || type === 'ui') {
        const uiFiles = await fs.readdir(path.join(testsDir, 'ui'));
        files.push(...uiFiles.map(f => `ui/${f}`));
      }

      if (type === 'all' || type === 'api') {
        const apiFiles = await fs.readdir(path.join(testsDir, 'api'));
        files.push(...apiFiles.map(f => `api/${f}`));
      }

      return {
        content: [
          {
            type: 'text',
            text: `Available ${type} tests:\n\n${files.join('\n')}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Could not list tests: ${error.message}`,
          },
        ],
      };
    }
  }

  async getTestCoverage() {
    try {
      const testsDir = path.join(FRAMEWORK_ROOT, 'src', 'tests');
      const uiTests = (await fs.readdir(path.join(testsDir, 'ui'))).length;
      const apiTests = (await fs.readdir(path.join(testsDir, 'api'))).length;

      const coverage = {
        totalTests: uiTests + apiTests,
        uiTests,
        apiTests,
        testTypes: {
          ui: uiTests,
          api: apiTests,
        },
      };

      return {
        content: [
          {
            type: 'text',
            text: `Test Coverage Overview:\n\n${JSON.stringify(coverage, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Could not gather coverage: ${error.message}`,
          },
        ],
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Playwright Framework MCP Server running on stdio');
  }
}

// Start the server
const server = new PlaywrightMCPServer();
server.run().catch(console.error);
