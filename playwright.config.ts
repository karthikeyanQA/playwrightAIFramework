import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables
const ENV = process.env.ENV || 'dev';
dotenv.config({ path: `.env.${ENV}` });

/**
 * Playwright Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './src/tests',
  
  // Maximum time one test can run
  timeout: 60 * 1000,
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 4 : parseInt(process.env.WORKERS || '1'),
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['allure-playwright', {
      outputFolder: 'allure-results',
      detail: true,
      suiteTitle: true,
      environmentInfo: {
        'Test Environment': process.env.ENV || 'dev',
        'Browser': process.env.BROWSER || 'chromium',
        'Base URL': process.env.BASE_URL || 'http://localhost:3000',
      },
    }],
    ['list'],
    ...(process.env.CI ? [['github']] : []),
  ],
  
  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,
  
  // Shared settings for all projects
  use: {
    // Base URL
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Browser context options
    headless: process.env.HEADLESS === 'true',
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    
    // Artifacts
    screenshot: process.env.ENABLE_SCREENSHOTS === 'true' ? 'only-on-failure' : 'off',
    video: process.env.ENABLE_VIDEO === 'true' ? 'retain-on-failure' : 'off',
    trace: process.env.ENABLE_TRACING === 'true' ? 'retain-on-failure' : 'off',
    
    // Action timeout
    actionTimeout: 30 * 1000,
    navigationTimeout: 30 * 1000,
    
    // Slow motion
    launchOptions: {
      slowMo: parseInt(process.env.SLOW_MO || '0'),
    },
  },
  
  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
    
    // Tablet viewports
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],
  
  // Web server configuration (optional)
  webServer: process.env.START_LOCAL_SERVER === 'true'
    ? {
        command: 'npm run start:server',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      }
    : undefined,
  
  // Output folder for test artifacts
  outputDir: 'test-results/',
  
  // Grep settings for tag-based execution
  grep: process.env.TEST_GREP ? new RegExp(process.env.TEST_GREP) : undefined,
  grepInvert: process.env.TEST_GREP_INVERT ? new RegExp(process.env.TEST_GREP_INVERT) : undefined,
});
