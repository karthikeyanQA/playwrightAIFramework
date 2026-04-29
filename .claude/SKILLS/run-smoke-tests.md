# Run Smoke Tests

## Description
Execute all smoke tests to verify critical functionality of the application.

## Usage
Invoke this skill to run smoke tests and get a summary of results.

## Parameters
- **browser** (optional): Specific browser to run tests on (chromium, firefox, webkit)
- **headed** (optional): Run in headed mode (true/false)
- **environment** (optional): Target environment (dev, qa, staging, prod)

## What This Skill Does

1. Executes all tests tagged with `@smoke`
2. Runs tests in parallel for faster execution
3. Captures screenshots and videos on failure
4. Generates test reports
5. Provides a summary of pass/fail results
6. Highlights any critical failures

## Expected Outcome

- All smoke tests executed
- Test report generated in `playwright-report/`
- Summary of results with pass rate
- Details of any failures
- Recommendations for next steps

## Example Commands

```bash
# Run smoke tests on default browser (chromium)
npx playwright test --grep @smoke

# Run smoke tests on all browsers
npx playwright test --grep @smoke --project=chromium --project=firefox --project=webkit

# Run smoke tests in headed mode
npx playwright test --grep @smoke --headed

# Run smoke tests on specific environment
ENV=qa npx playwright test --grep @smoke
```

## Example Invocation

**User**: "Run smoke tests"

**AI Agent**:
1. Executes: `npx playwright test --grep @smoke`
2. Waits for completion
3. Parses results from `test-results/results.json`
4. Provides summary:
   - Total tests: X
   - Passed: Y
   - Failed: Z
   - Duration: Ns
5. If failures exist, analyzes error logs and suggests fixes

## Success Criteria

- ✅ All smoke tests pass
- ✅ Execution time < 5 minutes
- ✅ No critical failures
- ✅ Report generated successfully

## Related Skills

- `analyze-failures` - Deep dive into failed tests
- `generate-test-report` - Generate comprehensive test report
- `debug-test` - Debug specific failing test

## Notes

- Smoke tests should cover critical user journeys
- If smoke tests fail, consider blocking deployment
- Smoke tests run automatically on every PR in CI/CD
- Check `logs/combined.log` for detailed execution logs
