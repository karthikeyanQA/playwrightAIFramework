import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import logger from '../logger/logger';
import { APIError } from '../helpers/error-handler';
import { RetryHelper } from '../helpers/retry-helper';

/**
 * API Request/Response interfaces
 */
export interface APIRequestConfig extends AxiosRequestConfig {
  retry?: {
    maxAttempts?: number;
    delayMs?: number;
  };
}

export interface APIResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string>;
  responseTime: number;
}

/**
 * API Client Utility
 * Provides methods for making HTTP requests with retry logic and logging
 */
export class APIClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string, defaultHeaders?: Record<string, string>) {
    this.baseURL = baseURL;

    this.client = axios.create({
      baseURL,
      timeout: parseInt(process.env.API_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json',
        ...defaultHeaders,
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.apiRequest(config.method?.toUpperCase() || 'GET', config.url || '', config.data);
        return config;
      },
      (error) => {
        logger.error('API Request Error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.apiResponse(response.status, response.config.url || '', response.data);
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          logger.error(`API Response Error: ${error.response.status}`, {
            url: error.config?.url,
            data: error.response.data,
          });
        } else {
          logger.error('API Network Error', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * GET request
   */
  async get<T = unknown>(url: string, config?: APIRequestConfig): Promise<APIResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: APIRequestConfig
  ): Promise<APIResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: APIRequestConfig
  ): Promise<APIResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: APIRequestConfig
  ): Promise<APIResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(url: string, config?: APIRequestConfig): Promise<APIResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  /**
   * Generic request method with retry logic
   */
  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    config?: APIRequestConfig
  ): Promise<APIResponse<T>> {
    const startTime = Date.now();

    const executeRequest = async (): Promise<APIResponse<T>> => {
      try {
        const response: AxiosResponse<T> = await this.client.request({
          method,
          url,
          data,
          ...config,
        });

        const responseTime = Date.now() - startTime;

        return {
          status: response.status,
          data: response.data,
          headers: response.headers as Record<string, string>,
          responseTime,
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const statusCode = error.response?.status || 0;
          const responseData = error.response?.data;

          throw new APIError(
            error.message || 'API request failed',
            statusCode,
            responseData
          );
        }
        throw error;
      }
    };

    // Execute with retry if configured
    if (config?.retry) {
      return await RetryHelper.execute(
        executeRequest,
        {
          maxAttempts: config.retry.maxAttempts || 3,
          delayMs: config.retry.delayMs || 1000,
        },
        `API ${method} ${url}`
      );
    }

    return await executeRequest();
  }

  /**
   * Set authorization header
   */
  setAuthToken(token: string, type: 'Bearer' | 'Basic' = 'Bearer'): void {
    this.client.defaults.headers.common['Authorization'] = `${type} ${token}`;
    logger.debug('Authorization token set');
  }

  /**
   * Remove authorization header
   */
  removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
    logger.debug('Authorization token removed');
  }

  /**
   * Set custom header
   */
  setHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Update base URL
   */
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
    this.client.defaults.baseURL = baseURL;
  }
}

/**
 * Create default API client instance
 */
export const createAPIClient = (
  baseURL?: string,
  headers?: Record<string, string>
): APIClient => {
  const apiBaseURL = baseURL || process.env.API_BASE_URL || 'http://localhost:3000';
  return new APIClient(apiBaseURL, headers);
};
