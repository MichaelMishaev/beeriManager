import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';
import { HebrewHelper } from '../helpers/hebrew.helper';

test.describe('Vendors Management', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('should navigate to vendors page from menu', async ({ page }) => {
    const hebrewHelper = new HebrewHelper(page);

    // Go to admin dashboard
    await page.goto('/admin');

    // Click vendors link in navigation
    await page.click('a[href="/admin/vendors"]');

    // Verify vendors page loaded
    await hebrewHelper.verifyHebrewText('h1', 'ספקים ונותני שירותים');
  });

  test('should display vendors list', async ({ page }) => {
    await page.goto('/admin/vendors');

    // Page should load without errors
    await expect(page.locator('h1')).toBeVisible();

    // Should have add vendor button
    await expect(page.locator('a[href="/admin/vendors/new"]')).toBeVisible();
  });

  test('should create new vendor successfully', async ({ page }) => {
    const hebrewHelper = new HebrewHelper(page);

    // Navigate to new vendor page
    await page.goto('/admin/vendors/new');

    // Verify page loaded
    await hebrewHelper.verifyHebrewText('h1', 'הוספת ספק חדש');

    // Fill vendor form
    await page.fill('input#name', 'קייטרינג הזהב - בדיקה אוטומטית');
    await page.fill('textarea#description', 'ספק קייטרינג איכותי לאירועים');

    // Select category
    await page.click('[id="category"]');
    await page.click('text=קייטרינג');

    // Fill contact information
    await page.fill('input#contact_person', 'משה כהן');
    await page.fill('input#phone', '0501234567');
    await page.fill('input#email', 'moshe@catering-test.com');
    await page.fill('input#website', 'https://catering-test.com');
    await page.fill('input#address', 'רחוב הרצל 123, תל אביב');

    // Fill business details
    await page.fill('input#business_number', '123456789');
    await page.fill('input#license_number', 'LIC-12345');
    await page.fill('textarea#payment_terms', 'תשלום מראש 50%, יתרה ביום האירוע');
    await page.fill('textarea#notes', 'ספק מומלץ עם ניסיון רב');

    // Select price range
    await page.click('[id="price_range"]');
    await page.click('text=בינוני');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to vendors list
    await page.waitForURL('/admin/vendors');

    // Verify vendor was created - should see it in the list
    await expect(page.locator('text=קייטרינג הזהב - בדיקה אוטומטית')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/admin/vendors/new');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation error for name
    await expect(page.locator('text=שם הספק חייב להכיל לפחות 2 תווים')).toBeVisible();
  });

  test('should validate phone number format', async ({ page }) => {
    await page.goto('/admin/vendors/new');

    // Fill name to pass that validation
    await page.fill('input#name', 'ספק בדיקה');

    // Enter invalid phone
    await page.fill('input#phone', '123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show phone validation error
    await expect(page.locator('text=מספר טלפון לא תקין')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/admin/vendors/new');

    // Fill name
    await page.fill('input#name', 'ספק בדיקה');

    // Enter invalid email
    await page.fill('input#email', 'invalid-email');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show email validation error
    await expect(page.locator('text=כתובת אימייל לא תקינה')).toBeVisible();
  });

  test('should validate website URL format', async ({ page }) => {
    await page.goto('/admin/vendors/new');

    // Fill name
    await page.fill('input#name', 'ספק בדיקה');

    // Enter invalid URL
    await page.fill('input#website', 'not-a-url');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show URL validation error
    await expect(page.locator('text=כתובת אתר לא תקינה')).toBeVisible();
  });

  test('should cancel vendor creation', async ({ page }) => {
    await page.goto('/admin/vendors/new');

    // Fill some data
    await page.fill('input#name', 'ספק לביטול');

    // Click cancel button
    await page.click('button:has-text("ביטול")');

    // Should navigate back (to vendors list)
    await page.waitForURL('/admin/vendors');
  });

  test('should filter vendors by category', async ({ page }) => {
    await page.goto('/admin/vendors');

    // Wait for page to load
    await expect(page.locator('h1')).toBeVisible();

    // Check if there are category headers
    const categoryHeaders = page.locator('h2');
    const count = await categoryHeaders.count();

    // Should have at least one category if there are vendors
    if (count > 0) {
      await expect(categoryHeaders.first()).toBeVisible();
    }
  });

  test('should display vendor contact information', async ({ page }) => {
    await page.goto('/admin/vendors');

    // Look for vendor cards
    const vendorCards = page.locator('[class*="Card"]').filter({ hasText: 'איש קשר' });
    const count = await vendorCards.count();

    // If there are vendors, check contact info is displayed
    if (count > 0) {
      const firstCard = vendorCards.first();

      // Should have phone or email visible
      const hasContact = await firstCard.locator('a[href^="tel:"], a[href^="mailto:"]').count();
      expect(hasContact).toBeGreaterThan(0);
    }
  });

  test('should display vendor statistics', async ({ page }) => {
    await page.goto('/admin/vendors');

    // Check for statistics cards
    await expect(page.locator('text=סה"כ ספקים')).toBeVisible();
    await expect(page.locator('text=קטגוריות')).toBeVisible();
    await expect(page.locator('text=דירוג ממוצע')).toBeVisible();
  });

  test('should have search and filter buttons', async ({ page }) => {
    await page.goto('/admin/vendors');

    // Check for search and filter functionality
    await expect(page.locator('button:has-text("חיפוש")')).toBeVisible();
    await expect(page.locator('button:has-text("סינון")')).toBeVisible();
  });
});

test.describe('Vendors - Mobile View', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('should display vendors in mobile view', async ({ page }) => {
    await page.goto('/admin/vendors');

    // Should be visible on mobile
    await expect(page.locator('h1')).toBeVisible();

    // Add vendor button should be visible
    await expect(page.locator('a[href="/admin/vendors/new"]')).toBeVisible();
  });

  test('should create vendor on mobile', async ({ page }) => {
    await page.goto('/admin/vendors/new');

    // Form should be usable on mobile
    await page.fill('input#name', 'ספק מובייל');

    // Category selector should work
    await page.click('[id="category"]');
    await page.click('text=אחר');

    // Submit should be visible
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
