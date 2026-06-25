# Claude Skills for Playwright Framework

This directory contains reusable skills that can be invoked by Claude Code, Claude Desktop, or other AI agents to interact with the Playwright test automation framework.

## 📚 Available Skills

### Test Execution
- **[run-smoke-tests](./run-smoke-tests.md)** - Execute smoke tests and get results summary
- **[debug-test](./debug-test.md)** - Debug failing tests with detailed analysis

### Test Analysis
- **[analyze-failures](./analyze-failures.md)** - Deep analysis of test failures with fix suggestions

### Test Generation
- **[generate-api-test](./generate-api-test.md)** - Generate API tests following framework conventions
- **[generate-ui-test](./generate-ui-test.md)** - Generate UI tests with Page Object Model
- **[create-page-object](./create-page-object.md)** - Create reusable Page Object classes
- **[generate-tests-from-file](./generate-tests-from-file.md)** - Generate UI or API tests by reading test cases from a CSV or Excel (.xlsx) file

### Quality & Standards
- **[best-practices](./best-practices.md)** - Audit tests for best practice violations and get guidance on correct Playwright patterns

### Migration
- **[migrate-from-serenity](./migrate-from-serenity.md)** - Full agentic migration from Serenity BDD / Serenity-JS to this Playwright framework

## 🚀 How to Use Skills

### With Claude Code (VS Code Extension)

Simply describe what you want in natural language:

```
"Run smoke tests and show me the results"
"Debug the login test that's failing"
"Create API tests for the /api/products endpoint"
"Generate a page object for the checkout page"
```

Claude Code will automatically invoke the appropriate skill.

### With Claude Desktop

After MCP integration, you can use skills directly:

```
"Use run-smoke-tests skill"
"Analyze test failures using analyze-failures skill"
"Generate UI test for login page"
```

###  Direct Invocation

You can also reference skills explicitly:

```
"Follow the run-smoke-tests skill to execute tests"
"Apply the debug-test skill to the failing API test"
```

## 📖 Skill Structure

Each skill is a markdown file with:

- **Description**: What the skill does
- **Usage**: How to invoke the skill
- **Parameters**: Required and optional parameters
- **What This Skill Does**: Step-by-step process
- **Expected Outcome**: What results you'll get
- **Examples**: Command examples and use cases
- **Success Criteria**: How to know if skill succeeded
- **Related Skills**: Other skills that work together

## 🎯 Skill Categories

### 1. Test Execution Skills
Run tests with various configurations and filters.

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| run-smoke-tests | Run critical tests | Before deployment, daily checks |

### 2. Test Analysis Skills
Analyze test results and failures.

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| analyze-failures | Debug failed tests | After test failures |
| debug-test | Debug specific test | When one test fails |

### 3. Test Generation Skills
Create new tests and page objects.

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| generate-api-test | Create API tests | New API endpoints |
| generate-ui-test | Create UI tests | New pages/features |
| create-page-object | Create page objects | New pages/components |
| generate-tests-from-file | Create UI or API tests from CSV/Excel | Bulk test creation from existing test case docs |

### 4. Quality & Standards Skills
Enforce coding standards and best practices.

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| best-practices | Audit and guide Playwright best practices | Before commits, PR reviews, onboarding new team members |

### 5. Migration Skills
Migrate existing test projects into this framework.

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| migrate-from-serenity | Migrate Serenity BDD / Serenity-JS project | Consolidating legacy Serenity suites |

## 💡 Example Workflows

### Workflow 1: Test-Driven Development

```
1. User: "Create page object for user profile page"
   → Claude: Uses create-page-object skill

2. User: "Generate UI tests for the profile page"
   → Claude: Uses generate-ui-test skill

3. User: "Run the new tests"
   → Claude: Executes tests

4. User: "The edit button test failed, debug it"
   → Claude: Uses debug-test skill
```

### Workflow 2: CI/CD Integration

```
1. User: "Run smoke tests"
   → Claude: Uses run-smoke-tests skill

2. User: "Some tests failed, analyze them"
   → Claude: Uses analyze-failures skill

3. User: "Fix the selector issues"
   → Claude: Updates page objects based on analysis
```

### Workflow 3: New Feature Testing

```
1. User: "Create API tests for new payment endpoint"
   → Claude: Uses generate-api-test skill

2. User: "Generate UI tests for payment form"
   → Claude: Uses generate-ui-test skill

3. User: "Run all payment tests"
   → Claude: Executes with @payment tag
```

## 🔧 Creating New Skills

To add a new skill:

### 1. Create Skill File

Create `new-skill.md` in this directory:

```markdown
# Skill Name

## Description
What this skill does

## Usage
How to invoke it

## Parameters
- param1 (required): Description
- param2 (optional): Description

## What This Skill Does
1. Step 1
2. Step 2
3. Step 3

## Expected Outcome
What results you'll get

## Example Commands
\`\`\`bash
command examples
\`\`\`

## Example Invocation
User: "Request"
AI Agent: Response

## Success Criteria
- ✅ Criterion 1
- ✅ Criterion 2

## Related Skills
- other-skill: Description

## Notes
Additional information
```

### 2. Update This README

Add your skill to the relevant category table.

### 3. Test the Skill

Test with Claude Code:
```
"Use the new-skill to [do something]"
```

## 🎨 Best Practices

### Skill Design
- ✅ **Single Responsibility**: One skill, one purpose
- ✅ **Clear Parameters**: Document all inputs
- ✅ **Expected Outcomes**: Define what success looks like
- ✅ **Examples**: Provide concrete use cases
- ✅ **Error Handling**: Explain failure scenarios

### Skill Documentation
- ✅ Use clear, concise language
- ✅ Include command examples
- ✅ Show expected output
- ✅ Link to related skills
- ✅ Add troubleshooting tips

### Skill Invocation
- ✅ Use natural language
- ✅ Reference skill name when ambiguous
- ✅ Provide necessary parameters
- ✅ Chain skills when appropriate

## 🔗 Integration with MCP

Skills work seamlessly with MCP tools:

| Skill | Uses MCP Tool |
|-------|---------------|
| run-smoke-tests | `run_tests` |
| analyze-failures | `analyze_failures` |
| debug-test | `get_test_logs`, `analyze_failures` |

When you invoke a skill, Claude may use one or more MCP tools to accomplish the task.

## 📊 Skill Status

| Skill | Status | Last Updated |
|-------|--------|--------------|
| run-smoke-tests | ✅ Active | 2024-01-15 |
| analyze-failures | ✅ Active | 2024-01-15 |
| generate-api-test | ✅ Active | 2024-01-15 |
| generate-ui-test | ✅ Active | 2024-01-15 |
| create-page-object | ✅ Active | 2024-01-15 |
| debug-test | ✅ Active | 2024-01-15 |
| generate-tests-from-file | ✅ Active | 2026-05-27 |
| best-practices | ✅ Active | 2026-06-25 |

## 🆘 Troubleshooting

### Skill Not Recognized

**Problem**: Claude doesn't recognize the skill

**Solution**:
1. Check skill file exists in `.claude/SKILLS/`
2. Verify skill name matches filename
3. Try being more explicit: "Use the run-smoke-tests skill"

### Skill Parameters Missing

**Problem**: Skill needs more information

**Solution**:
1. Review skill documentation for required parameters
2. Provide parameters explicitly
3. Claude will ask for missing information

### Skill Execution Failed

**Problem**: Skill ran but didn't complete

**Solution**:
1. Check error messages
2. Verify environment variables set
3. Review skill prerequisites
4. Try debug-test skill for more info

## 📞 Support

For skill-related questions:
- See individual skill documentation
- Check `MCP_INTEGRATION.md` for MCP setup
- Review `AGENTIC_CAPABILITIES.md` for AI integration
- Check framework `README.md` for general help

## 🎯 Quick Reference

```bash
# Run smoke tests
"Run smoke tests"

# Analyze failures
"Analyze test failures"
"Why did my tests fail?"

# Debug specific test
"Debug the login test"
"The checkout test is failing, help me fix it"

# Generate tests
"Create API tests for /api/orders endpoint"
"Generate UI tests for dashboard page"

# Create page objects
"Create page object for settings page"
"I need a page object for checkout"
```

---

**Skills make your framework AI-ready!** 🤖

Use them to speed up development, debug faster, and maintain better test coverage.
