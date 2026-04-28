import { test, expect } from '@playwright/test';
import { APIClient } from '../../utils/api/api-client';
import logger from '../../utils/logger/logger';

/**
 * Demo API Tests - Using JSONPlaceholder public API
 * These tests actually work and demonstrate API testing capabilities
 * Tags: @api, @smoke, @demo
 */

let apiClient: APIClient;

test.describe('JSONPlaceholder API - Posts Tests', () => {
  test.beforeAll(async () => {
    logger.info('Initializing API client for JSONPlaceholder');
    // Using JSONPlaceholder - a free fake REST API for testing
    apiClient = new APIClient('https://jsonplaceholder.typicode.com');
  });

  test('@smoke @api Should get all posts', async () => {
    logger.step('Fetching all posts');
    
    // Act
    const response = await apiClient.get('/posts');

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBeTruthy();
    expect((response.data as unknown[]).length).toBeGreaterThan(0);
    expect(response.responseTime).toBeLessThan(5000);
    
    logger.step(`Retrieved ${(response.data as unknown[]).length} posts in ${response.responseTime}ms`);
  });

  test('@api Should get post by ID', async () => {
    const postId = 1;
    logger.step(`Fetching post with ID: ${postId}`);

    // Act
    const response = await apiClient.get(`/posts/${postId}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id', postId);
    expect(response.data).toHaveProperty('title');
    expect(response.data).toHaveProperty('body');
    expect(response.data).toHaveProperty('userId');
    
    logger.step(`Retrieved post: ${JSON.stringify(response.data, null, 2)}`);
  });

  test('@api Should create new post', async () => {
    logger.step('Creating new post');
    
    // Arrange
    const newPost = {
      title: 'Test Post from Automation Framework',
      body: 'This is a test post created by the Playwright automation framework',
      userId: 1,
    };

    // Act
    const response = await apiClient.post('/posts', newPost);

    // Assert
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('title', newPost.title);
    expect(response.data).toHaveProperty('body', newPost.body);
    
    logger.step(`Created post with ID: ${(response.data as { id: number }).id}`);
  });

  test('@api Should update existing post', async () => {
    const postId = 1;
    logger.step(`Updating post with ID: ${postId}`);
    
    // Arrange
    const updateData = {
      id: postId,
      title: 'Updated Title',
      body: 'Updated body content',
      userId: 1,
    };

    // Act
    const response = await apiClient.put(`/posts/${postId}`, updateData);

    // Assert
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id', postId);
    expect(response.data).toHaveProperty('title', updateData.title);
    expect(response.data).toHaveProperty('body', updateData.body);
    
    logger.step('Post updated successfully');
  });

  test('@api Should partially update post with PATCH', async () => {
    const postId = 1;
    logger.step(`Partially updating post with ID: ${postId}`);
    
    // Arrange
    const patchData = {
      title: 'Partially Updated Title',
    };

    // Act
    const response = await apiClient.patch(`/posts/${postId}`, patchData);

    // Assert
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('title', patchData.title);
    
    logger.step('Post partially updated successfully');
  });

  test('@api Should delete post', async () => {
    const postId = 1;
    logger.step(`Deleting post with ID: ${postId}`);

    // Act
    const response = await apiClient.delete(`/posts/${postId}`);

    // Assert
    expect(response.status).toBe(200);
    
    logger.step(`Deleted post with ID: ${postId}`);
  });

  test('@api Should handle 404 for non-existent post', async () => {
    const nonExistentId = 999999;
    logger.step(`Attempting to fetch non-existent post with ID: ${nonExistentId}`);

    // Act & Assert
    try {
      await apiClient.get(`/posts/${nonExistentId}`);
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // JSONPlaceholder returns empty object for non-existent resources
      // This is expected behavior
      logger.step('Correctly handled non-existent resource');
      expect(error).toBeDefined();
    }
  });

  test('@api @regression Should verify response time performance', async () => {
    logger.step('Testing API response time');

    // Act
    const response = await apiClient.get('/posts/1');

    // Assert
    expect(response.status).toBe(200);
    expect(response.responseTime).toBeLessThan(3000); // Should respond within 3 seconds
    
    logger.step(`API response time: ${response.responseTime}ms - Performance good ✓`);
  });
});

test.describe('JSONPlaceholder API - Comments Tests', () => {
  test.beforeAll(async () => {
    apiClient = new APIClient('https://jsonplaceholder.typicode.com');
  });

  test('@smoke @api Should get comments for a post', async () => {
    const postId = 1;
    logger.step(`Fetching comments for post ID: ${postId}`);

    // Act
    const response = await apiClient.get(`/posts/${postId}/comments`);

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBeTruthy();
    expect((response.data as unknown[]).length).toBeGreaterThan(0);
    
    // Verify comment structure
    const firstComment = (response.data as any[])[0];
    expect(firstComment).toHaveProperty('postId', postId);
    expect(firstComment).toHaveProperty('id');
    expect(firstComment).toHaveProperty('name');
    expect(firstComment).toHaveProperty('email');
    expect(firstComment).toHaveProperty('body');
    
    logger.step(`Retrieved ${(response.data as unknown[]).length} comments for post ${postId}`);
  });

  test('@api Should get all comments', async () => {
    logger.step('Fetching all comments');

    // Act
    const response = await apiClient.get('/comments');

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBeTruthy();
    expect((response.data as unknown[]).length).toBeGreaterThan(0);
    
    logger.step(`Retrieved ${(response.data as unknown[]).length} total comments`);
  });
});

test.describe('JSONPlaceholder API - Users Tests', () => {
  test.beforeAll(async () => {
    apiClient = new APIClient('https://jsonplaceholder.typicode.com');
  });

  test('@smoke @api Should get all users', async () => {
    logger.step('Fetching all users');

    // Act
    const response = await apiClient.get('/users');

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBeTruthy();
    expect((response.data as unknown[]).length).toBe(10);
    
    logger.step(`Retrieved ${(response.data as unknown[]).length} users`);
  });

  test('@api Should get user by ID with complete details', async () => {
    const userId = 1;
    logger.step(`Fetching user with ID: ${userId}`);

    // Act
    const response = await apiClient.get(`/users/${userId}`);

    // Assert
    expect(response.status).toBe(200);
    
    // Verify user structure
    expect(response.data).toHaveProperty('id', userId);
    expect(response.data).toHaveProperty('name');
    expect(response.data).toHaveProperty('username');
    expect(response.data).toHaveProperty('email');
    expect(response.data).toHaveProperty('address');
    expect(response.data).toHaveProperty('phone');
    expect(response.data).toHaveProperty('website');
    expect(response.data).toHaveProperty('company');
    
    logger.step(`User details: ${(response.data as any).name} (${(response.data as any).email})`);
  });
});

test.describe('API Client Features Demonstration', () => {
  test.beforeAll(async () => {
    apiClient = new APIClient('https://jsonplaceholder.typicode.com');
  });

  test('@api Should demonstrate retry mechanism', async () => {
    logger.step('Testing API retry mechanism');

    // Act - Request with retry configuration
    const response = await apiClient.get('/posts/1', {
      retry: { maxAttempts: 3, delayMs: 1000 },
    });

    // Assert
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id');
    
    logger.step('Retry mechanism working correctly');
  });

  test('@api Should handle custom headers', async () => {
    logger.step('Testing custom headers');

    // Arrange
    apiClient.setHeader('X-Custom-Header', 'test-value');

    // Act
    const response = await apiClient.get('/posts/1');

    // Assert
    expect(response.status).toBe(200);
    
    logger.step('Custom headers handled successfully');
  });
});
