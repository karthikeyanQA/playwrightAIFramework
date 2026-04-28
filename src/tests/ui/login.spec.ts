import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login-page';
import { DashboardPage } from '../../pages/dashboard-page';
import { DataHelper } from '../../utils/helpers/data-helper';
import logger from '../../utils/logger/logger';

/**
 * Login Tests
 * Tags: @ui, @smoke, @login
 */

let loginPage: LoginPage;
let dashboardPage: DashboardPage;
let testData: {
  validUser: { username: string; password: string };
  invalidUser: { username: string; password: string };
};

test.describe('Login Functionality', () => {
  test.beforeAll(async () => {
    // Load test data
    testData = await DataHelper.readJSON('json/users.json');
  });

  test.beforeEach(async ({ page }) => {
    logger.testStart('Login Test');
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.navigate();
  });

  test.afterEach(async ({ page }, testInfo) => {
    logger.testEnd(testInfo.title, testInfo.status as 'passed' | 'failed' | 'skipped');
    
    // Capture screenshot on failure
    if (testInfo.status === 'failed') {
      await page.screenshot({
        path: `reports/screenshots/failed-${testInfo.title.replace(/\s/g, '-')}.png`,
      });
    }
  });

  test('@smoke @ui Should login successfully with valid credentials', async () => {
    // Arrange
    const { username, password } = testData.validUser;

    // Act
    await loginPage.login(username, password);
    await dashboardPage.verifyLoaded();

    // Assert
    expect(await dashboardPage.isUserLoggedIn()).toBeTruthy();
    logger.step('Login successful - user is logged in');
  });

  test('@ui Should display error message with invalid credentials', async () => {
    // Arrange
    const { username, password } = testData.invalidUser;

    // Act
    await loginPage.login(username, password);
    await loginPage.waitForErrorMessage();

    // Assert
    expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('Invalid');
    logger.step(`Error message displayed: ${errorMsg}`);
  });

  test('@ui Should not login with empty credentials', async () => {
    // Act
    await loginPage.clickLogin();

    // Assert
    const currentUrl = loginPage.getCurrentURL();
    expect(currentUrl).toContain('/login');
    logger.step('Login prevented with empty credentials');
  });

  test('@ui Should navigate to forgot password page', async () => {
    // Act
    await loginPage.clickForgotPassword();

    // Assert
    const currentUrl = loginPage.getCurrentURL();
    expect(currentUrl).toContain('forgot-password');
    logger.step('Navigated to forgot password page');
  });

  test('@ui Should remember user when remember me is checked', async () => {
    // Arrange
    const { username, password } = testData.validUser;

    // Act
    await loginPage.enterUsername(username);
    await loginPage.enterPassword(password);
    await loginPage.checkRememberMe();
    await loginPage.clickLogin();

    // Assert - verify user is logged in
    await dashboardPage.verifyLoaded();
    expect(await dashboardPage.isUserLoggedIn()).toBeTruthy();
  });
});

test.describe('Login Page UI Validation', () => {
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('@ui Should display all login page elements', async () => {
    // Assert
    await loginPage.verifyLoaded();
    const title = await loginPage.getTitle();
    expect(title).toContain('Login');
    logger.step('All login page elements are visible');
  });
});
