# 🔌 MCP (Model Context Protocol) Integration

## 🎯 What is MCP?

**Model Context Protocol (MCP)** is an open-source protocol that enables AI models to securely access local and remote resources. It allows AI assistants like GitHub Copilot and Claude to:

- 🌐 Control a real browser
- 🧪 Interact with web pages during testing
- 📸 Capture screenshots
- 🔧 Inspect the DOM, network, and console

---

## ✅ Framework MCP Compatibility

This framework ships with the **official Playwright MCP server** configured in `.vscode/mcp.json`, powered by `@playwright/mcp`:

✅ **Structured Data** - JSON outputs, typed interfaces  
✅ **Clear Documentation** - JSDoc, README files  
✅ **Standard Patterns** - Easy for AI to learn  
✅ **Readable Logs** - Winston structured logging  
✅ **Type Safety** - TypeScript definitions  
✅ **Modular Design** - Clear component boundaries  

---

## 🚀 Setting Up MCP in VS Code

### 1. Install all dependencies

```bash
npm run setup
```

### 2. Enable the Playwright MCP server

The `.vscode/mcp.json` is already configured:

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

In VS Code, open the MCP panel (or the Copilot chat) and click **Start** next to the `playwright` server. No extra installation is needed — `npx` fetches `@playwright/mcp@latest` automatically.

### Quick Setup Checklist

- [x] `.vscode/mcp.json` is committed to the repo
- [x] `@playwright/mcp` is launched via `npx`
- [x] `npm run setup` installs local dependencies and Playwright browsers
- [ ] Start the `playwright` MCP server from VS Code
- [ ] Verify the server by asking Copilot to navigate and capture a screenshot

---

## 🎯 How to Use MCP with GitHub Copilot

Once the MCP server is running, use GitHub Copilot Chat (Agent mode) with prompts like:

**1. Navigate and screenshot**
```
"Navigate to http://localhost:3000 and take a screenshot"
```

**2. Interact with forms**
```
"Go to the login page, fill in the credentials and click submit"
```

**3. Inspect the page**
```
"What does the accessibility tree look like on the dashboard page?"
```

**4. Debug UI issues**
```
"Take a screenshot of the checkout page and describe any visual issues"
```

**5. Validate API responses in the browser**
```
"Open http://localhost:3000/api/users and show me the network response"
```

---

## 📁 MCP-Accessible Resources

The Playwright MCP server provides live access to any running browser session. Combined with the framework's file structure, GitHub Copilot can also read:

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
└── screenshots/     → Failure screenshots

playwright-report/   → HTML test report
allure-results/      → Allure test data
```

---

## 🛠️ Playwright MCP Tools

The `@playwright/mcp` server exposes these tools:

| Tool | What It Does |
|------|-------------|
| `browser_navigate` | Go to a URL |
| `browser_click` | Click an element |
| `browser_fill` | Type into an input |
| `browser_select_option` | Choose a dropdown value |
| `browser_take_screenshot` | Capture a screenshot |
| `browser_snapshot` | Get the accessibility tree |
| `browser_console_messages` | Read console output |
| `browser_network_requests` | Inspect network traffic |
| `browser_tab_new` | Open a new tab |
| `browser_close` | Close the browser |

---

## 💡 MCP Use Cases

### 1. Visual Validation

```
You: "Open the login page and check if the layout looks correct"

Copilot (via MCP):
1. Navigates to the login URL
2. Takes a screenshot
3. Analyses the accessibility snapshot
4. Reports any issues found
```

### 2. Exploratory Testing

```
You: "Walk through the checkout flow and take screenshots at each step"

Copilot (via MCP):
1. Navigates to the cart page
2. Interacts with each step
3. Screenshots each screen
4. Reports any errors encountered
```

### 3. Test Generation Support

```
You: "Look at the registration page and generate a Playwright test for it"

Copilot (via MCP):
1. Navigates to the registration page
2. Reads the accessibility snapshot for element selectors
3. Generates a spec file following the framework's POM pattern
```

---

## 🔐 Security Considerations

✅ The MCP server only controls the browser during your session  
✅ No file system write access is granted to the MCP server  
⚠️ Review AI-generated code before committing  
⚠️ Do not expose credentials through browser interactions with AI  

---

## 📊 MCP Benefits

| Task | Without MCP | With MCP |
|------|-------------|----------|
| Visual checks | Manual screenshots | AI captures and analyses |
| Exploratory testing | Manual clicks | AI walks through flows |
| Selector discovery | Inspect element manually | AI reads accessibility snapshot |
| UI debugging | Trial and error | AI interacts and reports |

---

## ✅ MCP Integration Checklist

- [x] `.vscode/mcp.json` configured with `@playwright/mcp@latest`
- [x] No extra dependencies required
- [x] Works after `npm run setup`
- [ ] Enable the server in VS Code MCP panel

---

## ✅ Verification

### Check if MCP is working

1. Open VS Code with GitHub Copilot
2. Switch Copilot Chat to agent mode
3. Ask: `Navigate to https://playwright.dev and take a screenshot`

If the MCP server is running, Copilot will launch the browser and return a screenshot.

### Verify local prerequisites

```bash
node --version
npx @playwright/mcp@latest --version
```

Node.js 18+ is required.

---

## 🛠️ Troubleshooting

### MCP server does not start

1. Verify Node.js 18+ is installed
2. Run `npx @playwright/mcp@latest` manually to confirm the package resolves
3. Reload the VS Code window and start the server again

### Browser does not open visually

The server runs headless by default. To run headed, update `.vscode/mcp.json`:

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

### Package resolution fails

Check internet and npm access with:

```bash
npx @playwright/mcp@latest --version
```

---

## 📚 Resources

- [Playwright MCP on GitHub](https://github.com/microsoft/playwright-mcp)
- [Playwright Docs](https://playwright.dev/)
- [MCP Official Docs](https://modelcontextprotocol.io/)

