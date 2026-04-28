import { test, expect } from '@playwright/test';
import { APIClient } from '../../utils/api/api-client';
import { DataHelper } from '../../utils/helpers/data-helper';
import logger from '../../utils/logger/logger';

/**
 * User API Tests
 * Tags: @api, @regression
 */

let apiClient: APIClient;
let authToken: string;

test.describe('User API Tests', () => {
  test.beforeAll(async () => {
    // Initialize API client
    apiClient = new APIClient(process.env.API_BASE_URL || 'http://localhost:3000/api');

    // Perform login to get auth token
    const loginResponse = await apiClient.post('/auth/login', {
      username: 'testuser@example.com',
      password: 'Test@1234',
    });

    authToken = loginResponse.data as string;
    apiClient.setAuthToken(authToken);
    logger.info('API authentication successful');
  });

  test.afterAll(async () => {
    // Cleanup
    apiClient.removeAuthToken();
  });

  test('@api @smoke Should get list of users', async () => {
    // Act
    const response = await apiClient.get('/users', {
      retry: { maxAttempts: 2 },
    });

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBeTruthy();
    expect(response.responseTime).toBeLessThan(5000);
    logger.step(`Retrieved ${(response.data as unknown[]).length} users in ${response.responseTime}ms`);
  });

  test('@api Should get user by ID', async () => {
    const userId = 1;

    // Act
    const response = await apiClient.get(`/users/${userId}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id', userId);
    expect(response.data).toHaveProperty('email');
    expect(response.data).toHaveProperty('firstName');
    logger.step(`Retrieved user: ${JSON.stringify(response.data)}`);
  });

  test('@api Should create new user', async () => {
    // Arrange
    const newUser = {
      email: DataHelper.generateRandomEmail(),
      firstName: 'Test',
      lastName: 'User',
      password: 'Test@1234',
    };

    // Act
    const response = await apiClient.post('/users', newUser);

    // Assert
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('email', newUser.email);
    logger.step(`Created user with ID: ${(response.data as { id: number }).id}`);
  });

  test('@api Should update existing user', async () => {
    const userId = 1;
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    // Act
    const response = await apiClient.put(`/users/${userId}`, updateData);

    // Assert
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('firstName', updateData.firstName);
    expect(response.data).toHaveProperty('lastName', updateData.lastName);
    logger.step('User updated successfully');
  });

  test('@api Should delete user', async () => {
    // First create a user to delete
    const newUser = {
      email: DataHelper.generateRandomEmail(),
      firstName: 'ToDelete',
      lastName: 'User',
      password: 'Test@1234',
    };

    const createResponse = await apiClient.post('/users', newUser);
    const userId = (createResponse.data as { id: number }).id;

    // Act - Delete the user
    const deleteResponse = await apiClient.delete(`/users/${userId}`);

    // Assert
    expect(deleteResponse.status).toBe(204);
    logger.step(`Deleted user with ID: ${userId}`);

    // Verify user is deleted
    try {
      await apiClient.get(`/users/${userId}`);
      expect(false).toBeTruthy(); // Should not reach here
    } catch (error) {
      expect(error).toBeDefined();
      logger.step('Verified user is deleted');
    }
  });

  test('@api Should return 404 for non-existent user', async () => {
    const nonExistentId = 999999;

    // Act & Assert
    try {
      await apiClient.get(`/users/${nonExistentId}`);
      expect(false).toBeTruthy(); // Should not reach here
    } catch (error) {
      expect(error).toBeDefined();
      logger.step('Correctly returned 404 for non-existent user');
    }
  });

  test('@api Should validate user creation with missing fields', async () => {
    // Arrange - Invalid user data
    const invalidUser = {
      firstName: 'Test',
      // Missing required fields
    };

    // Act & Assert
    try {
      await apiClient.post('/users', invalidUser);
      expect(false).toBeTruthy(); // Should not reach here
    } catch (error) {
      expect(error).toBeDefined();
      logger.step('Validation error returned for missing fields');
    }
  });
});

test.describe('User API Performance Tests', () => {
  test.beforeAll(async () => {
    apiClient = new APIClient(process.env.API_BASE_URL || 'http://localhost:3000/api');
  });

  test('@api @regression Should return users within acceptable time', async () => {
    // Act
    const response = await apiClient.get('/users');

    // Assert
    expect(response.status).toBe(200);
    expect(response.responseTime).toBeLessThan(3000); // Response within 3 seconds
    logger.step(`API response time: ${response.responseTime}ms`);
  });
});
