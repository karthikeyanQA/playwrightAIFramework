import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { DashboardPage } from '../pages/dashboard-page';
import { APIClient } from '../utils/api/api-client';
import { DatabaseClient, DatabaseClientFactory } from '../utils/database/database-client';
import logger from '../utils/logger/logger';

/**
 * Extended test fixtures
 * Provides reusable setup for tests
 */

interface TestFixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  apiClient: APIClient;
  dbClient: DatabaseClient;
  authenticatedPage: Page;
}

export const test = base.extend<TestFixtures>({
  // Login page fixture
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // Dashboard page fixture
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  // API client fixture
  apiClient: async ({}, use) => {
    const apiClient = new APIClient(process.env.API_BASE_URL || 'http://localhost:3000/api');
    await use(apiClient);
    apiClient.removeAuthToken();
  },

  // Database client fixture
  dbClient: async ({}, use) => {
    const dbClient = DatabaseClientFactory.createFromEnv();
    await dbClient.connect();
    logger.info('Database connected for test');

    await use(dbClient);

    await dbClient.disconnect();
    logger.info('Database disconnected after test');
  },

  // Authenticated page fixture - automatically logs in
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();

    // Login with default credentials
    const username = process.env.TEST_USERNAME || 'testuser@example.com';
    const password = process.env.TEST_PASSWORD || 'Test@1234';

    await loginPage.login(username, password);
    logger.info('User authenticated via fixture');

    await use(page);
  },
});

export { expect } from '@playwright/test';
