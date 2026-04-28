import mysql from 'mysql2/promise';
import { Pool as PgPool, QueryResult } from 'pg';
import logger from '../logger/logger';
import { DatabaseError } from '../helpers/error-handler';

/**
 * Database Configuration Interface
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  type: 'mysql' | 'postgresql';
  connectionLimit?: number;
}

/**
 * Query Result Interface
 */
export interface DBQueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  fields?: unknown[];
}

/**
 * Database Client Base Class
 */
export abstract class DatabaseClient {
  protected config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract query<T = unknown>(sql: string, params?: unknown[]): Promise<DBQueryResult<T>>;
  abstract execute(sql: string, params?: unknown[]): Promise<number>;
  abstract beginTransaction(): Promise<void>;
  abstract commit(): Promise<void>;
  abstract rollback(): Promise<void>;
}

/**
 * MySQL Database Client
 */
export class MySQLClient extends DatabaseClient {
  private pool?: mysql.Pool;
  private connection?: mysql.PoolConnection;

  async connect(): Promise<void> {
    try {
      this.pool = mysql.createPool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        connectionLimit: this.config.connectionLimit || 10,
        waitForConnections: true,
      });

      // Test connection
      const testConnection = await this.pool.getConnection();
      await testConnection.release();

      logger.info('MySQL database connected successfully');
    } catch (error) {
      const err = error as Error;
      logger.error('MySQL connection failed', err);
      throw new DatabaseError(`MySQL connection failed: ${err.message}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      logger.info('MySQL database disconnected');
    }
  }

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<DBQueryResult<T>> {
    if (!this.pool) {
      throw new DatabaseError('Database not connected. Call connect() first.');
    }

    try {
      logger.dbQuery(sql, params);
      const [rows, fields] = await this.pool.execute(sql, params as any[]);

      return {
        rows: rows as T[],
        rowCount: Array.isArray(rows) ? rows.length : 0,
        fields: fields as unknown[],
      };
    } catch (error) {
      const err = error as Error;
      logger.error('MySQL query failed', { sql, params, error: err });
      throw new DatabaseError(`Query failed: ${err.message}`, err);
    }
  }

  async execute(sql: string, params?: unknown[]): Promise<number> {
    if (!this.pool) {
      throw new DatabaseError('Database not connected. Call connect() first.');
    }

    try {
      logger.dbQuery(sql, params);
      const [result] = await this.pool.execute(sql, params as any[]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (result as any).affectedRows || 0;
    } catch (error) {
      const err = error as Error;
      logger.error('MySQL execute failed', { sql, params, error: err });
      throw new DatabaseError(`Execute failed: ${err.message}`, err);
    }
  }

  async beginTransaction(): Promise<void> {
    if (!this.pool) {
      throw new DatabaseError('Database not connected');
    }
    this.connection = await this.pool.getConnection();
    await this.connection.beginTransaction();
    logger.debug('Transaction started');
  }

  async commit(): Promise<void> {
    if (!this.connection) {
      throw new DatabaseError('No active transaction');
    }
    await this.connection.commit();
    this.connection.release();
    this.connection = undefined;
    logger.debug('Transaction committed');
  }

  async rollback(): Promise<void> {
    if (!this.connection) {
      throw new DatabaseError('No active transaction');
    }
    await this.connection.rollback();
    this.connection.release();
    this.connection = undefined;
    logger.debug('Transaction rolled back');
  }
}

/**
 * PostgreSQL Database Client
 */
export class PostgreSQLClient extends DatabaseClient {
  private pool?: PgPool;

  async connect(): Promise<void> {
    try {
      this.pool = new PgPool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        max: this.config.connectionLimit || 10,
      });

      // Test connection
      const client = await this.pool.connect();
      client.release();

      logger.info('PostgreSQL database connected successfully');
    } catch (error) {
      const err = error as Error;
      logger.error('PostgreSQL connection failed', err);
      throw new DatabaseError(`PostgreSQL connection failed: ${err.message}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      logger.info('PostgreSQL database disconnected');
    }
  }

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<DBQueryResult<T>> {
    if (!this.pool) {
      throw new DatabaseError('Database not connected. Call connect() first.');
    }

    try {
      logger.dbQuery(sql, params);
      const result: QueryResult = await this.pool.query(sql, params);

      return {
        rows: result.rows as T[],
        rowCount: result.rowCount || 0,
        fields: result.fields,
      };
    } catch (error) {
      const err = error as Error;
      logger.error('PostgreSQL query failed', { sql, params, error: err });
      throw new DatabaseError(`Query failed: ${err.message}`, err);
    }
  }

  async execute(sql: string, params?: unknown[]): Promise<number> {
    if (!this.pool) {
      throw new DatabaseError('Database not connected. Call connect() first.');
    }

    try {
      logger.dbQuery(sql, params);
      const result = await this.pool.query(sql, params);
      return result.rowCount || 0;
    } catch (error) {
      const err = error as Error;
      logger.error('PostgreSQL execute failed', { sql, params, error: err });
      throw new DatabaseError(`Execute failed: ${err.message}`, err);
    }
  }

  async beginTransaction(): Promise<void> {
    if (!this.pool) {
      throw new DatabaseError('Database not connected');
    }
    await this.pool.query('BEGIN');
    logger.debug('Transaction started');
  }

  async commit(): Promise<void> {
    if (!this.pool) {
      throw new DatabaseError('Database not connected');
    }
    await this.pool.query('COMMIT');
    logger.debug('Transaction committed');
  }

  async rollback(): Promise<void> {
    if (!this.pool) {
      throw new DatabaseError('Database not connected');
    }
    await this.pool.query('ROLLBACK');
    logger.debug('Transaction rolled back');
  }
}

/**
 * Database Client Factory
 */
export class DatabaseClientFactory {
  static create(config: DatabaseConfig): DatabaseClient {
    switch (config.type) {
      case 'mysql':
        return new MySQLClient(config);
      case 'postgresql':
        return new PostgreSQLClient(config);
      default:
        throw new DatabaseError(`Unsupported database type: ${config.type}`);
    }
  }

  static createFromEnv(): DatabaseClient {
    const config: DatabaseConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'testdb',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      type: (process.env.DB_TYPE as 'mysql' | 'postgresql') || 'postgresql',
    };

    return this.create(config);
  }
}
