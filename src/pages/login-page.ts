import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import logger from '../utils/logger/logger';
import { config } from '../config/config';

/**
 * Login Page Object
 * Demonstrates best practices for page object implementation
 */
export class LoginPage extends BasePage {
  protected pageUrl: string;

  // Locators
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly rememberMeCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    this.pageUrl = `${config.get('baseURL')}/login`;

    // Initialize locators
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error-message');
    this.forgotPasswordLink = page.locator('a:has-text("Forgot Password")');
    this.rememberMeCheckbox = page.locator('#remember-me');
  }

  /**
   * Perform login
   */
  async login(username: string, password: string): Promise<void> {
    logger.step(`Logging in with username: ${username}`);
    await this.genericPageActions.fill(this.usernameInput, username, 'username input');
    await this.genericPageActions.fill(this.passwordInput, password, 'password input');
    await this.genericPageActions.click(this.loginButton, 'login button');
    logger.step('Login button clicked');
  }

  /**
   * Enter username
   */
  async enterUsername(username: string): Promise<void> {
    await this.genericPageActions.fill(this.usernameInput, username, 'username input');
  }

  /**
   * Enter password
   */
  async enterPassword(password: string): Promise<void> {
    await this.genericPageActions.fill(this.passwordInput, password, 'password input');
  }

  /**
   * Click login button
   */
  async clickLogin(): Promise<void> {
    await this.genericPageActions.click(this.loginButton, 'login button');
  }

  /**
   * Check remember me
   */
  async checkRememberMe(): Promise<void> {
    await this.genericPageActions.check(this.rememberMeCheckbox, 'remember me checkbox');
  }

  /**
   * Click forgot password
   */
  async clickForgotPassword(): Promise<void> {
    await this.genericPageActions.click(this.forgotPasswordLink, 'forgot password link');
  }

  /**
   * Get error message
   */
  async getErrorMessage(): Promise<string> {
    return await this.genericPageActions.getText(this.errorMessage, 'error message');
  }

  /**
   * Is error message visible
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.genericPageActions.isVisible(this.errorMessage);
  }

  /**
   * Wait for error message
   */
  async waitForErrorMessage(): Promise<void> {
    await this.genericPageActions.waitForVisible(this.errorMessage, 'error message');
  }

  /**
   * Verify login page loaded
   */
  async verifyLoaded(): Promise<void> {
    await this.uiActions.assertVisible(this.usernameInput);
    await this.uiActions.assertVisible(this.passwordInput);
    await this.uiActions.assertVisible(this.loginButton);
    logger.step('Login page verified as loaded');
  }
}
