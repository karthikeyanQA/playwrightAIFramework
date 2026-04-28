import logger from '../logger/logger';

/**
 * Retry Configuration Interface
 */
export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  exponentialBackoff?: boolean;
  maxDelayMs?: number;
  retryableErrors?: Array<new (...args: unknown[]) => Error>;
  onRetry?: (attempt: number, error: Error) => void | Promise<void>;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  exponentialBackoff: true,
  maxDelayMs: 10000,
};

/**
 * Retry Mechanism Utility
 * Implements exponential backoff and configurable retry strategies
 */
export class RetryHelper {
  /**
   * Execute a function with retry logic
   */
  static async execute<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    context?: string
  ): Promise<T> {
    const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    let lastError: Error;

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        logger.debug(
          `${context ? `[${context}] ` : ''}Attempt ${attempt}/${finalConfig.maxAttempts}`
        );
        const result = await fn();
        if (attempt > 1) {
          logger.info(
            `${context ? `[${context}] ` : ''}Operation succeeded on attempt ${attempt}`
          );
        }
        return result;
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        if (finalConfig.retryableErrors && finalConfig.retryableErrors.length > 0) {
          const isRetryable = finalConfig.retryableErrors.some(
            (ErrorClass) => error instanceof ErrorClass
          );
          if (!isRetryable) {
            throw error;
          }
        }

        // Last attempt - don't retry
        if (attempt === finalConfig.maxAttempts) {
          logger.error(
            `${context ? `[${context}] ` : ''}All ${finalConfig.maxAttempts} attempts failed`,
            lastError
          );
          throw lastError;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(
          attempt,
          finalConfig.delayMs,
          finalConfig.exponentialBackoff || false,
          finalConfig.maxDelayMs
        );

        logger.warn(
          `${context ? `[${context}] ` : ''}Attempt ${attempt} failed: ${lastError.message}. Retrying in ${delay}ms...`
        );

        // Call onRetry callback if provided
        if (finalConfig.onRetry) {
          await finalConfig.onRetry(attempt, lastError);
        }

        // Wait before next attempt
        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Execute a function with simple retry (no exponential backoff)
   */
  static async simpleRetry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000,
    context?: string
  ): Promise<T> {
    return this.execute(
      fn,
      {
        maxAttempts,
        delayMs,
        exponentialBackoff: false,
      },
      context
    );
  }

  /**
   * Calculate delay with exponential backoff
   */
  private static calculateDelay(
    attempt: number,
    baseDelay: number,
    useExponentialBackoff: boolean,
    maxDelay?: number
  ): number {
    if (!useExponentialBackoff) {
      return baseDelay;
    }

    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    return maxDelay ? Math.min(exponentialDelay, maxDelay) : exponentialDelay;
  }

  /**
   * Delay execution
   */
  private static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Conditional retry - only retry if condition is met
   */
  static async retryIf<T>(
    fn: () => Promise<T>,
    condition: (error: Error) => boolean,
    maxAttempts: number = 3,
    delayMs: number = 1000,
    context?: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (!condition(lastError) || attempt === maxAttempts) {
          throw lastError;
        }

        logger.warn(
          `${context ? `[${context}] ` : ''}Attempt ${attempt} failed, retrying in ${delayMs}ms...`
        );
        await this.delay(delayMs);
      }
    }

    throw lastError!;
  }

  /**
   * Retry until a condition is met
   */
  static async retryUntil<T>(
    fn: () => Promise<T>,
    validateResult: (result: T) => boolean,
    maxAttempts: number = 10,
    delayMs: number = 1000,
    context?: string
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await fn();

      if (validateResult(result)) {
        return result;
      }

      if (attempt === maxAttempts) {
        throw new Error(
          `${context ? `[${context}] ` : ''}Condition not met after ${maxAttempts} attempts`
        );
      }

      logger.debug(
        `${context ? `[${context}] ` : ''}Condition not met on attempt ${attempt}, retrying in ${delayMs}ms...`
      );
      await this.delay(delayMs);
    }

    throw new Error(`${context ? `[${context}] ` : ''}Maximum attempts reached`);
  }
}
