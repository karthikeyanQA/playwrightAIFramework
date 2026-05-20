# Generate API Test

## Description
Generate a new API test file following framework conventions and best practices.
Supports API input from structured parameters, cURL commands, or trace artifacts.

## Usage
Invoke this skill to create API tests for RESTful endpoints with proper structure, assertions, and error handling.
You can provide API input in one of three ways:
- Direct parameters (`endpoint`, `methods`, `auth`, `test-type`)
- A raw cURL command
- Trace-derived request data (Playwright/network/API traces)

## Parameters
- **input-source** (optional): `params` | `curl` | `trace` (default: `params`)
- **endpoint** (required when `input-source=params`): API endpoint to test (e.g., /api/users, /api/products)
- **methods** (required when `input-source=params`): HTTP methods to test (GET, POST, PUT, DELETE)
- **auth** (optional): Authentication type (bearer, basic, none)
- **test-type** (optional): Test category (smoke, regression, integration)
- **curl-command** (required when `input-source=curl`): Full cURL command string
- **trace-path** (required when `input-source=trace`): Path to trace file/folder to parse request details from
- **operation-filter** (optional): Request matcher for traces (method/path/operationId)
- **base-url** (optional): Override base URL inferred from cURL/trace
- **headers-allowlist** (optional): Headers to include in generated test input
- **headers-denylist** (optional): Sensitive headers to exclude (for example Authorization, Cookie)

## Input Sources

### 1) Params Input
Use explicit parameters for endpoint and methods.

### 2) cURL Input
When `input-source=curl`, the skill should parse and extract:
- HTTP method
- URL path and query params
- Headers
- Body payload
- Auth hints (Bearer/Basic/API key)

Then generate positive and negative tests for the extracted operation.

Example:

```json
{
  "input-source": "curl",
  "curl-command": "curl -X POST 'https://api.example.com/v1/users' -H 'Authorization: Bearer <token>' -H 'Content-Type: application/json' -d '{\"name\":\"John\"}'",
  "test-type": "regression"
}
```

### 3) Trace Input
When `input-source=trace`, the skill should parse request entries from provided traces and derive:
- Method, path, query
- Request/response payload shapes
- Status code expectations
- Reusable auth/header patterns

Prefer most recent successful request/response pairs and generate tests from stable operations.

Example:

```json
{
  "input-source": "trace",
  "trace-path": "test-results/traces/checkout-trace.zip",
  "operation-filter": "POST /api/orders",
  "test-type": "smoke"
}
```

## What This Skill Does

1. Analyzes existing API tests to understand patterns
2. Resolves API input from params, cURL, or trace
3. Creates new test file in `src/tests/api/`
4. Generates test cases for resolved HTTP methods/operations
5. Adds proper assertions (status, schema, data)
6. Includes error handling test cases
7. Adds performance assertions
8. Follows framework conventions
9. Adds proper tags (@api, @smoke, @regression)
10. Includes JSDoc comments

## Trace and cURL Safety Rules

- Never persist secrets from cURL/trace inputs (tokens, cookies, API keys)
- Replace sensitive values with environment variable references
- Use `process.env` for auth and secret headers
- Keep generated sample payloads sanitized and deterministic

## Test Structure Generated

```typescript
import { test, expect } from '@playwright/test';
import { APIClient } from '@utils/api/api-client';
import logger from '@utils/logger/logger';

test.describe('API - [Resource Name]', () => {
  let apiClient: APIClient;

  test.beforeAll(async () => {
    apiClient = new APIClient(process.env.API_BASE_URL || '');
    // Add auth if needed
  });

  test('@smoke @api Should GET all [resources]', async () => {
    const response = await apiClient.get('/endpoint');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBeTruthy();
    expect(response.responseTime).toBeLessThan(2000);
  });

  test('@api Should GET single [resource] by ID', async () => {
    // Test implementation
  });

  test('@api Should POST new [resource]', async () => {
    // Test implementation
  });

  test('@api Should handle POST with invalid data', async () => {
    // Error handling test
  });

  test('@api Should PUT update [resource]', async () => {
    // Test implementation
  });

  test('@api Should DELETE [resource]', async () => {
    // Test implementation
  });

  test('@api Should handle 404 for non-existent [resource]', async () => {
    // 404 handling test
  });
});
```

## Test Cases Generated

### For GET Requests
- Get all resources (200)
- Get single resource by ID (200)
- Get with query parameters
- Handle 404 for non-existent resource
- Handle 401 for unauthorized access
- Verify response schema
- Test pagination (if applicable)

### For POST Requests
- Create new resource (201)
- Handle validation errors (400)
- Handle duplicate entry (409)
- Handle unauthorized creation (401/403)
- Verify created resource fields

### For PUT/PATCH Requests
- Update existing resource (200)
- Handle partial updates
- Handle 404 for non-existent resource
- Handle validation errors (400)
- Verify updated fields

### For DELETE Requests
- Delete existing resource (204/200)
- Handle 404 for non-existent resource
- Handle unauthorized deletion (401/403)
- Verify resource is deleted

## Example Parameters

```json
{
  "endpoint": "/api/users",
  "methods": ["GET", "POST", "PUT", "DELETE"],
  "auth": "bearer",
  "test-type": "regression"
}
```

## Generated File Example

**File**: `src/tests/api/users.spec.ts`

```typescript
/**
 * API Tests - Users Endpoint
 * Tests CRUD operations for /api/users
 */

import { test, expect } from '@playwright/test';
import { APIClient } from '../../utils/api/api-client';
import logger from '../../utils/logger/logger';

test.describe('API - Users', () => {
  let apiClient: APIClient;
  let createdUserId: string;

  test.beforeAll(async () => {
    const baseUrl = process.env.API_BASE_URL || 'https://api.example.com';
    apiClient = new APIClient(baseUrl);
    apiClient.setAuth('bearer', process.env.API_TOKEN);
  });

  test('@smoke @api Should GET all users', async () => {
    logger.testStart('Get All Users');

    const response = await apiClient.get('/api/users');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBeTruthy();
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.responseTime).toBeLessThan(2000);

    logger.testEnd('Get All Users', 'passed');
  });

  test('@api Should POST new user', async () => {
    logger.testStart('Create New User');

    const newUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      role: 'user'
    };

    const response = await apiClient.post('/api/users', newUser);

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data.name).toBe(newUser.name);
    expect(response.data.email).toBe(newUser.email);

    createdUserId = response.data.id;
    logger.testEnd('Create New User', 'passed');
  });

  // More tests...
});
```

## Example Invocation

**User**: "Create API tests for the /api/products endpoint with GET, POST, PUT, DELETE methods"

**AI Agent**:
1. Analyzes existing API tests in `src/tests/api/`
2. Identifies framework patterns and conventions
3. Generates new file `src/tests/api/products.spec.ts`
4. Creates 10-15 test cases covering:
   - CRUD operations
   - Error handling
   - Schema validation
   - Performance assertions
   - Edge cases
5. Adds proper tags and documentation
6. Reports file location and test count

## Success Criteria

- ✅ Test file created in correct location
- ✅ All CRUD operations covered
- ✅ Error cases included
- ✅ Proper assertions added
- ✅ Framework conventions followed
- ✅ Tags and documentation complete
- ✅ TypeScript compiles without errors

## Best Practices Applied

1. **AAA Pattern**: Arrange, Act, Assert
2. **Independent Tests**: Each test can run standalone
3. **Cleanup**: Delete created resources (if needed)
4. **Logging**: Use logger for test lifecycle
5. **Assertions**: Multiple assertions per test
6. **Performance**: Response time assertions
7. **Error Handling**: Test negative scenarios
8. **Tags**: Proper categorization
9. **Data**: Use dynamic data to avoid conflicts

## Related Skills

- `generate-ui-test` - Generate UI tests
- `create-test-data` - Create test data files
- `run-api-tests` - Execute API tests
- `analyze-failures` - Debug failing tests

## Notes

- Generated tests follow existing framework patterns
- Review and customize generated tests as needed
- Add environment-specific data to `.env` files
- Update test data files if using external data
- Consider adding schema validation for responses
