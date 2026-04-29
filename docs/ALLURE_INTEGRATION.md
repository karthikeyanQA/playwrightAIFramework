# 📊 Allure Report Integration Guide

## ✅ Allure is Now Fully Integrated!

Your framework now includes **Allure Reporter** - one of the most powerful and beautiful test reporting tools available.

---

## 🎯 What is Allure?

Allure is an advanced reporting framework that provides:

- 📊 **Beautiful Visual Reports** - Charts, graphs, timelines
- 📈 **Historical Trends** - Track test stability over time
- 🔍 **Detailed Test Information** - Steps, attachments, parameters
- 🏷️ **Test Categorization** - By feature, severity, tags
- 🎯 **Flaky Test Detection** - Identify unstable tests
- 📸 **Screenshots & Videos** - Embedded in report
- ⏱️ **Execution Timeline** - See parallel execution
- 📋 **Test Suites Organization** - Hierarchical structure

---

## 🚀 How to Use Allure

### 1. Run Tests (Allure data is automatically generated)

```bash
# Run any tests - Allure results are generated automatically
npm test
npm run test:smoke
npm run test:api
npx playwright test src/tests/api/demo-api.spec.ts
```

### 2. Generate and View Allure Report

```bash
# Generate and open Allure report
npm run report:allure

# Or manually
npx allure generate allure-results --clean
npx allure open
```

The report will open in your default browser automatically!

---

## 📂 Allure Files Location

```
playwright-enterprise-framework/
├── allure-results/          # Raw test data (generated after each test run)
│   ├── *.json              # Test results
│   ├── attachments/        # Screenshots, logs, etc.
│   └── environment.properties
├── allure-report/          # Generated HTML report
│   ├── index.html          # Main report page
│   └── ...
└── allure.config.js        # Allure configuration
```

---

## 🎨 Allure Report Features

### Main Dashboard
- **Total Tests**: Pass/Fail/Broken statistics
- **Severity Distribution**: Critical, Normal, Minor, Trivial
- **Execution Time**: Duration graphs
- **Test Status**: Pie charts and trends

### Test Suites
- Organized by test files
- Categorized by @tags
- Grouped by features

### Timeline
- Visual timeline of test execution
- Shows parallel execution
- Test duration comparison

### Behaviors (BDD Style)
- Epic → Feature → Story hierarchy
- User-friendly test organization

### Test Details
- Test steps with timing
- Screenshots embedded
- Videos attached
- Logs and traces
- Environment info

---

## 🏷️ Using Allure Annotations in Tests

### Basic Example

```typescript
import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';

test.describe('User Management', () => {
  test('@smoke Login with valid credentials', async ({ page }) => {
    // Add metadata
    await allure.epic('Authentication');
    await allure.feature('Login');
    await allure.story('Valid User Login');
    await allure.severity('critical');
    await allure.owner('QA Team');
    
    // Test steps
    await allure.step('Navigate to login page', async () => {
      await page.goto('/login');
    });
    
    await allure.step('Enter credentials', async () => {
      await page.fill('#username', 'testuser');
      await page.fill('#password', 'password');
    });
    
    await allure.step('Submit login form', async () => {
      await page.click('#login-button');
    });
    
    await allure.step('Verify successful login', async () => {
      await expect(page).toHaveURL('/dashboard');
    });
    
    // Attach screenshot
    const screenshot = await page.screenshot();
    await allure.attachment('Dashboard Screenshot', screenshot, 'image/png');
  });
});
```

### Framework Default Pattern (Recommended)

This framework now routes UI/API test narration through `src/tests/helpers/allure-reporter.ts`:

```typescript
import { testReporter as reporter } from '../helpers/allure-reporter';

test('@ui Example test', async ({ page }) => {
  reporter.step('Navigate to page');
  await page.goto('https://example.com');

  reporter.step('Verify heading');
  await expect(page.getByRole('heading')).toBeVisible();
});
```

This keeps test code concise while still producing Allure steps for each important action.

### Available Annotations

```typescript
// Organizational
await allure.epic('Epic Name');
await allure.feature('Feature Name');
await allure.story('Story Name');
await allure.suite('Suite Name');

// Metadata
await allure.severity('blocker' | 'critical' | 'normal' | 'minor' | 'trivial');
await allure.owner('Owner Name');
await allure.tag('tag1', 'tag2');
await allure.label('key', 'value');

// Links
await allure.issue('JIRA-123', 'https://jira.example.com/JIRA-123');
await allure.tms('TMS-456', 'https://tms.example.com/TMS-456');
await allure.link('https://docs.example.com', 'Documentation');

// Test steps
await allure.step('Step description', async () => {
  // Step code here
});

// Attachments
await allure.attachment('Name', content, 'text/plain');
await allure.attachment('Screenshot', buffer, 'image/png');
await allure.attachment('Log', logData, 'application/json');

// Parameters
await allure.parameter('param1', 'value1');
await allure.parameter('param2', 'value2');

// Description
await allure.description('Test description in markdown or HTML');
await allure.descriptionHtml('<h1>HTML Description</h1>');
```

---

## 📝 Enhanced Test Example

Create `src/tests/api/allure-demo.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { APIClient } from '../../utils/api/api-client';

test.describe('JSONPlaceholder API - Enhanced with Allure', () => {
  let apiClient: APIClient;

  test.beforeAll(async () => {
    apiClient = new APIClient('https://jsonplaceholder.typicode.com');
    await allure.epic('API Testing');
    await allure.feature('Posts Management');
  });

  test('@api @smoke Get all posts with Allure reporting', async () => {
    await allure.story('Retrieve all posts');
    await allure.severity('critical');
    await allure.owner('QA Team');
    await allure.tag('api', 'smoke', 'regression');
    await allure.description('This test retrieves all posts from JSONPlaceholder API and validates the response');
    
    let response;
    
    await allure.step('Send GET request to /posts', async () => {
      await allure.parameter('endpoint', '/posts');
      await allure.parameter('method', 'GET');
      response = await apiClient.get('/posts');
    });
    
    await allure.step('Validate response status', async () => {
      expect(response.status).toBe(200);
      await allure.parameter('expected_status', 200);
      await allure.parameter('actual_status', response.status);
    });
    
    await allure.step('Validate response data', async () => {
      const data = response.data as unknown[];
      expect(Array.isArray(data)).toBeTruthy();
      expect(data.length).toBeGreaterThan(0);
      
      await allure.parameter('posts_count', data.length);
      await allure.attachment('Response Data', JSON.stringify(data.slice(0, 5), null, 2), 'application/json');
    });
    
    await allure.step('Validate response time', async () => {
      expect(response.responseTime).toBeLessThan(5000);
      await allure.parameter('response_time_ms', response.responseTime);
    });
  });
});
```

---

## 🎯 Allure Report Configuration

The framework includes `allure.config.js` with test categorization:

```javascript
module.exports = {
  categories: [
    {
      name: 'API Tests',
      matchedStatuses: ['passed', 'failed', 'broken'],
      messageRegex: '.*@api.*',
    },
    {
      name: 'UI Tests',
      matchedStatuses: ['passed', 'failed', 'broken'],
      messageRegex: '.*@ui.*',
    },
    {
      name: 'Smoke Tests',
      matchedStatuses: ['passed', 'failed', 'broken'],
      messageRegex: '.*@smoke.*',
    },
    // ... more categories
  ],
};
```

---

## 📊 Allure vs Playwright HTML Report

| Feature | Playwright HTML | Allure |
|---------|----------------|--------|
| Visual Appeal | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Test Steps | ✅ | ✅ Enhanced |
| Screenshots | ✅ | ✅ Embedded |
| Videos | ✅ | ✅ Embedded |
| Traces | ✅ | ❌ |
| Historical Trends | ❌ | ✅ |
| Flaky Detection | ❌ | ✅ |
| Categorization | Basic | ✅ Advanced |
| BDD Support | ❌ | ✅ |
| Custom Annotations | ❌ | ✅ |
| Setup Required | None | Allure CLI |

**Recommendation**: Use **both**!
- Playwright HTML for quick viewing and traces
- Allure for stakeholder presentations and trend analysis

---

## 🔧 CI/CD Integration

### GitHub Actions

```yaml
- name: Run tests
  run: npm test

- name: Generate Allure Report
  if: always()
  run: npm run report:allure

- name: Upload Allure Report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: allure-report
    path: allure-report/

- name: Deploy Allure to GitHub Pages
  if: always()
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./allure-report
    destination_dir: allure-reports/${{ github.run_number }}
```

---

## 💡 Best Practices

### 1. Use Meaningful Test Names
```typescript
// ❌ Bad
test('test1', async () => {});

// ✅ Good
test('@smoke Verify user can login with valid credentials', async () => {});
```

### 2. Add Steps for Complex Tests
```typescript
await allure.step('Given user is on login page', async () => {});
await allure.step('When user enters valid credentials', async () => {});
await allure.step('Then user should be redirected to dashboard', async () => {});
```

### 3. Attach Relevant Data
```typescript
// Attach request/response
await allure.attachment('API Request', JSON.stringify(requestData), 'application/json');
await allure.attachment('API Response', JSON.stringify(responseData), 'application/json');

// Attach screenshots
const screenshot = await page.screenshot();
await allure.attachment('Page Screenshot', screenshot, 'image/png');
```

### 4. Use Severity Appropriately
- **blocker**: Blocks testing/release
- **critical**: Critical functionality
- **normal**: Standard functionality
- **minor**: Minor issues
- **trivial**: Cosmetic issues

### 5. Link to Issue Trackers
```typescript
await allure.issue('JIRA-123', 'https://jira.company.com/browse/JIRA-123');
await allure.tms('TC-456', 'https://tms.company.com/testcase/456');
```

---

## 🎨 Viewing Allure Report

After running `npm run report:allure`, you'll see:

1. **Overview Page**
   - Test execution statistics
   - Pass/Fail trends
   - Duration graphs

2. **Categories**
   - Tests grouped by @tags
   - Test types (API, UI, etc.)

3. **Suites**
   - Test files and suites
   - Hierarchical organization

4. **Graphs**
   - Status trends
   - Duration trends
   - Retry trends

5. **Timeline**
   - Parallel execution visualization
   - Test duration comparison

6. **Behaviors**
   - BDD-style organization
   - Epic → Feature → Story

---

## 🚀 Quick Commands Reference

```bash
# Run tests (generates allure-results automatically)
npm test

# Generate and view Allure report
npm run report:allure

# Stop Allure local server
# Press Ctrl+C in the terminal that started the report

# Generate report only (don't open)
npx allure generate allure-results --clean

# Open existing report
npx allure open allure-report

# Serve report on specific port
npx allure open allure-report -p 8080

# Clean allure results
rm -rf allure-results allure-report
```

---

## 📚 Additional Resources

- [Allure Documentation](https://docs.qameta.io/allure/)
- [Allure Playwright Integration](https://www.npmjs.com/package/allure-playwright)
- [Allure Examples](https://demo.qameta.io/allure/)

---

## ✅ Allure Integration Checklist

- ✅ **allure-playwright** installed
- ✅ **allure-commandline** installed
- ✅ Added to `playwright.config.ts` reporter list
- ✅ Created `allure.config.js` for categorization
- ✅ npm scripts configured (`report:allure`)
- ✅ `.gitignore` includes allure folders
- ✅ Documentation created

**Your Allure integration is complete and ready to use!** 🎉

---

**Try it now:**
```bash
npm test
npm run report:allure
```
