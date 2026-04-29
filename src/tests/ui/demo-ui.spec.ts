import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { testReporter as reporter } from '../helpers/allure-reporter';
import { UIActions } from '../../utils/browser/ui-actions';

/**
 * Demo UI Tests - Using Playwright's demo site
 * These tests actually work and demonstrate the framework capabilities
 * Tags: @ui, @smoke, @demo
 */

test.describe('Demo TodoMVC Application Tests', () => {
  let uiActions: UIActions;

  test.beforeEach(async ({ page }) => {
    await allure.epic('Playwright AI Framework');
    await allure.feature('UI Demo Tests');
    await allure.story('TodoMVC Flows');
    reporter.testStart('TodoMVC Test');
    uiActions = new UIActions(page);
    // Navigate to TodoMVC demo application
    await page.goto('https://demo.playwright.dev/todomvc');
  });

  test.afterEach(async ({ page: _page }, testInfo) => {
    reporter.testEnd(testInfo.title, testInfo.status as 'passed' | 'failed' | 'skipped');
  });

  test('@smoke @ui Should add a new todo item', async ({ page }) => {
    // Arrange
    const todoText = 'Test automation with Playwright';
    const todoInput = page.getByPlaceholder('What needs to be done?');

    // Act
    reporter.step('Adding new todo item');
    await uiActions.fill(todoInput, todoText, 'new todo input');
    await todoInput.press('Enter');

    // Assert
    reporter.step('Verifying todo was added');
    await expect(page.getByTestId('todo-title')).toHaveText(todoText);
    await expect(page.getByTestId('todo-count')).toContainText('1');
    reporter.step('Todo item added successfully');
  });

  test('@ui Should mark todo as completed', async ({ page }) => {
    // Arrange - Add a todo first
    const todoText = 'Complete this task';
    const todoInput = page.getByPlaceholder('What needs to be done?');
    await uiActions.fill(todoInput, todoText, 'new todo input');
    await todoInput.press('Enter');

    // Act
    reporter.step('Marking todo as completed');
    await uiActions.click(page.getByTestId('todo-item').locator('.toggle'), 'todo toggle');

    // Assert
    reporter.step('Verifying todo is marked as completed');
    await expect(page.getByTestId('todo-item')).toHaveClass(/completed/);
    reporter.step('Todo marked as completed successfully');
  });

  test('@ui Should filter active todos', async ({ page }) => {
    // Arrange - Add multiple todos
    const todoInput = page.getByPlaceholder('What needs to be done?');
    await uiActions.fill(todoInput, 'First task', 'new todo input');
    await todoInput.press('Enter');
    await uiActions.fill(todoInput, 'Second task', 'new todo input');
    await todoInput.press('Enter');

    // Complete one todo
    await uiActions.click(
      page.getByTestId('todo-item').first().locator('.toggle'),
      'first todo toggle'
    );

    // Act
    reporter.step('Filtering active todos');
    await uiActions.click(page.getByRole('link', { name: 'Active' }), 'Active filter link');

    // Assert
    reporter.step('Verifying only active todos are shown');
    await expect(page.getByTestId('todo-item')).toHaveCount(1);
    await expect(page.getByTestId('todo-title')).toHaveText('Second task');
    reporter.step('Active filter working correctly');
  });

  test('@ui Should delete a todo item', async ({ page }) => {
    // Arrange - Add a todo
    const todoText = 'Task to be deleted';
    const todoInput = page.getByPlaceholder('What needs to be done?');
    await uiActions.fill(todoInput, todoText, 'new todo input');
    await todoInput.press('Enter');

    // Act
    reporter.step('Deleting todo item');
    const targetTodoItem = page.getByTestId('todo-item').filter({ hasText: todoText });
    await uiActions.hover(targetTodoItem, 'todo item');
    await uiActions.click(targetTodoItem.locator('.destroy'), 'delete todo button');

    // Assert
    reporter.step('Verifying todo was deleted');
    await expect(page.getByTestId('todo-item')).toHaveCount(0);
    reporter.step('Todo deleted successfully');
  });

  test('@ui Should clear completed todos', async ({ page }) => {
    // Arrange - Add and complete multiple todos
    const todoInput = page.getByPlaceholder('What needs to be done?');
    await uiActions.fill(todoInput, 'Task 1', 'new todo input');
    await todoInput.press('Enter');
    await uiActions.fill(todoInput, 'Task 2', 'new todo input');
    await todoInput.press('Enter');

    // Complete both todos
    const toggles = page.getByTestId('todo-item').locator('.toggle');
    await uiActions.click(toggles.first(), 'first todo toggle');
    await uiActions.click(toggles.last(), 'last todo toggle');

    // Act
    reporter.step('Clearing completed todos');
    await uiActions.click(
      page.getByRole('button', { name: 'Clear completed' }),
      'clear completed button'
    );

    // Assert
    reporter.step('Verifying all completed todos were cleared');
    await expect(page.getByTestId('todo-item')).toHaveCount(0);
    reporter.step('Completed todos cleared successfully');
  });
});

test.describe('Demo Form Tests', () => {
  let uiActions: UIActions;

  test.beforeEach(async ({ page }) => {
    await allure.epic('Playwright AI Framework');
    await allure.feature('UI Demo Tests');
    await allure.story('Example.com Validation');
    reporter.testStart('Form Test');
    uiActions = new UIActions(page);
    await page.goto('https://www.example.com');
  });

  test('@smoke @ui Should load example.com successfully', async ({ page }) => {
    // Assert
    reporter.step('Verifying page loaded');
    await expect(page).toHaveTitle(/Example Domain/);
    await expect(page.getByRole('heading')).toContainText('Example Domain');
    reporter.step('Page loaded successfully');
  });

  test('@ui Should have correct page structure', async ({ page }) => {
    // Assert
    reporter.step('Verifying page structure');
    await uiActions.assertVisible(page.locator('h1'));
    await expect(page.locator('p')).toHaveCount(2);
    await uiActions.assertVisible(page.locator('p').first());
    await uiActions.assertVisible(page.locator('p').nth(1));
    await uiActions.assertVisible(page.locator('a'));
    reporter.step('Page structure verified');
  });
});
