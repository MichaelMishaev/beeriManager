import { test, expect, devices } from '@playwright/test';
import { HebrewHelper } from '../helpers/hebrew.helper';

test.use({ ...devices['iPhone 12'] });

test.describe('Mobile Experience', () => {

  test('should display mobile navigation', async ({ page }) => {
    const hebrewHelper = new HebrewHelper(page);

    await page.goto('/');

    // Should show mobile navigation
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();

    // Should have correct Hebrew labels
    await hebrewHelper.verifyHebrewText('[data-testid="nav-home"]', 'בית');
    await hebrewHelper.verifyHebrewText('[data-testid="nav-events"]', 'אירועים');
    await hebrewHelper.verifyHebrewText('[data-testid="nav-tasks"]', 'משימות');

    // Navigation should be at bottom
    const navPosition = await page.locator('[data-testid="mobile-nav"]').evaluate(el => {
      const rect = el.getBoundingClientRect();
      return rect.bottom >= window.innerHeight - 10; // Within 10px of bottom
    });
    expect(navPosition).toBe(true);
  });

  test('should work with touch gestures', async ({ page }) => {
    await page.goto('/events');

    // Test swipe to navigate between events
    const eventsList = page.locator('[data-testid="events-list"]');
    await eventsList.scrollIntoViewIfNeeded();

    // Swipe down to scroll
    await page.touchscreen.tap(200, 300);
    await page.touchscreen.tap(200, 500); // Swipe gesture

    // Should scroll the list
    const scrollPosition = await eventsList.evaluate(el => el.scrollTop);
    expect(scrollPosition).toBeGreaterThan(0);
  });

  test('should handle mobile form input', async ({ page }) => {
    const hebrewHelper = new HebrewHelper(page);

    await page.goto('/events');

    // Find event with registration
    await page.click('[data-testid="event-card"]');

    const registerButton = page.locator('button:has-text("הרשמה")');
    if (await registerButton.isVisible()) {
      await registerButton.click();

      // Test mobile keyboard input
      await hebrewHelper.testHebrewKeyboard('input[name="name"]');

      // Test phone number input with mobile keyboard
      await page.click('input[name="phone"]');
      await page.keyboard.type('0501234567');

      // Verify correct input
      await expect(page.locator('input[name="phone"]')).toHaveValue('0501234567');
    }
  });

  test('should work in landscape orientation', async ({ page }) => {
    await page.goto('/');

    // Rotate to landscape
    await page.setViewportSize({ width: 812, height: 375 });

    // Should still display correctly
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();

    // Navigation should adapt to landscape
    const nav = page.locator('[data-testid="mobile-nav"]');
    const navHeight = await nav.evaluate(el => (el as HTMLElement).offsetHeight);
    expect(navHeight).toBeLessThan(80); // Should be smaller in landscape
  });

  test('should handle PWA install prompt', async ({ page }) => {
    await page.goto('/');

    // Trigger PWA install prompt (simulated)
    await page.evaluate(() => {
      // Simulate beforeinstallprompt event
      const event = new Event('beforeinstallprompt');
      window.dispatchEvent(event);
    });

    // Should show install banner
    await expect(page.locator('[data-testid="pwa-install-banner"]')).toBeVisible();

    // Click install
    await page.click('[data-testid="pwa-install-button"]');

    // Should hide banner after install
    await expect(page.locator('[data-testid="pwa-install-banner"]')).not.toBeVisible();
  });

  test('should display QR scanner correctly on mobile', async ({ page }) => {
    await page.goto('/admin/events');

    // Go to QR check-in
    await page.click('[data-testid="qr-checkin-button"]');

    // Should show camera permission request
    await expect(page.locator('[data-testid="camera-permission"]')).toBeVisible();

    // Mock camera permission granted
    await page.evaluate(() => {
      navigator.mediaDevices.getUserMedia = () =>
        Promise.resolve({} as MediaStream);
    });

    // Should display QR scanner
    await expect(page.locator('[data-testid="qr-scanner"]')).toBeVisible();

    // Scanner should be optimized for mobile
    const scannerSize = await page.locator('[data-testid="qr-scanner"]').evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });

    expect(scannerSize.width).toBeGreaterThan(250); // Should be large enough on mobile
  });

  test('should handle offline mode on mobile', async ({ page, context }) => {
    await page.goto('/');

    // Wait for page to load
    await expect(page.locator('h1')).toBeVisible();

    // Go offline
    await context.setOffline(true);

    // Should show offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

    // Navigate to cached page
    await page.click('[data-testid="nav-events"]');

    // Should still work (from cache)
    await expect(page.locator('h1')).toContainText('אירועים');

    // Try to submit form (should queue)
    const registerButton = page.locator('button:has-text("הרשמה")');
    if (await registerButton.isVisible()) {
      await registerButton.click();

      await page.fill('input[name="name"]', 'משתמש לא מקוון');
      await page.click('button[type="submit"]');

      // Should show queued message
      await expect(page.locator('.toast-info')).toContainText('הבקשה תישלח כשהחיבור יחזור');
    }

    // Go back online
    await context.setOffline(false);

    // Should process queued actions
    await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible();
  });
});