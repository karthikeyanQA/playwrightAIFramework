import winston from 'winston';
import path from 'path';
import fs from 'fs';

/**
 * Logger Configuration
 * Enterprise-grade logging with Winston
 * Supports multiple log levels and file-based logging
 */

// Ensure logs directory exists
const logsDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logLevel = process.env.LOG_LEVEL || 'info';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`
      : `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return stack
            ? `[${timestamp}] ${level}: ${message}\n${stack}`
            : `[${timestamp}] ${level}: ${message}`;
        })
      ),
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Export logger methods
export default {
  info: (message: string, meta?: Record<string, unknown>) => {
    logger.info(message, meta);
  },

  error: (message: string, error?: Error | unknown, meta?: Record<string, unknown>) => {
    if (error instanceof Error) {
      logger.error(message, { error: error.message, stack: error.stack, ...meta });
    } else {
      logger.error(message, { error, ...meta });
    }
  },

  warn: (message: string, meta?: Record<string, unknown>) => {
    logger.warn(message, meta);
  },

  debug: (message: string, meta?: Record<string, unknown>) => {
    logger.debug(message, meta);
  },

  http: (message: string, meta?: Record<string, unknown>) => {
    logger.http(message, meta);
  },

  // Special method for test step logging
  step: (stepName: string, meta?: Record<string, unknown>) => {
    logger.info(`STEP: ${stepName}`, meta);
  },

  // Special method for API logging
  apiCall: (method: string, url: string, status?: number, meta?: Record<string, unknown>) => {
    const message = status
      ? `API ${method} ${url} - Status: ${status}`
      : `API ${method} ${url}`;
    logger.http(message, meta);
  },

  // Test lifecycle methods
  testStart: (testName: string) => {
    logger.info(`========== TEST START: ${testName} ==========`);
  },

  testEnd: (testName: string, status: 'passed' | 'failed' | 'skipped') => {
    const logMethod = status === 'failed' ? 'error' : 'info';
    logger[logMethod](`========== TEST END: ${testName} - ${status.toUpperCase()} ==========`);
  },

  // API request/response methods
  apiRequest: (method: string, url: string, data?: unknown) => {
    logger.http(`API REQUEST: ${method} ${url}`, data ? { data } : undefined);
  },

  apiResponse: (status: number, url: string, data?: unknown) => {
    logger.http(`API RESPONSE: ${status} ${url}`, data ? { data } : undefined);
  },

  // Database query method
  dbQuery: (query: string, params?: unknown) => {
    logger.debug(`DB QUERY: ${query}`, params ? { params } : undefined);
  },
};
