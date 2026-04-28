import * as fs from 'fs/promises';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import * as yaml from 'js-yaml';
import logger from '../logger/logger';

/**
 * Data Helper Utility
 * Provides methods to read and write test data from various sources
 */
export class DataHelper {
  /**
   * Read JSON file
   */
  static async readJSON<T = unknown>(filePath: string): Promise<T> {
    try {
      const absolutePath = this.resolveDataPath(filePath);
      const content = await fs.readFile(absolutePath, 'utf-8');
      const data = JSON.parse(content);
      logger.debug(`JSON data loaded from: ${filePath}`);
      return data as T;
    } catch (error) {
      logger.error(`Failed to read JSON file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Write JSON file
   */
  static async writeJSON(filePath: string, data: unknown): Promise<void> {
    try {
      const absolutePath = this.resolveDataPath(filePath);
      const content = JSON.stringify(data, null, 2);
      await fs.writeFile(absolutePath, content, 'utf-8');
      logger.debug(`JSON data written to: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to write JSON file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Read CSV file
   */
  static async readCSV<T = unknown>(filePath: string, options?: { columns?: boolean; delimiter?: string }): Promise<T[]> {
    try {
      const absolutePath = this.resolveDataPath(filePath);
      const content = await fs.readFile(absolutePath, 'utf-8');
      const records = parse(content, {
        columns: options?.columns ?? true,
        delimiter: options?.delimiter ?? ',',
        skip_empty_lines: true,
        trim: true,
      });
      logger.debug(`CSV data loaded from: ${filePath}, records: ${records.length}`);
      return records as T[];
    } catch (error) {
      logger.error(`Failed to read CSV file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Read YAML file
   */
  static async readYAML<T = unknown>(filePath: string): Promise<T> {
    try {
      const absolutePath = this.resolveDataPath(filePath);
      const content = await fs.readFile(absolutePath, 'utf-8');
      const data = yaml.load(content);
      logger.debug(`YAML data loaded from: ${filePath}`);
      return data as T;
    } catch (error) {
      logger.error(`Failed to read YAML file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Write YAML file
   */
  static async writeYAML(filePath: string, data: unknown): Promise<void> {
    try {
      const absolutePath = this.resolveDataPath(filePath);
      const content = yaml.dump(data);
      await fs.writeFile(absolutePath, content, 'utf-8');
      logger.debug(`YAML data written to: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to write YAML file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Read text file
   */
  static async readText(filePath: string): Promise<string> {
    try {
      const absolutePath = this.resolveDataPath(filePath);
      const content = await fs.readFile(absolutePath, 'utf-8');
      logger.debug(`Text file loaded from: ${filePath}`);
      return content;
    } catch (error) {
      logger.error(`Failed to read text file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Write text file
   */
  static async writeText(filePath: string, content: string): Promise<void> {
    try {
      const absolutePath = this.resolveDataPath(filePath);
      await fs.writeFile(absolutePath, content, 'utf-8');
      logger.debug(`Text file written to: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to write text file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      const absolutePath = this.resolveDataPath(filePath);
      await fs.access(absolutePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate random data
   */
  static generateRandomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random email
   */
  static generateRandomEmail(domain: string = 'test.com'): string {
    const username = this.generateRandomString(8).toLowerCase();
    return `${username}@${domain}`;
  }

  /**
   * Generate random number
   */
  static generateRandomNumber(min: number = 0, max: number = 1000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Get timestamp
   */
  static getTimestamp(format: 'iso' | 'unix' | 'formatted' = 'iso'): string | number {
    const now = new Date();
    
    switch (format) {
      case 'iso':
        return now.toISOString();
      case 'unix':
        return now.getTime();
      case 'formatted':
        return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
      default:
        return now.toISOString();
    }
  }

  /**
   * Resolve data file path
   */
  private static resolveDataPath(filePath: string): string {
    // If absolute path, return as-is
    if (path.isAbsolute(filePath)) {
      return filePath;
    }

    // Otherwise, resolve relative to data directory
    return path.resolve(process.cwd(), 'src', 'data', filePath);
  }

  /**
   * Deep clone object
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Merge objects
   */
  static merge<T extends object>(target: T, ...sources: Partial<T>[]): T {
    return Object.assign({}, target, ...sources);
  }
}
