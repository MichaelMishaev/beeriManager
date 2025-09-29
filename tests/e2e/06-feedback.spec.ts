import { test, expect } from '@playwright/test';

test.describe('Feedback Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4500/feedback');
  });

  test('should display feedback page correctly', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('משוב והצעות');

    // Verify form elements are visible
    await expect(page.locator('textarea#message')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should test anonymous feedback submission', async ({ page }) => {
    // Fill in required fields
    await page.fill('input#subject', 'נושא בדיקה');
    await page.fill('textarea#message', 'זהו משוב בדיקה אנונימי עם טקסט ארוך מספיק');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for response and check for success message or redirect
    await page.waitForTimeout(2000);

    // Take screenshot after submission
    await page.screenshot({ path: 'tests/screenshots/feedback-anonymous-submitted.png' });
  });

  test('should test named feedback submission', async ({ page }) => {
    // Toggle anonymous mode off
    await page.click('#is_anonymous');
    await page.waitForTimeout(500);

    // Fill in the name and email
    const nameInput = page.locator('input#parent_name');
    const emailInput = page.locator('input#contact_email');

    await nameInput.fill('משתמש בדיקה');
    await emailInput.fill('test@example.com');

    // Fill in required fields
    await page.fill('input#subject', 'נושא בדיקה עם שם');
    await page.fill('textarea#message', 'זהו משוב בדיקה עם שם וטקסט ארוך מספיק');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(2000);

    // Take screenshot after submission
    await page.screenshot({ path: 'tests/screenshots/feedback-named-submitted.png' });
  });

  test('should test category selection buttons', async ({ page }) => {
    // Test the anonymous switch
    const anonymousSwitch = page.locator('#is_anonymous');
    await anonymousSwitch.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/screenshots/feedback-switch-off.png' });

    // Click it again to toggle back
    await anonymousSwitch.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/screenshots/feedback-switch-on.png' });

    // Test star rating buttons (use force click to handle overlay issues)
    const stars = page.locator('button[type="button"]').filter({ hasText: '' }).locator('svg');
    const starCount = await stars.count();

    console.log(`Found ${starCount} star buttons`);

    // Click each star
    for (let i = 0; i < Math.min(starCount, 5); i++) {
      await page.locator('button[type="button"]').nth(i + 1).click({ force: true });
      await page.waitForTimeout(200);
      await page.screenshot({
        path: `tests/screenshots/feedback-star-${i + 1}-clicked.png`
      });
    }

    // Test category select dropdown
    const categorySelect = page.locator('select, button[role="combobox"]').first();
    if (await categorySelect.isVisible()) {
      await categorySelect.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/feedback-category-dropdown.png' });
    }
  });

  test('should test empty form submission', async ({ page }) => {
    // Try to submit without filling anything
    await page.click('button[type="submit"]');

    // Wait for validation
    await page.waitForTimeout(500);

    // Check for error messages
    const errorMessages = page.locator('text=/חייב/');
    await expect(errorMessages.first()).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/feedback-empty-validation.png' });
  });

  test('should test long message input', async ({ page }) => {
    // Create a long message
    const longMessage = 'זהו משוב ארוך מאוד. '.repeat(50);

    // Fill in required fields
    await page.fill('input#subject', 'נושא ארוך');
    await page.fill('textarea#message', longMessage);

    // Verify the text was entered
    const value = await page.locator('textarea#message').inputValue();
    expect(value.length).toBeGreaterThan(500);

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/feedback-long-message.png' });
  });

  test('should test RTL layout', async ({ page }) => {
    // Check if html has RTL direction
    const html = page.locator('html');
    const direction = await html.getAttribute('dir');

    expect(direction).toBe('rtl');

    // Verify textarea is RTL aligned
    const textarea = page.locator('textarea#message');
    const textareaDirection = await textarea.evaluate(el => window.getComputedStyle(el).direction);

    expect(textareaDirection).toBe('rtl');
  });

  test('should test mobile responsiveness', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify elements are still visible and usable
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('textarea#message')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/feedback-mobile.png' });

    // Test on tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'tests/screenshots/feedback-tablet.png' });
  });

  test('should test all interactive elements', async ({ page }) => {
    // Get all clickable elements
    const clickableElements = await page.locator('button, a, input, textarea, select').all();

    console.log(`Found ${clickableElements.length} interactive elements`);

    for (let i = 0; i < clickableElements.length; i++) {
      const element = clickableElements[i];
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      const text = await element.textContent();
      const isVisible = await element.isVisible();

      console.log(`Element ${i + 1}: ${tagName} - "${text}" - visible: ${isVisible}`);
    }
  });
});