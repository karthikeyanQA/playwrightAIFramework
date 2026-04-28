import logger from '../logger/logger';

/**
 * Custom Error Classes
 * Enterprise-grade error handling with custom error types
 */

export class TestError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'TestError';
    Object.setPrototypeOf(this, TestError.prototype);
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: unknown,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class TimeoutError extends Error {
  constructor(message: string, public readonly timeoutMs?: number) {
    super(message);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

export class ElementNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ElementNotFoundError';
    Object.setPrototypeOf(this, ElementNotFoundError.prototype);
  }
}

/**
 * Error Handler Utility
 */
export class ErrorHandler {
  /**
   * Handle and log errors
   */
  static handle(error: Error | unknown, context?: string): never {
    const contextMsg = context ? `[${context}] ` : '';

    if (error instanceof APIError) {
      const msg = `${contextMsg}API Error: ${error.message} (Status: ${error.statusCode})`;
      logger.error(msg, error);
      throw error;
    }

    if (error instanceof DatabaseError) {
      const msg = `${contextMsg}Database Error: ${error.message}`;
      logger.error(msg, error);
      throw error;
    }

    if (error instanceof TimeoutError) {
      const msg = `${contextMsg}Timeout Error: ${error.message} (${error.timeoutMs}ms)`;
      logger.error(msg, error);
      throw error;
    }

    if (error instanceof TestError) {
      const msg = `${contextMsg}Test Error: ${error.message}`;
      logger.error(msg, error);
      throw error;
    }

    if (error instanceof Error) {
      const msg = `${contextMsg}Unexpected Error: ${error.message}`;
      logger.error(msg, error);
      throw new TestError(msg, error);
    }

    const msg = `${contextMsg}Unknown Error: ${String(error)}`;
    logger.error(msg);
    throw new TestError(msg);
  }

  /**
   * Safe error logging without throwing
   */
  static logError(error: Error | unknown, context?: string): void {
    const contextMsg = context ? `[${context}] ` : '';

    if (error instanceof Error) {
      logger.error(`${contextMsg}${error.message}`, error);
    } else {
      logger.error(`${contextMsg}${String(error)}`);
    }
  }

  /**
   * Create a standardized error message
   */
  static createErrorMessage(
    operation: string,
    details: string,
    error?: Error | unknown
  ): string {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return `Failed to ${operation}: ${details}. ${errorMsg ? `Error: ${errorMsg}` : ''}`.trim();
  }
}
