# Analyze Test Failures

## Description
Deep analysis of failed tests with error patterns, root causes, and fix suggestions.

## Usage
Invoke this skill after test execution to understand why tests failed and how to fix them.

## Parameters
- **test-name** (optional): Analyze specific test by name
- **tag** (optional): Analyze failures for specific tag (@api, @ui, @smoke)
- **report-path** (optional): Path to test results JSON file

## What This Skill Does

1. Reads test results from `test-results/results.json`
2. Extracts failed test details
3. Analyzes error messages and stack traces
4. Identifies common failure patterns
5. Categorizes failures (assertion, timeout, network, etc.)
6. Provides actionable fix suggestions
7. Checks logs for additional context

## Expected Outcome

- **Failure Summary**: Count and percentage of failures
- **Failure Categories**: Grouped by error type
- **Root Cause Analysis**: Why tests failed
- **Stack Traces**: Full error details
- **Fix Suggestions**: Concrete steps to resolve issues
- **Related Files**: Which test files and page objects need attention

## Analysis Categories

### 1. Assertion Failures
- Expected vs actual values mismatch
- Element visibility/text content assertions
- API response validation failures

### 2. Timeout Failures
- Element not found within timeout
- Navigation timeouts
- API request timeouts

### 3. Network Failures
- API endpoint unreachable
- Connection refused
- SSL/TLS errors

### 4. Element Interaction Failures
- Element not clickable
- Element detached from DOM
- Stale element reference

### 5. Data Failures
- Missing test data
- Invalid test data format
- Database connection issues

## Example Output

```markdown
## Test Failure Analysis

### Summary
- Total Failed: 3
- Assertion Errors: 2
- Timeouts: 1
- Failure Rate: 15%

### Failed Tests

#### 1. Login Test - Invalid Credentials
- **File**: src/tests/ui/auth/login.spec.ts:45
- **Error**: Expected "Invalid credentials" but got "Network error"
- **Type**: Assertion Failure
- **Root Cause**: API returned 500 instead of 401
- **Fix**:
  1. Check API endpoint health
  2. Update error handling in login page object
  3. Add network error assertions

#### 2. User Registration - Form Validation
- **File**: src/tests/ui/user/registration.spec.ts:78
- **Error**: Timeout waiting for element 'button[type="submit"]'
- **Type**: Timeout
- **Root Cause**: Form button selector changed or element not visible
- **Fix**:
  1. Update selector in page object
  2. Verify element visibility conditions
  3. Increase timeout if slow loading

#### 3. Get All Users API
- **File**: src/tests/api/users.spec.ts:23
- **Error**: Request failed with status 503
- **Type**: Network Failure
- **Root Cause**: API service unavailable
- **Fix**:
  1. Check API service health
  2. Verify base URL configuration
  3. Add retry mechanism for 503 errors

### Recommendations
1. Fix API health issues before re-running tests
2. Update selectors in registration page object
3. Add more robust error handling
4. Consider adding retry logic for flaky tests
```

## Example Commands

```bash
# Analyze all failures
node analyze-failures.js

# Analyze specific test failures
node analyze-failures.js --test "Login Test"

# Analyze API test failures only
node analyze-failures.js --tag @api
```

## Example Invocation

**User**: "Why did my tests fail?"

**AI Agent**:
1. Reads `test-results/results.json`
2. Reads `logs/error.log`
3. Parses failure details
4. Groups by error type
5. Provides analysis with:
   - What failed
   - Why it failed
   - How to fix it
6. Suggests code changes if needed

## Success Criteria

- ✅ All failures identified
- ✅ Root causes determined
- ✅ Fix suggestions provided
- ✅ Related files identified
- ✅ Actionable next steps clear

## Integration

This skill works with:
- **MCP Tool**: `analyze_failures`
- **Test Results**: `test-results/results.json`
- **Logs**: `logs/error.log`, `logs/combined.log`
- **Screenshots**: `screenshots/` (on failure)
- **Videos**: `videos/` (on failure)

## Related Skills

- `run-smoke-tests` - Run tests to generate results
- `debug-test` - Debug specific failing test
- `fix-test` - Apply suggested fixes to tests

## Notes

- Run this skill immediately after test failures
- Check screenshots/videos for visual context
- Some failures may require environment fixes (not code)
- Flaky tests may need retry mechanism or better waits
