import { test as base, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { DashboardPage } from '../pages/dashboard-page';
import { APIClient } from '../utils/api/api-client';
import { DatabaseClient, DatabaseClientFactory } from '../utils/database/database-client';
import { STORAGE_STATE_PATHS } from '../setup/auth.setup';
import logger from '../utils/logger/logger';

interface TestFixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  apiClient: APIClient;
  dbClient: DatabaseClient;
  /** Performs login at runtime (no storageState — use for login flow tests) */
  authenticatedPage: Page;
  /** Pre-authenticated as admin via storageState */
  adminContext: BrowserContext;
  adminPage: Page;
  /** Pre-authenticated as standard user via storageState */
  userContext: BrowserContext;
  userPage: Page;
  /** Unauthenticated guest context via storageState */
  guestContext: BrowserContext;
  guestPage: Page;
}

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  apiClient: async ({}, use) => {
    const client = new APIClient(process.env.API_BASE_URL ?? 'http://localhost:3000/api');
    await use(client);
    client.removeAuthToken();
  },

  dbClient: async ({}, use) => {
    const client = DatabaseClientFactory.createFromEnv();
    await client.connect();
    logger.info('Database connected for test');
    await use(client);
    await client.disconnect();
    logger.info('Database disconnected after test');
  },

  // Runtime login — keeps existing behaviour for login-flow specs
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(
      process.env.TEST_USERNAME ?? 'testuser@example.com',
      process.env.TEST_PASSWORD ?? 'Test@1234'
    );
    logger.info('User authenticated via runtime fixture');
    await use(page);
  },

  // ─── Role-based storageState fixtures ────────────────────────────────────

  adminContext: async ({ browser }, use) => {
    const ctx = await browser.newContext({ storageState: STORAGE_STATE_PATHS.admin });
    logger.info('Admin context created from storageState');
    await use(ctx);
    await ctx.close();
  },

  adminPage: async ({ adminContext }, use) => {
    const page = await adminContext.newPage();
    await use(page);
    await page.close();
  },

  userContext: async ({ browser }, use) => {
    const ctx = await browser.newContext({ storageState: STORAGE_STATE_PATHS.user });
    logger.info('User context created from storageState');
    await use(ctx);
    await ctx.close();
  },

  userPage: async ({ userContext }, use) => {
    const page = await userContext.newPage();
    await use(page);
    await page.close();
  },

  guestContext: async ({ browser }, use) => {
    const ctx = await browser.newContext({ storageState: STORAGE_STATE_PATHS.guest });
    logger.info('Guest context created from storageState');
    await use(ctx);
    await ctx.close();
  },

  guestPage: async ({ guestContext }, use) => {
    const page = await guestContext.newPage();
    await use(page);
    await page.close();
  },
});

export { expect } from '@playwright/test';
