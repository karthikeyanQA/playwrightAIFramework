import { allure } from 'allure-playwright';

/**
 * Allure-first test reporter adapter.
 * Keeps the same call style used by tests while writing steps to Allure.
 */
export const testReporter = {
  testStart(testName: string): void {
    void allure.logStep(`TEST START: ${testName}`);
  },

  testEnd(testName: string, status: 'passed' | 'failed' | 'skipped'): void {
    void allure.logStep(`TEST END: ${testName} - ${status.toUpperCase()}`);
  },

  step(message: string): void {
    void allure.logStep(message);
  },

  info(message: string): void {
    void allure.logStep(`INFO: ${message}`);
  },
};
