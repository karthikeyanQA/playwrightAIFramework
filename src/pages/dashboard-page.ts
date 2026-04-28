import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import logger from '../utils/logger/logger';
import { config } from '../config/config';

/**
 * Dashboard Page Object
 */
export class DashboardPage extends BasePage {
  protected pageUrl: string;

  // Locators
  private readonly welcomeMessage: Locator;
  private readonly userProfile: Locator;
  private readonly logoutButton: Locator;
  private readonly navigationMenu: Locator;

  constructor(page: Page) {
    super(page);
    this.pageUrl = `${config.get('baseURL')}/dashboard`;

    // Initialize locators
    this.welcomeMessage = page.locator('.welcome-message');
    this.userProfile = page.locator('.user-profile');
    this.logoutButton = page.locator('button:has-text("Logout")');
    this.navigationMenu = page.locator('nav.main-menu');
  }

  /**
   * Get welcome message
   */
  async getWelcomeMessage(): Promise<string> {
    return await this.uiActions.getText(this.welcomeMessage);
  }

  /**
   * Click logout
   */
  async logout(): Promise<void> {
    logger.step('Logging out');
    await this.uiActions.click(this.logoutButton);
  }

  /**
   * Navigate to menu item
   */
  async navigateToMenuItem(menuItem: string): Promise<void> {
    logger.step(`Navigating to menu item: ${menuItem}`);
    await this.uiActions.click(this.navigationMenu.locator(`a:has-text("${menuItem}")`));
  }

  /**
   * Verify dashboard loaded
   */
  async verifyLoaded(): Promise<void> {
    await this.uiActions.assertVisible(this.welcomeMessage);
    await this.uiActions.assertVisible(this.navigationMenu);
    logger.step('Dashboard page verified as loaded');
  }

  /**
   * Is user logged in
   */
  async isUserLoggedIn(): Promise<boolean> {
    return await this.uiActions.isVisible(this.userProfile);
  }
}
