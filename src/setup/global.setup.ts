import { chromium, FullConfig } from '@playwright/test';
import { SecretGuard } from '../utils/helpers/secret-guard';
import logger from '../utils/logger/logger';

const REQUIRED_SECRETS = ['BASE_URL', 'API_BASE_URL'];
const AUTH_SECRETS = ['TEST_USERNAME', 'TEST_PASSWORD'];

async function globalSetup(_config: FullConfig): Promise<void> {
  logger.info('=== Global Setup: Starting ===');

  // 1. Validate required env vars — fails fast without logging values
  SecretGuard.validateRequired(REQUIRED_SECRETS);

  if (process.env.VALIDATE_AUTH !== 'false') {
    SecretGuard.validateRequired(AUTH_SECRETS);
  }

  // 2. Audit Xray/JIRA secrets presence (no values logged)
  if (process.env.XRAY_ENABLED === 'true') {
    SecretGuard.audit(['XRAY_CLIENT_ID', 'XRAY_CLIENT_SECRET', 'JIRA_PROJECT_KEY']);
  }

  // 3. Health check: verify base URL is reachable before running any tests
  if (process.env.SKIP_HEALTH_CHECK !== 'true') {
    const baseUrl = process.env.BASE_URL!;
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      const response = await page.goto(baseUrl, { timeout: 30000 });
      if (!response || response.status() >= 500) {
        throw new Error(
          `Health check failed: ${baseUrl} returned status ${response?.status() ?? 'no response'}`
        );
      }
      logger.info(`Health check passed: ${baseUrl} is reachable`);
      await page.close();
    } finally {
      await browser.close();
    }
  }

  logger.info('=== Global Setup: Complete ===');
}

export default globalSetup;
