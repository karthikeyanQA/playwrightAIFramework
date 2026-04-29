# Quick Start Guide

Get up and running with the Playwright Enterprise Framework in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- Git installed

## 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/playwright-enterprise-framework.git
cd playwright-enterprise-framework

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env.dev

# Edit .env.dev with your settings
# Update BASE_URL, API_BASE_URL, database credentials, etc.
```

## 3. Run Your First Test

```bash
# Run smoke tests
npm run test:smoke

# Or run all tests
npm test
```

## 4. View Test Report

```bash
npm run report
npm run report:allure
```

Use `npm run report` for Playwright HTML and `npm run report:allure` for Allure dashboards.

## What's Next?

### Run Different Test Suites

```bash
npm run test:ui          # UI tests only
npm run test:api         # API tests only
npm run test:regression  # Regression suite
```

### Run in Different Modes

```bash
npm run test:headed      # See browser in action
npm run test:debug       # Debug mode with inspector
npm run test:parallel    # Parallel execution
```

### Create Your First Test

1. **Create a Page Object** (`src/pages/my-page.ts`):

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class MyPage extends BasePage {
  protected pageUrl = 'https://example.com/my-page';
  private myButton: Locator;

  constructor(page: Page) {
    super(page);
    this.myButton = page.locator('#my-button');
  }

  async clickMyButton() {
    await this.uiActions.click(this.myButton);
  }
}
```

2. **Create a Test** (`src/tests/ui/my-test.spec.ts`):

```typescript
import { test, expect } from '@playwright/test';
import { MyPage } from '../../pages/my-page';

test('@smoke My first test', async ({ page }) => {
  const myPage = new MyPage(page);
  await myPage.navigate();
  await myPage.clickMyButton();
  expect(await myPage.getTitle()).toBe('Success!');
});
```

3. **Run Your Test**:

```bash
npm test src/tests/ui/my-test.spec.ts
```

## Common Tasks

### Change Browser

Edit `.env.dev`:
```bash
BROWSER=firefox  # or webkit, chromium
```

### Run Specific Tags

```bash
npm run test:smoke      # @smoke tests
npm run test:regression # @regression tests
```

### Debug Failing Tests

```bash
# Run in headed mode
HEADLESS=false npm test

# Or use debug mode
npm run test:debug
```

### Check Logs

Test logs are saved in `logs/` directory:
- `combined.log` - All logs
- `error.log` - Errors only
- `debug.log` - Debug logs

UI/API test narration steps are written to Allure through `src/tests/helpers/allure-reporter.ts` and appear in `allure-results/`.

## Project Structure Overview

```
src/
├── pages/          # Page objects
├── tests/          # Test specifications
│   ├── ui/        # UI tests
│   └── api/       # API tests
├── utils/         # Utilities
│   ├── api/       # API client
│   ├── browser/   # Browser utilities
│   ├── database/  # Database utilities
│   └── helpers/   # Helper functions
├── data/          # Test data
│   ├── json/
│   ├── csv/
│   └── yaml/
└── config/        # Configuration
```

## Need Help?

- 📖 Read the full [README.md](README.md)
- 🐛 Report issues on GitHub
- 💬 Ask questions in Discussions
- 📝 Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

Happy Testing! 🚀
