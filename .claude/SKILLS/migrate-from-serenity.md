# Migrate from Serenity BDD to Playwright Framework

## Description

End-to-end agentic migration of a Serenity BDD / Serenity-JS test project into this
Playwright + TypeScript framework. Covers every Serenity pattern — Page Object Model,
Screenplay (Actor/Task/Question), Cucumber/Gherkin BDD, and REST-Assured API tests —
and iterates through compile errors, runtime failures, and assertion mismatches until
every migrated test is green.

---

## Usage

Invoke this skill when you need to migrate an existing Serenity project into this
framework. Provide the path to the Serenity project root and let the skill drive the
full migration, including automated error-fixing loops.

---

## Parameters

- **serenity-project-path** (required): Absolute or relative path to the root of the
  Serenity project to migrate (the folder containing `pom.xml` / `build.gradle` /
  `package.json` for Serenity-JS).
- **target-tag** (optional): Test tag to assign to all migrated tests
  (default: `@migrated`). Can be combined with `@smoke`, `@regression`, etc.
- **dry-run** (optional): `true` to generate files without executing tests
  (default: `false`).
- **max-fix-iterations** (optional): Maximum error-fixing cycles before stopping
  (default: `5`).
- **test-filter** (optional): Glob or name pattern to migrate only a subset of tests.
- **browser** (optional): `chromium` | `firefox` | `webkit` (default: `chromium`).

---

## What This Skill Does

### Phase 1 — Discovery & Analysis

1. **Detect Serenity project type** by inspecting:
   - `pom.xml` / `build.gradle` for Java Serenity (BDD, Screenplay, or classic POM)
   - `package.json` for Serenity-JS projects
   - `serenity.conf` / `serenity.properties` for runtime config
   - Presence of `*.feature` files → Cucumber/Gherkin BDD
   - Presence of `Actor`, `Task`, `Question` imports → Screenplay Pattern
   - Presence of `RestAssured` / `SerenityRest` → API testing layer
   - Presence of `@Steps`, `@Step`, `@FindBy`, `WebDriverManager` → Classic POM

2. **Map the project tree**:
   ```
   src/test/
   ├── java/
   │   ├── pages/          → src/pages/
   │   ├── steps/          → src/utils/browser/ui-actions.ts (shared) + inline
   │   ├── tasks/          → helper functions or page object methods
   │   ├── questions/      → page object getter methods
   │   ├── abilities/      → Playwright fixtures
   │   ├── runners/        → playwright.config.ts (test suites)
   │   └── features/ (or)
   └── resources/
       └── features/       → src/tests/ui/ or src/tests/api/ spec files
   ```

3. **Collect all artefacts**:
   - Feature files (`*.feature`)
   - Step definition files (`*StepDef*.java`, `*Steps*.java`)
   - Page object classes (extend `PageObject`, `WebElementFacade`)
   - Screenplay components (`Task`, `Question`, `Fact`, `Actor`, `Ability`)
   - API test classes (`SerenityRest`, `RestAssured`, `given().when().then()`)
   - Test data files (JSON, CSV, YAML, `*.properties`, `testdata/`)
   - Configuration (`serenity.conf`, `serenity.properties`, `application.properties`)
   - JUnit / TestNG annotations (`@RunWith`, `@CucumberOptions`, `@Test`)

4. **Build a migration manifest** listing every file, its type, and its target path
   in this framework.

---

### Phase 2 — Concept Mapping

Apply the following translation rules for every discovered component.

#### 2.1 Annotation & Runner Mapping

| Serenity / JUnit / TestNG                        | Playwright Equivalent                         |
|--------------------------------------------------|-----------------------------------------------|
| `@RunWith(CucumberWithSerenity.class)`           | `playwright.config.ts` project definition     |
| `@CucumberOptions(features=, glue=, tags=)`      | `--grep @tag` / `testDir` in config           |
| `@RunWith(SerenityRunner.class)`                 | Standard `npx playwright test`                |
| `@Test`                                          | `test('...', async ({ page }) => {...})`       |
| `@Before` / `@After` (JUnit)                     | `test.beforeEach` / `test.afterEach`          |
| `@BeforeAll` / `@AfterAll`                       | `test.beforeAll` / `test.afterAll`            |
| `@BeforeClass` / `@AfterClass` (TestNG)          | `test.beforeAll` / `test.afterAll`            |
| `@Ignore` / `@Disabled`                          | `test.skip('...')` / `test.fixme('...')`      |
| `@Title("...")` / `@DisplayName`                 | First arg of `test('My Title', ...)`          |
| `@WithTag("smoke")` / `@Tag("regression")`       | `@smoke` / `@regression` in test name string  |
| `@Steps` (step library field injection)          | Instantiate page objects in `beforeEach`      |
| `@Managed` (WebDriver injection)                 | `{ page }` Playwright fixture in test args    |
| `@DefaultUrl`                                    | `pageUrl` property in page object             |
| `@FindBy`, `@FindBys`, `@FindAll`                | `page.locator(...)` in page object constructor|
| `@Step("description")`                           | `logger.step('description')` in method body   |

#### 2.2 Serenity Page Object → Playwright BasePage

**Serenity Java**:
```java
public class LoginPage extends PageObject {
  @FindBy(id = "username")
  WebElementFacade usernameField;

  @FindBy(css = "button[type='submit']")
  WebElementFacade loginButton;

  @DefaultUrl("http://app/login")
  public void open() { openAt("/login"); }

  @Step("Enter username {0}")
  public void enterUsername(String username) {
    usernameField.type(username);
  }
}
```

**Migrated Playwright TypeScript**:
```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import logger from '../utils/logger/logger';

export class LoginPage extends BasePage {
  protected pageUrl = '/login';

  readonly usernameField: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameField = page.locator('#username');
    this.loginButton   = page.locator("button[type='submit']");
  }

  async enterUsername(username: string): Promise<void> {
    logger.step(`Enter username ${username}`);
    await this.uiActions.fill(this.usernameField, username, 'Username field');
  }
}
```

#### 2.3 Serenity Screenplay → Playwright Equivalents

| Screenplay Concept         | Playwright Equivalent                                      |
|----------------------------|------------------------------------------------------------|
| `Actor`                    | `{ page }` fixture (or named fixture in `test-fixtures.ts`)|
| `Ability` (BrowseTheWeb)   | Built-in `page` object                                     |
| `Ability` (CallAnApi)      | `APIClient` instance in `beforeAll`                        |
| `Task` (performable)       | `async` method on page object or a standalone helper       |
| `Question`                 | Getter method on page object (returns value)               |
| `Fact` / `Note`            | Local variable or `test.info().annotations`                |
| `actor.attemptsTo(...)`    | Sequential `await` calls in test body                      |
| `actor.asksAbout(...)`     | `const value = await page.getXxx()`                        |
| `serenity.stage().theActorCalled()` | `test.use({ storageState: '...' })` or fixture  |
| `OnStage` / `Cast`         | `test.extend({...})` fixture factory                       |

**Serenity-JS Task example → Playwright**:
```typescript
// SERENITY-JS (before)
const Login = {
  as: (username: string, password: string) =>
    Task.where(`#actor logs in as ${username}`,
      Enter.theValue(username).into(LoginPage.usernameField),
      Enter.theValue(password).into(LoginPage.passwordField),
      Click.on(LoginPage.submitButton),
    )
};
actor.attemptsTo(Login.as('admin', 'secret'));

// PLAYWRIGHT (after) — inline in test or extracted to page object method
await loginPage.login('admin', 'secret');
// where login() = fill username + fill password + click submit
```

#### 2.4 Cucumber/Gherkin → Playwright spec

Feature files are **not** retained as Gherkin. Each Scenario becomes a `test(...)` block.
The full Gherkin narrative is preserved as the test title and as `logger.step()` calls.

**Feature file (before)**:
```gherkin
Feature: User Authentication
  @smoke @ui
  Scenario: Successful login with valid credentials
    Given the user is on the login page
    When they enter username "admin" and password "secret"
    Then they should see the dashboard
```

**Migrated Playwright spec (after)**:
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login-page';
import { DashboardPage } from '../../pages/dashboard-page';
import logger from '../../utils/logger/logger';

test.describe('User Authentication', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage    = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.navigate();
  });

  test('@smoke @ui Successful login with valid credentials', async ({ page }) => {
    logger.step('Given the user is on the login page');
    // page is already on /login from beforeEach

    logger.step('When they enter username "admin" and password "secret"');
    await loginPage.login('admin', 'secret');

    logger.step('Then they should see the dashboard');
    await dashboardPage.verifyLoaded();
    expect(await dashboardPage.isUserLoggedIn()).toBeTruthy();
  });
});
```

#### 2.5 REST-Assured / SerenityRest → APIClient

| REST-Assured / SerenityRest                   | Playwright APIClient                              |
|-----------------------------------------------|---------------------------------------------------|
| `given().baseUri(url)`                        | `new APIClient(url)`                              |
| `.header("Authorization", "Bearer ...")`      | `apiClient.setAuthToken(token)`                   |
| `.contentType(ContentType.JSON)`              | Default — APIClient sets `Content-Type: application/json`|
| `.body(payload)`                              | `apiClient.post(endpoint, payload)`               |
| `.when().get("/users")`                       | `apiClient.get('/users')`                         |
| `.when().post("/users")`                      | `apiClient.post('/users', body)`                  |
| `.when().put("/users/1")`                     | `apiClient.put('/users/1', body)`                 |
| `.when().delete("/users/1")`                  | `apiClient.delete('/users/1')`                    |
| `.then().statusCode(200)`                     | `expect(response.status).toBe(200)`               |
| `.body("id", equalTo(1))`                     | `expect(response.data.id).toBe(1)`                |
| `.body("users.size()", greaterThan(0))`       | `expect(response.data.users.length).toBeGreaterThan(0)` |
| `.body(matchesJsonSchema(schema))`            | Custom schema assertion (see below)               |
| `SerenityRest.lastResponse()`                 | Return value of `apiClient.get/post/...`          |
| `@WithTag("api")`                             | `@api` in test name                               |

**REST-Assured (before)**:
```java
@Test
@WithTag("api")
public void shouldReturnAllUsers() {
  given()
    .baseUri(BASE_URL)
    .header("Authorization", "Bearer " + token)
  .when()
    .get("/api/users")
  .then()
    .statusCode(200)
    .body("size()", greaterThan(0));
}
```

**Migrated Playwright API spec (after)**:
```typescript
import { test, expect } from '@playwright/test';
import { APIClient } from '../../utils/api/api-client';

test.describe('API - Users', () => {
  let apiClient: APIClient;

  test.beforeAll(async () => {
    apiClient = new APIClient(process.env.API_BASE_URL || '');
    apiClient.setAuthToken(process.env.API_TOKEN || '');
  });

  test('@smoke @api Should return all users', async () => {
    const response = await apiClient.get('/api/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBeTruthy();
    expect(response.data.length).toBeGreaterThan(0);
  });
});
```

#### 2.6 Test Data Migration

| Serenity Pattern                           | Playwright Equivalent                        |
|--------------------------------------------|----------------------------------------------|
| `@UseTestDataFrom("csv/data.csv")`         | `DataHelper.readCSV('csv/data.csv')`         |
| `@TestData` field injection                | Local variable from `DataHelper.readJSON()`  |
| `testdata/` folder (`*.properties`)        | Convert to `src/data/json/*.json`            |
| Cucumber `Examples:` table                 | `test.each` or array loop in test body       |
| `DataTable` step argument                  | Typed array passed to test helper            |
| JUnit `@Parameterized`                     | `for...of` loop over data array              |

**Cucumber Examples Table (before)**:
```gherkin
  Scenario Outline: Login with various credentials
    When user logs in with "<username>" and "<password>"
    Then result should be "<result>"
    Examples:
      | username | password | result  |
      | admin    | valid    | success |
      | user     | wrong    | failure |
```

**Migrated Playwright (after)**:
```typescript
const loginCases = [
  { username: 'admin', password: 'valid',  result: 'success' },
  { username: 'user',  password: 'wrong',  result: 'failure' },
];

for (const { username, password, result } of loginCases) {
  test(`@ui Login with ${username} expects ${result}`, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(username, password);
    if (result === 'success') {
      const dashboard = new DashboardPage(page);
      await dashboard.verifyLoaded();
    } else {
      expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
    }
  });
}
```

#### 2.7 Serenity Configuration → Framework Configuration

| `serenity.conf` / `serenity.properties`    | Playwright Equivalent                               |
|--------------------------------------------|-----------------------------------------------------|
| `webdriver.base.url`                       | `BASE_URL` in `.env.qa` / `.env.dev`                |
| `serenity.browser`                         | `BROWSER` env var / `playwright.config.ts` project  |
| `serenity.take.screenshots`                | `screenshot: 'only-on-failure'` in config           |
| `serenity.video.recording`                 | `video: 'retain-on-failure'` in config              |
| `serenity.timeout`                         | `timeout` in `playwright.config.ts`                 |
| `serenity.reports.show.step.details`       | Allure reporter config                              |
| `cucumber.options.tags`                    | `--grep @tagName` flag                              |
| `serenity.project.name`                    | `metadata: { project: '...' }` in config           |
| `webdriver.driver=chrome`                  | `projects: [{ use: { ...devices['Desktop Chrome'] }}]` |
| `serenity.parallel.batches`                | `workers` in `playwright.config.ts`                 |

#### 2.8 Selenium WebDriver Locators → Playwright Locators

| Selenium / Serenity WebElementFacade       | Playwright Locator                          |
|--------------------------------------------|---------------------------------------------|
| `By.id("username")`                        | `page.locator('#username')`                 |
| `By.name("email")`                         | `page.locator('[name="email"]')`            |
| `By.className("btn-primary")`              | `page.locator('.btn-primary')`              |
| `By.cssSelector(".form input[type=text]")` | `page.locator('.form input[type=text]')`    |
| `By.xpath("//button[@type='submit']")`     | `page.locator("//button[@type='submit']")` |
| `By.linkText("Click here")`                | `page.getByRole('link', { name: 'Click here' })` |
| `By.partialLinkText("Click")`             | `page.getByRole('link', { name: /Click/ })`|
| `By.tagName("input")`                      | `page.locator('input')`                     |
| `@FindBy(how = How.DATA_TESTID, ...)`      | `page.getByTestId('...')`                   |
| `@FindBys({@FindBy(css=".list"), @FindBy(css=".item")})` | `page.locator('.list .item')` |
| `element.findElement(By.css(...))`         | `locator.locator('...')` (chained)          |

#### 2.9 Serenity Interaction Methods → UIActions

| Serenity / Selenium                        | `this.uiActions` / Playwright                |
|--------------------------------------------|----------------------------------------------|
| `element.type("text")`                     | `uiActions.fill(locator, 'text')`            |
| `element.typeAndTab("text")`               | `uiActions.fill(locator, 'text')` + `pressKey('Tab')` |
| `element.click()`                          | `uiActions.click(locator)`                   |
| `element.waitUntilVisible()`               | `uiActions.waitForVisible(locator)`          |
| `element.waitUntilNotVisible()`            | `uiActions.waitForHidden(locator)`           |
| `element.isVisible()`                      | `uiActions.isVisible(locator)`               |
| `element.isEnabled()`                      | `uiActions.isEnabled(locator)`               |
| `element.getText()`                        | `uiActions.getText(locator)`                 |
| `element.getAttribute("href")`             | `uiActions.getAttribute(locator, 'href')`    |
| `element.selectByValue("opt")`             | `uiActions.selectOption(locator, 'opt')`     |
| `element.selectByVisibleText("Label")`     | `uiActions.selectOption(locator, { label: 'Label' })` |
| `element.uploadFile(path)`                 | `uiActions.uploadFile(locator, path)`        |
| `element.scrollIntoView()`                 | `uiActions.scrollToElement(locator)`         |
| `element.hover()`                          | `uiActions.hover(locator)`                   |
| `element.doubleClick()`                    | `uiActions.doubleClick(locator)`             |
| `webdriver().navigate().to(url)`           | `page.goto(url)`                             |
| `webdriver().navigate().back()`            | `page.goBack()`                              |
| `webdriver().navigate().refresh()`         | `page.reload()`                              |

#### 2.10 Assertions Mapping

| Serenity / Hamcrest / AssertJ              | Playwright `expect`                            |
|--------------------------------------------|------------------------------------------------|
| `assertThat(value, equalTo(expected))`     | `expect(value).toBe(expected)`                 |
| `assertThat(value, containsString("x"))`  | `expect(value).toContain('x')`                 |
| `assertThat(value, greaterThan(0))`        | `expect(value).toBeGreaterThan(0)`             |
| `assertThat(list, hasSize(3))`             | `expect(list.length).toBe(3)`                  |
| `assertThat(element, isDisplayed())`       | `await expect(locator).toBeVisible()`          |
| `assertThat(element, isEnabled())`         | `await expect(locator).toBeEnabled()`          |
| `assertThat(text, containsString("x"))`   | `await expect(locator).toContainText('x')`     |
| `assertTrue(condition)`                    | `expect(condition).toBeTruthy()`               |
| `assertFalse(condition)`                   | `expect(condition).toBeFalsy()`                |
| `assertNull(value)`                        | `expect(value).toBeNull()`                     |
| `assertNotNull(value)`                     | `expect(value).not.toBeNull()`                 |
| `Assertions.assertThat(response).isEqualTo(201)` | `expect(response.status).toBe(201)`   |

---

### Phase 3 — File Generation

For each item in the migration manifest, generate the corresponding Playwright artefact:

#### 3.1 Page Objects

- Create `src/pages/<page-name>.ts` extending `BasePage`.
- Translate `@FindBy` → `page.locator(...)` in constructor.
- Translate `@Step` methods → `async` methods using `uiActions` + `logger.step()`.
- Translate `@DefaultUrl` → `protected pageUrl`.
- Add `verifyLoaded()` based on the most stable visible element.
- Add `navigate()` if not inherited from `BasePage`.

#### 3.2 Test Specs

For **each Feature file** or **JUnit test class**:

- Create `src/tests/ui/<feature-name>.spec.ts` (UI) or `src/tests/api/<feature-name>.spec.ts` (API).
- `test.describe` = Feature name / class name.
- `test.beforeEach` = navigate to page.
- `test.afterEach` = screenshot on failure + `reporter.testEnd()`.
- `test(...)` = one per Scenario / `@Test` method.
- Preserve original Gherkin/step narrative via `logger.step()`.
- Apply `@smoke` / `@regression` / `@ui` / `@api` tags from original annotations.
- Apply the `target-tag` parameter to every test name.

#### 3.3 API Specs

For **each RestAssured / SerenityRest test class**:

- Create `src/tests/api/<resource-name>.spec.ts`.
- `test.beforeAll` = `new APIClient(...)` + `setAuthToken(...)`.
- Each `@Test` method → `test('@api ...')` block.
- Map `given/when/then` fluent chain → `const response = await apiClient.verb(url, body)`.
- Map Hamcrest matchers → `expect(...)` assertions.

#### 3.4 Test Data

- Copy or convert `testdata/` files:
  - `.properties` → JSON key-value object in `src/data/json/`.
  - `.csv` → kept as-is in `src/data/csv/`.
  - `.json` → copied to `src/data/json/`.
  - `.yml` / `.yaml` → copied to `src/data/yaml/`.
- Update all data file references in test specs to use `DataHelper`.

#### 3.5 Configuration

- Extract environment values from `serenity.conf` / `serenity.properties`:
  - Write to `.env.dev`, `.env.qa`, `.env.prod` as appropriate.
  - Add `BASE_URL`, `API_BASE_URL`, `BROWSER`, `HEADLESS`, `WORKERS`.
- If multiple browser projects are found, add corresponding `projects` entries to
  `playwright.config.ts`.

---

### Phase 4 — Compile & Lint Validation

After all files are generated:

1. **Run TypeScript compilation**:
   ```bash
   npx tsc --noEmit
   ```
2. **Run ESLint**:
   ```bash
   npm run lint
   ```
3. **Parse errors** — for each error:

   | Error Pattern                              | Fix Strategy                                          |
   |--------------------------------------------|-------------------------------------------------------|
   | `Cannot find module '../../pages/...'`     | Verify generated file path matches import             |
   | `Property 'X' does not exist on type`      | Add missing property/method to page object            |
   | `Type 'string | null' not assignable`      | Add null-check or `|| ''` fallback                    |
   | `Argument of type 'X' not assignable`      | Correct method signature or cast                      |
   | `Object is possibly 'undefined'`           | Add optional chaining `?.` or guard                   |
   | `Expected 2 arguments, but got 1`          | Check method signature in `api-client.ts` / `UIActions` |
   | `'await' expressions only allowed in async`| Wrap in `async` function                              |
   | `Cannot redeclare block-scoped variable`   | Rename or scope variables properly                    |
   | ESLint `no-unused-vars`                    | Remove or prefix with `_`                             |
   | ESLint `playwright/no-wait-for-timeout`    | Replace `page.waitForTimeout` with proper waits       |
   | ESLint `@typescript-eslint/no-explicit-any`| Replace `any` with specific type or `unknown`         |

4. **Apply fixes** to the generated files.
5. **Re-run** `tsc --noEmit` and `npm run lint`.
6. **Repeat** up to `max-fix-iterations` times until clean.

---

### Phase 5 — Test Execution & Fix Loop

Run migrated tests and iterate on failures until all pass (or the iteration cap is hit).

#### 5.1 Initial Run

```bash
npx playwright test --grep @migrated --reporter=json,html
```

#### 5.2 Failure Analysis

For each failing test, inspect:

1. **Error type** — assertion, timeout, network, element-not-found, navigation.
2. **Stack trace** — identify the page object method and locator involved.
3. **Screenshot** in `test-results/` — confirm visual state at failure.
4. **Logger output** — last `logger.step()` reached before failure.

#### 5.3 Fix Decision Table

| Failure Symptom                                     | Root Cause                            | Fix                                                     |
|-----------------------------------------------------|---------------------------------------|---------------------------------------------------------|
| `locator.click: Element is not attached to DOM`     | Stale locator / dynamic DOM           | Use `page.locator()` lazily; add `.first()` or filter  |
| `Timeout waiting for element to be visible`         | Wrong selector / hidden element       | Update locator; add explicit `waitForVisible` before act|
| `expect(received).toBe(expected)` mismatch          | Wrong expected value or API response  | Adjust assertion or use regex match                     |
| `net::ERR_CONNECTION_REFUSED`                       | Base URL not configured               | Set correct `BASE_URL` in `.env.dev`                    |
| `page.goto: Navigation timeout exceeded`            | Page too slow or wrong URL            | Increase `navigationTimeout`; verify URL                |
| `Error: apiClient is undefined`                     | `beforeAll` not awaited properly      | Ensure `beforeAll` is `async` and `await` the init     |
| `Cannot read properties of undefined (reading 'X')`| Response data shape mismatch          | Inspect actual response; adjust accessor path           |
| `expect(value).toBeGreaterThan(0)` - received 0     | Empty dataset / wrong endpoint        | Seed test data or fix endpoint path                     |
| `Error: ENOENT` on data file read                   | Test data file not migrated           | Copy source data file to `src/data/`                    |
| `401 Unauthorized` from API                         | Auth token not set                    | Add `apiClient.setAuthToken(process.env.API_TOKEN)`     |
| `Locator matches multiple elements`                 | Ambiguous selector                    | Scope to parent or add `.first()` / `.nth(0)`           |
| `net::ERR_CERT_AUTHORITY_INVALID`                   | Self-signed cert on dev environment   | Add `ignoreHTTPSErrors: true` to `playwright.config.ts` |
| `Test timeout of XXXms exceeded`                    | Test too slow                         | Increase `timeout` or split test into smaller steps     |
| `DashboardPage.verifyLoaded is not a function`      | Method missing from migrated PO       | Add `verifyLoaded()` to the page object                 |

#### 5.4 Fix & Re-Run Cycle

```
for iteration 1..max-fix-iterations:
  1. Collect all failing tests from JSON report
  2. For each failure, apply the fix from the decision table
  3. Run TypeScript check: npx tsc --noEmit
  4. If compile errors: fix them first (Phase 4 rules)
  5. Re-run only the previously failing tests:
       npx playwright test --grep @migrated --reporter=json
  6. If all pass → stop loop, report success
  7. If same tests still failing after 2 iterations → escalate with
     detailed diagnosis and ask user for input on environment or
     missing application context
```

---

### Phase 6 — Reporting & Summary

After a successful run (or max iterations reached), produce a migration summary:

```
## Serenity → Playwright Migration Summary

### Source Project
- Type: [Cucumber BDD / Screenplay / Classic POM / REST API / Mixed]
- Language: [Java / JavaScript / TypeScript]
- Test count: [N]
- Feature files: [N]
- Page objects: [N]
- API test classes: [N]

### Migrated Artefacts
| Source File                            | Target File                             | Status  |
|----------------------------------------|-----------------------------------------|---------|
| src/test/java/pages/LoginPage.java     | src/pages/login-page.ts                 | ✅ Done |
| src/test/resources/features/login.feature | src/tests/ui/login.spec.ts           | ✅ Done |
| src/test/java/api/UserApiTest.java     | src/tests/api/users-api.spec.ts         | ✅ Done |
| testdata/users.json                    | src/data/json/users.json                | ✅ Done |

### Test Results
- Total migrated tests: N
- Passing: N
- Fixed during migration: N
- Remaining failures: N (see below)

### Errors Fixed During Migration
1. [Error description] → [Fix applied]
2. ...

### Remaining Issues (if any)
- [Test name]: [Issue] — requires [user action / env setup / data seeding]

### Next Steps
1. Set environment variables in `.env.qa` for your target environment
2. Run: `npm run test:smoke` to verify critical paths
3. Run: `npm run report:allure` to view detailed Allure report
4. Review migrated page objects for any missed dynamic selectors
```

---

## Example Invocation

**User**: "Migrate the Serenity project at `../serenity-legacy` into this framework.
Tag all tests as @migrated and use chromium."

**Agent workflow**:

1. Scans `../serenity-legacy` — finds Cucumber BDD + Page Objects + REST-Assured (Java)
2. Identifies 3 feature files, 5 page objects, 2 API test classes, 1 data folder
3. Generates:
   - `src/pages/login-page.ts`, `src/pages/dashboard-page.ts`, ...
   - `src/tests/ui/login.spec.ts`, `src/tests/ui/search.spec.ts`, ...
   - `src/tests/api/users-api.spec.ts`, `src/tests/api/orders-api.spec.ts`
   - `src/data/json/users.json`, `src/data/csv/products.csv`
   - Updates `.env.qa` with `BASE_URL` from `serenity.conf`
4. Runs `tsc --noEmit` → 3 type errors → fixes them → clean compile
5. Runs `npx playwright test --grep @migrated` → 2 failures:
   - Selector mismatch on `loginButton` → updates to `button[type='submit']`
   - 401 on API test → adds `setAuthToken` with env var
6. Re-runs → all 18 tests pass
7. Prints migration summary

---

## Success Criteria

- ✅ All Serenity page objects translated to `BasePage` subclasses
- ✅ All Feature scenarios / `@Test` methods have corresponding `test(...)` blocks
- ✅ All REST-Assured calls translated to `APIClient` methods
- ✅ Test data migrated to `src/data/`
- ✅ Environment config written to `.env.*` files
- ✅ TypeScript compiles with zero errors (`tsc --noEmit`)
- ✅ ESLint passes (`npm run lint`)
- ✅ All migrated tests pass (`npx playwright test --grep @migrated`)
- ✅ Allure/HTML report generated
- ✅ Migration summary produced

---

## Edge Cases & Special Handling

### Serenity-JS (TypeScript/JavaScript Serenity)

- Source is already TypeScript — preserve types and adapt imports.
- `@serenity-js/core`, `@serenity-js/playwright`, `@serenity-js/cucumber` dependencies
  are removed; replaced by `@playwright/test`.
- `actorCalled(name)` → remove; use `{ page }` fixture directly.
- `serenity.configure({ crew: [new ArtifactArchiver()] })` → remove; framework handles reporting.

### Cucumber Background Steps

- `Background:` steps → `test.beforeEach(async ({ page }) => { ... })` block.
- Multiple Background steps are merged into a single `beforeEach`.

### Shared Step Definitions

- If step definitions are reused across multiple feature files, extract to a
  shared helper in `src/utils/helpers/` rather than repeating in each spec.

### Database Setup / Teardown

- `@Before` with DB seeding → `test.beforeAll` using `DatabaseClientFactory.createFromEnv()`.
- `@After` with DB cleanup → `test.afterAll`.

### Page Factory / Custom Element Proxies

- Serenity `TargetElement`, `Target.the("name").located(By.css(...))` →
  `readonly element: Locator` in page object constructor.

### Soft Assertions

- Serenity soft assertions → Use `expect.soft(value).toBe(...)` in Playwright.
- At end of test, Playwright automatically fails on any soft assertion mismatch.

### Multi-Browser Serenity Runs

- Serenity `webdriver.driver=firefox` etc. → Add `firefox` and `webkit` to
  `projects` array in `playwright.config.ts`.

### Serenity `@Steps` Inheritance

- If step library classes inherit from one another, flatten to a single page object
  or extract a `BasePage` method.

### TestNG `@DataProvider`

- Translate to a TypeScript array + `for...of` loop, same pattern as Cucumber Examples.

### Timeouts from `withTimeoutOf(...)`

- Map to Playwright `{ timeout: ms }` option in specific locator actions.

---

## Prerequisites Before Running This Skill

1. Node.js ≥ 18 and `npm install` already run in this framework (`node_modules` present)
2. The Serenity source project is readable from this machine (local path or mounted drive)
3. Target application URL is known (for `.env` configuration)
4. Any API auth tokens needed are available as environment variables or provided manually
5. Playwright browsers installed: `npx playwright install`

---

## Related Skills

- `create-page-object` — Manually create additional page objects post-migration
- `generate-ui-test` — Generate additional UI tests beyond what was migrated
- `generate-api-test` — Generate additional API tests beyond what was migrated
- `analyze-failures` — Deep-dive into any remaining failures after migration
- `debug-test` — Debug a specific migrated test that remains flaky

---

## Notes

- Locators from Selenium `@FindBy` are migrated as-is (CSS/XPath preserved). They
  may need refinement if the application has changed since the Serenity tests were
  written; the fix loop will surface these as timeout failures.
- Serenity reports (Thucydides HTML) are replaced by Allure + Playwright HTML reports.
  Run `npm run report:allure` after migration for the equivalent rich report.
- If the Serenity project uses a custom `WebDriverManager` or `DriverFactory`, that
  entire layer is dropped — Playwright manages browsers natively.
- Business-readable step descriptions from `@Step("...")` are preserved as
  `logger.step('...')` calls, keeping Allure reports equally descriptive.
- `.properties` files from Java classpath are not directly supported; convert them
  to JSON or reference them as environment variables.
- If the source project uses Spring dependency injection (`@SpringBootTest`,
  `@Autowired` for page objects), the injection is replaced by direct instantiation
  in `beforeEach`.
