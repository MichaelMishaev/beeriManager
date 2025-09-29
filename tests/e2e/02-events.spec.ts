import { test, expect } from '@playwright/test';
import { HebrewHelper } from '../helpers/hebrew.helper';

test.describe('Events Management', () => {
  test('should display events list', async ({ page }) => {
    const hebrewHelper = new HebrewHelper(page);

    await page.goto('/events');

    // Check page title
    await hebrewHelper.verifyHebrewText('h1', 'אירועים');

    // Should display at least one test event
    await expect(page.locator('[data-testid="event-card"]')).toHaveCount.atLeast(1);

    // Check event card content
    const firstEvent = page.locator('[data-testid="event-card"]').first();
    await expect(firstEvent.locator('.event-title')).toBeVisible();
    await expect(firstEvent.locator('.event-date')).toBeVisible();

    // Verify Hebrew date format
    await hebrewHelper.verifyHebrewDate('.event-date');
  });

  test('should filter events by type', async ({ page }) => {
    await page.goto('/events');

    // Click on meeting filter
    await page.click('[data-testid="filter-meeting"]');

    // Should show only meeting events
    await expect(page.locator('[data-testid="event-type-meeting"]')).toHaveCount.atLeast(0);

    // Click on all filter
    await page.click('[data-testid="filter-all"]');

    // Should show all events again
    await expect(page.locator('[data-testid="event-card"]')).toHaveCount.atLeast(1);
  });

  test('should navigate to event detail', async ({ page }) => {
    await page.goto('/events');

    // Click on first event
    await page.click('[data-testid="event-card"]', { position: { x: 50, y: 50 } });

    // Should navigate to event detail
    await expect(page).toHaveURL(/\/events\/[a-f0-9-]+/);
    await expect(page.locator('.event-detail')).toBeVisible();
  });

  test('should register for event', async ({ page }) => {
    const hebrewHelper = new HebrewHelper(page);

    await page.goto('/events');

    // Find an event with registration enabled
    const eventCard = page.locator('[data-testid="event-card"]').first();
    await eventCard.click();

    // Check if registration is available
    const registerButton = page.locator('button:has-text("הרשמה")');
    if (await registerButton.isVisible()) {
      await registerButton.click();

      // Fill registration form
      await hebrewHelper.fillHebrewText('input[name="name"]', 'תומר לוי');
      await page.fill('input[name="phone"]', '0501234567');
      await page.fill('input[name="email"]', 'tomer@example.com');

      // Submit form
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.locator('.toast-success')).toContainText('נרשמת בהצלחה');

      // Should show QR code
      await expect(page.locator('[data-testid="qr-code"]')).toBeVisible();
    }
  });

  test('should display calendar view', async ({ page }) => {
    await page.goto('/events');

    // Switch to calendar view
    await page.click('[data-testid="calendar-view-button"]');

    // Should display calendar
    await expect(page.locator('[data-testid="calendar"]')).toBeVisible();

    // Should show current month
    await expect(page.locator('.calendar-header')).toBeVisible();

    // Should display events on calendar
    await expect(page.locator('.calendar-event')).toHaveCount.atLeast(1);
  });

  test('should export to iCal', async ({ page }) => {
    await page.goto('/events');

    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-ical"]');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('events.ics');
  });
});