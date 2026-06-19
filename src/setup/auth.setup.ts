import { test as setup } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { LoginPage } from '../pages/login-page';

export const STORAGE_STATE_PATHS = {
  admin: path.resolve('playwright/.auth/admin.json'),
  user: path.resolve('playwright/.auth/user.json'),
  guest: path.resolve('playwright/.auth/guest.json'),
};

// Ensure the auth directory exists before saving state files
function ensureAuthDir(): void {
  const authDir = path.resolve('playwright/.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
}

/**
 * Authenticate as Admin role and persist storage state.
 * Uses ADMIN_USERNAME/ADMIN_PASSWORD; falls back to TEST_USERNAME/TEST_PASSWORD.
 */
setup('authenticate as admin', async ({ page }) => {
  ensureAuthDir();

  const username = process.env.ADMIN_USERNAME ?? process.env.TEST_USERNAME ?? '';
  const password = process.env.ADMIN_PASSWORD ?? process.env.TEST_PASSWORD ?? '';

  if (!username) {
    throw new Error('ADMIN_USERNAME or TEST_USERNAME must be set');
  }
  if (!password) {
    throw new Error('ADMIN_PASSWORD or TEST_PASSWORD must be set');
  }

  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(username, password);

  await page.context().storageState({ path: STORAGE_STATE_PATHS.admin });
});

/**
 * Authenticate as standard User role and persist storage state.
 * Uses USER_USERNAME/USER_PASSWORD; falls back to TEST_USERNAME/TEST_PASSWORD.
 */
setup('authenticate as user', async ({ page }) => {
  ensureAuthDir();

  const username = process.env.USER_USERNAME ?? process.env.TEST_USERNAME ?? '';
  const password = process.env.USER_PASSWORD ?? process.env.TEST_PASSWORD ?? '';

  if (!username) {
    throw new Error('USER_USERNAME or TEST_USERNAME must be set');
  }
  if (!password) {
    throw new Error('USER_PASSWORD or TEST_PASSWORD must be set');
  }

  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(username, password);

  await page.context().storageState({ path: STORAGE_STATE_PATHS.user });
});

/**
 * Guest role — no login performed.
 * Saves an empty storage state so guest-role tests load consistently.
 */
setup('authenticate as guest', async ({ page }) => {
  ensureAuthDir();
  await page.goto(process.env.BASE_URL ?? 'http://localhost:3000');
  await page.context().storageState({ path: STORAGE_STATE_PATHS.guest });
});
