# Generate Tests from File

## Description
Generate Playwright test cases by reading test scenarios from a CSV or Excel (.xlsx) file.
Auto-detects UI (POM-based) or API test type from the file columns, and writes ready-to-run spec files following all framework conventions.

## Usage
Invoke this skill when you have test cases in a CSV or Excel spreadsheet and want to convert them into Playwright test files without writing them by hand.

## Parameters
- **file-path** (required): Path to the CSV or Excel file (absolute, or relative to project root)
- **test-type** (optional): `ui` | `api` | `auto` (default: `auto` — inferred from column names)
- **output-dir** (optional): Override output directory (default: `src/tests/ui/` or `src/tests/api/`)
- **create-page-object** (optional): `true` | `false` — generate page objects for UI tests (default: `true`)
- **sheet-name** (optional): Excel sheet to read (default: first sheet)

---

## Expected File Format

### UI Test Columns
| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `TestCaseID` | ✅ | Unique row identifier | TC001 |
| `TestName` | ✅ | Human-readable test name | Valid Login |
| `PageName` | ✅ | Page under test (used for grouping) | Login |
| `URL` | ✅ | Page URL path | /login |
| `Steps` | ✅ | Semicolon-separated action steps | Enter username;Enter password;Click login |
| `ExpectedResult` | ✅ | What success looks like | User redirected to dashboard |
| `TestType` | ✅ | smoke, regression, or e2e | smoke |
| `Tags` | ✅ | Space- or comma-separated Playwright tags | @smoke @ui |
| `Description` | ⬜ | Additional context | Happy path login |

### API Test Columns
| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `TestCaseID` | ✅ | Unique row identifier | TC001 |
| `TestName` | ✅ | Human-readable test name | Get all users |
| `Endpoint` | ✅ | API path | /api/users |
| `Method` | ✅ | HTTP verb | GET |
| `RequestBody` | ⬜ | JSON body string | {"name":"Test"} |
| `Headers` | ⬜ | Extra headers (`Key:Value` pairs, semicolon-separated) | Content-Type:application/json |
| `ExpectedStatus` | ✅ | Expected HTTP status code | 200 |
| `ExpectedResponse` | ✅ | Describes expected response shape/message | Array of users |
| `TestType` | ✅ | smoke, regression, or integration | smoke |
| `Tags` | ✅ | Space- or comma-separated Playwright tags | @smoke @api |

### Auto-detection Rule
- Columns `Endpoint` + `Method` + `ExpectedStatus` present → **API mode**
- Columns `PageName` + `URL` + `Steps` present → **UI mode**
- If ambiguous, use the `test-type` parameter explicitly

---

## What This Skill Does

1. **Validates** the file exists and has a supported extension (`.csv`, `.xlsx`, `.xls`)
2. **Installs** `xlsx` npm package (dev dependency) if the file is Excel and the package is missing:
   ```bash
   npm list xlsx 2>/dev/null | grep xlsx || npm install xlsx --save-dev
   ```
3. **Parses** the file:
   - CSV → `DataHelper.readCSV()` (uses existing `csv-parse` dependency)
   - Excel → inline `node -e` script using the `xlsx` package
4. **Validates** required columns; reports any missing ones clearly
5. **Detects** test type from columns (or uses `test-type` parameter)
6. **Groups** rows by `PageName` (UI) or by first path segment of `Endpoint` (API) to produce one spec file per group
7. **Generates** spec files following the same patterns as existing tests in `src/tests/ui/` or `src/tests/api/`
8. **Creates** page objects (UI mode) if `create-page-object=true` and the file doesn't already exist
9. **Reports** every created/updated file and the total number of generated tests

---

## Reading the File — How-To

### CSV (already supported by the framework)
```typescript
import { DataHelper } from '@utils/helpers/data-helper';
const rows = await DataHelper.readCSV('path/to/file.csv');
```

### Excel (.xlsx / .xls)
Run as a one-liner to extract JSON before generating tests:
```bash
node -e "
const XLSX = require('xlsx');
const wb = XLSX.readFile(process.argv[1]);
const sheetName = process.argv[2] || wb.SheetNames[0];
const ws = wb.Sheets[sheetName];
console.log(JSON.stringify(XLSX.utils.sheet_to_json(ws)));
" path/to/file.xlsx [optional-sheet-name]
```

---

## Generated UI Test Structure

```typescript
// src/tests/ui/<page-name>.spec.ts
import { test, expect } from '@playwright/test';
import { <PageName>Page } from '../../pages/<page-name>-page';
import { testReporter as reporter } from '../helpers/allure-reporter';

test.describe('<PageName> Tests', () => {
  let <pageName>Page: <PageName>Page;

  test.beforeEach(async ({ page }) => {
    <pageName>Page = new <PageName>Page(page);
    await <pageName>Page.navigate();
    await <pageName>Page.verifyLoaded();
  });

  test.afterEach(async ({ page: _page }, testInfo) => {
    reporter.testEnd(testInfo.title, testInfo.status as 'passed' | 'failed' | 'skipped');
    if (testInfo.status === 'failed') {
      await <pageName>Page.screenshot(`failed-${testInfo.title.replace(/\s/g, '-')}`);
    }
  });

  // One test block per CSV/Excel row:
  test('<Tags> <TestName>', async () => {
    reporter.testStart('<TestName>');

    // Arrange
    // (preconditions from Steps[0] if applicable)

    // Act
    // Step 1: <Steps[0]>
    // Step 2: <Steps[1]>
    // ... (each semicolon-delimited step becomes a comment + action call)

    // Assert
    // <ExpectedResult>

    reporter.step('<ExpectedResult>');
  });
});
```

## Generated API Test Structure

```typescript
// src/tests/api/<resource-name>.spec.ts
import { test, expect } from '@playwright/test';
import { APIClient } from '../../utils/api/api-client';
import { testReporter as reporter } from '../helpers/allure-reporter';

test.describe('API - <Endpoint>', () => {
  let apiClient: APIClient;

  test.beforeAll(async () => {
    apiClient = new APIClient(process.env.API_BASE_URL || '');
    apiClient.setAuth('bearer', process.env.API_TOKEN);
  });

  // One test block per CSV/Excel row:
  test('<Tags> <TestName>', async () => {
    reporter.testStart('<TestName>');

    // Arrange
    // <RequestBody if present>

    // Act
    const response = await apiClient.<method>('<Endpoint>'[, requestBody]);

    // Assert
    expect(response.status).toBe(<ExpectedStatus>);
    // <ExpectedResponse description as comment>
    expect(response.responseTime).toBeLessThan(2000);

    reporter.step('<ExpectedResponse>');
  });
});
```

---

## Sample CSV — UI Tests
_(saved to `src/data/csv/sample-ui-tests.csv` on first use)_

```csv
TestCaseID,TestName,PageName,URL,Steps,ExpectedResult,TestType,Tags,Description
TC001,Valid Login,Login,/login,Enter valid username;Enter valid password;Click login button,User redirected to dashboard,smoke,@smoke @ui,Happy path
TC002,Invalid Credentials,Login,/login,Enter invalid username;Enter wrong password;Click login button,Error message is displayed,regression,@regression @ui,Negative case
TC003,Empty Fields Validation,Login,/login,Click login button without entering any credentials,Validation error shown below each field,regression,@regression @ui,Boundary condition
TC004,Forgot Password Navigation,Login,/login,Click forgot password link,User navigated to /forgot-password page,regression,@regression @ui,Navigation check
TC005,Load Dashboard,Dashboard,/dashboard,Navigate to dashboard URL;Wait for widgets to load,All dashboard widgets are visible,smoke,@smoke @ui,Page load check
```

## Sample CSV — API Tests
_(saved to `src/data/csv/sample-api-tests.csv` on first use)_

```csv
TestCaseID,TestName,Endpoint,Method,RequestBody,Headers,ExpectedStatus,ExpectedResponse,TestType,Tags
TC001,Get All Users,/api/users,GET,,,200,Array of user objects,smoke,@smoke @api
TC002,Create New User,/api/users,POST,"{""name"":""Test User"",""email"":""test@example.com""}",Content-Type:application/json,201,Created user with id field,regression,@regression @api
TC003,Get User By ID,/api/users/1,GET,,,200,Single user object,smoke,@smoke @api
TC004,Non-existent User,/api/users/99999,GET,,,404,Resource not found error,regression,@regression @api
TC005,Create User Missing Fields,/api/users,POST,"{""name"":""Test""}",Content-Type:application/json,400,Validation error for email,regression,@regression @api
```

---

## Example Invocations

### From CSV file
**User**: "Generate tests from `src/data/csv/login-tests.csv`"

**AI Agent**:
1. Reads CSV → detects UI mode (`PageName`, `URL`, `Steps` columns present)
2. Groups 4 rows under `Login` page
3. Checks `src/pages/login-page.ts` — already exists, skips creation
4. Writes `src/tests/ui/login.spec.ts` with 4 test cases
5. Reports:
   ```
   ✅ src/tests/ui/login.spec.ts — 4 tests generated
   ⏭  src/pages/login-page.ts — already exists, skipped
   ```

### From Excel file
**User**: "Create Playwright tests from `/Users/me/regression/api-tests.xlsx`"

**AI Agent**:
1. Detects `.xlsx` format → checks for `xlsx` package → installs if missing
2. Reads first sheet → detects API mode (`Endpoint`, `Method`, `ExpectedStatus` present)
3. Groups rows: `/api/users` → `users.spec.ts`, `/api/orders` → `orders.spec.ts`
4. Writes test files to `src/tests/api/`
5. Reports:
   ```
   ✅ src/tests/api/users.spec.ts — 5 tests generated
   ✅ src/tests/api/orders.spec.ts — 3 tests generated
   Total: 8 tests across 2 files
   ```

### Multi-page Excel
**User**: "Read test cases from `test-data/all-tests.xlsx`, sheet `Regression`"

**AI Agent**:
1. Opens `all-tests.xlsx`, reads sheet named `Regression`
2. Auto-detects type per row group
3. Generates all matching spec files

---

## Success Criteria

- ✅ File read without errors (CSV or Excel)
- ✅ Required columns validated; missing columns reported clearly
- ✅ Test type correctly detected (or overridden by parameter)
- ✅ One spec file generated per unique `PageName` or endpoint group
- ✅ Every row in the file produces exactly one `test()` block
- ✅ Page objects created for UI tests (if not already present)
- ✅ All imports resolve to existing framework utilities
- ✅ Tags from file are preserved on each test
- ✅ TypeScript compiles without errors

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `File not found` | Use absolute path or path relative to project root |
| `xlsx not found after install` | Run `npm install xlsx --save-dev` manually |
| `Missing columns` | Skill lists exact missing columns; check spelling/case |
| `Wrong test type detected` | Pass `test-type=ui` or `test-type=api` explicitly |
| `Too many spec files` | Consolidate rows under fewer unique `PageName`/`Endpoint` values |
| `Excel parse error` | Save file as `.xlsx` (not `.xls`); re-save from Excel if corrupted |

---

## Related Skills

- `generate-ui-test` — Generate UI tests from natural-language descriptions
- `generate-api-test` — Generate API tests from parameters, cURL, or traces
- `create-page-object` — Create standalone page object classes
- `debug-test` — Debug generated tests that fail after first run

## Notes

- CSV delimiter is auto-detected (comma or semicolon)
- Empty rows and header rows are skipped automatically
- Steps column uses `;` as the separator — avoid semicolons in step text
- Tags can be `@smoke @ui` (space) or `@smoke,@ui` (comma) — both are normalised
- Existing spec files are **not** overwritten without confirmation; page objects are only created when absent
- For large files (100+ rows), the skill batches generation and reports progress per file
