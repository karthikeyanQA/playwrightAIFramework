# MCP Configuration Guide

## Overview

This framework uses the **official Playwright MCP server** (`@playwright/mcp`) to enable GitHub Copilot and other MCP-compatible AI agents to control a browser directly from the chat panel in VS Code.

## What Is Configured

### `.vscode/mcp.json`

```json
{
  "servers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

This file is committed to the repository. Any team member who clones the repo and runs `npm run setup` gets the MCP server configured automatically.

---

## Installation Steps

### Step 1: Run the setup command

```bash
npm run setup
```

This installs all npm dependencies, Playwright browsers, and Husky hooks in one command.

### Step 2: Enable the MCP server in VS Code

1. Open VS Code
2. Open the **MCP** panel (or start GitHub Copilot in Agent mode)
3. Click **Start** next to the `playwright` server entry
4. The server will launch via `npx @playwright/mcp@latest`

No additional configuration files or manual steps are needed.

---

## Available Playwright MCP Tools

Once the server is running, GitHub Copilot (Agent mode) can use:

| Tool | What It Does |
|------|-------------|
| `browser_navigate` | Navigate to a URL |
| `browser_click` | Click an element by selector or label |
| `browser_fill` | Type text into an input field |
| `browser_select_option` | Choose a dropdown value |
| `browser_take_screenshot` | Capture a full-page screenshot |
| `browser_snapshot` | Get the accessibility tree snapshot |
| `browser_console_messages` | Read browser console output |
| `browser_network_requests` | Inspect network requests |
| `browser_tab_new` | Open a new browser tab |
| `browser_close` | Close the browser session |

---

## Usage Examples

### Example 1: Visual Page Validation
```
You: "Navigate to http://localhost:3000/login and take a screenshot"

Copilot will:
1. Use browser_navigate to open the page
2. Use browser_take_screenshot to capture it
3. Describe what it sees
```

### Example 2: Form Interaction
```
You: "Fill in the login form with username 'admin' and password 'test123' and submit"

Copilot will:
1. Navigate to the login page
2. Use browser_fill for each field
3. Use browser_click on the submit button
4. Take a screenshot of the result
```

### Example 3: Generate Tests from a Live Page
```
You: "Look at the registration page and generate a Playwright test for it"

Copilot will:
1. Navigate to the registration page
2. Use browser_snapshot to read element selectors
3. Generate a spec file following the framework's POM pattern
```

### Example 4: Debug UI Issues
```
You: "The dashboard page looks broken. Can you check it?"

Copilot will:
1. Navigate to the dashboard URL
2. Take a screenshot
3. Read the accessibility snapshot
4. Report any errors or anomalies
```

---

## Verification

### Check if MCP is Working

1. Open VS Code with GitHub Copilot
2. Switch to **Agent** mode in the Copilot chat
3. Ask: `"Navigate to https://playwright.dev and take a screenshot"`

If the MCP server is running, Copilot will open the browser and return a screenshot.

### Verify Node.js version

```bash
node --version  # needs 18+
```

---

## Troubleshooting

### MCP server does not start

**Problem**: The `playwright` server shows an error in the MCP panel

**Solutions**:
1. Verify Node.js 18+ is installed: `node --version`
2. Try running manually: `npx @playwright/mcp@latest`
3. Reload the VS Code window and try again

### npx cannot find the package

**Problem**: `@playwright/mcp` is not found

**Solution**: Ensure you have internet access and npm is working:
```bash
npx @playwright/mcp@latest --version
```

### Browser does not open

**Problem**: Tools run but no browser window appears

**Solution**: The server runs in headless mode by default. To run headed, update `.vscode/mcp.json`:

```json
{
  "servers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--headed"]
    }
  }
}
```

---

## Security Considerations

✅ The MCP server only controls the browser during your active session  
✅ No file system write access is granted by default  
✅ `.vscode/mcp.json` contains no credentials  
⚠️ Review AI-generated test code before committing  
⚠️ Do not enter real credentials into pages controlled by an AI agent  

---

## References

- [Playwright MCP on GitHub](https://github.com/microsoft/playwright-mcp)
- [Playwright Docs](https://playwright.dev/)
- [MCP_INTEGRATION.md](MCP_INTEGRATION.md) — Detailed integration guide
- [MCP_CONFIGURATION_SUMMARY.md](MCP_CONFIGURATION_SUMMARY.md) — Configuration summary
