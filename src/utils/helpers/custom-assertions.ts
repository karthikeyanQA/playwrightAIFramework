import { expect, Page, Locator } from '@playwright/test';
import logger from '../logger/logger';

/**
 * Custom Assertions
 * Extended assertion methods for common test scenarios
 */
export class CustomAssertions {
  /**
   * Assert element text contains
   */
  static async assertTextContains(
    locator: Locator,
    expectedText: string,
    message?: string
  ): Promise<void> {
    await expect(locator, message).toContainText(expectedText);
    logger.debug(`Assertion passed: Text contains "${expectedText}"`);
  }

  /**
   * Assert element has exact text
   */
  static async assertExactText(
    locator: Locator,
    expectedText: string,
    message?: string
  ): Promise<void> {
    await expect(locator, message).toHaveText(expectedText);
    logger.debug(`Assertion passed: Text equals "${expectedText}"`);
  }

  /**
   * Assert element is visible and enabled
   */
  static async assertVisibleAndEnabled(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeVisible();
    await expect(locator, message).toBeEnabled();
    logger.debug('Assertion passed: Element is visible and enabled');
  }

  /**
   * Assert URL contains
   */
  static async assertUrlContains(page: Page, expectedText: string, message?: string): Promise<void> {
    await expect(page, message).toHaveURL(new RegExp(expectedText));
    logger.debug(`Assertion passed: URL contains "${expectedText}"`);
  }

  /**
   * Assert URL equals
   */
  static async assertUrlEquals(page: Page, expectedUrl: string, message?: string): Promise<void> {
    await expect(page, message).toHaveURL(expectedUrl);
    logger.debug(`Assertion passed: URL equals "${expectedUrl}"`);
  }

  /**
   * Assert title contains
   */
  static async assertTitleContains(page: Page, expectedTitle: string, message?: string): Promise<void> {
    await expect(page, message).toHaveTitle(new RegExp(expectedTitle));
    logger.debug(`Assertion passed: Title contains "${expectedTitle}"`);
  }

  /**
   * Assert element count
   */
  static async assertElementCount(
    locator: Locator,
    expectedCount: number,
    message?: string
  ): Promise<void> {
    await expect(locator, message).toHaveCount(expectedCount);
    logger.debug(`Assertion passed: Element count is ${expectedCount}`);
  }

  /**
   * Assert element has attribute
   */
  static async assertHasAttribute(
    locator: Locator,
    attribute: string,
    value?: string | RegExp,
    message?: string
  ): Promise<void> {
    if (value) {
      await expect(locator, message).toHaveAttribute(attribute, value);
      logger.debug(`Assertion passed: Element has attribute "${attribute}" with value "${value}"`);
    } else {
      await expect(locator, message).toHaveAttribute(attribute, /.+/);
      logger.debug(`Assertion passed: Element has attribute "${attribute}"`);
    }
  }

  /**
   * Assert element has CSS class
   */
  static async assertHasClass(
    locator: Locator,
    className: string,
    message?: string
  ): Promise<void> {
    await expect(locator, message).toHaveClass(new RegExp(className));
    logger.debug(`Assertion passed: Element has class "${className}"`);
  }

  /**
   * Assert array contains value
   */
  static assertArrayContains<T>(array: T[], value: T, message?: string): void {
    expect(array, message).toContain(value);
    logger.debug(`Assertion passed: Array contains "${value}"`);
  }

  /**
   * Assert array length
   */
  static assertArrayLength<T>(array: T[], expectedLength: number, message?: string): void {
    expect(array, message).toHaveLength(expectedLength);
    logger.debug(`Assertion passed: Array length is ${expectedLength}`);
  }

  /**
   * Assert object has property
   */
  static assertObjectHasProperty(obj: object, property: string, message?: string): void {
    expect(obj, message).toHaveProperty(property);
    logger.debug(`Assertion passed: Object has property "${property}"`);
  }

  /**
   * Assert response time
   */
  static assertResponseTime(responseTime: number, maxTime: number, message?: string): void {
    expect(responseTime, message || `Response time ${responseTime}ms exceeded ${maxTime}ms`).toBeLessThan(maxTime);
    logger.debug(`Assertion passed: Response time ${responseTime}ms is within ${maxTime}ms`);
  }

  /**
   * Soft assertion - continues test execution on failure
   */
  static softAssert(condition: boolean, message: string): void {
    if (!condition) {
      logger.warn(`Soft assertion failed: ${message}`);
    } else {
      logger.debug(`Soft assertion passed: ${message}`);
    }
  }
}
