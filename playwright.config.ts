import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

const ENV = process.env.ENV || 'dev';
dotenv.config({ path: `.env.${ENV}` });

// Storage state paths must match auth.setup.ts
const AUTH_STATE = {
  admin: path.resolve('playwright/.auth/admin.json'),
  user: path.resolve('playwright/.auth/user.json'),
  guest: path.resolve('playwright/.auth/guest.json'),
};

// Xray reporter is added only when XRAY_ENABLED=true in CI
const xrayReporter =
  process.env.XRAY_ENABLED === 'true'
    ? [
        [
          'junit',
          {
            outputFile: 'test-results/xray-junit.xml',
            suiteName: process.env.JIRA_PROJECT_KEY || 'PROJ',
          },
        ] as [string, Record<string, unknown>],
      ]
    : [];

export default defineConfig({
  testDir: './src/tests',
  timeout: 60 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 4 : parseInt(process.env.WORKERS || '1'),

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    [
      'allure-playwright',
      {
        outputFolder: 'allure-results',
        detail: true,
        suiteTitle: true,
        environmentInfo: {
          'Test Environment': process.env.ENV || 'dev',
          Browser: process.env.BROWSER || 'chromium',
          'Base URL': process.env.BASE_URL || 'http://localhost:3000',
        },
      },
    ],
    ['list'],
    ...(process.env.CI ? [['github'] as [string]] : []),
    ...xrayReporter,
  ],

  globalSetup: './src/setup/global.setup.ts',
  globalTeardown: './src/setup/global.teardown.ts',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    headless: process.env.HEADLESS === 'true',
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    screenshot: process.env.ENABLE_SCREENSHOTS === 'true' ? 'only-on-failure' : 'off',
    video: process.env.ENABLE_VIDEO === 'true' ? 'retain-on-failure' : 'off',
    trace: process.env.ENABLE_TRACING === 'true' ? 'retain-on-failure' : 'off',
    actionTimeout: 30 * 1000,
    navigationTimeout: 30 * 1000,
    launchOptions: {
      slowMo: parseInt(process.env.SLOW_MO || '0'),
    },
  },

  // Exclude @flaky tests from CI runs unless explicitly opted-in
  grepInvert: process.env.SKIP_FLAKY === 'true' ? /@flaky/ : undefined,
  grep: process.env.TEST_GREP ? new RegExp(process.env.TEST_GREP) : undefined,

  projects: [
    // ── Setup projects: generate storageState per role ──────────────────────
    {
      name: 'setup:auth',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // ── Desktop browsers ────────────────────────────────────────────────────
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup:auth'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup:auth'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup:auth'],
    },

    // ── Mobile viewports ────────────────────────────────────────────────────
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup:auth'],
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
      dependencies: ['setup:auth'],
    },

    // ── Tablet ──────────────────────────────────────────────────────────────
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
      dependencies: ['setup:auth'],
    },

    // ── Role-scoped projects (use pre-generated storageState) ───────────────
    {
      name: 'admin-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_STATE.admin,
      },
      dependencies: ['setup:auth'],
    },
    {
      name: 'user-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_STATE.user,
      },
      dependencies: ['setup:auth'],
    },
  ],

  outputDir: 'test-results/',

  webServer:
    process.env.START_LOCAL_SERVER === 'true'
      ? {
          command: 'npm run start:server',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 120 * 1000,
        }
      : undefined,
});
