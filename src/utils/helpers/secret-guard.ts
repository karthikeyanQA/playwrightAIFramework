import logger from '../logger/logger';

/**
 * SecretGuard validates that required secrets are present at startup
 * without ever logging their values. Throws fast if anything is missing.
 */
export class SecretGuard {
  /**
   * Throws if any of the listed env var names are absent or empty.
   * Logs only the key name — never the value.
   */
  static validateRequired(keys: string[]): void {
    const missing = keys.filter((k) => !process.env[k]);

    if (missing.length > 0) {
      const msg = `[SecretGuard] Missing required secrets: ${missing.join(', ')}`;
      logger.error(msg);
      throw new Error(msg);
    }

    logger.info(`[SecretGuard] All required secrets present: ${keys.join(', ')}`);
  }

  /**
   * Logs presence/absence of each key without revealing values.
   * Safe to call in any environment for auditing purposes.
   */
  static audit(keys: string[]): void {
    for (const key of keys) {
      const present = !!process.env[key];
      logger.info(`[SecretGuard] ${key}: ${present ? 'present' : 'MISSING'}`);
    }
  }

  /**
   * Returns a masked version of a secret value for safe log output.
   * e.g. "MySecretPass" → "My********ss"
   */
  static mask(value: string): string {
    if (!value) {
      return '***';
    }
    if (value.length <= 4) {
      return '*'.repeat(value.length);
    }
    return value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2);
  }
}
