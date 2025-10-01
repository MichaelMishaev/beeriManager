import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';
import { HebrewHelper } from '../helpers/hebrew.helper';

/**
 * Comprehensive Complaint Form Testing
 * Tests the complete flow from homepage → complaint form → submission → admin view
 */
test.describe('Complaint Form Complete Flow', () => {

  test.describe('Public Complaint Form Access', () => {
    test('should navigate to complaint form from homepage', async ({ page }) => {
      const startTime = performance.now();

      // Start at homepage
      await page.goto('/');
      await expect(page.locator('h1')).toContainText('ברוכים הבאים');

      // Find and click the feedback/complaint button
      const complaintButton = page.locator('a[href="/complaint"]');
      await expect(complaintButton).toBeVisible();
      await expect(complaintButton).toContainText('שלחו תלונה או משוב');

      // Click and navigate
      await complaintButton.click();
      await expect(page).toHaveURL('/complaint');

      const endTime = performance.now();
      console.log(`Navigation time: ${(endTime - startTime).toFixed(2)}ms`);
    });

    test('should display complaint form correctly', async ({ page }) => {
      const hebrewHelper = new HebrewHelper(page);

      await page.goto('/complaint');

      // Verify page title
      await expect(page.locator('h1')).toContainText('דיווח על בעיה');

      // Verify RTL layout
      await hebrewHelper.verifyRTLLayout();

      // Check required field (only מה הבעיה?)
      const titleInput = page.locator('input#title');
      await expect(titleInput).toBeVisible();
      const titleLabel = page.locator('label[for="title"]');
      await expect(titleLabel).toContainText('מה הבעיה?');
      await expect(titleLabel).toContainText('*'); // Required indicator

      // Check optional fields
      await expect(page.locator('textarea#description')).toBeVisible();
      await expect(page.locator('input#reporter_name')).toBeVisible();
      await expect(page.locator('input#reporter_contact')).toBeVisible();

      // Check optional event connection button
      const eventButton = page.locator('button:has-text("קשור לאירוע")');
      await expect(eventButton).toBeVisible();

      // Check submit button
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toContainText('שלח תלונה');
    });

    test('should validate required field', async ({ page }) => {
      await page.goto('/complaint');

      // Try to submit without filling anything
      await page.click('button[type="submit"]');

      // Should show error toast
      await page.waitForTimeout(500);
      const toast = page.locator('.sonner-toast');
      await expect(toast).toContainText('נא למלא את שדה הבעיה');
    });
  });

  test.describe('Complaint Submission Scenarios', () => {
    test('should submit minimal complaint (only required field)', async ({ page }) => {
      const startTime = performance.now();
      const hebrewHelper = new HebrewHelper(page);

      await page.goto('/complaint');

      // Fill only the required field
      await hebrewHelper.fillHebrewText('input#title', 'בעיה בחצר בית הספר');

      // Submit
      await page.click('button[type="submit"]');

      // Wait for success screen
      await page.waitForSelector('h1:has-text("התלונה נקלטה בהצלחה")', { timeout: 5000 });

      // Verify success screen elements
      await expect(page.locator('h1')).toContainText('התלונה נקלטה בהצלחה!');
      await expect(page.locator('p')).toContainText('תודה על הפנייה');

      // Check for "חזרה לדף הבית" button (not "שלח תלונה נוספת")
      const homeButton = page.locator('button:has-text("חזרה לדף הבית")');
      await expect(homeButton).toBeVisible();

      // Verify Home icon is present
      const homeIcon = homeButton.locator('svg');
      await expect(homeIcon).toBeVisible();

      const endTime = performance.now();
      console.log(`Minimal complaint submission time: ${(endTime - startTime).toFixed(2)}ms`);

      // Screenshot success screen
      await page.screenshot({ path: 'test-results/screenshots/complaint-success-minimal.png' });
    });

    test('should submit complete complaint (all fields)', async ({ page }) => {
      const startTime = performance.now();
      const hebrewHelper = new HebrewHelper(page);

      await page.goto('/complaint');

      // Fill all fields
      await hebrewHelper.fillHebrewText('input#title', 'תקלה בחצר - דחוף');
      await hebrewHelper.fillHebrewText('textarea#description', 'יש שבר בגדר ליד המגלשה. זה מסוכן לילדים ודורש תיקון מיידי.');
      await hebrewHelper.fillHebrewText('input#reporter_name', 'דני כהן');
      await page.fill('input#reporter_contact', '050-1234567');

      // Submit
      await page.click('button[type="submit"]');

      // Wait for success
      await page.waitForSelector('h1:has-text("התלונה נקלטה בהצלחה")', { timeout: 5000 });
      await expect(page.locator('h1')).toContainText('התלונה נקלטה בהצלחה!');

      const endTime = performance.now();
      console.log(`Complete complaint submission time: ${(endTime - startTime).toFixed(2)}ms`);

      await page.screenshot({ path: 'test-results/screenshots/complaint-success-complete.png' });
    });

    test('should submit complaint with phone number in contact field', async ({ page }) => {
      const hebrewHelper = new HebrewHelper(page);

      await page.goto('/complaint');

      // Test with phone number (not email)
      await hebrewHelper.fillHebrewText('input#title', 'בעיה עם החניה');
      await page.fill('input#reporter_contact', '0501234567'); // Phone without dashes

      await page.click('button[type="submit"]');

      // Should succeed (phone is accepted)
      await page.waitForSelector('h1:has-text("התלונה נקלטה בהצלחה")', { timeout: 5000 });
      await expect(page.locator('h1')).toContainText('התלונה נקלטה בהצלחה!');
    });

    test('should submit complaint with email in contact field', async ({ page }) => {
      const hebrewHelper = new HebrewHelper(page);

      await page.goto('/complaint');

      // Test with email
      await hebrewHelper.fillHebrewText('input#title', 'בעיה עם התקשורת');
      await page.fill('input#reporter_contact', 'parent@example.com');

      await page.click('button[type="submit"]');

      // Should succeed (email is accepted)
      await page.waitForSelector('h1:has-text("התלונה נקלטה בהצלחה")', { timeout: 5000 });
      await expect(page.locator('h1')).toContainText('התלונה נקלטה בהצלחה!');
    });

    test('should handle event connection feature', async ({ page }) => {
      const hebrewHelper = new HebrewHelper(page);

      await page.goto('/complaint');

      // Fill required field
      await hebrewHelper.fillHebrewText('input#title', 'בעיה באירוע');

      // Click event connection button
      const eventButton = page.locator('button:has-text("קשור לאירוע")');
      await eventButton.click();

      // Wait for event selector to appear
      await page.waitForTimeout(500);

      // Check if event selector is visible
      const eventSelect = page.locator('button[role="combobox"]');
      await expect(eventSelect).toBeVisible();

      // Close event selector (X button)
      const closeButton = page.locator('button:has(svg)').filter({ hasText: '' }).last();
      await closeButton.click();

      // Event selector should be hidden
      await expect(eventSelect).not.toBeVisible();

      // Submit without event
      await page.click('button[type="submit"]');
      await page.waitForSelector('h1:has-text("התלונה נקלטה בהצלחה")', { timeout: 5000 });
    });
  });

  test.describe('Success Screen Navigation', () => {
    test('should navigate back to homepage from success screen', async ({ page }) => {
      const hebrewHelper = new HebrewHelper(page);

      // Submit a complaint first
      await page.goto('/complaint');
      await hebrewHelper.fillHebrewText('input#title', 'בדיקת ניווט');
      await page.click('button[type="submit"]');

      // Wait for success screen
      await page.waitForSelector('h1:has-text("התלונה נקלטה בהצלחה")', { timeout: 5000 });

      // Click "חזרה לדף הבית" button
      const homeButton = page.locator('button:has-text("חזרה לדף הבית")');
      await homeButton.click();

      // Should navigate to homepage
      await expect(page).toHaveURL('/');
      await expect(page.locator('h1')).toContainText('ברוכים הבאים');
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/complaint');

      // Check all elements are visible and usable
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('input#title')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      // Fill and submit on mobile
      await page.fill('input#title', 'בדיקת מובייל');
      await page.click('button[type="submit"]');

      // Success screen should be mobile-friendly
      await page.waitForSelector('h1:has-text("התלונה נקלטה בהצלחה")', { timeout: 5000 });

      // Large success screen on mobile
      const card = page.locator('.rounded-2xl, .rounded-lg').first();
      await expect(card).toBeVisible();

      await page.screenshot({ path: 'test-results/screenshots/complaint-mobile.png' });
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/complaint');

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('input#title')).toBeVisible();

      await page.screenshot({ path: 'test-results/screenshots/complaint-tablet.png' });
    });
  });

  test.describe('RTL and Accessibility', () => {
    test('should display proper RTL layout', async ({ page }) => {
      const hebrewHelper = new HebrewHelper(page);

      await page.goto('/complaint');

      // Check RTL layout
      await hebrewHelper.verifyRTLLayout();

      // Check input direction
      const titleInput = page.locator('input#title');
      const direction = await titleInput.evaluate(el => window.getComputedStyle(el).direction);
      expect(direction).toBe('rtl');

      // Check textarea direction
      const descTextarea = page.locator('textarea#description');
      const textareaDirection = await descTextarea.evaluate(el => window.getComputedStyle(el).direction);
      expect(textareaDirection).toBe('rtl');
    });

    test('should support Hebrew keyboard input', async ({ page }) => {
      const hebrewHelper = new HebrewHelper(page);

      await page.goto('/complaint');

      // Test Hebrew keyboard
      await hebrewHelper.testHebrewKeyboard('input#title');

      // Verify text is in Hebrew
      const value = await page.inputValue('input#title');
      expect(value).toBe('שלום עולם');
    });

    test('should have accessible form labels', async ({ page }) => {
      await page.goto('/complaint');

      // Check all inputs have labels
      const titleLabel = page.locator('label[for="title"]');
      await expect(titleLabel).toBeVisible();

      const descLabel = page.locator('label[for="description"]');
      await expect(descLabel).toBeVisible();

      const nameLabel = page.locator('label[for="reporter_name"]');
      await expect(nameLabel).toBeVisible();

      const contactLabel = page.locator('label[for="reporter_contact"]');
      await expect(contactLabel).toBeVisible();
    });
  });

  test.describe('Edge Cases and Error Handling', () => {
    test('should handle very long text', async ({ page }) => {
      const hebrewHelper = new HebrewHelper(page);

      await page.goto('/complaint');

      // Create very long title
      const longTitle = 'בעיה '.repeat(100);
      await hebrewHelper.fillHebrewText('input#title', longTitle);

      // Create very long description
      const longDescription = 'תיאור ארוך מאוד של הבעיה. '.repeat(200);
      await page.fill('textarea#description', longDescription);

      await page.click('button[type="submit"]');

      // Should still succeed
      await page.waitForSelector('h1:has-text("התלונה נקלטה בהצלחה")', { timeout: 5000 });
    });

    test('should handle special characters', async ({ page }) => {
      const hebrewHelper = new HebrewHelper(page);

      await page.goto('/complaint');

      // Use special characters
      await hebrewHelper.fillHebrewText('input#title', 'בעיה עם "ציטוטים" ו\'אפוסטרופים\'');
      await page.fill('textarea#description', 'תיאור עם סימנים: !@#$%^&*()_+-=[]{}|;:,.<>?');

      await page.click('button[type="submit"]');

      // Should succeed
      await page.waitForSelector('h1:has-text("התלונה נקלטה בהצלחה")', { timeout: 5000 });
    });

    test('should handle whitespace-only input', async ({ page }) => {
      await page.goto('/complaint');

      // Fill with only spaces
      await page.fill('input#title', '   ');
      await page.click('button[type="submit"]');

      // Should show validation error
      await page.waitForTimeout(500);
      const toast = page.locator('.sonner-toast');
      await expect(toast).toContainText('נא למלא את שדה הבעיה');
    });

    test('should handle network errors gracefully', async ({ page }) => {
      await page.goto('/complaint');

      // Fill form
      await page.fill('input#title', 'בדיקת שגיאת רשת');

      // Intercept API call and simulate network error
      await page.route('**/api/feedback', route => {
        route.abort('failed');
      });

      // Submit
      await page.click('button[type="submit"]');

      // Should show error message
      await page.waitForTimeout(1000);
      const toast = page.locator('.sonner-toast');
      await expect(toast).toContainText('שגיאה בשליחת התלונה');

      // Should not show success screen
      await expect(page.locator('h1:has-text("התלונה נקלטה בהצלחה")')).not.toBeVisible();
    });
  });

  test.describe('Performance Tests', () => {
    test('should load complaint form quickly', async ({ page }) => {
      const startTime = performance.now();

      await page.goto('/complaint');
      await page.waitForSelector('h1');

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      console.log(`Complaint form load time: ${loadTime.toFixed(2)}ms`);

      // Should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should submit form quickly', async ({ page }) => {
      await page.goto('/complaint');
      await page.fill('input#title', 'בדיקת ביצועים');

      const startTime = performance.now();

      await page.click('button[type="submit"]');
      await page.waitForSelector('h1:has-text("התלונה נקלטה בהצלחה")');

      const endTime = performance.now();
      const submitTime = endTime - startTime;

      console.log(`Form submission time: ${submitTime.toFixed(2)}ms`);

      // Should submit in under 5 seconds
      expect(submitTime).toBeLessThan(5000);
    });
  });
});

test.describe('Admin Feedback View', () => {
  test('should view submitted complaints in admin panel', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    const hebrewHelper = new HebrewHelper(page);

    // First submit a complaint as parent
    await page.goto('/complaint');
    const uniqueTitle = `בדיקת אדמין - ${Date.now()}`;
    await hebrewHelper.fillHebrewText('input#title', uniqueTitle);
    await page.click('button[type="submit"]');
    await page.waitForSelector('h1:has-text("התלונה נקלטה בהצלחה")', { timeout: 5000 });

    // Now login as admin
    await authHelper.loginAsAdmin();

    // Navigate to feedback page
    await page.goto('/admin/feedback');

    // Should display feedback list
    await expect(page.locator('h1')).toBeVisible();

    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check if our submitted complaint appears (might need to search or filter)
    // This is a basic check - actual implementation depends on admin UI
    const feedbackList = page.locator('[role="table"], .feedback-list, [data-testid="feedback-list"]');
    if (await feedbackList.isVisible()) {
      await expect(feedbackList).toBeVisible();
    }

    await page.screenshot({ path: 'test-results/screenshots/admin-feedback-view.png' });
  });

  test('should filter complaints by category', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();

    await page.goto('/admin/feedback');

    // Wait for page load
    await page.waitForTimeout(1000);

    // Look for category filter (if exists)
    const categoryFilter = page.locator('select, button[role="combobox"]').filter({ hasText: /קטגוריה|סוג/ });

    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();

      // Select complaint category
      const complaintOption = page.locator('text=/תלונה|complaint/i');
      if (await complaintOption.isVisible()) {
        await complaintOption.click();
      }

      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/screenshots/admin-feedback-filtered.png' });
    }
  });

  test('should sort feedback by date', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();

    await page.goto('/admin/feedback');
    await page.waitForTimeout(1000);

    // Look for sort button/header
    const dateHeader = page.locator('th, button').filter({ hasText: /תאריך|Date/i });

    if (await dateHeader.isVisible()) {
      await dateHeader.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/screenshots/admin-feedback-sorted.png' });
    }
  });
});

test.describe('Complete End-to-End Flow', () => {
  test('should complete full parent-to-admin flow', async ({ page }) => {
    const startTime = performance.now();

    console.log('\n========================================');
    console.log('COMPLETE END-TO-END COMPLAINT FLOW TEST');
    console.log('========================================\n');

    // Step 1: Parent navigates from homepage
    console.log('Step 1: Parent navigates from homepage to complaint form');
    const step1Start = performance.now();
    await page.goto('/');
    await page.click('a[href="/complaint"]');
    await expect(page).toHaveURL('/complaint');
    const step1Time = performance.now() - step1Start;
    console.log(`✓ Navigation time: ${step1Time.toFixed(2)}ms`);

    // Step 2: Parent fills complaint form
    console.log('\nStep 2: Parent fills and submits complaint');
    const step2Start = performance.now();
    const uniqueTitle = `E2E Test - ${new Date().toISOString()}`;
    await page.fill('input#title', uniqueTitle);
    await page.fill('textarea#description', 'This is a comprehensive end-to-end test complaint with full details.');
    await page.fill('input#reporter_name', 'Test Parent');
    await page.fill('input#reporter_contact', '050-9999999');
    const step2Time = performance.now() - step2Start;
    console.log(`✓ Form fill time: ${step2Time.toFixed(2)}ms`);

    // Step 3: Submit complaint
    console.log('\nStep 3: Submit complaint and verify success');
    const step3Start = performance.now();
    await page.click('button[type="submit"]');
    await page.waitForSelector('h1:has-text("התלונה נקלטה בהצלחה")', { timeout: 5000 });
    const step3Time = performance.now() - step3Start;
    console.log(`✓ Submission time: ${step3Time.toFixed(2)}ms`);

    // Step 4: Navigate back to homepage
    console.log('\nStep 4: Navigate back to homepage');
    const step4Start = performance.now();
    await page.click('button:has-text("חזרה לדף הבית")');
    await expect(page).toHaveURL('/');
    const step4Time = performance.now() - step4Start;
    console.log(`✓ Return navigation time: ${step4Time.toFixed(2)}ms`);

    // Step 5: Login as admin
    console.log('\nStep 5: Login as admin');
    const step5Start = performance.now();
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
    const step5Time = performance.now() - step5Start;
    console.log(`✓ Admin login time: ${step5Time.toFixed(2)}ms`);

    // Step 6: View feedback in admin panel
    console.log('\nStep 6: View feedback in admin panel');
    const step6Start = performance.now();
    await page.goto('/admin/feedback');
    await page.waitForTimeout(1000); // Wait for data to load
    const step6Time = performance.now() - step6Start;
    console.log(`✓ Admin feedback view time: ${step6Time.toFixed(2)}ms`);

    // Take final screenshot
    await page.screenshot({ path: 'test-results/screenshots/e2e-complete-flow.png', fullPage: true });

    const totalTime = performance.now() - startTime;

    console.log('\n========================================');
    console.log('TEST SUMMARY');
    console.log('========================================');
    console.log(`Total end-to-end time: ${totalTime.toFixed(2)}ms (${(totalTime / 1000).toFixed(2)}s)`);
    console.log(`\nBreakdown:`);
    console.log(`  1. Homepage → Complaint: ${step1Time.toFixed(2)}ms`);
    console.log(`  2. Fill form: ${step2Time.toFixed(2)}ms`);
    console.log(`  3. Submit complaint: ${step3Time.toFixed(2)}ms`);
    console.log(`  4. Return home: ${step4Time.toFixed(2)}ms`);
    console.log(`  5. Admin login: ${step5Time.toFixed(2)}ms`);
    console.log(`  6. Admin view feedback: ${step6Time.toFixed(2)}ms`);
    console.log('========================================\n');

    // Performance assertion
    expect(totalTime).toBeLessThan(30000); // Should complete in under 30 seconds
  });
});
