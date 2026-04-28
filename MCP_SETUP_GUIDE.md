# MCP Configuration Guide

## Overview

The Model Context Protocol (MCP) has been configured for your Playwright framework, enabling Claude Code and Claude Desktop to directly interact with your test automation suite.

## What Was Configured

### 1. **MCP Server** (`mcp-server.js`)
   - Full-featured MCP server implementation
   - Provides access to test files, results, logs, and documentation
   - Offers 6 powerful tools for test execution and analysis

### 2. **Claude Desktop Configuration**
   - **Location**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Server Name**: `playwright-framework`
   - **Status**: ✅ Configured and ready

### 3. **Project Configuration** (`mcp.json`)
   - Reference configuration file in your project root
   - Documents available capabilities and usage examples

---

## Installation Steps

### Step 1: Install MCP SDK

```bash
cd /Users/karthikeyansounderrajan/Documents/DXC/Playwright-POM
npm install @modelcontextprotocol/sdk
```

### Step 2: Verify Server Executable

Make the MCP server executable:

```bash
chmod +x mcp-server.js
```

### Step 3: Test the MCP Server

Test the server locally:

```bash
node mcp-server.js
```

You should see the server initialize. Press Ctrl+C to stop.

### Step 4: Restart Claude Desktop

**Important**: Restart Claude Desktop to load the new MCP configuration:

1. Quit Claude Desktop completely (Cmd+Q)
2. Relaunch Claude Desktop
3. The MCP server will automatically connect

---

## Available MCP Resources

Claude can now access these resources from your framework:

| Resource | URI | Description |
|----------|-----|-------------|
| **Test Files** | `test-files://list` | List all test files in src/tests/ |
| **Test Results** | `test-results://latest` | Latest test execution results (JSON) |
| **Test Logs** | `logs://combined` | Combined test logs |
| **Error Logs** | `logs://errors` | Error-only logs |
| **Documentation** | `docs://readme` | Framework README |
| **Configuration** | `config://playwright` | Playwright configuration |

---

## Available MCP Tools

Claude can use these tools to interact with your tests:

### 1. **run_tests**
Execute Playwright tests with various filters

**Parameters:**
- `tag` (optional): Run tests with specific tag (@smoke, @api, @ui, @regression)
- `file` (optional): Run specific test file
- `project` (optional): Run on specific browser (chromium, firefox, webkit)
- `headed` (optional): Run in headed mode

**Example Prompts:**
```
"Run all smoke tests"
"Run the demo-api tests in headed mode"
"Run tests tagged @regression on Firefox"
"Execute all API tests"
```

### 2. **analyze_test_results**
Analyze the latest test execution results

**Returns:**
- Total tests, passed, failed, skipped
- Success rate percentage
- Failed test details
- Execution duration

**Example Prompts:**
```
"Analyze the latest test results"
"What's the success rate of the last test run?"
"Show me test execution summary"
```

### 3. **analyze_failures**
Deep analysis of failed tests

**Returns:**
- Failed test names and error messages
- Stack traces
- Failure patterns
- Recommendations

**Example Prompts:**
```
"Why did tests fail?"
"Analyze test failures"
"Show me failure details"
```

### 4. **get_test_logs**
Retrieve test execution logs

**Parameters:**
- `type`: 'combined' (all logs) or 'error' (errors only)
- `lines` (optional): Number of recent lines (default: 100)

**Example Prompts:**
```
"Show me the last 50 lines of test logs"
"Get error logs from the last test run"
"Display recent test execution logs"
```

### 5. **list_tests**
List all available tests

**Parameters:**
- `tag` (optional): Filter by tag (@smoke, @api, @ui)

**Example Prompts:**
```
"List all tests"
"Show me all smoke tests"
"What API tests are available?"
```

### 6. **get_test_coverage**
Get test coverage information

**Returns:**
- Total test count by type
- Tag distribution
- Test organization summary

**Example Prompts:**
```
"Show test coverage"
"How many tests do we have?"
"What's the test distribution?"
```

---

## Usage Examples

### Example 1: Run Smoke Tests and Analyze
```
You: "Run all smoke tests using MCP and analyze the results"

Claude will:
1. Use run_tests tool with tag "@smoke"
2. Execute tests and capture output
3. Use analyze_test_results to show summary
4. Provide insights and recommendations
```

### Example 2: Debug Failed Tests
```
You: "My tests are failing. Can you help debug?"

Claude will:
1. Use get_test_logs to check recent logs
2. Use analyze_failures to identify issues
3. Examine error patterns
4. Suggest fixes based on error messages
```

### Example 3: Generate New Tests
```
You: "Create new API tests for user authentication"

Claude will:
1. Use list_tests to check existing tests
2. Read test files using resources
3. Use config://playwright to understand setup
4. Generate new tests following existing patterns
```

### Example 4: Test Coverage Analysis
```
You: "What's our test coverage and what's missing?"

Claude will:
1. Use get_test_coverage to get overview
2. Use list_tests to see test distribution
3. Analyze gaps in coverage
4. Recommend additional test cases
```

---

## Verification

### Check if MCP is Working

1. **Open Claude Desktop**
2. **Start a new conversation**
3. **Ask**: "Can you list all available tests in my Playwright framework?"

If MCP is working, Claude will use the `list_tests` tool and show your test files.

### Verify Configuration

Check that the config file exists:

```bash
ls -la "$HOME/Library/Application Support/Claude/claude_desktop_config.json"
cat "$HOME/Library/Application Support/Claude/claude_desktop_config.json"
```

Expected output:
```json
{
  "mcpServers": {
    "playwright-framework": {
      "command": "node",
      "args": [
        "/Users/karthikeyansounderrajan/Documents/DXC/Playwright-POM/mcp-server.js"
      ],
      "env": {
        "FRAMEWORK_ROOT": "/Users/karthikeyansounderrajan/Documents/DXC/Playwright-POM"
      }
    }
  }
}
```

---

## Troubleshooting

### MCP Server Not Found

**Problem**: Claude can't find the MCP server

**Solutions**:
1. Verify the file path in `claude_desktop_config.json` is correct
2. Ensure `mcp-server.js` is executable: `chmod +x mcp-server.js`
3. Restart Claude Desktop completely

### Missing Dependencies

**Problem**: Error about missing @modelcontextprotocol/sdk

**Solution**:
```bash
cd /Users/karthikeyansounderrajan/Documents/DXC/Playwright-POM
npm install @modelcontextprotocol/sdk
```

### MCP Tools Not Available

**Problem**: Claude doesn't show MCP tools

**Solutions**:
1. Restart Claude Desktop (Cmd+Q, then relaunch)
2. Check MCP server logs: Run `node mcp-server.js` directly
3. Verify Node.js version: `node --version` (needs 18+)

### Permission Errors

**Problem**: Cannot write to Claude config directory

**Solution**:
```bash
mkdir -p "$HOME/Library/Application Support/Claude"
chmod 755 "$HOME/Library/Application Support/Claude"
```

---

## Advanced Configuration

### Multiple Environments

You can configure different MCP servers for different environments:

```json
{
  "mcpServers": {
    "playwright-framework-dev": {
      "command": "node",
      "args": ["/path/to/mcp-server.js"],
      "env": {
        "FRAMEWORK_ROOT": "/path/to/framework",
        "ENV": "dev"
      }
    },
    "playwright-framework-qa": {
      "command": "node",
      "args": ["/path/to/mcp-server.js"],
      "env": {
        "FRAMEWORK_ROOT": "/path/to/framework",
        "ENV": "qa"
      }
    }
  }
}
```

### Custom Log Levels

Set log level in the MCP server environment:

```json
{
  "mcpServers": {
    "playwright-framework": {
      "command": "node",
      "args": ["/path/to/mcp-server.js"],
      "env": {
        "FRAMEWORK_ROOT": "/path/to/framework",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

---

## Integration with Claude Code

This MCP server works with:

- **Claude Desktop**: Full MCP integration
- **Claude Code (VS Code Extension)**: Direct test execution from editor
- **Claude API**: Programmatic access to test tools

To use with Claude Code in VS Code:
1. Install the Claude Code extension
2. The MCP server will be automatically detected
3. Use natural language commands to run tests

---

## Security Considerations

### Safe Practices

✅ **Do:**
- Keep sensitive data in `.env` files (already gitignored)
- Use environment-specific configurations
- Review test results before sharing
- Limit MCP server access to localhost

❌ **Don't:**
- Commit credentials or API keys
- Expose MCP server to network
- Share logs containing sensitive data

### Data Access

The MCP server has read access to:
- Test files in `src/tests/`
- Test results in `test-results/`
- Logs in `logs/`
- Documentation in project root

The MCP server can execute:
- Playwright test commands
- File system reads (within FRAMEWORK_ROOT)
- Log analysis

The MCP server **cannot**:
- Modify source code (read-only access)
- Access files outside FRAMEWORK_ROOT
- Make network calls (except test execution)
- Delete or modify test results

---

## Next Steps

### 1. Install MCP SDK
```bash
npm install @modelcontextprotocol/sdk
```

### 2. Restart Claude Desktop
Cmd+Q to quit, then relaunch

### 3. Test the Integration
Open Claude Desktop and ask:
```
"List all my Playwright tests"
"Run smoke tests and show me the results"
```

### 4. Explore MCP Capabilities
Try these prompts:
- "Analyze test failures from the last run"
- "Show me error logs"
- "Create a new API test for login functionality"
- "What's the test coverage for API tests?"

---

## File Locations

- **MCP Server**: `/Users/karthikeyansounderrajan/Documents/DXC/Playwright-POM/mcp-server.js`
- **Claude Config**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Project Config**: `/Users/karthikeyansounderrajan/Documents/DXC/Playwright-POM/mcp.json`
- **Documentation**: See `MCP_INTEGRATION.md` for detailed integration guide

---

## Support

For MCP-related questions:
- **MCP Specification**: https://github.com/modelcontextprotocol/specification
- **MCP SDK Documentation**: https://github.com/modelcontextprotocol/sdk
- **Claude Desktop**: https://claude.ai/download

For framework-specific questions:
- See `README.md` for framework documentation
- See `AGENTIC_CAPABILITIES.md` for AI integration features
- See `ALLURE_INTEGRATION.md` for reporting setup

---

## Quick Reference

### MCP Status Checklist

- [x] MCP server created (`mcp-server.js`)
- [x] Claude Desktop config created
- [x] Project config documented (`mcp.json`)
- [ ] MCP SDK installed (`npm install @modelcontextprotocol/sdk`)
- [ ] Claude Desktop restarted
- [ ] MCP integration verified

### Essential Commands

```bash
# Install MCP SDK
npm install @modelcontextprotocol/sdk

# Test MCP server
node mcp-server.js

# Verify Claude config
cat "$HOME/Library/Application Support/Claude/claude_desktop_config.json"

# Run tests normally
npm test

# Run tests with tag
npm run test:smoke
```

---

**MCP configuration is complete! 🎉**

Install the MCP SDK, restart Claude Desktop, and you're ready to interact with your Playwright framework through natural language!
