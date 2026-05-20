---
name: generate-api-test
description: 'Generate API test files for RESTful endpoints. Use when creating API tests, writing tests for an endpoint, generating tests from a cURL command, or deriving tests from a Playwright trace.'
argument-hint: 'endpoint, methods (GET/POST/PUT/DELETE), auth (bearer/basic/none), test-type (smoke/regression), or provide a cURL command / trace path'
---

# Generate API Test

Generate a new API test file following framework conventions and best practices.
Supports API input from structured parameters, cURL commands, or trace artifacts.

## When to Use
- Creating tests for a new or existing REST endpoint
- Generating tests from a raw cURL command
- Deriving tests from Playwright/network/API trace files

## Input Sources

### 1) Params Input (`input-source: params`)
Provide: `endpoint`, `methods`, `auth`, `test-type`

### 2) cURL Input (`input-source: curl`)
Provide the full cURL command. The skill will extract method, URL, headers, body, and auth hints, then generate positive and negative tests.

### 3) Trace Input (`input-source: trace`)
Provide a path to a trace file/folder. The skill will parse request/response pairs and generate tests from stable operations.

**Safety Rules for cURL/Trace:**
- Never persist secrets (tokens, cookies, API keys) — replace with `process.env` references
- Keep generated payloads sanitized and deterministic

## Procedure

1. Resolve input source and extract endpoint details
2. Scan `src/tests/api/` to understand existing patterns and conventions
3. Create new test file at `src/tests/api/<resource>.spec.ts`
4. Generate test cases:
   - GET: list, single by ID, query params, 404, 401, schema validation
   - POST: create (201), validation errors (400), duplicate (409), 401/403
   - PUT/PATCH: update (200), partial update, 404, validation errors
   - DELETE: delete (200/204), 404, 401/403, verify deletion
5. Add performance assertions (`responseTime < 2000`)
6. Add proper tags (`@api`, `@smoke`, `@regression`) and JSDoc

## Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { APIClient } from '@utils/api/api-client';
import logger from '@utils/logger/logger';

test.describe('API - [Resource Name]', () => {
  let apiClient: APIClient;

  test.beforeAll(async () => {
    apiClient = new APIClient(process.env.API_BASE_URL || '');
    // apiClient.setAuth('bearer', process.env.API_TOKEN);
  });

  test('@smoke @api Should GET all [resources]', async () => {
    const response = await apiClient.get('/endpoint');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBeTruthy();
    expect(response.responseTime).toBeLessThan(2000);
  });
});
```

## Success Criteria

- ✅ Test file created in `src/tests/api/`
- ✅ All CRUD operations covered with positive and negative cases
- ✅ Framework conventions followed
- ✅ Tags and JSDoc complete
- ✅ TypeScript compiles without errors

## Related Skills

- `generate-ui-test` — generate UI/E2E tests
- `analyze-failures` — debug failing API tests
- `debug-test` — debug a specific test
