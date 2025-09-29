import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';
import { HebrewHelper } from '../helpers/hebrew.helper';

test.describe('Admin Features', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('should access admin dashboard', async ({ page }) => {
    const hebrewHelper = new HebrewHelper(page);

    await page.goto('/admin');

    // Check admin dashboard
    await hebrewHelper.verifyHebrewText('h1', 'פאנל ניהול');

    // Should display statistics
    await expect(page.locator('[data-testid="stats-upcoming-events"]')).toBeVisible();
    await expect(page.locator('[data-testid="stats-pending-tasks"]')).toBeVisible();
    await expect(page.locator('[data-testid="stats-pending-expenses"]')).toBeVisible();

    // Should have admin navigation
    await expect(page.locator('[data-testid="admin-nav"]')).toBeVisible();
  });

  test('should create new event', async ({ page }) => {
    const hebrewHelper = new HebrewHelper(page);

    await page.goto('/admin/events/new');

    // Fill event form
    await hebrewHelper.fillHebrewText('input[name="title"]', 'אירוע בדיקה חדש');
    await hebrewHelper.fillHebrewText('textarea[name="description"]', 'תיאור האירוע לבדיקה');

    // Set date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().slice(0, 16);
    await page.fill('input[name="start_datetime"]', dateString);

    // Set location
    await hebrewHelper.fillHebrewText('input[name="location"]', 'בית הספר');

    // Select event type
    await page.selectOption('select[name="event_type"]', 'general');

    // Enable registration
    await page.check('input[name="registration_enabled"]');
    await page.fill('input[name="max_attendees"]', '30');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to events list
    await expect(page).toHaveURL('/admin/events');

    // Should show success message
    await expect(page.locator('.toast-success')).toContainText('האירוע נוצר בהצלחה');

    // Should display new event in list
    await expect(page.locator('text=אירוע בדיקה חדש')).toBeVisible();
  });

  test('should manage tasks', async ({ page }) => {
    const hebrewHelper = new HebrewHelper(page);

    await page.goto('/admin/tasks');

    // Click create new task
    await page.click('[data-testid="new-task-button"]');

    // Fill task form
    await hebrewHelper.fillHebrewText('input[name="title"]', 'משימה לבדיקה');
    await hebrewHelper.fillHebrewText('textarea[name="description"]', 'תיאור המשימה');
    await hebrewHelper.fillHebrewText('input[name="owner_name"]', 'דני כהן');
    await page.fill('input[name="owner_phone"]', '0501234567');

    // Set due date
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dueDateString = nextWeek.toISOString().slice(0, 10);
    await page.fill('input[name="due_date"]', dueDateString);

    // Submit
    await page.click('button[type="submit"]');

    // Should show success
    await expect(page.locator('.toast-success')).toBeVisible();

    // Should display new task
    await expect(page.locator('text=משימה לבדיקה')).toBeVisible();
  });

  test('should approve expenses', async ({ page }) => {
    await page.goto('/admin/expenses');

    // Find pending expense (if any)
    const pendingExpense = page.locator('[data-status="pending"]').first();

    if (await pendingExpense.isVisible()) {
      // Click approve button
      await pendingExpense.locator('[data-testid="approve-button"]').click();

      // Add approval notes
      await page.fill('textarea[name="approval_notes"]', 'מאושר - תקציב זמין');

      // Confirm approval
      await page.click('button:has-text("אישור")');

      // Should show success
      await expect(page.locator('.toast-success')).toContainText('ההוצאה אושרה');

      // Status should change to approved
      await expect(pendingExpense).toHaveAttribute('data-status', 'approved');
    }
  });

  test('should manage vendors', async ({ page }) => {
    const hebrewHelper = new HebrewHelper(page);

    await page.goto('/admin/vendors');

    // Click add vendor
    await page.click('[data-testid="new-vendor-button"]');

    // Fill vendor form
    await hebrewHelper.fillHebrewText('input[name="name"]', 'ספק בדיקה');
    await page.selectOption('select[name="category"]', 'catering');
    await hebrewHelper.fillHebrewText('input[name="contact_person"]', 'רונית לוי');
    await page.fill('input[name="phone"]', '0501234567');
    await page.fill('input[name="email"]', 'vendor@example.com');
    await hebrewHelper.fillHebrewText('textarea[name="description"]', 'ספק איכותי לאירועים');

    // Set as preferred
    await page.check('input[name="is_preferred"]');

    // Submit
    await page.click('button[type="submit"]');

    // Should show success
    await expect(page.locator('.toast-success')).toBeVisible();

    // Should display new vendor
    await expect(page.locator('text=ספק בדיקה')).toBeVisible();
  });

  test('should view feedback', async ({ page }) => {
    await page.goto('/admin/feedback');

    // Should display feedback list
    await expect(page.locator('[data-testid="feedback-list"]')).toBeVisible();

    // Find unread feedback (if any)
    const unreadFeedback = page.locator('[data-status="new"]').first();

    if (await unreadFeedback.isVisible()) {
      // Click to read
      await unreadFeedback.click();

      // Should open feedback detail
      await expect(page.locator('[data-testid="feedback-detail"]')).toBeVisible();

      // Mark as reviewed
      await page.click('[data-testid="mark-reviewed"]');

      // Should update status
      await expect(page.locator('.toast-success')).toContainText('הודעה סומנה כנקראה');
    }
  });

  test('should export data', async ({ page }) => {
    await page.goto('/admin/reports');

    // Export events
    const eventsDownloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-events"]');
    const eventsDownload = await eventsDownloadPromise;
    expect(eventsDownload.suggestedFilename()).toBe('events.csv');

    // Export tasks
    const tasksDownloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-tasks"]');
    const tasksDownload = await tasksDownloadPromise;
    expect(tasksDownload.suggestedFilename()).toBe('tasks.csv');

    // Export financial report
    const financialDownloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-financial"]');
    const financialDownload = await financialDownloadPromise;
    expect(financialDownload.suggestedFilename()).toBe('financial-report.csv');
  });
});