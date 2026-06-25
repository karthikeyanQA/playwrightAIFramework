# Playwright Best Practices

## Description
Enforce, audit, and guide Playwright automation best practices for this 16-app framework. Invoke this skill to review existing tests for violations, generate compliant code, or get guidance on the correct patterns to follow.

## Usage
Invoke this skill to:
- Audit a test file or page object for best practice violations
- Get the correct pattern for a specific scenario
- Auto-fix common violations in an existing file

## Parameters
- **target-file** (optional): Path to a `.spec.ts` or page object file to audit
- **rule** (optional): Name of a specific rule to check (e.g., `pom`, `assertions`, `data`, `locators`, `waits`, `base-class`)
- **fix** (optional): `true` to apply auto-fixes after audit

---

## Rules Reference

### Rule A — Strict Page Object Model (POM)

**Violation**: Raw CSS/XPath selectors inside `.spec.ts` files.

```typescript
// ❌ WRONG — selector in spec file
test('login', async ({ page }) => {
  await page.locator('#username').fill('user@example.com');
  await page.locator('//button[@type="submit"]').click();
});
```

```typescript
// ✅ CORRECT — all selectors live in the page object
test('login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('user@example.com', 'secret');
  await expect(page).toHaveURL(/dashboard/);
});
```

**Why**: If a button ID changes in the app, we update it in one POM file, not across every spec.

#### POM Design Patterns

| Pattern | Rule |
|---------|------|
| Locators over text | Prefer `getByRole()` / `getByPlaceholder()` over `getByText()` |
| No assertions in POMs | `expect()` belongs in `.spec.ts` files only |
| No `networkidle` | Wait for a specific UI element instead |

```typescript
// ❌ WRONG — assertion in page object
async login(email: string, password: string): Promise<void> {
  await this.emailInput.fill(email);
  await this.submitButton.click();
  await expect(this.page).toHaveURL(/dashboard/); // assertion does NOT belong here
}

// ✅ CORRECT — page object is a pure "service"
async login(email: string, password: string): Promise<void> {
  await this.uiActions.fill(this.emailInput, email, 'Email');
  await this.uiActions.click(this.submitButton, 'Submit');
}

// ✅ CORRECT — assertion lives in the spec
test('login', async ({ page }) => {
  await loginPage.login(email, password);
  await expect(page).toHaveURL(/dashboard/); // assertion here
});
```

```typescript
// ❌ WRONG — networkidle is unreliable
async navigate(): Promise<void> {
  await this.page.goto(this.pageUrl);
  await this.page.waitForLoadState('networkidle');
}

// ✅ CORRECT — wait for a meaningful element
async navigate(): Promise<void> {
  await this.page.goto(this.pageUrl);
  await this.dashboardHeader.waitFor({ state: 'visible' });
}
```

---

### Rule B — Smart Assertions Only (No Hard Waits)

**Violation**: `page.waitForTimeout()` anywhere in specs or page objects.

```typescript
// ❌ WRONG — hard pause causes flaky tests
await page.waitForTimeout(5000);

// ✅ CORRECT — Playwright's auto-waiting web-first assertion
await expect(locator).toBeVisible();
await expect(locator).toBeEnabled();
await expect(locator).toHaveText('Expected');
await locator.waitFor({ state: 'visible' });
```

**Preferred assertion patterns**:

```typescript
// Visibility
await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

// Text content
await expect(page.getByTestId('status-message')).toHaveText('Saved!');

// URL change
await expect(page).toHaveURL(/dashboard/);

// Element count
await expect(page.getByRole('row')).toHaveCount(10);

// Attribute
await expect(page.getByRole('checkbox')).toBeChecked();
```

---

### Rule C — Data Generation (No Hardcoding)

**Violation**: Literal patient names, claim IDs, credentials, or environment-specific values in spec files.

```typescript
// ❌ WRONG — hardcoded credentials and data
await loginPage.login('john.doe@hospital.com', 'Password123!');
await claimsPage.searchClaim('CLM-2024-00123');
```

```typescript
// ✅ CORRECT — environment variables for credentials
await loginPage.login(process.env.TEST_USERNAME!, process.env.TEST_PASSWORD!);

// ✅ CORRECT — API fixture for dynamic test data
test.describe('Claims', () => {
  let claimId: string;

  test.beforeAll(async ({ apiClient }) => {
    const patient = await generateUniquePatient();
    claimId = patient.claimId;
  });

  test('view claim', async ({ page }) => {
    await claimsPage.searchClaim(claimId);
  });
});

// ✅ CORRECT — JSON fixture file for static reference data
import testData from '../fixtures/claims.json';
await claimsPage.searchClaim(testData.validClaimId);
```

**Rules summary**:
- Credentials → `process.env.*` only
- Dynamic entities (patients, claims) → `generateUniquePatient()` or similar API fixtures in `beforeAll`
- Static lookup data → JSON fixture files in `src/fixtures/`
- Never commit real patient names or real claim IDs to the repository

---

### Rule D — Locator Strategy & Accessibility-First

Follow this priority order when choosing locators:

| Priority | Strategy | When to Use |
|----------|----------|-------------|
| 1 (Best) | `getByRole()` | Buttons, links, headings, inputs with labels — mimics real user |
| 2 | `getByLabel()` | Form inputs that have an associated `<label>` |
| 3 | `getByPlaceholder()` | Inputs identified by placeholder text |
| 4 | `getByTestId()` / `[data-testid]` | When no accessible role exists |
| 5 (Last resort) | CSS / XPath | Only if the UI has no unique accessible attributes |

```typescript
// ✅ CORRECT — role locator (best)
this.submitButton = page.getByRole('button', { name: 'Submit' });
this.navLink     = page.getByRole('link', { name: 'Dashboard' });
this.heading     = page.getByRole('heading', { name: 'Patient Details' });

// ✅ CORRECT — label locator (good for forms)
this.emailInput    = page.getByLabel('Email address');
this.passwordInput = page.getByLabel('Password');

// ✅ CORRECT — placeholder (fallback for unlabelled inputs)
this.searchBox = page.getByPlaceholder('Search patients...');

// ✅ CORRECT — data-testid (last resort when UI has no accessible role)
this.claimStatusBadge = page.locator('[data-testid="claim-status"]');

// ❌ WRONG — brittle CSS or XPath
this.submitButton = page.locator('#btn-submit-123');
this.submitButton = page.locator('//div[3]/button');
this.submitButton = page.getByText('Submit'); // breaks when copy changes
```

---

### Rule E — Base Class Convention

Every page object **must** extend `BasePage`. Never instantiate `Page` interactions directly without the base class.

```typescript
// ✅ CORRECT — extends BasePage
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base-page';

export class ClaimsPage extends BasePage {
  protected pageUrl = '/claims';

  readonly searchInput: Locator;
  readonly resultsTable: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByPlaceholder('Search claims...');
    this.resultsTable = page.getByRole('table', { name: 'Claims' });
  }

  async searchClaim(claimId: string): Promise<void> {
    await this.uiActions.fill(this.searchInput, claimId, 'Search Input');
    await this.uiActions.pressKey(this.searchInput, 'Enter', 'Search');
  }
}
```

**BasePage provides** (do not re-implement):
- `this.uiActions` — all element interactions
- `this.page` — raw Playwright page
- `navigate()` — goto + waitForPageLoad
- `screenshot(name)` — artifact capture
- `reload()`, `goBack()` — navigation helpers

---

## What This Skill Does

### Mode 1: Audit a file

When given a file path, the agent will:

1. Read the file
2. Check each rule (A through E) for violations
3. Report findings grouped by rule
4. Optionally apply auto-fixes

### Mode 2: Guidance on demand

When asked about a specific pattern (e.g., "how do I wait for a modal?"), the agent returns the correct pattern with a compliant code example.

### Mode 3: Review before commit

Scan all files changed in the current git diff for best practice violations before they reach the repository.

---

## Audit Checklist

Run through these checks for every PR:

```
[ ] A1 — No raw locators (CSS/XPath) in .spec.ts files
[ ] A2 — All locators defined as readonly Locator in page object class
[ ] A3 — No expect() calls inside page object methods
[ ] A4 — No waitForLoadState('networkidle') — waits for specific element instead
[ ] B1 — No page.waitForTimeout() anywhere
[ ] B2 — All waits use web-first assertions or locator.waitFor()
[ ] C1 — No hardcoded credentials in spec files (use process.env.*)
[ ] C2 — No hardcoded dynamic data (patient names, claim IDs) — use fixtures or API helpers
[ ] D1 — getByRole() used where an accessible role exists
[ ] D2 — getByLabel() / getByPlaceholder() used for form inputs
[ ] D3 — [data-testid] only used as last resort
[ ] D4 — No getByText() for interactive elements
[ ] E1 — All page objects extend BasePage
[ ] E2 — pageUrl abstract property is set
[ ] E3 — uiActions used for all element interactions (not raw page.click/fill)
```

---

## Example Invocations

**User**: "Check my login spec for best practice violations"

**Agent**:
1. Reads `src/tests/ui/auth/login.spec.ts`
2. Detects: hardcoded password `'Admin@123'` (Rule C violation)
3. Detects: `page.waitForTimeout(3000)` (Rule B violation)
4. Reports violations with line numbers
5. Suggests fixes

---

**User**: "How do I wait for a modal to appear after clicking a button?"

**Agent** (Rule B guidance):
```typescript
// In the page object action:
async openModal(): Promise<void> {
  await this.uiActions.click(this.openModalButton, 'Open Modal');
  // Wait for a specific element inside the modal — not a timeout
  await this.modalDialog.waitFor({ state: 'visible' });
}
```

---

**User**: "Review all changed files for best practice issues before I commit"

**Agent**:
1. Runs `git diff --name-only`
2. Filters to `*.spec.ts` and `*-page.ts` files
3. Audits each file against all 5 rules
4. Produces a summary report with line-level findings

---

## Success Criteria

- ✅ All spec files free of raw locators (Rules A1–A2)
- ✅ No `expect()` inside page objects (Rule A3)
- ✅ No `waitForTimeout` anywhere (Rule B1)
- ✅ No hardcoded credentials or test data (Rules C1–C2)
- ✅ Locators follow accessibility-first priority (Rules D1–D4)
- ✅ All page objects extend BasePage (Rules E1–E3)

## Related Skills

- `create-page-object` — Create a new page object following all rules
- `generate-ui-test` — Generate spec files that comply with all rules
- `debug-test` — Debug a failing test with best practice guidance
- `analyze-failures` — Determine whether a failure was caused by a best practice violation

## Notes

- The `wait()` method on BasePage (`this.wait(ms)`) still calls `waitForTimeout` internally. Do not use it in new code — it exists only for legacy compatibility during migration.
- When the UI lacks accessible roles or labels, raise a ticket to the dev team to add `data-testid` attributes rather than using brittle CSS paths.
- For the 16-app CHS framework, each app may have its own `/pages` subdirectory (e.g., `src/pages/chs/`, `src/pages/billing/`). Keep page objects scoped to their app.