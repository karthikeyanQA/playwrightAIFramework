# Generate UI Test

## Description
Generate a new UI test file with Page Object Model pattern, proper waits, and assertions.

## Usage
Invoke this skill to create UI tests for web pages following POM design pattern and framework best practices.

## Parameters
- **page-name** (required): Name of the page to test (e.g., Login, Dashboard, Checkout)
- **test-scenarios** (required): List of scenarios to test
- **create-page-object** (optional): Generate page object if it doesn't exist (true/false)
- **test-type** (optional): Test category (smoke, regression, e2e)

## What This Skill Does

1. Checks if page object exists in `src/pages/`
2. Creates page object if needed (or prompts to create)
3. Generates test file in `src/tests/ui/`
4. Creates test cases for specified scenarios
5. Adds proper waits and assertions
6. Includes error handling
7. Adds tags (@ui, @smoke, @regression)
8. Follows framework conventions
9. Uses UIActions utility for interactions

## Page Object Structure Generated

```typescript
// src/pages/[page-name]-page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class [PageName]Page extends BasePage {
  // Locators
  readonly field1: Locator;
  readonly button1: Locator;

  constructor(page: Page) {
    super(page);
    this.field1 = page.locator('#field1');
    this.button1 = page.locator('button[type="submit"]');
  }

  // Actions
  async performAction(data: string): Promise<void> {
    await this.uiActions.fill(this.field1, data, 'Field 1');
    await this.uiActions.click(this.button1, 'Submit Button');
  }

  // Assertions
  async verifyPageLoaded(): Promise<void> {
    await this.uiActions.waitForVisible(this.field1, 'Field 1');
  }
}
```

## Test Structure Generated

```typescript
// src/tests/ui/[page-name].spec.ts
import { test, expect } from '@playwright/test';
import { [PageName]Page } from '@pages/[page-name]-page';
import logger from '@utils/logger/logger';

test.describe('UI - [Page Name]', () => {
  let [pageName]Page: [PageName]Page;

  test.beforeEach(async ({ page }) => {
    [pageName]Page = new [PageName]Page(page);
    await page.goto('/[page-url]');
    await [pageName]Page.verifyPageLoaded();
  });

  test('@smoke @ui Should [scenario 1]', async () => {
    logger.testStart('[Scenario 1]');

    // Arrange
    // Act
    // Assert

    logger.testEnd('[Scenario 1]', 'passed');
  });

  test('@ui Should [scenario 2]', async () => {
    // Test implementation
  });
});
```

## Test Scenarios Generated

### Common UI Test Patterns

#### Form Submission
- Submit valid data
- Validate required fields
- Handle validation errors
- Verify success message
- Check form reset

#### Navigation
- Navigate to page
- Verify page title
- Check breadcrumbs
- Test back/forward navigation
- Verify URL changes

#### Element Interactions
- Click buttons
- Fill form fields
- Select dropdown options
- Check/uncheck checkboxes
- Upload files

#### Data Display
- Verify table data
- Test search/filter
- Check pagination
- Sort columns
- Verify empty states

#### Error Handling
- Display error messages
- Handle network errors
- Validate input format
- Show loading states

## Example Parameters

```json
{
  "page-name": "Login",
  "test-scenarios": [
    "Successful login with valid credentials",
    "Show error for invalid credentials",
    "Display validation for empty fields",
    "Navigate to forgot password page",
    "Remember me functionality"
  ],
  "create-page-object": true,
  "test-type": "smoke"
}
```

## Generated Test Example

```typescript
/**
 * UI Tests - Login Page
 * Tests authentication flows and error handling
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/login-page';
import logger from '../../utils/logger/logger';

test.describe('UI - Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.goto('/login');
    await loginPage.verifyPageLoaded();
  });

  test('@smoke @ui Should login successfully with valid credentials', async () => {
    logger.testStart('Valid Login');

    await loginPage.login(
      process.env.TEST_USERNAME!,
      process.env.TEST_PASSWORD!
    );

    await expect(loginPage.page).toHaveURL(/.*dashboard/);
    await loginPage.verifySuccessMessage('Welcome back!');

    logger.testEnd('Valid Login', 'passed');
  });

  test('@ui Should show error for invalid credentials', async () => {
    logger.testStart('Invalid Login');

    await loginPage.login('invalid@example.com', 'wrongpassword');

    await loginPage.verifyErrorMessage('Invalid credentials');
    await expect(loginPage.page).toHaveURL(/.*login/);

    logger.testEnd('Invalid Login', 'passed');
  });

  test('@ui Should validate empty email field', async () => {
    logger.testStart('Empty Email Validation');

    await loginPage.clickLoginButton();

    await loginPage.verifyValidationError('email', 'Email is required');

    logger.testEnd('Empty Email Validation', 'passed');
  });

  test('@ui Should navigate to forgot password page', async () => {
    logger.testStart('Forgot Password Navigation');

    await loginPage.clickForgotPassword();

    await expect(loginPage.page).toHaveURL(/.*forgot-password/);

    logger.testEnd('Forgot Password Navigation', 'passed');
  });

  test('@ui Should remember user credentials', async ({ page }) => {
    logger.testStart('Remember Me');

    await loginPage.login(
      process.env.TEST_USERNAME!,
      process.env.TEST_PASSWORD!,
      true // rememberMe
    );

    await expect(loginPage.page).toHaveURL(/.*dashboard/);

    // Verify cookie or local storage
    const cookies = await page.context().cookies();
    const rememberCookie = cookies.find(c => c.name === 'rememberMe');
    expect(rememberCookie).toBeDefined();

    logger.testEnd('Remember Me', 'passed');
  });
});
```

## Generated Page Object Example

```typescript
/**
 * Login Page Object
 * Handles authentication interactions
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base-page';

export class LoginPage extends BasePage {
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.forgotPasswordLink = page.locator('a:has-text("Forgot Password")');
    this.rememberMeCheckbox = page.locator('input[name="rememberMe"]');
    this.errorMessage = page.locator('.error-message');
    this.successMessage = page.locator('.success-message');
  }

  // Actions
  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    await this.uiActions.fill(this.emailInput, email, 'Email');
    await this.uiActions.fill(this.passwordInput, password, 'Password');

    if (rememberMe) {
      await this.uiActions.check(this.rememberMeCheckbox, 'Remember Me');
    }

    await this.clickLoginButton();
  }

  async clickLoginButton(): Promise<void> {
    await this.uiActions.click(this.loginButton, 'Login Button');
  }

  async clickForgotPassword(): Promise<void> {
    await this.uiActions.click(this.forgotPasswordLink, 'Forgot Password Link');
  }

  // Assertions
  async verifyPageLoaded(): Promise<void> {
    await this.uiActions.waitForVisible(this.emailInput, 'Email Input');
    await this.uiActions.waitForVisible(this.passwordInput, 'Password Input');
    await this.uiActions.waitForVisible(this.loginButton, 'Login Button');
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await this.uiActions.waitForVisible(this.errorMessage, 'Error Message');
    await this.uiActions.assertContainsText(this.errorMessage, expectedMessage);
  }

  async verifySuccessMessage(expectedMessage: string): Promise<void> {
    await this.uiActions.waitForVisible(this.successMessage, 'Success Message');
    await this.uiActions.assertContainsText(this.successMessage, expectedMessage);
  }

  async verifyValidationError(field: string, expectedMessage: string): Promise<void> {
    const validationError = this.page.locator(`[data-testid="${field}-error"]`);
    await this.uiActions.waitForVisible(validationError, `${field} Validation Error`);
    await this.uiActions.assertText(validationError, expectedMessage);
  }
}
```

## Example Invocation

**User**: "Create UI tests for the checkout page with scenarios for shipping, payment, and order confirmation"

**AI Agent**:
1. Checks for `src/pages/checkout-page.ts`
2. Creates page object with locators and actions
3. Generates `src/tests/ui/checkout.spec.ts`
4. Creates test cases for:
   - Enter shipping information
   - Select payment method
   - Apply discount code
   - Submit order
   - Verify confirmation page
5. Adds proper waits, assertions, and error handling
6. Reports generated files

## Success Criteria

- ✅ Page object created (if needed)
- ✅ Test file generated
- ✅ All scenarios covered
- ✅ Proper waits and assertions
- ✅ POM pattern followed
- ✅ Framework conventions applied
- ✅ TypeScript compiles without errors

## Best Practices Applied

1. **Page Object Model**: Separate page structure from tests
2. **Single Responsibility**: One action per method
3. **Descriptive Names**: Clear method and variable names
4. **Proper Waits**: No hard waits, use waitForVisible
5. **Reusable Actions**: Use UIActions utility
6. **Error Handling**: Test negative scenarios
7. **Logging**: Test lifecycle logging
8. **Tags**: Proper categorization
9. **Independent Tests**: Each test is isolated

## Related Skills

- `create-page-object` - Create standalone page object
- `generate-api-test` - Generate API tests
- `update-selectors` - Update page object selectors
- `debug-test` - Debug failing UI tests

## Notes

- Review generated selectors to ensure they're stable
- Use data-testid attributes for better selector stability
- Add screenshots on failure (already configured)
- Consider accessibility testing (ARIA labels, roles)
- Mobile viewport tests are separate test files
