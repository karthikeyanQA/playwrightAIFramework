# Claude Skills Created! ✅

## Overview

I've created a comprehensive `.claude/SKILLS/` directory with **6 reusable skills** that enable Claude Code and AI agents to interact with your Playwright framework through natural language.

---

## 📁 Created Files

| File | Size | Lines | Purpose |
|------|------|-------|---------|
| **README.md** | 7.5 KB | ~250 | Skills directory documentation |
| **run-smoke-tests.md** | 2.2 KB | ~70 | Execute smoke tests skill |
| **analyze-failures.md** | 4.4 KB | ~150 | Analyze test failures skill |
| **generate-api-test.md** | 6.5 KB | ~220 | Generate API tests skill |
| **generate-ui-test.md** | 10.4 KB | ~350 | Generate UI tests skill |
| **create-page-object.md** | 11.3 KB | ~380 | Create page objects skill |
| **debug-test.md** | 8.1 KB | ~270 | Debug failing tests skill |

**Total**: ~50 KB of documentation, 1,900+ lines

---

## 🛠️ Available Skills

### 1. Test Execution Skills

#### **run-smoke-tests**
Execute all smoke tests and get a summary of results.

**Example Usage:**
```
"Run smoke tests"
"Execute smoke tests on Firefox"
"Run critical tests before deployment"
```

**What It Does:**
- Executes tests tagged with `@smoke`
- Runs in parallel for speed
- Captures artifacts on failure
- Provides pass/fail summary
- Highlights critical failures

---

### 2. Test Analysis Skills

#### **analyze-failures**
Deep analysis of failed tests with root causes and fix suggestions.

**Example Usage:**
```
"Analyze test failures"
"Why did my tests fail?"
"Show me what went wrong"
```

**What It Does:**
- Reads test results JSON
- Categorizes failures by type
- Provides stack traces
- Identifies patterns
- Suggests specific fixes
- Shows related files

**Failure Categories:**
- Assertion failures
- Timeout errors
- Network failures
- Element interaction issues
- Data problems

#### **debug-test**
Debug specific failing test with detailed analysis.

**Example Usage:**
```
"Debug the login test"
"The checkout test is failing, help me fix it"
"Why is my API test timing out?"
```

**What It Does:**
- Analyzes error messages
- Reviews screenshots/videos
- Checks execution logs
- Identifies root cause
- Provides specific code fixes
- Offers prevention tips

---

### 3. Test Generation Skills

#### **generate-tests-from-file** _(new)_
Generate UI or API Playwright tests by reading test cases from a CSV or Excel (.xlsx) file.

**Example Usage:**
```
"Generate tests from src/data/csv/login-tests.csv"
"Create Playwright tests from my Excel file at /Users/me/regression/api-tests.xlsx"
"Read test cases from test-data/all-tests.xlsx sheet Regression and generate tests"
```

**What It Does:**
- Reads CSV (using existing `csv-parse`) or Excel (auto-installs `xlsx` if needed)
- Auto-detects UI vs API mode from column names
- Groups rows by `PageName` or `Endpoint` to produce one spec file per group
- Generates page objects for UI tests if they don't already exist
- Outputs ready-to-run `.spec.ts` files following all framework conventions

**Sample templates** (auto-created on first use):
- `src/data/csv/sample-ui-tests.csv`
- `src/data/csv/sample-api-tests.csv`

---

#### **generate-api-test**
Generate new API test files with CRUD operations and error handling.

**Example Usage:**
```
"Create API tests for /api/users endpoint"
"Generate API tests for products with GET, POST, PUT, DELETE"
"I need tests for the authentication API"
```

**What It Does:**
- Creates test file in `src/tests/api/`
- Generates CRUD test cases
- Adds error handling tests
- Includes schema validation
- Adds performance assertions
- Follows framework patterns
- Adds proper tags and docs

**Generated Tests Include:**
- GET all resources
- GET single resource
- POST create resource
- PUT update resource
- DELETE resource
- 404 handling
- 401/403 auth errors
- Validation errors (400)

#### **generate-ui-test**
Generate UI tests with Page Object Model pattern.

**Example Usage:**
```
"Create UI tests for the login page"
"Generate tests for checkout with shipping, payment, and confirmation"
"I need UI tests for the user dashboard"
```

**What It Does:**
- Checks for existing page object
- Creates page object if needed
- Generates test file in `src/tests/ui/`
- Creates scenario-based tests
- Adds proper waits and assertions
- Uses UIActions utility
- Follows POM pattern

**Generated Tests Include:**
- Form submission
- Validation errors
- Navigation flows
- Element interactions
- Success/error messages
- Empty states
- Edge cases

#### **create-page-object**
Create reusable Page Object classes.

**Example Usage:**
```
"Create page object for the product details page"
"Generate a page object for user settings"
"I need a page object for checkout"
```

**What It Does:**
- Creates file in `src/pages/`
- Extends `BasePage`
- Defines all locators
- Implements action methods
- Adds assertion methods
- Includes JSDoc comments
- Uses UIActions utility

**Generated Sections:**
- Locators (readonly)
- Constructor
- Navigation methods
- Action methods
- Getter methods
- Assertion methods

---

## 🚀 How to Use Skills

### With Natural Language

Simply describe what you want:

```
"Run smoke tests"
"Analyze test failures"
"Create API tests for /api/orders"
"Generate UI tests for login page"
"Debug the failing checkout test"
"Create page object for dashboard"
```

Claude will automatically invoke the appropriate skill!

### Common Workflows

#### Workflow 1: New Feature Testing
```
1. "Create page object for new feature page"
2. "Generate UI tests for the new feature"
3. "Run the new tests"
4. "If failed: Debug the failing test"
```

#### Workflow 2: API Testing
```
1. "Create API tests for /api/products endpoint"
2. "Run API tests"
3. "Analyze failures"
4. "Fix and re-run"
```

#### Workflow 3: Daily Testing
```
1. "Run smoke tests"
2. "If failures: Analyze test failures"
3. "Debug specific failing tests"
4. "Verify fixes"
```

---

## 📖 Skill Details

### Skill Structure

Each skill markdown file contains:

- **Description**: What the skill does
- **Usage**: How to invoke it
- **Parameters**: Required/optional inputs
- **What This Skill Does**: Step-by-step process
- **Expected Outcome**: Success criteria
- **Example Commands**: Concrete examples
- **Example Invocation**: User/AI interaction
- **Success Criteria**: How to verify
- **Related Skills**: Connected skills
- **Notes**: Additional tips

### Example: run-smoke-tests.md

```markdown
# Run Smoke Tests

## Description
Execute all smoke tests to verify critical functionality

## Usage
Invoke this skill to run smoke tests and get results

## Parameters
- browser (optional): chromium, firefox, webkit
- headed (optional): true/false
- environment (optional): dev, qa, staging, prod

## What This Skill Does
1. Executes tests tagged @smoke
2. Runs in parallel
3. Captures artifacts
4. Generates reports
5. Provides summary

## Expected Outcome
- All tests executed
- Report generated
- Summary with pass rate
- Failure details
- Next step recommendations

## Example Commands
npx playwright test --grep @smoke

## Success Criteria
- ✅ All smoke tests pass
- ✅ Execution time < 5 minutes
- ✅ Report generated
```

---

## 🎯 Skill Categories

### Test Execution (1 skill)
- **run-smoke-tests**: Run critical tests

### Test Analysis (2 skills)
- **analyze-failures**: Analyze all failures
- **debug-test**: Debug specific test

### Test Generation (3 skills)
- **generate-api-test**: Create API tests
- **generate-ui-test**: Create UI tests
- **create-page-object**: Create page objects

---

## 💡 Example Interactions

### Example 1: Complete Test Creation

**User**: "Create UI tests for the checkout page with shipping and payment scenarios"

**Claude**:
1. Uses `create-page-object` skill
   - Creates `src/pages/checkout-page.ts`
   - Defines locators for shipping, payment, order summary
   - Implements actions: fillShipping, selectPayment, submitOrder

2. Uses `generate-ui-test` skill
   - Creates `src/tests/ui/checkout.spec.ts`
   - Generates 5 test scenarios:
     - Fill valid shipping information
     - Select payment method
     - Apply discount code
     - Submit order successfully
     - Verify confirmation page

3. Reports files created and test count

### Example 2: Debugging Workflow

**User**: "My login test is failing"

**Claude**:
1. Uses `debug-test` skill
2. Reads `src/tests/ui/auth/login.spec.ts`
3. Checks `logs/error.log`
4. Reviews screenshot: `screenshots/login-failure.png`
5. Analysis:
   - Error: Timeout waiting for submit button
   - Cause: Selector changed
   - Fix: Update selector in page object
6. Provides exact code change needed

### Example 3: API Testing

**User**: "Create API tests for user registration endpoint"

**Claude**:
1. Uses `generate-api-test` skill
2. Analyzes existing patterns in `src/tests/api/`
3. Creates `src/tests/api/registration.spec.ts`
4. Generates 10 test cases:
   - POST valid user (201)
   - POST duplicate email (409)
   - POST invalid email (400)
   - POST missing required fields (400)
   - POST weak password (400)
   - Verify user created
   - Verify email sent
   - Test rate limiting
   - Test SQL injection protection
   - Performance < 2s
5. Reports: "Created 10 API tests in src/tests/api/registration.spec.ts"

---

## 🔧 Integration

### Works With MCP Tools

| Skill | Uses MCP Tool |
|-------|---------------|
| run-smoke-tests | `run_tests` |
| analyze-failures | `analyze_failures` |
| debug-test | `get_test_logs`, `analyze_failures` |
| generate-api-test | `list_tests` (to check patterns) |
| generate-ui-test | `list_tests` (to check patterns) |

### Works With Framework Components

- **Logger**: All skills use logger for tracking
- **UIActions**: UI skills use UIActions utility
- **APIClient**: API skills use APIClient
- **Page Objects**: UI skills work with POM pattern
- **Test Data**: Skills respect data file patterns

---

## 📊 Quick Stats

- **Total Skills**: 7
- **Total Documentation**: ~80 KB
- **Total Lines**: 2,700+
- **Categories**: 4 (Execution, Analysis, Generation, Migration)
- **Example Commands**: 50+
- **Use Cases**: 30+

---

## ✅ Benefits

### For Developers
- Generate tests faster
- Debug failures quickly
- Create page objects easily
- Follow framework patterns automatically

### For QA Engineers
- Rapid test creation
- Consistent test structure
- Built-in best practices
- Easy maintenance

### For AI Agents
- Clear invocation patterns
- Structured outputs
- Predictable behavior
- Integration with MCP

---

## 🎓 Learning Resources

### Start Here
1. Read `.claude/SKILLS/README.md`
2. Try: "Run smoke tests"
3. Try: "Create a page object for login"
4. Explore individual skill docs

### Advanced Usage
1. Chain skills together
2. Customize parameters
3. Create new skills
4. Integrate with CI/CD

---

## 🆘 Troubleshooting

### Skill Not Working

**Issue**: Skill doesn't execute

**Fix**:
1. Be more specific: "Use the run-smoke-tests skill"
2. Check skill exists in `.claude/SKILLS/`
3. Verify Claude Code is active

### Missing Information

**Issue**: Skill asks for more info

**Fix**:
1. Provide required parameters
2. Check skill documentation
3. Answer follow-up questions

---

## 📞 Next Steps

### 1. Try a Skill

Open Claude Code and try:

```
"Run smoke tests and show me the results"
```

### 2. Generate Tests

Try creating new tests:

```
"Create API tests for /api/products endpoint with GET, POST, PUT, DELETE methods"
```

### 3. Debug Tests

If you have failing tests:

```
"Analyze test failures and suggest fixes"
```

### 4. Create Page Objects

For new pages:

```
"Create a page object for the user profile page"
```

---

## 🎉 Skills Complete!

Your framework now has **6 powerful skills** that enable:

✅ Natural language test execution
✅ Intelligent failure analysis
✅ Automated test generation
✅ Quick debugging workflows
✅ Consistent code patterns
✅ AI-agent integration

---

**Start using skills now with Claude Code or Claude Desktop!** 🚀

Simply describe what you need in natural language, and the skills will handle the rest.
