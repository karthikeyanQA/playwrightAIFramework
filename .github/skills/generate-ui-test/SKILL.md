---
name: generate-ui-test
description: 'Generate UI/E2E test files using Page Object Model pattern. Use when creating UI tests, writing end-to-end tests for a page, generating test scenarios for a web page, or creating Playwright UI specs.'
argument-hint: 'page-name, test-scenarios (comma-separated), test-type (smoke/regression/e2e), create-page-object (true/false)'
---

# Generate UI Test

Generate a new UI test file with Page Object Model pattern, proper waits, and assertions.

## When to Use
- Creating tests for a new or existing web page
- Generating tests for specific user scenarios (login, checkout, search, etc.)
- Need a page object + spec file pair generated together

## Procedure

1. Check if a page object exists in `src/pages/` for the target page
2. If missing (and `create-page-object: true`), create one — see `create-page-object` skill
3. Scan `src/tests/ui/` for existing patterns and naming conventions
4. Create `src/tests/ui/<page-name>.spec.ts`
5. For each scenario, generate a test using AAA pattern (Arrange / Act / Assert)
6. Add proper waits (`waitForVisible`, `waitForURL`) — no hard `waitForTimeout`
7. Add tags (`@ui`, `@smoke`, `@regression`) and logger calls
8. Verify TypeScript compiles

## Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { [PageName]Page } from '@pages/[page-name]-page';
import logger from '@utils/logger/logger';

test.describe('UI - [Page Name]', () => {
  let page: [PageName]Page;

  test.beforeEach(async ({ page: p }) => {
    page = new [PageName]Page(p);
    await p.goto('/[page-url]');
    await page.verifyPageLoaded();
  });

  test('@smoke @ui Should [scenario]', async () => {
    logger.testStart('[Scenario]');
    // Arrange / Act / Assert
    logger.testEnd('[Scenario]', 'passed');
  });
});
```

## Common Scenario Categories

- **Form Submission**: valid data, required field validation, error messages, success state
- **Navigation**: page load, URL changes, breadcrumbs, back/forward
- **Data Display**: table content, search/filter, pagination, empty states
- **Error Handling**: network errors, loading states, input format validation

## Success Criteria

- ✅ Page object exists or is created
- ✅ Test file generated in `src/tests/ui/`
- ✅ All scenarios covered
- ✅ Proper waits and assertions used (no hard waits)
- ✅ POM pattern followed
- ✅ TypeScript compiles without errors

## Related Skills

- `create-page-object` — create a standalone page object
- `generate-api-test` — generate API tests
- `debug-test` — debug a failing UI test
