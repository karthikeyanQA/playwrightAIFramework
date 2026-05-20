---
name: create-page-object
description: 'Create a Page Object Model (POM) class for a web page. Use when creating a page object, adding a new page to the framework, modeling a UI page with locators and actions, or generating a BasePage subclass.'
argument-hint: 'page-name (e.g. Login), page-url (e.g. /login), elements (optional list), actions (optional list)'
---

# Create Page Object

Generate a new Page Object class following the Page Object Model (POM) design pattern.

## When to Use
- Adding a new page or component to the test framework
- Modeling locators and user actions for a web page
- Generating a typed, reusable page class that extends `BasePage`

## Procedure

1. Determine `page-name`, `page-url`, key elements, and user actions
2. Check `src/pages/` for similar existing page objects to match conventions
3. Create file at `src/pages/<page-name>-page.ts` (or a subdirectory if appropriate)
4. Structure the class:
   - **Locators** — `readonly` fields, grouped by area; prefer `data-testid > role selectors > CSS`
   - **Constructor** — initialize all locators via `super(page)`
   - **Navigation** — `navigate()` method that goes to `page-url` and calls `verifyPageLoaded()`
   - **Actions** — one action per method, use `UIActions` utilities, no assertions inside actions
   - **Assertions** — `verifyPageLoaded()` and specific verify methods
5. Add JSDoc comments at class level

## Page Object Template

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * [PageName] Page Object — [page-url]
 */
export class [PageName]Page extends BasePage {
  // Locators
  readonly element1: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.element1 = page.locator('[data-testid="element1"]');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  async navigate(): Promise<void> {
    await this.page.goto('[page-url]');
    await this.verifyPageLoaded();
  }

  async performAction(data: string): Promise<void> {
    await this.uiActions.fill(this.element1, data, 'Element 1');
    await this.uiActions.click(this.submitButton, 'Submit Button');
  }

  async verifyPageLoaded(): Promise<void> {
    await this.uiActions.waitForVisible(this.element1, 'Element 1');
  }
}
```

## Selector Priority

1. `[data-testid="..."]` — most stable
2. `getByRole('button', { name: '...' })` — semantic
3. `locator('#id')` or `.class` — only if stable
4. XPath — last resort only

## Success Criteria

- ✅ File created in `src/pages/`
- ✅ Extends `BasePage`
- ✅ All locators defined with `readonly`
- ✅ Action and assertion methods separated
- ✅ JSDoc at class level
- ✅ TypeScript compiles without errors

## Notes

- Keep one page/component per file
- Never add assertions inside action methods
- Group locators by UI section for readability

## Related Skills

- `generate-ui-test` — generate tests using this page object
- `debug-test` — debug a failing test that uses a page object
