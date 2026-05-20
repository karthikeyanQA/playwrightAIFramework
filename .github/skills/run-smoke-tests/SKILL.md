---
name: run-smoke-tests
description: 'Execute smoke tests to verify critical functionality. Use when running smoke tests, verifying critical paths, checking app health before deployment, or running @smoke tagged tests.'
argument-hint: 'Optional: browser (chromium/firefox/webkit), environment (dev/qa/staging/prod), headed (true/false)'
---

# Run Smoke Tests

Execute all smoke tests to verify critical functionality of the application.

## When to Use
- Before or after a deployment to verify nothing is broken
- Quick health check of critical user journeys
- Running `@smoke` tagged tests on a specific browser or environment

## Procedure

1. Determine parameters: browser, environment, headed mode (defaults: chromium, dev, headless)
2. Run smoke tests:
   ```bash
   # Default run
   npx playwright test --grep @smoke

   # Specific browser
   npx playwright test --grep @smoke --project=chromium

   # All browsers
   npx playwright test --grep @smoke --project=chromium --project=firefox --project=webkit

   # Headed mode
   npx playwright test --grep @smoke --headed

   # Specific environment
   ENV=qa npx playwright test --grep @smoke
   ```
3. Wait for completion and parse `test-results/results.json`
4. Report:
   - Total tests / Passed / Failed / Duration
   - Details of any failures with file + line
   - Recommendations if failures exist

## Success Criteria

- ✅ All smoke tests pass
- ✅ Execution time < 5 minutes
- ✅ No critical failures
- ✅ Report generated in `playwright-report/`

## Notes

- Smoke tests should cover critical user journeys only
- If smoke tests fail, consider blocking deployment
- Check `logs/combined.log` for detailed execution logs
- Screenshots and videos are captured on failure

## Related Skills

- `analyze-failures` — deep dive into failed tests
- `debug-test` — debug a specific failing test
