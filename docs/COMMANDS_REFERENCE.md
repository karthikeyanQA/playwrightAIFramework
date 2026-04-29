# 📋 Commands Reference Card

Quick reference for all available commands and features in the framework.

## 🧪 Testing Commands

### Run Tests

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:ui` | Run UI tests only (tests with @ui tag) |
| `npm run test:api` | Run API tests only (tests with @api tag) |
| `npm run test:smoke` | Run smoke tests (@smoke tag) |
| `npm run test:regression` | Run regression tests (@regression tag) |
| `npm run test:headed` | Run tests in headed mode (see browser) |
| `npm run test:debug` | Run tests in debug mode with inspector |
| `npm run test:parallel` | Run tests in parallel (4 workers) |
| `npm run test:serial` | Run tests serially (1 worker) |
| `npm run test:ci` | Run tests in CI mode with multiple reporters |

### Specific Test Execution

```bash
# Run specific file
npm test src/tests/ui/login.spec.ts

# Run specific test by name
npm test -- --grep "Should login successfully"

# Run tests matching pattern
npm test -- --grep "@smoke"

# Run on specific browser
npm test -- --project=firefox

# Run headed on specific browser
npm test -- --project=chromium --headed
```

## 📊 Reporting Commands

| Command | Description |
|---------|-------------|
| `npm run report` | Open Playwright HTML report |
| `npm run report:allure` | Generate and open Allure report (starts local server until Ctrl+C) |

## 🔍 Code Quality Commands

### Linting

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint on all TypeScript files |
| `npm run lint:fix` | Auto-fix linting issues |

### Formatting

| Command | Description |
|---------|-------------|
| `npm run format` | Format all TypeScript files with Prettier |
| `npm run format:check` | Check if files are formatted correctly |

### Type Checking

| Command | Description |
|---------|-------------|
| `npm run type-check` | Run TypeScript compiler checks |

### Pre-flight Check

| Command | Description |
|---------|-------------|
| `npm run validate` | Run lint + type-check + format:check in one command |

```bash
# Recommended: run all quality checks before committing
npm run validate
```

### Git Hooks (Husky)

Quality gates are enforced automatically on every commit and push:

#### `pre-commit` — runs on `git commit`
```
1. lint-staged  →  ESLint + Prettier on staged .ts files only
2. tsc --noEmit →  Full TypeScript type check
```
- Commit is **blocked** if either step fails.
- Fix errors reported, then re-run `git commit`.

#### `pre-push` — runs on `git push`
```
1. npm run lint        →  Full ESLint check (no auto-fix)
2. npm run type-check  →  TypeScript compiler check
3. npm run test:smoke  →  Smoke test suite
```
- Push is **blocked** if any step fails.
- Use `npm run lint:fix` to auto-fix lint issues, then re-push.

#### `commit-msg` — runs on `git commit`
```
Validates conventional commit format: type(scope): description
Allowed types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
```
- Commit is **blocked** for non-conforming messages.

## 🔧 Setup Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npx playwright install` | Install Playwright browsers |
| `npm run prepare` | Setup Husky git hooks |

## 🧹 Maintenance Commands

| Command | Description |
|---------|-------------|
| `npm run clean` | Remove node_modules and lock file |

## 📝 Environment Commands

```bash
# Switch environments
export ENV=dev    # Use development environment
export ENV=qa     # Use QA environment
export ENV=prod   # Use production environment

# Or set in command
ENV=qa npm test

# Run with specific .env file
cp .env.qa .env && npm test
```

## 🏷️ Tag-Based Execution

Tags available in the framework:

| Tag | Description | Command |
|-----|-------------|---------|
| `@ui` | UI/E2E tests | `npm run test:ui` |
| `@api` | API tests | `npm run test:api` |
| `@smoke` | Smoke tests | `npm run test:smoke` |
| `@regression` | Regression tests | `npm run test:regression` |

### Custom Tag Execution

```bash
# Run tests with specific tag
npm test -- --grep "@yourtag"

# Run tests without specific tag
npm test -- --grep-invert "@slow"

# Combine tags (OR condition)
npm test -- --grep "@smoke|@critical"

# Run on specific browser with tag
npm test -- --project=firefox --grep "@smoke"
```

## 🌐 Browser Commands

```bash
# Run on specific browser
npm test -- --project=chromium
npm test -- --project=firefox
npm test -- --project=webkit

# Run on mobile
npm test -- --project=mobile-chrome
npm test -- --project=mobile-safari

# Run on tablet
npm test -- --project=tablet

# Run on all browsers
npm test -- --project=chromium --project=firefox --project=webkit
```

## 🐛 Debugging Commands

```bash
# Debug mode with Playwright Inspector
npm run test:debug

# Run in headed mode
npm run test:headed

# Run with slow motion
SLOW_MO=1000 npm test

# Run single test in debug
npm test src/tests/ui/login.spec.ts -- --debug

# Enable verbose logging
LOG_LEVEL=debug npm test

# Pause on failure
npm test -- --headed --pause-on-failure
```

## 📸 Screenshot & Video Commands

```bash
# Enable screenshots on failure
ENABLE_SCREENSHOTS=true npm test

# Enable video recording
ENABLE_VIDEO=true npm test

# Enable tracing
ENABLE_TRACING=true npm test

# Enable all artifacts
ENABLE_SCREENSHOTS=true ENABLE_VIDEO=true ENABLE_TRACING=true npm test
```

## 🔄 Git Commands (with Hooks)

```bash
# Commit (will trigger pre-commit hook)
git commit -m "feat(login): add remember me feature"

# Push (will trigger pre-push hook - runs smoke tests)
git push origin main

# Skip hooks (not recommended)
git commit --no-verify -m "message"
git push --no-verify
```

## 📦 Playwright Commands

```bash
# Install/Update browsers
npx playwright install
npx playwright install chromium
npx playwright install --with-deps

# Show installed browsers
npx playwright --version

# Generate code
npx playwright codegen https://example.com

# Show report
npx playwright show-report

# Show trace
npx playwright show-trace trace.zip
```

## 🔐 Environment Variables

Set these in your `.env.dev`, `.env.qa`, or `.env.prod` file:

### Application
```bash
ENV=dev                                    # Environment name
BASE_URL=http://localhost:3000            # App base URL
API_BASE_URL=http://localhost:3000/api    # API base URL
```

### Database
```bash
DB_HOST=localhost                          # Database host
DB_PORT=5432                              # Database port
DB_NAME=testdb                            # Database name
DB_USER=postgres                          # Database user
DB_PASSWORD=yourpassword                  # Database password
DB_TYPE=postgresql                        # Database type (mysql/postgresql)
```

### Test Configuration
```bash
HEADLESS=true                             # Run in headless mode
SLOW_MO=0                                 # Slow motion delay (ms)
BROWSER=chromium                          # Browser (chromium/firefox/webkit)
WORKERS=1                                 # Number of parallel workers
```

### Authentication
```bash
TEST_USERNAME=testuser@example.com        # Test user username
TEST_PASSWORD=Test@1234                   # Test user password
```

### Logging
```bash
LOG_LEVEL=info                            # Log level (error/warn/info/debug)
```

### Features
```bash
ENABLE_SCREENSHOTS=true                   # Enable screenshots
ENABLE_VIDEO=false                        # Enable video recording
ENABLE_TRACING=false                      # Enable trace recording
```

### CI/CD
```bash
CI=false                                  # Running in CI
START_LOCAL_SERVER=false                  # Start local server before tests
```

## 🚀 CI/CD Commands

GitHub Actions workflow can be triggered:

### Manual Trigger

1. Go to GitHub Repository
2. Click "Actions" tab
3. Select "Playwright Tests CI/CD"
4. Click "Run workflow"
5. Select test suite:
   - `all` - Run all tests
   - `smoke` - Run smoke tests
   - `regression` - Run regression tests
   - `ui` - Run UI tests only
   - `api` - Run API tests only

### Automatic Trigger

Workflow runs automatically on:
- Push to `main` or `develop` branch
- Pull request to `main` or `develop` branch

## 📚 Utility Usage in Code

### Data Helper

```typescript
// Read JSON
const data = await DataHelper.readJSON('json/users.json');

// Read CSV
const products = await DataHelper.readCSV('csv/products.csv');

// Read YAML
const config = await DataHelper.readYAML('yaml/config.yaml');

// Generate random data
const email = DataHelper.generateRandomEmail();
const str = DataHelper.generateRandomString(10);
const num = DataHelper.generateRandomNumber(1, 100);
```

### API Client

```typescript
// Create client
const api = new APIClient('http://api.example.com');

// Make requests
const response = await api.get('/users');
await api.post('/users', { name: 'John' });
await api.put('/users/1', { name: 'Jane' });
await api.delete('/users/1');

// With retry
await api.get('/users', { retry: { maxAttempts: 3 } });

// With auth
api.setAuthToken('your-token');
```

### Database Client

```typescript
// Create client
const db = DatabaseClientFactory.createFromEnv();
await db.connect();

// Query
const result = await db.query('SELECT * FROM users');

// Execute
await db.execute('UPDATE users SET status = ?', ['active']);

// Transaction
await db.beginTransaction();
await db.execute('INSERT INTO ...');
await db.commit();

// Disconnect
await db.disconnect();
```

### UI Actions

```typescript
await uiActions.click('#button');
await uiActions.fill('#input', 'text');
await uiActions.waitForVisible('#element');
const text = await uiActions.getText('#element');
```

## 💡 Pro Tips

### Speed Up Tests
```bash
# Run in parallel
npm run test:parallel

# Run only changed tests
npm test -- --only-changed

# Run in headless mode
HEADLESS=true npm test
```

### Better Debugging
```bash
# Slow motion for visibility
SLOW_MO=500 npm run test:headed

# Pause on failure
npm test -- --headed --pause-on-failure

# Enable debug logs
LOG_LEVEL=debug npm test
```

### Clean Runs
```bash
# Clear previous results
rm -rf test-results playwright-report

# Full clean and reinstall
npm run clean
npm install
```

---

For more detailed information, see:
- `README.md` - Complete documentation
- `QUICK_START.md` - Quick setup guide
- `ARCHITECTURE.md` - Framework architecture
- `CONTRIBUTING.md` - Contribution guidelines
