---
name: analyze-failures
description: 'Analyze test failures with root cause analysis and fix suggestions. Use when tests fail, to understand why tests failed, to get a failure summary, or to investigate error patterns after a test run.'
argument-hint: 'Optional: test-name, tag (@api/@ui/@smoke), report-path (default: test-results/results.json)'
---

# Analyze Test Failures

Deep analysis of failed tests with error patterns, root causes, and fix suggestions.

## When to Use
- After a test run has failures and you want to understand why
- Investigating a pattern of failures across multiple tests
- Getting actionable next steps to fix broken tests

## Procedure

1. Read `test-results/results.json` (or the provided `report-path`)
2. Filter by `test-name` or `tag` if provided
3. For each failed test, extract: file path, line number, error message, stack trace
4. Categorize failures:
   - **Assertion Failure** — expected vs actual mismatch
   - **Timeout** — element/navigation/API timeout
   - **Network Failure** — unreachable endpoint, 5xx errors
   - **Element Interaction** — not clickable, detached, stale reference
   - **Data Failure** — missing or invalid test data
5. Check `logs/error.log` and `logs/combined.log` for additional context
6. Check `screenshots/` and `videos/` for visual evidence
7. Provide fix suggestions per failure

## Output Format

```
## Test Failure Analysis

### Summary
- Total Failed: N  |  Assertion: N  |  Timeout: N  |  Network: N
- Failure Rate: N%

### 🔴 [Test Name]
- File: src/tests/...spec.ts:LINE
- Error: [message]
- Type: [category]
- Root Cause: [explanation]
- Fix:
  1. [step 1]
  2. [step 2]

### Recommendations
1. [actionable next step]
```

## Success Criteria

- ✅ All failures identified and categorized
- ✅ Root cause determined for each failure
- ✅ Concrete fix suggestions provided
- ✅ Related files (test + page object) identified

## Notes

- Run immediately after test failures while context is fresh
- Some failures require environment fixes, not code changes
- Flaky tests may need retry logic or improved waits
- Cross-reference screenshots/videos for visual context

## Related Skills

- `run-smoke-tests` — run tests to generate results
- `debug-test` — deep dive into a single failing test
