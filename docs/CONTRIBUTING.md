# Contributing to Playwright Enterprise Framework

Thank you for considering contributing to this project! This document provides guidelines and instructions for contributing.

## Code of Conduct

We expect all contributors to be respectful and professional. Please:
- Be welcoming and inclusive
- Respect differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check existing issues to avoid duplicates
2. Verify the bug exists in the latest version
3. Collect relevant information (logs, screenshots, steps to reproduce)

When creating a bug report, include:
- Clear, descriptive title
- Detailed steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, browser)
- Screenshots or logs if applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:
1. Check if the enhancement already exists
2. Provide clear use case and benefits
3. Include examples or mockups if relevant

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/playwright-enterprise-framework.git
   cd playwright-enterprise-framework
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests for new features
   - Update documentation

4. **Validate your changes before committing**

   Run the full pre-flight check manually to catch all issues early:
   ```bash
   npm run validate
   ```
   This runs lint → type-check → format-check in one command.

   Or run each step individually:
   ```bash
   npm run lint          # ESLint
   npm run type-check    # TypeScript compiler
   npm run format:check  # Prettier format check
   ```

5. **Commit your changes**

   Follow conventional commit format:
   ```bash
   git commit -m "feat(scope): add amazing feature"
   ```

   > **The commit will be blocked automatically if any check fails.** The `pre-commit` hook runs:
   > - `lint-staged` — ESLint + Prettier on staged `.ts` files
   > - `tsc --noEmit` — full TypeScript type check
   >
   > Fix all reported errors before the commit will be accepted.

   Commit types:
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code style changes (formatting)
   - `refactor`: Code refactoring
   - `test`: Adding or updating tests
   - `chore`: Maintenance tasks
   - `perf`: Performance improvements
   - `ci`: CI/CD changes
   - `build`: Build system changes

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

   > **The push will be blocked automatically if any check fails.** The `pre-push` hook runs:
   > - `npm run lint` — full ESLint check (no auto-fix)
   > - `npm run type-check` — TypeScript compiler check
   >
   > Both checks must pass before the push proceeds.

7. **Create Pull Request**
   - Provide clear description
   - Reference related issues
   - Include screenshots/examples if relevant

## Development Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Installation
```bash
npm install
npx playwright install
npm run prepare
```

### Running Tests
```bash
npm test              # Run all tests
npm run test:ui       # Run UI tests
npm run test:api      # Run API tests
npm run test:smoke    # Run smoke tests
```

### Code Quality
```bash
npm run validate      # Run all checks: lint + type-check + format:check
npm run lint          # Lint code
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code with Prettier
npm run format:check  # Check formatting without modifying
npm run type-check    # TypeScript type checking
```

### Git Hooks (Husky)

The framework enforces quality gates automatically via Husky:

| Hook | Trigger | Checks Run |
|------|---------|------------|
| `pre-commit` | `git commit` | lint-staged (ESLint + Prettier on staged files), TypeScript type check |
| `pre-push` | `git push` | Full lint, TypeScript type check |
| `commit-msg` | `git commit` | Validates conventional commit message format |

If any check fails, the commit or push is **aborted** with a descriptive error message. Resolve the errors and try again.

## Code Style Guidelines

### TypeScript
- Use TypeScript strict mode
- Define proper types/interfaces
- Avoid `any` type unless absolutely necessary
- Use async/await over promises

### Naming Conventions
- Classes: PascalCase (`LoginPage`, `APIClient`)
- Methods: camelCase (`clickButton`, `getUsers`)
- Constants: UPPER_SNAKE_CASE (`API_TIMEOUT`)
- Files: kebab-case (`login-page.ts`, `api-client.ts`)

### File Organization
- One class per file
- Group related functionality
- Keep files focused and concise
- Use index files for exports

### Comments
- Add JSDoc comments for public methods
- Explain "why" not "what"
- Keep comments up to date
- Remove commented-out code

### Testing
- Write descriptive test names
- Use AAA pattern (Arrange, Act, Assert)
- Keep tests independent
- Clean up after tests
- Use appropriate tags

## Documentation

When adding features:
1. Update README.md if needed
2. Add JSDoc comments to public APIs
3. Update relevant guides
4. Include examples

## Review Process

All submissions require review. We use GitHub pull requests for this purpose:

1. **Automated Checks**: CI runs tests and linting
2. **Code Review**: Team members review code quality
3. **Testing**: Verify functionality works as expected
4. **Documentation**: Ensure documentation is updated
5. **Approval**: At least one approval required
6. **Merge**: Squash and merge into main

## Getting Help

- **Questions**: Create a discussion in GitHub Discussions
- **Issues**: Report bugs or suggest features in GitHub Issues
- **Chat**: Join our Discord/Slack (if available)

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Acknowledged in project documentation

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

---

Thank you for contributing! 🎉
