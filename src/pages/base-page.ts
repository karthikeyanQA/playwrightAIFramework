import { Page } from '@playwright/test';
import { UIActions } from '../utils/browser/ui-actions';
import logger from '../utils/logger/logger';

/**
 * Base Page Class
 * All page objects should extend this base class
 */
export abstract class BasePage {
  protected page: Page;
  protected uiActions: UIActions;
  protected abstract pageUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.uiActions = new UIActions(page);
  }

  /**
   * Navigate to page
   */
  async navigate(): Promise<void> {
    logger.step(`Navigating to ${this.pageUrl}`);
    await this.page.goto(this.pageUrl);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  getCurrentURL(): string {
    return this.page.url();
  }

  /**
   * Take screenshot
   */
  async screenshot(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${name}-${timestamp}.png`;
    await this.page.screenshot({
      path: `reports/screenshots/${fileName}`,
      fullPage: true,
    });
    logger.info(`Screenshot saved: ${fileName}`);
  }

  /**
   * Reload page
   */
  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Go back
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  /**
   * Wait for timeout
   */
  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }
}
