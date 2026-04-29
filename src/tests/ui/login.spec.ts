import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login-page';
import { DashboardPage } from '../../pages/dashboard-page';
import { DataHelper } from '../../utils/helpers/data-helper';
import { testReporter as reporter } from '../helpers/allure-reporter';

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
    reporter.testStart('Login Test');
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.navigate();
  });

  test.afterEach(async ({ page: _page }, testInfo) => {
    reporter.testEnd(testInfo.title, testInfo.status as 'passed' | 'failed' | 'skipped');

    // Capture screenshot on failure
    if (testInfo.status === 'failed') {
      await loginPage.screenshot(`failed-${testInfo.title.replace(/\s/g, '-')}`);
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
    reporter.step('Login successful - user is logged in');
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
    reporter.step(`Error message displayed: ${errorMsg}`);
  });

  test('@ui Should not login with empty credentials', async () => {
    // Act
    await loginPage.clickLogin();

    // Assert
    const currentUrl = loginPage.getCurrentURL();
    expect(currentUrl).toContain('/login');
    reporter.step('Login prevented with empty credentials');
  });

  test('@ui Should navigate to forgot password page', async () => {
    // Act
    await loginPage.clickForgotPassword();

    // Assert
    const currentUrl = loginPage.getCurrentURL();
    expect(currentUrl).toContain('forgot-password');
    reporter.step('Navigated to forgot password page');
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
    reporter.step('All login page elements are visible');
  });
});
