import { Page, Locator, expect } from '@playwright/test';
import logger from '../logger/logger';
import { RetryHelper } from '../helpers/retry-helper';
import { TimeoutError } from '../helpers/error-handler';

/**
 * UI Actions Utility
 * Provides reusable, robust UI interaction methods with built-in waiting and error handling
 */

export class UIActions {
  constructor(private page: Page) {}

  /**
   * Click element with retry and logging
   */
  async click(locator: Locator | string, elementName?: string, options?: { timeout?: number; force?: boolean }): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const name = elementName || (typeof locator === 'string' ? locator : 'element');

    await RetryHelper.execute(
      async () => {
        logger.step(`Clicking on ${name}`);
        await element.click({ timeout: options?.timeout || 30000, force: options?.force });
        logger.debug(`Successfully clicked on ${name}`);
      },
      { maxAttempts: 3, delayMs: 1000 },
      `Click ${name}`
    );
  }

  /**
   * Fill text field
   */
  async fill(locator: Locator | string, value: string, elementName?: string, options?: { timeout?: number }): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const name = elementName || (typeof locator === 'string' ? locator : 'element');

    logger.step(`Filling ${name} with value: ${value}`);
    await element.fill(value, { timeout: options?.timeout || 30000 });
    logger.debug(`Successfully filled ${name}`);
  }

  /**
   * Type text with delay (simulates human typing)
   */
  async type(locator: Locator | string, value: string, elementName?: string, options?: { delay?: number }): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const name = elementName || (typeof locator === 'string' ? locator : 'element');

    logger.step(`Typing into ${name}: ${value}`);
    await element.pressSequentially(value, { delay: options?.delay || 50 });
    logger.debug(`Successfully typed into ${name}`);
  }

  /**
   * Select option from dropdown
   */
  async selectOption(locator: Locator | string, value: string | { label?: string; value?: string; index?: number }, elementName?: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const name = elementName || (typeof locator === 'string' ? locator : 'element');

    logger.step(`Selecting option in ${name}`);
    await element.selectOption(value);
    logger.debug(`Successfully selected option in ${name}`);
  }

  /**
   * Check checkbox or radio button
   */
  async check(locator: Locator | string, elementName?: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const name = elementName || (typeof locator === 'string' ? locator : 'element');

    logger.step(`Checking ${name}`);
    await element.check();
    logger.debug(`Successfully checked ${name}`);
  }

  /**
   * Uncheck checkbox
   */
  async uncheck(locator: Locator | string, elementName?: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const name = elementName || (typeof locator === 'string' ? locator : 'element');

    logger.step(`Unchecking ${name}`);
    await element.uncheck();
    logger.debug(`Successfully unchecked ${name}`);
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisible(locator: Locator | string, elementName?: string, timeout?: number): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const name = elementName || (typeof locator === 'string' ? locator : 'element');

    logger.step(`Waiting for ${name} to be visible`);
    await element.waitFor({ state: 'visible', timeout: timeout || 30000 });
    logger.debug(`${name} is visible`);
  }

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(locator: Locator | string, elementName?: string, timeout?: number): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const name = elementName || (typeof locator === 'string' ? locator : 'element');

    logger.step(`Waiting for ${name} to be hidden`);
    await element.waitFor({ state: 'hidden', timeout: timeout || 30000 });
    logger.debug(`${name} is hidden`);
  }

  /**
   * Get element text
   */
  async getText(locator: Locator | string, elementName?: string): Promise<string> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const name = elementName || (typeof locator === 'string' ? locator : 'element');

    logger.debug(`Getting text from ${name}`);
    const text = await element.textContent();
    logger.debug(`Text from ${name}: ${text}`);
    return text || '';
  }

  /**
   * Get element attribute
   */
  async getAttribute(locator: Locator | string, attribute: string, elementName?: string): Promise<string | null> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const name = elementName || (typeof locator === 'string' ? locator : 'element');

    logger.debug(`Getting attribute '${attribute}' from ${name}`);
    return await element.getAttribute(attribute);
  }

  /**
   * Hover over element
   */
  async hover(locator: Locator | string, elementName?: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const name = elementName || (typeof locator === 'string' ? locator : 'element');

    logger.step(`Hovering over ${name}`);
    await element.hover();
    logger.debug(`Successfully hovered over ${name}`);
  }

  /**
   * Double click element
   */
  async doubleClick(locator: Locator | string, elementName?: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const name = elementName || (typeof locator === 'string' ? locator : 'element');

    logger.step(`Double-clicking ${name}`);
    await element.dblclick();
    logger.debug(`Successfully double-clicked ${name}`);
  }

  /**
   * Right click element
   */
  async rightClick(locator: Locator | string, elementName?: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const name = elementName || (typeof locator === 'string' ? locator : 'element');

    logger.step(`Right-clicking ${name}`);
    await element.click({ button: 'right' });
    logger.debug(`Successfully right-clicked ${name}`);
  }

  /**
   * Is element visible
   */
  async isVisible(locator: Locator | string, timeout?: number): Promise<boolean> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    return await element.isVisible({ timeout: timeout || 5000 });
  }

  /**
   * Is element enabled
   */
  async isEnabled(locator: Locator | string): Promise<boolean> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    return await element.isEnabled();
  }

  /**
   * Screenshot element
   */
  async screenshotElement(locator: Locator | string, path: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.debug(`Taking screenshot of element: ${path}`);
    await element.screenshot({ path });
  }

  /**
   * Scroll to element
   */
  async scrollToElement(locator: Locator | string, elementName?: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const name = elementName || (typeof locator === 'string' ? locator : 'element');

    logger.step(`Scrolling to ${name}`);
    await element.scrollIntoViewIfNeeded();
    logger.debug(`Successfully scrolled to ${name}`);
  }

  /**
   * Drag and drop
   */
  async dragAndDrop(source: Locator | string, target: Locator | string): Promise<void> {
    const sourceElement = typeof source === 'string' ? this.page.locator(source) : source;
    const targetElement = typeof target === 'string' ? this.page.locator(target) : target;

    logger.step('Performing drag and drop');
    await sourceElement.dragTo(targetElement);
    logger.debug('Successfully performed drag and drop');
  }

  /**
   * Upload file
   */
  async uploadFile(locator: Locator | string, filePath: string | string[], elementName?: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const name = elementName || (typeof locator === 'string' ? locator : 'element');

    logger.step(`Uploading file(s) to ${name}`);
    await element.setInputFiles(filePath);
    logger.debug(`Successfully uploaded file(s) to ${name}`);
  }

  /**
   * Press keyboard key
   */
  async pressKey(key: string): Promise<void> {
    logger.step(`Pressing key: ${key}`);
    await this.page.keyboard.press(key);
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation(options?: { url?: string | RegExp; timeout?: number }): Promise<void> {
    logger.step('Waiting for navigation');
    await this.page.waitForLoadState('networkidle', { timeout: options?.timeout || 30000 });
    if (options?.url) {
      await this.page.waitForURL(options.url, { timeout: options.timeout || 30000 });
    }
    logger.debug('Navigation completed');
  }

  /**
   * Get element count
   */
  async getCount(locator: Locator | string): Promise<number> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const count = await element.count();
    logger.debug(`Element count: ${count}`);
    return count;
  }

  /**
   * Wait for element count
   */
  async waitForCount(locator: Locator | string, expectedCount: number, timeout: number = 30000): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const count = await element.count();
      if (count === expectedCount) {
        logger.debug(`Element count matches expected: ${expectedCount}`);
        return;
      }
      await this.page.waitForTimeout(500);
    }

    throw new TimeoutError(`Element count did not reach ${expectedCount} within ${timeout}ms`, timeout);
  }

  /**
   * Assert element is visible
   */
  async assertVisible(locator: Locator | string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await expect(element).toBeVisible();
    logger.debug('Element is visible');
  }

  /**
   * Assert element is hidden
   */
  async assertHidden(locator: Locator | string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await expect(element).toBeHidden();
    logger.debug('Element is hidden');
  }

  /**
   * Assert text content
   */
  async assertText(locator: Locator | string, expectedText: string | RegExp): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await expect(element).toHaveText(expectedText);
    logger.debug(`Element has expected text: ${expectedText}`);
  }

  /**
   * Assert element contains text
   */
  async assertContainsText(locator: Locator | string, expectedText: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await expect(element).toContainText(expectedText);
    logger.debug(`Element contains text: ${expectedText}`);
  }
}
