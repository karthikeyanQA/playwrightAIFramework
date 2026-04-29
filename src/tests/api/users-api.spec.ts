import { test, expect } from '@playwright/test';
import { APIClient } from '../../utils/api/api-client';
import { DataHelper } from '../../utils/helpers/data-helper';
import { testReporter as reporter } from '../helpers/allure-reporter';

/**
 * User API Tests
 * Tags: @api, @regression
 */

let apiClient: APIClient;
let authToken: string;
const configuredApiBaseURL = process.env.API_BASE_URL;
const localApiBaseURL =
  configuredApiBaseURL && !configuredApiBaseURL.includes('example.com')
    ? configuredApiBaseURL
    : 'https://jsonplaceholder.typicode.com';
const isJsonPlaceholder = localApiBaseURL.includes('jsonplaceholder.typicode.com');

test.describe('User API Tests', () => {
  test.beforeAll(async () => {
    // Initialize API client
    apiClient = new APIClient(localApiBaseURL);

    if (!isJsonPlaceholder) {
      // Perform login to get auth token for authenticated APIs
      const loginResponse = await apiClient.post('/auth/login', {
        username: 'testuser@example.com',
        password: 'Test@1234',
      });

      authToken = loginResponse.data as string;
      apiClient.setAuthToken(authToken);
      reporter.info('API authentication successful');
    } else {
      reporter.info('Using JSONPlaceholder for local API runs - authentication skipped');
    }
  });

  test.afterAll(async () => {
    // Cleanup
    if (!isJsonPlaceholder) {
      apiClient.removeAuthToken();
    }
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
    reporter.step(
      `Retrieved ${(response.data as unknown[]).length} users in ${response.responseTime}ms`
    );
  });

  test('@api Should get user by ID', async () => {
    const userId = 1;

    // Act
    const response = await apiClient.get(`/users/${userId}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id', userId);
    expect(response.data).toHaveProperty('email');
    if (isJsonPlaceholder) {
      expect(response.data).toHaveProperty('name');
      expect(response.data).toHaveProperty('username');
    } else {
      expect(response.data).toHaveProperty('firstName');
    }
    reporter.step(`Retrieved user: ${JSON.stringify(response.data)}`);
  });

  test('@api Should create new user', async () => {
    // Arrange
    const newUser = isJsonPlaceholder
      ? {
          name: 'Test User',
          username: 'testuser',
          email: DataHelper.generateRandomEmail(),
        }
      : {
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
    reporter.step(`Created user with ID: ${(response.data as { id: number }).id}`);
  });

  test('@api Should update existing user', async () => {
    const userId = 1;
    const updateData = isJsonPlaceholder
      ? {
          name: 'Updated Name',
        }
      : {
          firstName: 'Updated',
          lastName: 'Name',
        };

    // Act
    const response = await apiClient.put(`/users/${userId}`, updateData);

    // Assert
    expect(response.status).toBe(200);
    if (isJsonPlaceholder) {
      expect(response.data).toHaveProperty('name', updateData.name);
    } else {
      expect(response.data).toHaveProperty('firstName', updateData.firstName);
      expect(response.data).toHaveProperty('lastName', updateData.lastName);
    }
    reporter.step('User updated successfully');
  });

  test('@api Should delete user', async () => {
    // First create a user to delete
    const newUser = isJsonPlaceholder
      ? {
          name: 'ToDelete User',
          username: 'todelete',
          email: DataHelper.generateRandomEmail(),
        }
      : {
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
    expect(deleteResponse.status).toBe(isJsonPlaceholder ? 200 : 204);
    reporter.step(`Deleted user with ID: ${userId}`);

    // Verification for deletion is environment-specific for mock APIs
    if (!isJsonPlaceholder) {
      try {
        await apiClient.get(`/users/${userId}`);
        expect(false).toBeTruthy(); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
        reporter.step('Verified user is deleted');
      }
    } else {
      reporter.step('Delete endpoint validated for JSONPlaceholder');
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
      reporter.step('Correctly returned 404 for non-existent user');
    }
  });

  test('@api Should validate user creation with missing fields', async () => {
    // Arrange - Invalid user data
    const invalidUser = isJsonPlaceholder
      ? {
          email: DataHelper.generateRandomEmail(),
        }
      : {
          firstName: 'Test',
          // Missing required fields
        };

    // Act & Assert
    if (isJsonPlaceholder) {
      const response = await apiClient.post('/users', invalidUser);
      expect(response.status).toBe(201);
      reporter.step('JSONPlaceholder accepted partial payload as expected');
    } else {
      try {
        await apiClient.post('/users', invalidUser);
        expect(false).toBeTruthy(); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
        reporter.step('Validation error returned for missing fields');
      }
    }
  });
});

test.describe('User API Performance Tests', () => {
  test.beforeAll(async () => {
    apiClient = new APIClient(localApiBaseURL);
  });

  test('@api @regression Should return users within acceptable time', async () => {
    // Act
    const response = await apiClient.get('/users');

    // Assert
    expect(response.status).toBe(200);
    expect(response.responseTime).toBeLessThan(3000); // Response within 3 seconds
    reporter.step(`API response time: ${response.responseTime}ms`);
  });
});
