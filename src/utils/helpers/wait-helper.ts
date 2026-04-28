import { Page } from '@playwright/test';
import logger from '../logger/logger';

/**
 * Wait Helper Utility
 * Provides various wait strategies
 */
export class WaitHelper {
  /**
   * Wait for condition to be true
   */
  static async waitForCondition(
    condition: () => Promise<boolean> | boolean,
    timeout: number = 30000,
    interval: number = 500,
    errorMessage?: string
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await this.sleep(interval);
    }

    throw new Error(errorMessage || `Condition not met within ${timeout}ms`);
  }

  /**
   * Wait for page to be ready
   */
  static async waitForPageReady(page: Page): Promise<void> {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    logger.debug('Page is ready');
  }

  /**
   * Wait for element count
   */
  static async waitForElementCount(
    page: Page,
    selector: string,
    expectedCount: number,
    timeout: number = 30000
  ): Promise<void> {
    await this.waitForCondition(
      async () => {
        const count = await page.locator(selector).count();
        return count === expectedCount;
      },
      timeout,
      500,
      `Element count did not reach ${expectedCount} for selector: ${selector}`
    );
  }

  /**
   * Wait for URL to contain text
   */
  static async waitForUrlContains(page: Page, text: string, timeout: number = 30000): Promise<void> {
    await this.waitForCondition(
      () => page.url().includes(text),
      timeout,
      500,
      `URL did not contain "${text}" within ${timeout}ms`
    );
  }

  /**
   * Wait for URL to match pattern
   */
  static async waitForUrlMatch(page: Page, pattern: RegExp, timeout: number = 30000): Promise<void> {
    await this.waitForCondition(
      () => pattern.test(page.url()),
      timeout,
      500,
      `URL did not match pattern within ${timeout}ms`
    );
  }

  /**
   * Sleep/delay
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Wait for animation to complete
   */
  static async waitForAnimation(durationMs: number = 500): Promise<void> {
    await this.sleep(durationMs);
    logger.debug(`Waited ${durationMs}ms for animation`);
  }

  /**
   * Wait for network to be idle
   */
  static async waitForNetworkIdle(page: Page, timeout: number = 30000): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
    logger.debug('Network is idle');
  }
}
