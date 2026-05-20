# Enterprise-Grade Test Automation Framework

[![Playwright Tests](https://github.com/yourusername/playwright-enterprise-framework/actions/workflows/playwright-tests.yml/badge.svg)](https://github.com/yourusername/playwright-enterprise-framework/actions/workflows/playwright-tests.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.42-green)](https://playwright.dev/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

A scalable, production-ready test automation framework built with **Playwright**, **TypeScript**, and **Page Object Model (POM)** design pattern. This framework supports both UI and API testing, database validations, and is designed to work seamlessly with AI agents, GitHub Copilot, and MCP (Model Context Protocol).

## 🚀 Features

### Core Capabilities
- ✅ **UI Testing** - Browser automation with Playwright
- ✅ **API Testing** - RESTful API testing with Axios
- ✅ **Database Testing** - Support for MySQL and PostgreSQL
- ✅ **Parallel Execution** - Run tests in parallel for faster execution
- ✅ **Tag-Based Execution** - Run specific test suites (@smoke, @regression, @ui, @api)
- ✅ **Cross-Browser Testing** - Chromium, Firefox, and WebKit support
- ✅ **Retry Mechanism** - Auto-retry failed tests with exponential backoff
- ✅ **Rich Reporting** - HTML reports, Allure integration, screenshots, videos
- ✅ **CI/CD Ready** - GitHub Actions workflow included

### Architecture & Design
- 🏗️ **Page Object Model (POM)** - Clean separation of test logic and page objects
- 🧩 **Modular Architecture** - Easy to extend and maintain
- 📦 **Layered Design** - Clear separation across tests, pages, utilities, data, configs
- 🔧 **Type-Safe** - Full TypeScript support with strict typing
- 🎯 **Reusable Components** - Shared utilities for common operations

### Developer Experience
- 🤖 **AI-Agent Friendly** - Designed for GitHub Copilot and MCP workflows
- 🔌 **MCP Integration** - Claude Code can run tests, analyze results, and generate new tests
- 📝 **Code Quality** - ESLint + Prettier + Husky for consistent code style
- 📊 **Allure-First Test Narration** - UI/API test steps are written directly into Allure
- 🌍 **Environment-Based Config** - Separate configs for dev, qa, prod
- 📊 **Test Data Management** - Support for JSON, CSV, YAML data files

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Database Testing](#database-testing)
- [API Testing](#api-testing)
- [MCP Integration](#mcp-integration)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Documentation](#-documentation)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**
- **VS Code** (recommended) with Playwright extension

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/playwright-enterprise-framework.git
cd playwright-enterprise-framework
```

### 2. Install all dependencies & browsers

```bash
npm run setup
```

> This single command runs `npm install`, installs Playwright browsers, and sets up Husky git hooks.

### 3. Configure environment

Copy the appropriate environment file:

```bash
# For development
cp .env.dev .env

# For QA
cp .env.qa .env

# For production
cp .env.prod .env
```

Update the `.env` file with your configuration.

## 📁 Project Structure

```
playwright-enterprise-framework/
├── .github/
│   └── workflows/
│       └── playwright-tests.yml      # CI/CD workflow
├── .husky/                            # Git hooks
│   ├── pre-commit                     # Pre-commit validation
│   ├── pre-push                       # Pre-push tests
│   └── commit-msg                     # Commit message validation
├── src/
│   ├── config/
│   │   └── config.ts                  # Configuration management
│   ├── data/
│   │   ├── json/                      # JSON test data
│   │   ├── csv/                       # CSV test data
│   │   └── yaml/                      # YAML test data
│   ├── fixtures/                      # Playwright fixtures
│   ├── models/                        # Data models/interfaces
│   ├── pages/
│   │   ├── base-page.ts               # Base page object
│   │   ├── login-page.ts              # Login page object
│   │   └── dashboard-page.ts          # Dashboard page object
│   ├── tests/
│   │   ├── ui/                        # UI tests
│   │   │   └── login.spec.ts
│   │   ├── api/                       # API tests
│   │       └── users-api.spec.ts
│   │   └── helpers/
│   │       └── allure-reporter.ts     # Allure-first step reporter adapter
│   └── utils/
│       ├── api/
│       │   └── api-client.ts          # API client utility
│       ├── browser/
│       │   ├── browser-manager.ts     # Browser management
│       │   └── ui-actions.ts          # UI actions utility
│       ├── database/
│       │   └── database-client.ts     # Database utilities
│       ├── helpers/
│       │   ├── custom-assertions.ts   # Custom assertions
│       │   ├── data-helper.ts         # Data management
│       │   ├── error-handler.ts       # Error handling
│       │   ├── retry-helper.ts        # Retry mechanism
│       │   └── wait-helper.ts         # Wait utilities
│       └── logger/
│           └── logger.ts              # Winston logger
├── docs/                              # Documentation
│   ├── ARCHITECTURE.md                # Architecture overview
│   ├── COMMANDS_REFERENCE.md          # All available commands
│   ├── CONTRIBUTING.md                # Contribution guidelines
│   ├── QUICK_START.md                 # Quick start guide
│   ├── ALLURE_INTEGRATION.md          # Allure setup & usage
│   ├── ALLURE_AND_AGENTIC_SUMMARY.md  # Allure + AI agent summary
│   ├── AGENTIC_CAPABILITIES.md        # AI agent capabilities
│   ├── MCP_INTEGRATION.md             # MCP integration guide
│   ├── FRAMEWORK_SUMMARY.md           # Framework overview
│   ├── README.md                      # Documentation hub
│   └── VALIDATION_REPORT.md           # Validation report
├── logs/                              # Log files
├── reports/                           # Test reports
│   └── screenshots/                   # Test screenshots
├── .env.dev                           # Dev environment config
├── .env.qa                            # QA environment config
├── .env.prod                          # Prod environment config
├── .eslintrc.json                     # ESLint configuration
├── .gitignore                         # Git ignore rules
├── .prettierrc.json                   # Prettier configuration
├── package.json                       # Dependencies and scripts
├── playwright.config.ts               # Playwright configuration
├── tsconfig.json                      # TypeScript configuration
└── README.md                          # This file
```

## ⚙️ Configuration

### Environment Variables

The framework uses environment-specific configuration files:

| Variable | Description | Default |
|----------|-------------|---------|
| `ENV` | Environment (dev/qa/prod) | dev |
| `BASE_URL` | Application base URL | http://localhost:3000 |
| `API_BASE_URL` | API base URL | http://localhost:3000/api |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | testdb |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | - |
| `DB_TYPE` | Database type (mysql/postgresql) | postgresql |
| `HEADLESS` | Run browser in headless mode | true |
| `BROWSER` | Browser to use (chromium/firefox/webkit) | chromium |
| `WORKERS` | Number of parallel workers | 1 |
| `LOG_LEVEL` | Logging level | info |

### Playwright Configuration

Edit `playwright.config.ts` to customize:
- Browser settings
- Timeout values
- Screenshot/video options
- Reporter settings
- Test directory

## 🚀 Running Tests

### Run all tests

```bash
npm test
```

### Run UI tests only

```bash
npm run test:ui
```

### Run API tests only

```bash
npm run test:api
```

### Run smoke tests

```bash
npm run test:smoke
```

### Run regression tests

```bash
npm run test:regression
```

### Run tests in headed mode

```bash
npm run test:headed
```

### Run tests in debug mode

```bash
npm run test:debug
```

### Run tests in parallel

```bash
npm run test:parallel
```

### Run tests serially

```bash
npm run test:serial
```

### View test report

```bash
npm run report
```

### Generate and open Allure report

```bash
npm run report:allure
```

## ✍️ Writing Tests

### Creating a Page Object

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import { config } from '../config/config';

export class MyPage extends BasePage {
  protected pageUrl: string;
  
  // Locators
  private readonly myButton: Locator;
  
  constructor(page: Page) {
    super(page);
    this.pageUrl = `${config.get('baseURL')}/my-page`;
    this.myButton = page.locator('#my-button');
  }
  
  async clickMyButton(): Promise<void> {
    await this.uiActions.click(this.myButton);
  }
}
```

### Creating a UI Test

```typescript
import { test, expect } from '@playwright/test';
import { MyPage } from '../../pages/my-page';

test.describe('My Test Suite', () => {
  let myPage: MyPage;
  
  test.beforeEach(async ({ page }) => {
    myPage = new MyPage(page);
    await myPage.navigate();
  });
  
  test('@smoke @ui My test case', async () => {
    await myPage.clickMyButton();
    expect(await myPage.getTitle()).toBe('Expected Title');
  });
});
```

### Creating an API Test

```typescript
import { test, expect } from '@playwright/test';
import { APIClient } from '../../utils/api/api-client';

test.describe('My API Tests', () => {
  let apiClient: APIClient;
  
  test.beforeAll(async () => {
    apiClient = new APIClient(process.env.API_BASE_URL);
  });
  
  test('@api Should get resource', async () => {
    const response = await apiClient.get('/resource');
    expect(response.status).toBe(200);
  });
});
```

## 🗄️ Database Testing

### Connecting to Database

```typescript
import { DatabaseClientFactory } from '../../utils/database/database-client';

const dbClient = DatabaseClientFactory.createFromEnv();
await dbClient.connect();

// Query data
const result = await dbClient.query('SELECT * FROM users WHERE id = ?', [1]);

// Execute statement
await dbClient.execute('UPDATE users SET status = ? WHERE id = ?', ['active', 1]);

// Disconnect
await dbClient.disconnect();
```

### Using Transactions

```typescript
await dbClient.beginTransaction();
try {
  await dbClient.execute('INSERT INTO users ...');
  await dbClient.execute('INSERT INTO profiles ...');
  await dbClient.commit();
} catch (error) {
  await dbClient.rollback();
  throw error;
}
```

## 🌐 API Testing

### Making API Calls

```typescript
import { createAPIClient } from '../../utils/api/api-client';

const apiClient = createAPIClient();

// GET request
const users = await apiClient.get('/users');

// POST request
const newUser = await apiClient.post('/users', { name: 'John' });

// PUT request
await apiClient.put('/users/1', { name: 'Jane' });

// DELETE request
await apiClient.delete('/users/1');
```

### With Authentication

```typescript
const apiClient = createAPIClient();
apiClient.setAuthToken('your-token-here');

// Or use Basic auth
apiClient.setAuthToken(btoa('username:password'), 'Basic');
```

### With Retry

```typescript
const response = await apiClient.get('/users', {
  retry: { maxAttempts: 3, delayMs: 1000 }
});
```

## � MCP Integration

This framework ships with the **official Playwright MCP server** configured out of the box via `.vscode/mcp.json`. GitHub Copilot (and other MCP-compatible agents) can use it to browse pages, run tests, take screenshots, and interact with the browser directly from the chat.

### How It Works

The `.vscode/mcp.json` file registers `@playwright/mcp` as an MCP server for VS Code:

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

No additional installation is required — `npx` downloads and runs the latest version automatically when the server starts.

### What the Playwright MCP Server Provides

| Capability | Description |
|------------|-------------|
| **Browser navigation** | Navigate to URLs, go back/forward |
| **Element interaction** | Click, fill, select, hover, drag |
| **Screenshots** | Capture full-page or element screenshots |
| **Network inspection** | Monitor requests and responses |
| **Console messages** | Read browser console output |
| **Accessibility snapshots** | Inspect the accessibility tree |
| **Tab management** | Open, switch, and close tabs |

### Usage

Once the MCP server is enabled in VS Code, you can ask GitHub Copilot things like:

```
"Navigate to http://localhost:3000 and take a screenshot"
"Click the login button and fill in the credentials"
"Run the smoke tests and show me any failures"
"Take a screenshot of the dashboard page"
```

For more details see [docs/MCP_INTEGRATION.md](docs/MCP_INTEGRATION.md).

## �🔄 CI/CD Integration

### GitHub Actions

The framework includes a complete CI/CD workflow in `.github/workflows/playwright-tests.yml`.

**Features:**
- Runs on push/PR to main and develop branches
- Manual trigger with test suite selection
- Parallel execution across 4 shards
- Automatic report generation and archival
- Test reports deployed to GitHub Pages
- Screenshot capture on failures

### Manual Workflow Dispatch

1. Go to **Actions** tab in GitHub
2. Select **Playwright Tests CI/CD**
3. Click **Run workflow**
4. Select test suite (all/smoke/regression/ui/api)
5. Click **Run workflow**

### Viewing Reports

After workflow completes:
1. Download artifacts from the workflow run
2. Or visit: `https://yourusername.github.io/repo-name/reports/RUN_NUMBER`

## 📊 Test Data Management

### JSON Data

```typescript
import { DataHelper } from '../../utils/helpers/data-helper';

const users = await DataHelper.readJSON('json/users.json');
await DataHelper.writeJSON('json/output.json', data);
```

### CSV Data

```typescript
const products = await DataHelper.readCSV('csv/products.csv');
```

### YAML Data

```typescript
const config = await DataHelper.readYAML('yaml/test-config.yaml');
```

## 🎯 Best Practices

### Test Organization
- Use descriptive test names
- Group related tests with `test.describe()`
- Use tags (@smoke, @regression, @ui, @api) for categorization
- Keep tests independent and atomic

### Page Objects
- One page object per page
- Use meaningful method names
- Keep locators private
- Return page objects for chaining

### Data Management
- Externalize test data
- Use data-driven testing
- Generate dynamic data when needed
- Clean up test data after execution

### Error Handling
- Use try-catch blocks for critical operations
- Capture screenshots on failures
- Log errors with context
- Use custom error classes

### Performance
- Run tests in parallel when possible
- Use appropriate timeouts
- Clean up resources
- Optimize wait strategies

## 🐛 Troubleshooting

### Tests failing in headless mode

Try running in headed mode to debug:
```bash
npm run test:headed
```

### Timeout errors

Increase timeout in `playwright.config.ts`:
```typescript
timeout: 60000 // 60 seconds
```

### Database connection issues

Verify environment variables:
```bash
echo $DB_HOST $DB_PORT $DB_NAME
```

### Installation issues

Clear cache and reinstall:
```bash
npm run clean
npm run setup
```

## 🤝 Contributing

Please read [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed contribution guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat(scope): add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Message Format

Follow conventional commits:
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
```

## 📚 Documentation

All detailed documentation is available in the [`docs/`](docs/) folder:

| Document | Description |
|----------|-------------|
| [README.md](docs/README.md) | Documentation hub and grouped navigation |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Framework architecture and design decisions |
| [QUICK_START.md](docs/QUICK_START.md) | Get up and running quickly |
| [COMMANDS_REFERENCE.md](docs/COMMANDS_REFERENCE.md) | Full reference of all npm scripts and commands |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | How to contribute to this project |
| [ALLURE_INTEGRATION.md](docs/ALLURE_INTEGRATION.md) | Allure reporting setup and usage |
| [ALLURE_AND_AGENTIC_SUMMARY.md](docs/ALLURE_AND_AGENTIC_SUMMARY.md) | Allure + AI agent integration summary |
| [AGENTIC_CAPABILITIES.md](docs/AGENTIC_CAPABILITIES.md) | AI agent capabilities and usage |
| [MCP_INTEGRATION.md](docs/MCP_INTEGRATION.md) | MCP integration guide |
| [FRAMEWORK_SUMMARY.md](docs/FRAMEWORK_SUMMARY.md) | High-level framework overview |
| [VALIDATION_REPORT.md](docs/VALIDATION_REPORT.md) | Framework validation report |

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [Playwright](https://playwright.dev/) - Modern web testing framework
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Winston](https://github.com/winstonjs/winston) - Logging library
- [Axios](https://axios-http.com/) - HTTP client

## 📧 Support

For support, email your-email@example.com or create an issue in this repository.

---

**Built with ❤️ for scalable test automation**
