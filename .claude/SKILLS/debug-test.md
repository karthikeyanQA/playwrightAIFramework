# Debug Test

## Description
Debug a failing test by analyzing errors, checking logs, reviewing screenshots/videos, and providing fix suggestions.

## Usage
Invoke this skill when a test is failing and you need to understand why and how to fix it.

## Parameters
- **test-name** (required): Name or path of the failing test
- **error-message** (optional): Error message from test failure
- **check-screenshots** (optional): Review failure screenshots (true/false)
- **check-videos** (optional): Review failure videos (true/false)

## What This Skill Does

1. Locates the test file
2. Reads test implementation
3. Analyzes error message and stack trace
4. Checks test logs for the specific test
5. Reviews screenshots/videos if available
6. Identifies the root cause
7. Suggests specific fixes
8. Provides code changes if needed

## Debugging Process

### Step 1: Gather Information
- Read test file
- Extract test steps
- Get error message
- Get stack trace
- Check execution logs

### Step 2: Analyze Error
- Identify error type:
  - Assertion failure
  - Timeout
  - Element not found
  - Network error
  - Authentication failure
  - Environment issue

### Step 3: Review Artifacts
- Screenshots: Visual state when failed
- Videos: User journey replay
- Logs: Detailed execution trace
- Network logs: API calls/responses

### Step 4: Identify Root Cause
- Flaky test (timing issue)
- Broken selector
- Environment change
- Data dependency
- Application bug
- Test logic error

### Step 5: Provide Solution
- Specific code changes
- Selector updates
- Wait improvements
- Data fixes
- Configuration changes

## Error Types & Solutions

### 1. Timeout Errors

**Error**: `Timeout 30000ms exceeded waiting for locator`

**Common Causes:**
- Selector doesn't match element
- Element not visible
- Slow page load
- Network issues

**Solutions:**
```typescript
// ❌ Bad: Hard-coded wait
await page.waitForTimeout(5000);

// ✅ Good: Wait for specific condition
await page.waitForLoadState('networkidle');
await element.waitFor({ state: 'visible', timeout: 30000 });

// ✅ Better: Use UIActions
await uiActions.waitForVisible(element, 'Element Name', 30000);
```

### 2. Assertion Failures

**Error**: `Expected "Welcome" but received "Error"`

**Common Causes:**
- Wrong expected value
- Application bug
- State not ready
- Wrong element

**Solutions:**
```typescript
// ❌ Bad: Immediate assertion
await expect(element).toHaveText('Welcome');

// ✅ Good: Wait then assert
await element.waitFor({ state: 'visible' });
await expect(element).toHaveText('Welcome');

// ✅ Better: Use page object assertion
await loginPage.verifyWelcomeMessage('Welcome');
```

### 3. Element Not Found

**Error**: `Element not found: button[type="submit"]`

**Common Causes:**
- Selector changed
- Element in shadow DOM
- Wrong page/state
- Dynamic content

**Solutions:**
```typescript
// ❌ Bad: Fragile selector
page.locator('div > div > button')

// ✅ Good: Semantic selector
page.locator('button:has-text("Submit")')
page.getByRole('button', { name: 'Submit' })

// ✅ Best: data-testid
page.locator('[data-testid="submit-button"]')
```

### 4. Flaky Tests

**Error**: Test passes sometimes, fails other times

**Common Causes:**
- Race conditions
- Network timing
- Animation timing
- Test data conflicts

**Solutions:**
```typescript
// ❌ Bad: Hard wait
await page.waitForTimeout(1000);

// ✅ Good: Auto-waiting
await uiActions.click(button, 'Submit');

// ✅ Better: Explicit wait
await page.waitForResponse(resp => resp.url().includes('/api/data'));

// ✅ Best: Retry mechanism
await RetryHelper.execute(
  async () => await submitForm(),
  { maxAttempts: 3, delayMs: 1000 }
);
```

### 5. Authentication Errors

**Error**: `401 Unauthorized` or `403 Forbidden`

**Common Causes:**
- Missing auth token
- Expired session
- Wrong credentials
- Missing setup

**Solutions:**
```typescript
// ❌ Bad: No auth
const response = await apiClient.get('/api/users');

// ✅ Good: Set auth
apiClient.setAuth('bearer', process.env.API_TOKEN);
const response = await apiClient.get('/api/users');

// ✅ Better: Auth in beforeAll
test.beforeAll(async () => {
  apiClient = new APIClient(baseUrl);
  apiClient.setAuth('bearer', await getAuthToken());
});
```

## Debug Example

### Failing Test

```typescript
test('@ui Should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto('/login');

  await loginPage.login('user@example.com', 'password123');

  // ❌ Fails here
  await expect(page).toHaveURL('/dashboard');
});
```

### Error Message
```
Error: Timeout 30000ms exceeded.
Expected URL: /dashboard
Actual URL: /login
```

### Debug Analysis

**Step 1: Check Logs**
```
[INFO] Clicking on Login Button
[ERROR] Element not clickable: button is disabled
```

**Step 2: Check Screenshot**
- Login button is disabled
- Validation errors showing "Invalid email format"

**Step 3: Root Cause**
- Email validation failing
- Button not becoming enabled
- Test using wrong email format

**Step 4: Solution**

```typescript
test('@ui Should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto('/login');

  // ✅ Fix: Wait for page to be ready
  await loginPage.verifyPageLoaded();

  // ✅ Fix: Use valid email
  await loginPage.login(
    process.env.TEST_USERNAME!, // Valid email
    process.env.TEST_PASSWORD!
  );

  // ✅ Fix: Wait for navigation
  await page.waitForURL('/dashboard', { timeout: 10000 });

  // ✅ Additional verification
  await expect(page).toHaveURL('/dashboard');
});
```

## Debug Checklist

### Before Debugging
- [ ] Run test in isolation
- [ ] Check if test passes in headed mode
- [ ] Verify environment variables set
- [ ] Check test data exists
- [ ] Review recent code changes

### During Debugging
- [ ] Read error message carefully
- [ ] Check stack trace for failure point
- [ ] Review test execution logs
- [ ] Look at failure screenshot
- [ ] Watch failure video
- [ ] Check element selectors
- [ ] Verify test data
- [ ] Check network calls

### Common Fixes
- [ ] Update element selectors
- [ ] Add proper waits
- [ ] Fix test data
- [ ] Update assertions
- [ ] Add retry logic
- [ ] Fix race conditions
- [ ] Update environment config

## Debugging Commands

```bash
# Run single test in debug mode
npx playwright test --debug tests/ui/login.spec.ts

# Run test in headed mode
npx playwright test tests/ui/login.spec.ts --headed

# Run with trace
npx playwright test tests/ui/login.spec.ts --trace on

# View trace
npx playwright show-trace trace.zip

# Run with specific browser
npx playwright test tests/ui/login.spec.ts --project=chromium

# Run with slow motion
SLOW_MO=1000 npx playwright test tests/ui/login.spec.ts
```

## Example Invocation

**User**: "The login test is failing with timeout error"

**AI Agent**:
1. Finds test file: `src/tests/ui/auth/login.spec.ts`
2. Reads test implementation
3. Checks error logs: `logs/error.log`
4. Reviews screenshot: `screenshots/login-test-failure.png`
5. Analyzes:
   - Error: Timeout waiting for submit button
   - Cause: Button selector changed from `button[type="submit"]` to `button.submit-btn`
6. Provides fix:
   ```typescript
   // In login-page.ts
   - readonly submitButton = page.locator('button[type="submit"]');
   + readonly submitButton = page.locator('button.submit-btn');
   ```
7. Suggests adding data-testid for stability

## Success Criteria

- ✅ Root cause identified
- ✅ Specific fix provided
- ✅ Code changes suggested
- ✅ Test passes after fix
- ✅ Prevention tips given

## Related Skills

- `analyze-failures` - Analyze multiple test failures
- `fix-flaky-test` - Fix intermittent test failures
- `update-selectors` - Update page object selectors
- `run-smoke-tests` - Verify fix with smoke tests

## Notes

- Always run test in isolation first
- Use headed mode for visual debugging
- Check Playwright trace for detailed timeline
- Look for patterns in flaky tests
- Add comments explaining complex waits
- Use data-testid for stable selectors
