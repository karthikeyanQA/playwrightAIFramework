import { test, expect } from '@playwright/test';
import logger from '../../utils/logger/logger';

/**
 * Demo UI Tests - Using Playwright's demo site
 * These tests actually work and demonstrate the framework capabilities
 * Tags: @ui, @smoke, @demo
 */

test.describe('Demo TodoMVC Application Tests', () => {
  test.beforeEach(async ({ page }) => {
    logger.testStart('TodoMVC Test');
    // Navigate to TodoMVC demo application
    await page.goto('https://demo.playwright.dev/todomvc');
  });

  test.afterEach(async ({ page: _page }, testInfo) => {
    logger.testEnd(testInfo.title, testInfo.status as 'passed' | 'failed' | 'skipped');
  });

  test('@smoke @ui Should add a new todo item', async ({ page }) => {
    // Arrange
    const todoText = 'Test automation with Playwright';

    // Act
    logger.step('Adding new todo item');
    await page.getByPlaceholder('What needs to be done?').fill(todoText);
    await page.getByPlaceholder('What needs to be done?').press('Enter');

    // Assert
    logger.step('Verifying todo was added');
    await expect(page.getByTestId('todo-title')).toHaveText(todoText);
    await expect(page.getByTestId('todo-count')).toContainText('1');
    logger.step('Todo item added successfully');
  });

  test('@ui Should mark todo as completed', async ({ page }) => {
    // Arrange - Add a todo first
    const todoText = 'Complete this task';
    await page.getByPlaceholder('What needs to be done?').fill(todoText);
    await page.getByPlaceholder('What needs to be done?').press('Enter');

    // Act
    logger.step('Marking todo as completed');
    await page.getByTestId('todo-item').locator('.toggle').click();

    // Assert
    logger.step('Verifying todo is marked as completed');
    await expect(page.getByTestId('todo-item')).toHaveClass(/completed/);
    logger.step('Todo marked as completed successfully');
  });

  test('@ui Should filter active todos', async ({ page }) => {
    // Arrange - Add multiple todos
    await page.getByPlaceholder('What needs to be done?').fill('First task');
    await page.getByPlaceholder('What needs to be done?').press('Enter');
    await page.getByPlaceholder('What needs to be done?').fill('Second task');
    await page.getByPlaceholder('What needs to be done?').press('Enter');

    // Complete one todo
    await page.getByTestId('todo-item').first().locator('.toggle').click();

    // Act
    logger.step('Filtering active todos');
    await page.getByRole('link', { name: 'Active' }).click();

    // Assert
    logger.step('Verifying only active todos are shown');
    await expect(page.getByTestId('todo-item')).toHaveCount(1);
    await expect(page.getByTestId('todo-title')).toHaveText('Second task');
    logger.step('Active filter working correctly');
  });

  test('@ui Should delete a todo item', async ({ page }) => {
    // Arrange - Add a todo
    const todoText = 'Task to be deleted';
    await page.getByPlaceholder('What needs to be done?').fill(todoText);
    await page.getByPlaceholder('What needs to be done?').press('Enter');

    // Act
    logger.step('Deleting todo item');
    await page.getByTestId('todo-item').hover();
    await page.getByRole('button', { name: '×' }).click();

    // Assert
    logger.step('Verifying todo was deleted');
    await expect(page.getByTestId('todo-item')).toHaveCount(0);
    logger.step('Todo deleted successfully');
  });

  test('@ui Should clear completed todos', async ({ page }) => {
    // Arrange - Add and complete multiple todos
    await page.getByPlaceholder('What needs to be done?').fill('Task 1');
    await page.getByPlaceholder('What needs to be done?').press('Enter');
    await page.getByPlaceholder('What needs to be done?').fill('Task 2');
    await page.getByPlaceholder('What needs to be done?').press('Enter');
    
    // Complete both todos
    const toggles = page.getByTestId('todo-item').locator('.toggle');
    await toggles.first().click();
    await toggles.last().click();

    // Act
    logger.step('Clearing completed todos');
    await page.getByRole('button', { name: 'Clear completed' }).click();

    // Assert
    logger.step('Verifying all completed todos were cleared');
    await expect(page.getByTestId('todo-item')).toHaveCount(0);
    logger.step('Completed todos cleared successfully');
  });
});

test.describe('Demo Form Tests', () => {
  test.beforeEach(async ({ page }) => {
    logger.testStart('Form Test');
    await page.goto('https://www.example.com');
  });

  test('@smoke @ui Should load example.com successfully', async ({ page }) => {
    // Assert
    logger.step('Verifying page loaded');
    await expect(page).toHaveTitle(/Example Domain/);
    await expect(page.getByRole('heading')).toContainText('Example Domain');
    logger.step('Page loaded successfully');
  });

  test('@ui Should have correct page structure', async ({ page }) => {
    // Assert
    logger.step('Verifying page structure');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('p')).toBeVisible();
    await expect(page.locator('a')).toBeVisible();
    logger.step('Page structure verified');
  });
});
