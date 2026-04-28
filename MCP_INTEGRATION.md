# 🔌 MCP (Model Context Protocol) Integration

## 🎯 What is MCP?

**Model Context Protocol (MCP)** is an open-source protocol that enables AI models to securely access local and remote resources. It allows AI assistants like Claude to:

- 📁 Access your codebase
- 🧪 Read test results
- 📊 Analyze logs and reports
- 🔧 Understand project structure
- 🤖 Generate contextual code

---

## ✅ Framework MCP Compatibility

This framework is **MCP-ready** with:

✅ **Structured Data** - JSON outputs, typed interfaces  
✅ **Clear Documentation** - JSDoc, README files  
✅ **Standard Patterns** - Easy for AI to learn  
✅ **Readable Logs** - Winston structured logging  
✅ **Type Safety** - TypeScript definitions  
✅ **Modular Design** - Clear component boundaries  

---

## 🚀 Setting Up MCP with Claude Code

### 1. Install Claude Desktop App

Download from: https://claude.ai/download

### 2. Configure MCP Server

Create or edit `~/Library/Application\ Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "playwright-framework": {
      "command": "node",
      "args": ["/path/to/your/Playwright-POM/mcp-server.js"],
      "env": {
        "FRAMEWORK_ROOT": "/Users/you/Documents/DXC/Playwright-POM"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/you/Documents/DXC/Playwright-POM"]
    }
  }
}
```

### 3. Create MCP Server (Basic)

Create `mcp-server.js` in your framework root:

```javascript
#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const fs = require('fs').promises;
const path = require('path');

const FRAMEWORK_ROOT = process.env.FRAMEWORK_ROOT || process.cwd();

const server = new Server(
  {
    name: 'playwright-framework',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// List available resources
server.setRequestHandler('resources/list', async () => {
  return {
    resources: [
      {
        uri: `file://${FRAMEWORK_ROOT}/src/tests`,
        name: 'Test Files',
        mimeType: 'application/x-directory',
        description: 'All test specifications',
      },
      {
        uri: `file://${FRAMEWORK_ROOT}/src/pages`,
        name: 'Page Objects',
        mimeType: 'application/x-directory',
        description: 'Page Object Model files',
      },
      {
        uri: `file://${FRAMEWORK_ROOT}/test-results/results.json`,
        name: 'Test Results',
        mimeType: 'application/json',
        description: 'Latest test execution results',
      },
      {
        uri: `file://${FRAMEWORK_ROOT}/logs/combined.log`,
        name: 'Test Logs',
        mimeType: 'text/plain',
        description: 'Combined test execution logs',
      },
      {
        uri: `file://${FRAMEWORK_ROOT}/README.md`,
        name: 'Framework Documentation', 
        mimeType: 'text/markdown',
        description: 'Complete framework documentation',
      },
    ],
  };
});

// Read resource content
server.setRequestHandler('resources/read', async (request) => {
  const url = new URL(request.params.uri);
  const filePath = url.pathname;

  try {
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
  } catch (error) {
    throw new Error(`Failed to read ${filePath}: ${error.message}`);
  }
});

// List available tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'run_tests',
        description: 'Run Playwright tests with specified tags or files',
        inputSchema: {
          type: 'object',
          properties: {
            tag: {
              type: 'string',
              description: 'Test tag to run (e.g., @smoke, @api, @ui)',
            },
            file: {
              type: 'string',
              description: 'Specific test file to run',
            },
          },
        },
      },
      {
        name: 'analyze_failures',
        description: 'Analyze failed tests and provide insights',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'generate_test',
        description: 'Generate a new test based on description',
        inputSchema: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Description of the test to generate',
            },
            type: {
              type: 'string',
              enum: ['ui', 'api'],
              description: 'Type of test to generate',
            },
          },
          required: ['description', 'type'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'run_tests') {
    // Execute tests
    const { execSync } = require('child_process');
    const tag = args.tag ? `--grep "${args.tag}"` : '';
    const file = args.file || '';
    const command = `cd ${FRAMEWORK_ROOT} && npx playwright test ${file} ${tag}`;
    
    try {
      const output = execSync(command, { encoding: 'utf-8' });
      return {
        content: [
          {
            type: 'text',
            text: output,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Test execution failed:\n${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (name === 'analyze_failures') {
    // Read test results and analyze
    try {
      const resultsPath = path.join(FRAMEWORK_ROOT, 'test-results', 'results.json');
      const results = JSON.parse(await fs.readFile(resultsPath, 'utf-8'));
      
      const failed = results.suites
        .flatMap(s => s.specs)
        .filter(t => t.ok === false);
      
      const analysis = {
        totalFailed: failed.length,
        failures: failed.map(t => ({
          test: t.title,
          error: t.tests[0]?.results[0]?.error?.message,
        })),
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(analysis, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Analysis failed: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Playwright Framework MCP Server running');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
```

### 4. Install MCP SDK

```bash
npm install @modelcontextprotocol/sdk
```

---

## 🎯 How to Use MCP with Claude

### Example Prompts

Once MCP is configured, you can ask Claude:

**1. Analyze Test Results**
```
"Read the latest test results and tell me which tests failed and why"

Claude will:
- Access test-results/results.json
- Parse failures
- Provide summary with error messages
```

**2. Review Code Structure**
```
"Show me all page objects in the framework"

Claude will:
- Access src/pages/ directory
- List all page object files
- Explain their purpose
```

**3. Generate Tests**
```
"Create a test for adding items to shopping cart"

Claude will:
- Read existing test patterns
- Generate test following framework style
- Include proper imports and assertions
```

**4. Debug Failures**
```
"Why is the login test failing?"

Claude will:
- Read test file
- Access logs
- Analyze error
- Suggest fix
```

---

## 📁 MCP-Accessible Resources

The framework exposes these resources to Claude via MCP:

### Source Code
```
src/
├── pages/           → Page Object Models
├── tests/           → Test specifications
├── utils/           → Utility functions
├── config/          → Configuration
├── data/            → Test data
└── models/          → TypeScript interfaces
```

### Test Outputs
```
test-results/
├── results.json     → Test execution results
├── junit.xml        → CI/CD integration
└── screenshots/     → Failure screenshots
```

### Logs
```
logs/
├── combined.log     → All logs
├── error.log        → Errors only
└── debug.log        → Debug information
```

### Reports
```
playwright-report/   → HTML test report
allure-results/      → Allure test data
allure-report/       → Allure HTML report
```

---

## 🛠️ MCP Tools

The framework provides these tools via MCP:

### 1. **run_tests**
Execute tests with tags or specific files

```javascript
// Claude can execute:
run_tests({ tag: "@smoke" })
run_tests({ file: "src/tests/api/demo-api.spec.ts" })
```

### 2. **analyze_failures**
Analyze failed tests and provide insights

```javascript
// Claude analyzes:
analyze_failures({})
// Returns: Summary of failures with error messages
```

### 3. **generate_test**
Generate new tests based on description

```javascript
// Claude generates:
generate_test({
  description: "Verify user can checkout with saved payment method",
  type: "ui"
})
```

---

## 💡 MCP Use Cases

### 1. Test Maintenance

**Scenario**: UI selectors changed

```
You: "The login button selector changed to .login-btn. Update all files."

Claude (via MCP):
1. Searches codebase for old selector
2. Identifies LoginPage needs update
3. Suggests change:
   - this.loginButton = page.locator('#login-button');
   + this.loginButton = page.locator('.login-btn');
4. Updates test data if needed
```

### 2. Failure Analysis

**Scenario**: Tests failing after deployment

```
You: "Tests are failing after the latest deployment. What's wrong?"

Claude (via MCP):
1. Reads test-results/results.json
2. Analyzes logs/error.log
3. Identifies pattern: "API timeout errors"
4. Suggests: "Increase API_TIMEOUT in .env from 30000 to 60000"
```

### 3. Test Generation

**Scenario**: New feature needs tests

```
You: "Generate tests for the new password reset feature"

Claude (via MCP):
1. Reads existing test patterns
2. Creates PasswordResetPage page object
3. Generates test spec with:
   - Request reset link
   - Verify email sent
   - Click reset link
   - Enter new password
   - Verify password changed
```

### 4. Documentation

**Scenario**: Need to document test coverage

```
You: "Create a test coverage report"

Claude (via MCP):
1. Analyzes all test files
2. Lists features tested
3. Identifies gaps
4. Generates coverage.md:
   - Features with tests: ✅
   - Features without tests: ❌
   - Recommendations
```

---

## 🔐 Security Considerations

MCP integrations should:

✅ **Read-only access** to logs and results (default)  
✅ **Controlled file access** via specific paths  
✅ **Sandboxed execution** for generated code  
⚠️ **Review AI suggestions** before committing  
⚠️ **Validate generated tests** before running  

---

## 📊 MCP Benefits

| Task | Without MCP | With MCP |
|------|-------------|----------|
| Analyze failures | Manual log reading | AI summarizes instantly |
| Generate tests | Write from scratch | AI generates following patterns |
| Update selectors | Find & replace manually | AI updates across files |
| Debug issues | Trial and error | AI suggests targeted fixes |
| Documentation | Manual writing | AI auto-generates docs |

---

## 🚀 Advanced MCP Features

### Custom Tools

Add more tools to `mcp-server.js`:

```javascript
{
  name: 'update_selectors',
  description: 'Update selectors across all page objects',
  inputSchema: {
    type: 'object',
    properties: {
      old: { type: 'string' },
      new: { type: 'string' },
    },
  },
}

{
  name: 'generate_page_object',
  description: 'Generate page object from URL',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      name: { type: 'string' },
    },
  },
}
```

---

## ✅ MCP Integration Checklist

- ✅ Framework has structured outputs (JSON, logs)
- ✅ Clear file organization
- ✅ Type-safe TypeScript code
- ✅ Comprehensive documentation
- ✅ Consistent patterns throughout
- ✅ External test data
- ✅ Modular architecture
- ✅ Detailed error messages

**Your framework is MCP-ready!** 🔌

---

## 📚 Resources

- [MCP Official Docs](https://modelcontextprotocol.io/)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)
- [Claude Desktop](https://claude.ai/download)

---

**Start using MCP with Claude today!** 🤖✨
