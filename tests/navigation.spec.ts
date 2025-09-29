import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('http://localhost:4500');
    await expect(page).toHaveTitle(/BeeriManager/);
    await expect(page.locator('h1')).toContainText('ברוכים הבאים');
  });

  test('should navigate to events page from home', async ({ page }) => {
    await page.goto('http://localhost:4500');

    // Click on events card
    await page.click('a[href="/events"]');

    // Wait for navigation
    await page.waitForURL('**/events');

    // Check we're on events page
    await expect(page).toHaveURL(/events/);
    await expect(page.locator('h1')).toContainText('אירועים');
  });

  test('should show events page content', async ({ page }) => {
    await page.goto('http://localhost:4500/events');

    // Check for events page elements
    await expect(page.locator('h1')).toContainText('אירועים');

    // Should have action buttons
    const newEventButton = page.locator('text=אירוע חדש');
    await expect(newEventButton).toBeVisible();
  });

  test('should handle 404 for non-existent routes', async ({ page }) => {
    const response = await page.goto('http://localhost:4500/non-existent-page');

    // Should get 404 response
    expect(response?.status()).toBe(404);

    // Should show 404 page
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=העמוד לא נמצא')).toBeVisible();
  });

  test('should navigate between home and drills', async ({ page }) => {
    // Start at home
    await page.goto('http://localhost:4500');

    // Find all quick action buttons
    const calendarButton = page.locator('a[href="/events"]').first();
    await expect(calendarButton).toBeVisible();

    // Click to navigate
    await calendarButton.click();
    await page.waitForLoadState('networkidle');

    // Verify we're on events page
    await expect(page).toHaveURL(/events/);

    // Take screenshot for verification
    await page.screenshot({ path: 'tests/screenshots/events-page.png' });
  });
});