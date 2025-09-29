import { test, expect } from '@playwright/test';
import { HebrewHelper } from '../helpers/hebrew.helper';

test.describe('Home Page', () => {
  test('should display home page correctly', async ({ page }) => {
    const hebrewHelper = new HebrewHelper(page);

    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/ועד הורים/);

    // Verify RTL layout
    await hebrewHelper.verifyRTLLayout();

    // Check main navigation
    await expect(page.locator('nav')).toBeVisible();
    await hebrewHelper.verifyHebrewText('nav >> text=אירועים', 'אירועים');
    await hebrewHelper.verifyHebrewText('nav >> text=משימות', 'משימות');

    // Check hero section
    await expect(page.locator('h1')).toBeVisible();
    await hebrewHelper.verifyHebrewText('h1', 'ועד הורים');

    // Verify mobile navigation on small screens
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
  });

  test('should navigate to events page', async ({ page }) => {
    await page.goto('/');

    await page.click('text=אירועים');
    await expect(page).toHaveURL('/events');
    await expect(page.locator('h1')).toContainText('אירועים');
  });

  test('should navigate to tasks page', async ({ page }) => {
    await page.goto('/');

    await page.click('text=משימות');
    await expect(page).toHaveURL('/tasks');
    await expect(page.locator('h1')).toContainText('משימות');
  });

  test('should work offline', async ({ page, context }) => {
    await page.goto('/');

    // Go offline
    await context.setOffline(true);

    // Should still display cached content
    await expect(page.locator('h1')).toBeVisible();

    // Should show offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

    // Go back online
    await context.setOffline(false);
    await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible();
  });
});