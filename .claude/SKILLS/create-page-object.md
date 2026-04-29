# Create Page Object

## Description
Generate a new Page Object class following the Page Object Model (POM) design pattern.

## Usage
Invoke this skill to create a reusable page object for a specific page or component.

## Parameters
- **page-name** (required): Name of the page (e.g., Login, Dashboard, ProductDetail)
- **page-url** (required): URL or route of the page
- **elements** (optional): List of elements on the page to include
- **actions** (optional): List of actions users can perform on the page

## What This Skill Does

1. Creates new page object file in `src/pages/`
2. Extends `BasePage` for inherited utilities
3. Defines locators for page elements
4. Implements action methods
5. Adds assertion/verification methods
6. Includes JSDoc comments
7. Follows TypeScript best practices
8. Uses UIActions utility for interactions

## Page Object Template

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * [PageName] Page Object
 * Represents the [page description] page
 * URL: [page-url]
 */
export class [PageName]Page extends BasePage {
  // ==================== Locators ====================

  readonly element1: Locator;
  readonly element2: Locator;

  // ==================== Constructor ====================

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.element1 = page.locator('[selector]');
    this.element2 = page.locator('[selector]');
  }

  // ==================== Navigation ====================

  async navigate(): Promise<void> {
    await this.page.goto('[page-url]');
    await this.verifyPageLoaded();
  }

  // ==================== Actions ====================

  async performAction(data: string): Promise<void> {
    await this.uiActions.fill(this.element1, data, 'Element 1');
    await this.uiActions.click(this.element2, 'Element 2');
  }

  // ==================== Assertions ====================

  async verifyPageLoaded(): Promise<void> {
    await this.uiActions.waitForVisible(this.element1, 'Page loaded');
  }

  async verifyElement(expectedValue: string): Promise<void> {
    await this.uiActions.assertText(this.element1, expectedValue);
  }
}
```

## Structure Sections

### 1. Locators Section
Define all element locators at the top of the class.

**Best Practices:**
- Use `readonly` for all locators
- Use descriptive names (e.g., `submitButton`, not `btn1`)
- Group related locators together
- Prefer data-testid for stability

```typescript
// Form Elements
readonly emailInput: Locator;
readonly passwordInput: Locator;
readonly submitButton: Locator;

// Validation Messages
readonly errorMessage: Locator;
readonly successMessage: Locator;

// Navigation
readonly homeLink: Locator;
readonly logoutButton: Locator;
```

### 2. Constructor Section
Initialize all locators in the constructor.

```typescript
constructor(page: Page) {
  super(page);

  // Form Elements
  this.emailInput = page.locator('input[name="email"]');
  this.passwordInput = page.locator('input[type="password"]');
  this.submitButton = page.locator('button[type="submit"]');

  // Validation Messages
  this.errorMessage = page.locator('.error-message');
  this.successMessage = page.locator('.success-message');
}
```

### 3. Navigation Section
Methods to navigate to/from the page.

```typescript
async navigate(): Promise<void> {
  await this.page.goto('/login');
  await this.verifyPageLoaded();
}

async navigateWithParams(param: string): Promise<void> {
  await this.page.goto(`/page/${param}`);
  await this.verifyPageLoaded();
}
```

### 4. Actions Section
User interactions with the page.

**Best Practices:**
- One action per method
- Use UIActions utility
- Add descriptive element names
- Return promises
- No assertions in action methods

```typescript
async fillLoginForm(email: string, password: string): Promise<void> {
  await this.uiActions.fill(this.emailInput, email, 'Email Input');
  await this.uiActions.fill(this.passwordInput, password, 'Password Input');
}

async clickSubmit(): Promise<void> {
  await this.uiActions.click(this.submitButton, 'Submit Button');
}

async login(email: string, password: string): Promise<void> {
  await this.fillLoginForm(email, password);
  await this.clickSubmit();
}
```

### 5. Assertions Section
Verification and assertion methods.

```typescript
async verifyPageLoaded(): Promise<void> {
  await this.uiActions.waitForVisible(this.emailInput, 'Email Input');
  await this.uiActions.waitForVisible(this.submitButton, 'Submit Button');
}

async verifyErrorMessage(expectedMessage: string): Promise<void> {
  await this.uiActions.waitForVisible(this.errorMessage, 'Error Message');
  await this.uiActions.assertText(this.errorMessage, expectedMessage);
}

async verifySuccessfulLogin(): Promise<void> {
  await this.uiActions.waitForHidden(this.submitButton, 'Submit Button');
  await this.page.waitForURL(/.*dashboard/);
}
```

## Example: Product Page Object

```typescript
/**
 * Product Page Object
 * Represents the product details page
 * URL: /products/:productId
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class ProductPage extends BasePage {
  // ==================== Locators ====================

  // Product Information
  readonly productTitle: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly productImage: Locator;
  readonly productRating: Locator;

  // Actions
  readonly addToCartButton: Locator;
  readonly quantityInput: Locator;
  readonly buyNowButton: Locator;

  // Reviews
  readonly reviewsSection: Locator;
  readonly writeReviewButton: Locator;

  // Related Products
  readonly relatedProductsCarousel: Locator;

  // ==================== Constructor ====================

  constructor(page: Page) {
    super(page);

    // Product Information
    this.productTitle = page.locator('h1.product-title');
    this.productPrice = page.locator('.product-price');
    this.productDescription = page.locator('.product-description');
    this.productImage = page.locator('img.product-image');
    this.productRating = page.locator('.product-rating');

    // Actions
    this.addToCartButton = page.locator('button:has-text("Add to Cart")');
    this.quantityInput = page.locator('input[name="quantity"]');
    this.buyNowButton = page.locator('button:has-text("Buy Now")');

    // Reviews
    this.reviewsSection = page.locator('#reviews');
    this.writeReviewButton = page.locator('button:has-text("Write a Review")');

    // Related Products
    this.relatedProductsCarousel = page.locator('.related-products');
  }

  // ==================== Navigation ====================

  async navigate(productId: string): Promise<void> {
    await this.page.goto(`/products/${productId}`);
    await this.verifyPageLoaded();
  }

  // ==================== Actions ====================

  async addToCart(quantity: number = 1): Promise<void> {
    if (quantity > 1) {
      await this.setQuantity(quantity);
    }
    await this.uiActions.click(this.addToCartButton, 'Add to Cart Button');
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.uiActions.fill(
      this.quantityInput,
      quantity.toString(),
      'Quantity Input'
    );
  }

  async buyNow(): Promise<void> {
    await this.uiActions.click(this.buyNowButton, 'Buy Now Button');
  }

  async scrollToReviews(): Promise<void> {
    await this.uiActions.scrollToElement(this.reviewsSection, 'Reviews Section');
  }

  async clickWriteReview(): Promise<void> {
    await this.uiActions.click(this.writeReviewButton, 'Write Review Button');
  }

  async selectRelatedProduct(index: number): Promise<void> {
    const relatedProduct = this.relatedProductsCarousel
      .locator('.product-card')
      .nth(index);
    await this.uiActions.click(relatedProduct, `Related Product ${index}`);
  }

  // ==================== Getters ====================

  async getProductTitle(): Promise<string> {
    return await this.uiActions.getText(this.productTitle, 'Product Title');
  }

  async getProductPrice(): Promise<string> {
    return await this.uiActions.getText(this.productPrice, 'Product Price');
  }

  async getRating(): Promise<string> {
    return await this.uiActions.getText(this.productRating, 'Product Rating');
  }

  // ==================== Assertions ====================

  async verifyPageLoaded(): Promise<void> {
    await this.uiActions.waitForVisible(this.productTitle, 'Product Title');
    await this.uiActions.waitForVisible(this.productPrice, 'Product Price');
    await this.uiActions.waitForVisible(this.addToCartButton, 'Add to Cart Button');
  }

  async verifyProductTitle(expectedTitle: string): Promise<void> {
    await this.uiActions.assertText(this.productTitle, expectedTitle);
  }

  async verifyProductPrice(expectedPrice: string): Promise<void> {
    await this.uiActions.assertContainsText(this.productPrice, expectedPrice);
  }

  async verifyProductInStock(): Promise<void> {
    const isEnabled = await this.uiActions.isEnabled(this.addToCartButton);
    expect(isEnabled).toBeTruthy();
  }

  async verifyImageDisplayed(): Promise<void> {
    await this.uiActions.assertVisible(this.productImage);
  }
}
```

## Example Invocation

**User**: "Create a page object for the user profile page with elements for name, email, avatar, and edit button"

**AI Agent**:
1. Creates `src/pages/profile/user-profile-page.ts`
2. Defines locators for:
   - Name display
   - Email display
   - Avatar image
   - Edit button
   - Save button
   - Cancel button
3. Implements actions:
   - `navigate()`
   - `clickEdit()`
   - `updateName(newName)`
   - `updateEmail(newEmail)`
   - `uploadAvatar(filePath)`
   - `clickSave()`
   - `clickCancel()`
4. Adds assertions:
   - `verifyPageLoaded()`
   - `verifyName(expectedName)`
   - `verifyEmail(expectedEmail)`
   - `verifyEditMode()`
5. Reports file location

## Success Criteria

- ✅ Page object file created
- ✅ Extends BasePage
- ✅ All locators defined
- ✅ Action methods implemented
- ✅ Assertion methods added
- ✅ JSDoc comments included
- ✅ TypeScript compiles without errors
- ✅ Follows framework conventions

## Selector Best Practices

### Priority Order
1. **data-testid** (most stable)
   ```typescript
   page.locator('[data-testid="submit-button"]')
   ```

2. **Semantic selectors**
   ```typescript
   page.locator('button:has-text("Submit")')
   page.getByRole('button', { name: 'Submit' })
   ```

3. **Class/ID selectors** (if stable)
   ```typescript
   page.locator('#submit-btn')
   page.locator('.submit-button')
   ```

4. **XPath** (last resort)
   ```typescript
   page.locator('//button[@type="submit"]')
   ```

### Avoid
❌ Complex CSS selectors
❌ Dynamic IDs/classes
❌ Index-based selectors (unless necessary)
❌ Text-based selectors for dynamic content

## Related Skills

- `generate-ui-test` - Generate tests using this page object
- `update-selectors` - Update page object selectors
- `refactor-page-object` - Refactor existing page object

## Notes

- Keep page objects focused (one page/component per class)
- Don't add test assertions in action methods
- Use getters for retrieving element values
- Group related methods together
- Document complex interactions
- Update page objects when UI changes
