---
name: debug-test
description: 'Debug a failing Playwright test with root cause analysis and code fix suggestions. Use when a test is failing, to understand a test error, to fix a timeout or selector issue, or when a test passes locally but fails in CI.'
argument-hint: 'test-name or path, optional: error-message, check-screenshots (true/false), check-videos (true/false)'
---

# Debug Test

Debug a failing test by analyzing errors, checking logs, reviewing screenshots/videos, and providing fix suggestions.

## When to Use
- A specific test is failing and you need to know why
- Timeout, assertion, or element-not-found errors need diagnosis
- Test is flaky (passes sometimes, fails others)

## Procedure

1. **Gather** — read the test file, extract test steps, error message, and stack trace
2. **Check logs** — read `logs/error.log` for the specific test run
3. **Review artifacts** — check `screenshots/` and `videos/` if available
4. **Classify error type**:
   - Timeout — element/navigation/API not ready in time
   - Assertion failure — expected vs actual mismatch
   - Element not found — selector broken or wrong state
   - Flaky — race condition, timing, or data conflict
   - Auth failure — missing or expired token
   - Environment issue — wrong URL, env var not set
5. **Identify root cause** — broken selector? missing wait? wrong data? app bug?
6. **Provide fix** — specific code changes with before/after

## Common Fixes

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `Timeout waiting for locator` | Selector changed or element hidden | Update selector; use `waitForVisible` |
| `Expected X but received Y` | Wrong expected value or app bug | Check element state before asserting |
| `Element not found` | Wrong page/state or dynamic content | Use `data-testid`; add `waitForLoadState` |
| `401 Unauthorized` | Missing auth setup | Set auth in `beforeAll` with `process.env` token |
| Flaky | Race condition | Use `waitForResponse` or `RetryHelper` |

## Debugging Commands

```bash
# Debug mode (pauses at each step)
npx playwright test --debug tests/ui/login.spec.ts

# Headed mode (see the browser)
npx playwright test tests/ui/login.spec.ts --headed

# With trace recording
npx playwright test tests/ui/login.spec.ts --trace on

# View recorded trace
npx playwright show-trace trace.zip

# Slow motion
SLOW_MO=1000 npx playwright test tests/ui/login.spec.ts
```

## Output Format

```
## Debug Report: [Test Name]

**File**: src/tests/.../spec.ts:LINE
**Error Type**: Timeout / Assertion / Element Not Found / ...
**Root Cause**: [clear explanation]

### Fix
// Before
[broken code]

// After
[corrected code]

### Prevention
[tip to avoid recurrence]
```

## Success Criteria

- ✅ Root cause clearly identified
- ✅ Specific code fix provided
- ✅ Test passes after applying fix
- ✅ Prevention tip included

## Notes

- Always run the test in isolation first
- Headed mode is fastest for visual debugging
- Use Playwright trace for detailed step-by-step timeline
- Add `data-testid` attributes to elements to prevent selector fragility

## Related Skills

- `analyze-failures` — analyze multiple test failures at once
- `run-smoke-tests` — verify fix with a smoke run
