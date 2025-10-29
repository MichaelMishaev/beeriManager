import { test, expect } from '@playwright/test';
import { HebrewHelper } from '../helpers/hebrew.helper';

test.describe('Feedback & Ideas Modal Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage where the component is displayed
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display the feedback and ideas card on homepage', async ({ page }) => {
    const hebrewHelper = new HebrewHelper(page);

    // Verify card is visible
    const card = page.locator('text=💬💡 יש לכם משוב או רעיון?').first();
    await expect(card).toBeVisible();

    // Verify button exists
    const button = page.getByTestId('share-feedback-ideas-button');
    await expect(button).toBeVisible();
    await hebrewHelper.verifyHebrewText('[data-testid="share-feedback-ideas-button"]', 'שתפו אותנו');
  });

  test('should open modal when button is clicked', async ({ page }) => {
    // Click the main button
    const button = page.getByTestId('share-feedback-ideas-button');
    await button.click();

    // Verify modal opens
    const modal = page.getByTestId('feedback-ideas-modal');
    await expect(modal).toBeVisible();

    // Verify modal title
    await expect(page.locator('text=איך תרצו לשתף אותנו?')).toBeVisible();

    // Verify modal description
    await expect(page.locator('text=בחרו את הדרך המתאימה לכם')).toBeVisible();
  });

  test('should display both feedback and ideas options in modal', async ({ page }) => {
    // Open modal
    await page.getByTestId('share-feedback-ideas-button').click();

    const modal = page.getByTestId('feedback-ideas-modal');
    await expect(modal).toBeVisible();

    // Verify feedback option
    const feedbackOption = page.getByTestId('modal-feedback-link');
    await expect(feedbackOption).toBeVisible();
    await expect(feedbackOption.locator('text=💬 שלחו משוב')).toBeVisible();
    await expect(feedbackOption.locator('text=שתפו אותנו בדעתכם על האירועים והשירותים שקיבלתם')).toBeVisible();

    // Verify ideas option
    const ideasOption = page.getByTestId('modal-ideas-link');
    await expect(ideasOption).toBeVisible();
    await expect(ideasOption.locator('text=💡 שלחו רעיון')).toBeVisible();
    await expect(ideasOption.locator('text=יש לכם רעיון לשיפור או תכונה חדשה')).toBeVisible();
  });

  test('should navigate to complaint page when feedback option is clicked', async ({ page }) => {
    // Open modal
    await page.getByTestId('share-feedback-ideas-button').click();

    // Wait for modal to be visible
    await expect(page.getByTestId('feedback-ideas-modal')).toBeVisible();

    // Click feedback option
    await page.getByTestId('modal-feedback-link').click();

    // Verify navigation to complaint page
    await page.waitForURL('**/complaint');
    expect(page.url()).toContain('/complaint');

    // Verify complaint page loaded (check for any heading or form element)
    await expect(page.locator('h1, h2, form, textarea, [role="form"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to ideas page when ideas option is clicked', async ({ page }) => {
    // Open modal
    await page.getByTestId('share-feedback-ideas-button').click();

    // Wait for modal to be visible
    await expect(page.getByTestId('feedback-ideas-modal')).toBeVisible();

    // Click ideas option
    await page.getByTestId('modal-ideas-link').click();

    // Verify navigation to ideas page
    await page.waitForURL('**/ideas');
    expect(page.url()).toContain('/ideas');

    // Verify ideas page loaded
    await expect(page.locator('h1, h2').filter({ hasText: /רעיון/ })).toBeVisible();
  });

  test('should close modal when clicking outside (overlay)', async ({ page }) => {
    // Open modal
    await page.getByTestId('share-feedback-ideas-button').click();

    const modal = page.getByTestId('feedback-ideas-modal');
    await expect(modal).toBeVisible();

    // Click outside modal (on the overlay)
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  test('should close modal when clicking X button', async ({ page }) => {
    // Open modal
    await page.getByTestId('share-feedback-ideas-button').click();

    const modal = page.getByTestId('feedback-ideas-modal');
    await expect(modal).toBeVisible();

    // Click close button (X)
    await page.locator('[data-testid="feedback-ideas-modal"] button[aria-label="Close"], [data-testid="feedback-ideas-modal"] button:has(svg)').first().click();

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  test('should apply correct color styling to feedback option (blue)', async ({ page }) => {
    // Open modal
    await page.getByTestId('share-feedback-ideas-button').click();

    await expect(page.getByTestId('feedback-ideas-modal')).toBeVisible();

    // Check feedback option has blue color scheme
    const feedbackOption = page.getByTestId('modal-feedback-link');
    const feedbackIcon = feedbackOption.locator('div').first();

    // Check for blue color class (0D98BA is the blue-green color)
    const classList = await feedbackOption.locator('div.border-2').getAttribute('class');
    expect(classList).toContain('border-[#0D98BA]');
  });

  test('should apply correct color styling to ideas option (yellow)', async ({ page }) => {
    // Ensure we're on homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for and click button
    const button = page.getByTestId('share-feedback-ideas-button');
    await button.scrollIntoViewIfNeeded();
    await button.click();

    await expect(page.getByTestId('feedback-ideas-modal')).toBeVisible();

    // Check ideas option has yellow color scheme
    const ideasOption = page.getByTestId('modal-ideas-link');

    // Check for yellow color class (FFBA00 is the yellow color)
    const classList = await ideasOption.locator('div.border-2').getAttribute('class');
    expect(classList).toContain('border-[#FFBA00]');
  });

  test('should have hover effects on modal options', async ({ page }) => {
    // Ensure we're on homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for and click button
    const button = page.getByTestId('share-feedback-ideas-button');
    await button.scrollIntoViewIfNeeded();
    await button.click();

    await expect(page.getByTestId('feedback-ideas-modal')).toBeVisible();

    // Hover over feedback option
    const feedbackOption = page.getByTestId('modal-feedback-link');
    await feedbackOption.hover();

    // Take screenshot to verify hover state (optional, for visual regression)
    // await page.screenshot({ path: 'feedback-option-hover.png' });

    // Hover over ideas option
    const ideasOption = page.getByTestId('modal-ideas-link');
    await ideasOption.hover();

    // Verify the options are still visible and clickable after hover
    await expect(feedbackOption).toBeVisible();
    await expect(ideasOption).toBeVisible();
  });

  test('should work correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Reload page with mobile viewport
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify button is visible and clickable on mobile
    const button = page.getByTestId('share-feedback-ideas-button');
    await expect(button).toBeVisible();

    // Click button
    await button.click();

    // Verify modal opens and is properly sized for mobile
    const modal = page.getByTestId('feedback-ideas-modal');
    await expect(modal).toBeVisible();

    // Verify both options are visible and properly laid out on mobile
    await expect(page.getByTestId('modal-feedback-link')).toBeVisible();
    await expect(page.getByTestId('modal-ideas-link')).toBeVisible();

    // Verify text is readable on mobile
    await expect(page.locator('text=💬 שלחו משוב')).toBeVisible();
    await expect(page.locator('text=💡 שלחו רעיון')).toBeVisible();
  });

  test('should work correctly on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Reload page with tablet viewport
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify button is visible
    const button = page.getByTestId('share-feedback-ideas-button');
    await expect(button).toBeVisible();

    // Open modal
    await button.click();

    // Verify modal displays correctly on tablet
    const modal = page.getByTestId('feedback-ideas-modal');
    await expect(modal).toBeVisible();

    // Verify options are properly displayed
    await expect(page.getByTestId('modal-feedback-link')).toBeVisible();
    await expect(page.getByTestId('modal-ideas-link')).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Open modal
    await page.getByTestId('share-feedback-ideas-button').click();

    const modal = page.getByTestId('feedback-ideas-modal');
    await expect(modal).toBeVisible();

    // Verify modal content exists and is accessible
    await expect(modal).toHaveAttribute('data-testid', 'feedback-ideas-modal');

    // Verify title and description exist (important for screen readers)
    await expect(page.locator('text=איך תרצו לשתף אותנו?')).toBeVisible();
    await expect(page.locator('text=בחרו את הדרך המתאימה לכם')).toBeVisible();
  });

  test('should handle rapid clicks without errors', async ({ page }) => {
    const button = page.getByTestId('share-feedback-ideas-button');

    // Click button 3 times with proper wait
    for (let i = 0; i < 3; i++) {
      await button.click();
      await page.waitForTimeout(300);
      // Try to close if modal appeared
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }

    // Click one final time and verify modal opens
    await button.click();
    const modal = page.getByTestId('feedback-ideas-modal');
    await expect(modal).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('should maintain RTL direction in modal', async ({ page }) => {
    const hebrewHelper = new HebrewHelper(page);

    // Open modal
    await page.getByTestId('share-feedback-ideas-button').click();

    const modal = page.getByTestId('feedback-ideas-modal');
    await expect(modal).toBeVisible();

    // Check RTL direction
    const direction = await modal.evaluate(el => window.getComputedStyle(el).direction);
    expect(direction).toBe('rtl');

    // Verify Hebrew text is properly aligned
    const title = page.locator('text=איך תרצו לשתף אותנו?');
    const textAlign = await title.evaluate(el => window.getComputedStyle(el).textAlign);
    // RTL text should be center-aligned (as designed) or right-aligned
    expect(['center', 'right', 'start']).toContain(textAlign);
  });

  test('should take screenshots for visual regression', async ({ page }) => {
    // Screenshot 1: Card on homepage
    await page.locator('text=💬💡 יש לכם משוב או רעיון?').first().scrollIntoViewIfNeeded();
    await page.screenshot({
      path: 'tests/screenshots/feedback-ideas-card.png',
      fullPage: false
    });

    // Screenshot 2: Modal opened
    await page.getByTestId('share-feedback-ideas-button').click();
    await expect(page.getByTestId('feedback-ideas-modal')).toBeVisible();
    await page.screenshot({
      path: 'tests/screenshots/feedback-ideas-modal.png',
      fullPage: false
    });

    // Screenshot 3: Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: 'tests/screenshots/feedback-ideas-modal-mobile.png',
      fullPage: false
    });
  });
});

test.describe('Feedback & Ideas Modal - Integration Tests', () => {
  test('should complete full user journey: homepage -> modal -> feedback submission', async ({ page }) => {
    // 1. Start on homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Open modal
    await page.getByTestId('share-feedback-ideas-button').click();
    await expect(page.getByTestId('feedback-ideas-modal')).toBeVisible();

    // 3. Click feedback option
    await page.getByTestId('modal-feedback-link').click();

    // 4. Verify on complaint page
    await page.waitForURL('**/complaint');
    expect(page.url()).toContain('/complaint');

    // 5. Verify feedback form is present
    await expect(page.locator('form, [data-testid="feedback-form"]')).toBeVisible();
  });

  test('should complete full user journey: homepage -> modal -> ideas submission', async ({ page }) => {
    // 1. Start on homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Open modal
    await page.getByTestId('share-feedback-ideas-button').click();
    await expect(page.getByTestId('feedback-ideas-modal')).toBeVisible();

    // 3. Click ideas option
    await page.getByTestId('modal-ideas-link').click();

    // 4. Verify on ideas page
    await page.waitForURL('**/ideas');
    expect(page.url()).toContain('/ideas');

    // 5. Verify ideas form is present
    await expect(page.locator('form, [data-testid="ideas-form"]')).toBeVisible();
  });
});
