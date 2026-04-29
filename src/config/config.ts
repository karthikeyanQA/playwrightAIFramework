import * as dotenv from 'dotenv';
import * as path from 'path';
import logger from '../utils/logger/logger';
import { ConfigurationError } from '../utils/helpers/error-handler';

/**
 * Environment type
 */
export type Environment = 'dev' | 'qa' | 'prod';

/**
 * Configuration Interface
 */
export interface Config {
  env: Environment;
  baseURL: string;
  apiBaseURL: string;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    type: 'mysql' | 'postgresql';
  };
  api: {
    timeout: number;
    retryCount: number;
  };
  test: {
    headless: boolean;
    slowMo: number;
    browser: 'chromium' | 'firefox' | 'webkit';
    workers: number;
  };
  logging: {
    level: string;
  };
  features: {
    screenshots: boolean;
    video: boolean;
    tracing: boolean;
  };
  ci: {
    enabled: boolean;
    startLocalServer: boolean;
  };
}

/**
 * Configuration Manager
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;
  private environment: Environment;

  private constructor() {
    this.environment = this.determineEnvironment();
    this.loadEnvironmentFile();
    this.config = this.buildConfig();
    this.validateConfig();
    this.logConfiguration();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Determine current environment
   */
  private determineEnvironment(): Environment {
    const env = process.env.ENV || process.env.NODE_ENV || 'dev';

    if (env === 'development' || env === 'dev') {
      return 'dev';
    }

    if (env === 'qa' || env === 'staging') {
      return 'qa';
    }

    if (env === 'production' || env === 'prod') {
      return 'prod';
    }

    logger.warn(`Unknown environment: ${env}, defaulting to 'dev'`);
    return 'dev';
  }

  /**
   * Load environment-specific .env file
   */
  private loadEnvironmentFile(): void {
    const envFile = `.env.${this.environment}`;
    const envPath = path.resolve(process.cwd(), envFile);

    const result = dotenv.config({ path: envPath });

    if (result.error) {
      logger.warn(`Failed to load ${envFile}, using default .env or system environment`);
      dotenv.config(); // Fallback to default .env
    } else {
      logger.info(`Loaded configuration from ${envFile}`);
    }
  }

  /**
   * Build configuration object from environment variables
   */
  private buildConfig(): Config {
    return {
      env: this.environment,
      baseURL: this.getEnvVar('BASE_URL', 'http://localhost:3000'),
      apiBaseURL: this.getEnvVar('API_BASE_URL', 'http://localhost:3000/api'),
      database: {
        host: this.getEnvVar('DB_HOST', 'localhost'),
        port: parseInt(this.getEnvVar('DB_PORT', '5432')),
        name: this.getEnvVar('DB_NAME', 'testdb'),
        user: this.getEnvVar('DB_USER', 'postgres'),
        password: this.getEnvVar('DB_PASSWORD', ''),
        type: this.getEnvVar('DB_TYPE', 'postgresql') as 'mysql' | 'postgresql',
      },
      api: {
        timeout: parseInt(this.getEnvVar('API_TIMEOUT', '30000')),
        retryCount: parseInt(this.getEnvVar('API_RETRY_COUNT', '3')),
      },
      test: {
        headless: this.getEnvVar('HEADLESS', 'true') === 'true',
        slowMo: parseInt(this.getEnvVar('SLOW_MO', '0')),
        browser: this.getEnvVar('BROWSER', 'chromium') as 'chromium' | 'firefox' | 'webkit',
        workers: parseInt(this.getEnvVar('WORKERS', '1')),
      },
      logging: {
        level: this.getEnvVar('LOG_LEVEL', 'info'),
      },
      features: {
        screenshots: this.getEnvVar('ENABLE_SCREENSHOTS', 'true') === 'true',
        video: this.getEnvVar('ENABLE_VIDEO', 'false') === 'true',
        tracing: this.getEnvVar('ENABLE_TRACING', 'false') === 'true',
      },
      ci: {
        enabled: this.getEnvVar('CI', 'false') === 'true',
        startLocalServer: this.getEnvVar('START_LOCAL_SERVER', 'false') === 'true',
      },
    };
  }

  /**
   * Get environment variable with fallback
   */
  private getEnvVar(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const errors: string[] = [];

    if (!this.config.baseURL) {
      errors.push('BASE_URL is required');
    }

    if (!this.config.apiBaseURL) {
      errors.push('API_BASE_URL is required');
    }

    if (this.config.database.port < 1 || this.config.database.port > 65535) {
      errors.push('DB_PORT must be between 1 and 65535');
    }

    if (!['mysql', 'postgresql'].includes(this.config.database.type)) {
      errors.push('DB_TYPE must be either "mysql" or "postgresql"');
    }

    if (errors.length > 0) {
      const errorMessage = `Configuration validation failed:\n${errors.join('\n')}`;
      throw new ConfigurationError(errorMessage);
    }
  }

  /**
   * Log configuration (without sensitive data)
   */
  private logConfiguration(): void {
    const safeConfig = {
      ...this.config,
      database: {
        ...this.config.database,
        password: '***',
      },
    };

    logger.info('Configuration loaded:', safeConfig);
  }

  /**
   * Get complete configuration
   */
  getConfig(): Config {
    return { ...this.config };
  }

  /**
   * Get environment
   */
  getEnvironment(): Environment {
    return this.environment;
  }

  /**
   * Check if running in CI
   */
  isCI(): boolean {
    return this.config.ci.enabled;
  }

  /**
   * Get specific config value
   */
  get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }

  /**
   * Update configuration at runtime (use with caution)
   */
  set<K extends keyof Config>(key: K, value: Config[K]): void {
    this.config[key] = value;
    logger.warn(`Configuration updated: ${String(key)}`);
  }
}

/**
 * Export singleton instance
 */
export const config = ConfigManager.getInstance();
