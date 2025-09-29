import { test, expect } from '@playwright/test';

// Simple navigation test without database setup
test.describe('Simple Navigation', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('http://localhost:4500');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/home.png', fullPage: true });

    // Check title
    await expect(page).toHaveTitle(/BeeriManager/);

    console.log('✅ Home page loaded successfully');
  });

  test('click events card navigates to events', async ({ page }) => {
    await page.goto('http://localhost:4500');
    await page.waitForLoadState('networkidle');

    console.log('🏠 On home page');

    // Find and click events link
    const eventsLink = page.locator('a[href="/events"]').first();
    await expect(eventsLink).toBeVisible();

    console.log('🔍 Found events link, clicking...');

    await eventsLink.click();
    await page.waitForLoadState('networkidle');

    console.log('🎯 Clicked events link');

    // Take screenshot of events page
    await page.screenshot({ path: 'tests/screenshots/events.png', fullPage: true });

    // Check URL
    await expect(page).toHaveURL(/events/);

    console.log('✅ Successfully navigated to events page');
  });

  test('events page shows correct content', async ({ page }) => {
    await page.goto('http://localhost:4500/events');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/events-direct.png', fullPage: true });

    // Check for main heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    const headingText = await heading.textContent();
    console.log(`📄 Page heading: ${headingText}`);

    console.log('✅ Events page loaded successfully');
  });
});