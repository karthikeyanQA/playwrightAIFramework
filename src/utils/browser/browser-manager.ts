import { Browser, chromium, firefox, webkit, BrowserContext, Page } from '@playwright/test';
import logger from '../logger/logger';
import { config } from '../../config/config';

/**
 * Browser Manager Utility
 * Manages browser lifecycle and context creation
 */
export class BrowserManager {
  private browser?: Browser;
  private contexts: BrowserContext[] = [];

  /**
   * Launch browser
   */
  async launchBrowser(browserType?: 'chromium' | 'firefox' | 'webkit'): Promise<Browser> {
    const type = browserType || config.get('test').browser;
    const headless = config.get('test').headless;
    const slowMo = config.get('test').slowMo;

    logger.info(`Launching ${type} browser (headless: ${headless})`);

    switch (type) {
      case 'chromium':
        this.browser = await chromium.launch({ headless, slowMo });
        break;
      case 'firefox':
        this.browser = await firefox.launch({ headless, slowMo });
        break;
      case 'webkit':
        this.browser = await webkit.launch({ headless, slowMo });
        break;
      default:
        this.browser = await chromium.launch({ headless, slowMo });
    }

    return this.browser;
  }

  /**
   * Create new browser context
   */
  async createContext(options?: {
    viewport?: { width: number; height: number };
    userAgent?: string;
    locale?: string;
    geolocation?: { latitude: number; longitude: number };
    permissions?: string[];
  }): Promise<BrowserContext> {
    if (!this.browser) {
      await this.launchBrowser();
    }

    const context = await this.browser!.newContext({
      viewport: options?.viewport || { width: 1920, height: 1080 },
      userAgent: options?.userAgent,
      locale: options?.locale,
      geolocation: options?.geolocation,
      permissions: options?.permissions,
      recordVideo: config.get('features').video ? { dir: 'videos/' } : undefined,
    });

    this.contexts.push(context);
    logger.debug('Browser context created');
    return context;
  }

  /**
   * Create new page
   */
  async createPage(): Promise<Page> {
    const context = await this.createContext();
    const page = await context.newPage();
    logger.debug('New page created');
    return page;
  }

  /**
   * Close all contexts
   */
  async closeContexts(): Promise<void> {
    for (const context of this.contexts) {
      await context.close();
    }
    this.contexts = [];
    logger.debug('All contexts closed');
  }

  /**
   * Close browser
   */
  async closeBrowser(): Promise<void> {
    await this.closeContexts();
    
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
      logger.info('Browser closed');
    }
  }

  /**
   * Get browser instance
   */
  getBrowser(): Browser | undefined {
    return this.browser;
  }
}
