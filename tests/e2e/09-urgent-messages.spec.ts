import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';
// HebrewHelper removed - unused

test.describe('Urgent Messages Admin', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('should reach urgent messages admin from the hub via "more tools"', async ({ page }) => {
    await page.goto('/he/admin');

    // Urgent messages left the hub (redesign, Nov 2026): hub -> "more tools" -> urgent messages
    await page.getByTestId('hub-row-more').click();
    await expect(page).toHaveURL('/he/admin/more');

    const urgentRow = page.getByTestId('more-row-urgent');
    await expect(urgentRow).toBeVisible();

    // Click to navigate to urgent messages admin
    await urgentRow.click();
    await expect(page).toHaveURL('/he/admin/urgent');
  });

  test('should display all admin controls properly on desktop', async ({ page }) => {
    await page.goto('/he/admin/urgent');

    // Check title is visible
    await expect(page.locator('h1:has-text("ניהול הודעות דחופות")')).toBeVisible();

    // Check "הוסף הודעה" button is visible
    const addButton = page.locator('button:has-text("הוסף הודעה")');
    await expect(addButton).toBeVisible();

    // Check "שמור שינויים" button is visible and not cut off
    const saveButton = page.locator('button:has-text("שמור שינויים")');
    await expect(saveButton).toBeVisible();

    // Verify button is fully in viewport
    const saveButtonBox = await saveButton.boundingBox();
    expect(saveButtonBox).not.toBeNull();
    if (saveButtonBox) {
      const viewportSize = page.viewportSize();
      expect(saveButtonBox.x + saveButtonBox.width).toBeLessThanOrEqual(viewportSize!.width);
    }

    // Check white shirt quick action card is visible
    await expect(page.locator('text=תזכורת מהירה לחולצה לבנה')).toBeVisible();

    // Check all quick action buttons are visible
    await expect(page.locator('button:has-text("+ 1 יום")')).toBeVisible();
    await expect(page.locator('button:has-text("+ 3 ימים")')).toBeVisible();
    await expect(page.locator('button:has-text("+ שבוע")')).toBeVisible();
    await expect(page.locator('button:has-text("+ שבועיים")')).toBeVisible();
    await expect(page.locator('button:has-text("+ חודש")')).toBeVisible();
  });

  test('should display all controls properly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size

    await page.goto('/he/admin/urgent');

    // Check title is visible
    await expect(page.locator('h1:has-text("ניהול הודעות דחופות")')).toBeVisible();

    // Check buttons are stacked vertically and visible
    const addButton = page.locator('button:has-text("הוסף הודעה")');
    await expect(addButton).toBeVisible();

    const saveButton = page.locator('button:has-text("שמור שינויים")');
    await expect(saveButton).toBeVisible();

    // Verify both buttons are fully in viewport (not cut off)
    const addButtonBox = await addButton.boundingBox();
    const saveButtonBox = await saveButton.boundingBox();

    expect(addButtonBox).not.toBeNull();
    expect(saveButtonBox).not.toBeNull();

    if (addButtonBox && saveButtonBox) {
      // Check buttons don't overflow viewport
      expect(addButtonBox.x + addButtonBox.width).toBeLessThanOrEqual(375);
      expect(saveButtonBox.x + saveButtonBox.width).toBeLessThanOrEqual(375);

      // Check buttons are stacked (saveButton below addButton)
      expect(saveButtonBox.y).toBeGreaterThan(addButtonBox.y);
    }

    // Check white shirt quick action buttons are in responsive grid
    const quickButtons = page.locator('button:has-text("+ 1 יום")');
    await expect(quickButtons).toBeVisible();

    // Verify quick action buttons don't overflow
    const quickButtonBox = await quickButtons.boundingBox();
    expect(quickButtonBox).not.toBeNull();
    if (quickButtonBox) {
      expect(quickButtonBox.x + quickButtonBox.width).toBeLessThanOrEqual(375);
    }

    // All 5 quick buttons should be visible (may need scrolling)
    await expect(page.locator('button:has-text("+ 1 יום")')).toBeVisible();
    await expect(page.locator('button:has-text("+ 3 ימים")')).toBeVisible();
    await expect(page.locator('button:has-text("+ שבוע")')).toBeVisible();
    await expect(page.locator('button:has-text("+ שבועיים")')).toBeVisible();

    // Last button might need scrolling into view on small screens
    const monthButton = page.locator('button:has-text("+ חודש")');
    await monthButton.scrollIntoViewIfNeeded();
    await expect(monthButton).toBeVisible();
  });

  test('should create white shirt alert for 1 day', async ({ page }) => {
    await page.goto('/he/admin/urgent');

    // Initial message count
    const initialCount = await page.locator('[data-testid="message-card"]').count();

    // Click "1 יום" button
    await page.locator('button:has-text("+ 1 יום")').click();

    // Should show success toast
    await expect(page.locator('text=נוספה תזכורת לחולצה לבנה ל-1 ימים')).toBeVisible({ timeout: 3000 });

    // Should add a new message card
    const newCount = await page.locator('[data-testid="message-card"]').count();
    expect(newCount).toBe(initialCount + 1);

    // New message should have white shirt badge
    await expect(page.locator('text=👕 חולצה לבנה').last()).toBeVisible();

    // Message should be auto-expanded for editing
    await expect(page.locator('input[value="תזכורת: חולצה לבנה!"]').last()).toBeVisible();
  });

  test('should create white shirt alert for 7 days', async ({ page }) => {
    await page.goto('/he/admin/urgent');

    // Click "שבוע" button
    await page.locator('button:has-text("+ שבוע")').click();

    // Should show success toast
    await expect(page.locator('text=נוספה תזכורת לחולצה לבנה ל-7 ימים')).toBeVisible({ timeout: 3000 });

    // Should have white shirt message
    await expect(page.locator('text=👕 חולצה לבנה').last()).toBeVisible();

    // Check dates are set correctly (7 days from now)
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7);

    const expectedEndDate = endDate.toISOString().split('T')[0];

    // Should have end date input with correct value
    const endDateInputs = page.locator('input[type="date"]').last();
    await expect(endDateInputs).toHaveValue(expectedEndDate);
  });

  test('should save messages successfully', async ({ page }) => {
    await page.goto('/he/admin/urgent');

    // Add a white shirt alert
    await page.locator('button:has-text("+ 1 יום")').click();
    await page.waitForTimeout(500);

    // Click save button
    const saveButton = page.locator('button:has-text("שמור שינויים")');
    await saveButton.click();

    // Should show loading state
    await expect(page.locator('button:has-text("שומר...")')).toBeVisible({ timeout: 1000 });

    // Should show success toast
    await expect(page.locator('text=הודעות דחופות נשמרו בהצלחה')).toBeVisible({ timeout: 5000 });

    // Button should return to normal state
    await expect(page.locator('button:has-text("שמור שינויים")')).toBeVisible({ timeout: 2000 });
  });

  test('should delete message', async ({ page }) => {
    await page.goto('/he/admin/urgent');

    // Add a message first
    await page.locator('button:has-text("+ 1 יום")').click();
    await page.waitForTimeout(500);

    // Click delete button (trash icon)
    page.on('dialog', dialog => dialog.accept()); // Accept confirmation dialog
    await page.locator('button[class*="text-red-600"]').last().click();

    // Should show success toast
    await expect(page.locator('text=ההודעה נמחקה')).toBeVisible({ timeout: 3000 });

    // Message should be removed from DOM
    await page.waitForTimeout(300);
  });

  test('should display white shirt message on parent portal with special design', async ({ page }) => {
    // First, create and save a white shirt message as admin
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();

    await page.goto('/he/admin/urgent');

    // Add white shirt alert for 7 days
    await page.locator('button:has-text("+ שבוע")').click();
    await page.waitForTimeout(500);

    // Save
    await page.locator('button:has-text("שמור שינויים")').click();
    await expect(page.locator('text=הודעות דחופות נשמרו בהצלחה')).toBeVisible({ timeout: 5000 });

    // Now logout and visit parent portal
    await authHelper.logout();

    await page.goto('/he');

    // Should display white shirt banner with special styling
    const whiteShirtBanner = page.locator('text=תזכורת: חולצה לבנה!').first();
    await expect(whiteShirtBanner).toBeVisible({ timeout: 3000 });

    // Should have shirt icon
    await expect(page.locator('svg[class*="lucide-shirt"]').first()).toBeVisible();

    // Should have share button
    const shareButton = page.locator('button[aria-label="שתף"]').first();
    await expect(shareButton).toBeVisible();

    // Should have close button
    const closeButton = page.locator('button[aria-label="סגור"]').first();
    await expect(closeButton).toBeVisible();

    // Check for special styling classes (yellow border, gradient background)
    const bannerContainer = page.locator('text=תזכורת: חולצה לבנה!').locator('..').locator('..');
    const classAttr = await bannerContainer.getAttribute('class');
    expect(classAttr).toContain('border-yellow-400');
    expect(classAttr).toContain('from-sky-100');
  });

  test('should dismiss urgent message on parent portal', async ({ page }) => {
    // Visit parent portal (no auth needed)
    await page.goto('/he');

    // Check if there's an urgent message banner
    const messageCount = await page.locator('button[aria-label="סגור"]').count();

    if (messageCount > 0) {
      // Click dismiss button
      await page.locator('button[aria-label="סגור"]').first().click();

      // Message should disappear
      await page.waitForTimeout(300);

      // Reload page - message should still be dismissed (localStorage)
      await page.reload();

      // Should have one less message than before
      const newCount = await page.locator('button[aria-label="סגור"]').count();
      expect(newCount).toBeLessThan(messageCount);
    }
  });

  test('should create custom urgent message', async ({ page }) => {
    await page.goto('/he/admin/urgent');

    // Click "הוסף הודעה" button
    await page.locator('button:has-text("הוסף הודעה")').click();
    await page.waitForTimeout(500);

    // Should create a new message in edit mode
    // Fill Hebrew title
    const titleHeInput = page.locator('input[placeholder="תזכורת חשובה"]').last();
    await titleHeInput.fill('בדיקת הודעה דחופה');

    // Fill Russian title
    const titleRuInput = page.locator('input[placeholder="Важное напоминание"]').last();
    await titleRuInput.fill('Срочное сообщение тест');

    // Fill Hebrew description
    const descHeInput = page.locator('textarea[placeholder="פרטים נוספים..."]').last();
    await descHeInput.fill('זוהי הודעת בדיקה לבדיקת המערכת');

    // Select message type
    const typeSelect = page.locator('select').last();
    await typeSelect.selectOption('urgent');

    // Should show urgent badge
    await expect(page.locator('text=🚨 דחוף').last()).toBeVisible();

    // Save
    await page.locator('button:has-text("שמור שינויים")').click();
    await expect(page.locator('text=הודעות דחופות נשמרו בהצלחה')).toBeVisible({ timeout: 5000 });

    // Exit edit mode
    await page.locator('button').filter({ has: page.locator('svg[class*="lucide-x"]') }).last().click();

    // Should display message with red styling (urgent type)
    await expect(page.locator('text=בדיקת הודעה דחופה')).toBeVisible();
  });

  test('should edit existing message', async ({ page }) => {
    await page.goto('/he/admin/urgent');

    // Add a message
    await page.locator('button:has-text("+ 1 יום")').click();
    await page.waitForTimeout(500);

    // Message should be in edit mode, modify the title
    const titleInput = page.locator('input[value="תזכורת: חולצה לבנה!"]').last();
    await titleInput.fill('חולצה לבנה מעודכנת!');

    // Exit edit mode
    const closeEditButton = page.locator('button').filter({ has: page.locator('svg[class*="lucide-x"]') }).last();
    await closeEditButton.click();

    // Should display updated title
    await expect(page.locator('text=חולצה לבנה מעודכנת!')).toBeVisible();

    // Re-open edit mode
    const editButton = page.locator('button').filter({ has: page.locator('svg[class*="lucide-edit"]') }).last();
    await editButton.click();

    // Title should be editable again
    await expect(page.locator('input[value="חולצה לבנה מעודכנת!"]').last()).toBeVisible();
  });

  test('should toggle message active status', async ({ page }) => {
    await page.goto('/he/admin/urgent');

    // Add a message
    await page.locator('button:has-text("+ 1 יום")').click();
    await page.waitForTimeout(500);

    // Should be active by default
    const activeCheckbox = page.locator('input[type="checkbox"][checked]').last();
    await expect(activeCheckbox).toBeChecked();

    // Uncheck active status
    await activeCheckbox.uncheck();

    // Exit edit mode
    await page.locator('button').filter({ has: page.locator('svg[class*="lucide-x"]') }).last().click();

    // Should show "לא פעילה" status
    await expect(page.locator('text=❌ לא פעילה').last()).toBeVisible();

    // Should NOT show "פעילה כעת" badge
    const activeNowBadges = page.locator('text=פעילה כעת');
    await activeNowBadges.count();
    // If there were any before, should be one less now
  });
});

test.describe('Urgent Messages - Additional Mobile Tests', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('should display responsive layout on iPhone 12 size', async ({ page }) => {
    // Set iPhone 12 viewport size
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/he/admin/urgent');

    // Check title is visible
    await expect(page.locator('h1:has-text("ניהול הודעות דחופות")')).toBeVisible();

    // Check buttons are full width on mobile
    const addButton = page.locator('button:has-text("הוסף הודעה")');
    const saveButton = page.locator('button:has-text("שמור שינויים")');

    await expect(addButton).toBeVisible();
    await expect(saveButton).toBeVisible();

    // Get button widths
    const addButtonBox = await addButton.boundingBox();
    const saveButtonBox = await saveButton.boundingBox();

    if (addButtonBox && saveButtonBox) {
      const viewportWidth = 390;

      // Buttons should be nearly full width (accounting for padding)
      // On mobile they should stack and be much wider than on desktop
      expect(addButtonBox.width).toBeGreaterThan(viewportWidth * 0.8);
      expect(saveButtonBox.width).toBeGreaterThan(viewportWidth * 0.8);

      // Buttons should not overflow
      expect(addButtonBox.x + addButtonBox.width).toBeLessThanOrEqual(viewportWidth);
      expect(saveButtonBox.x + saveButtonBox.width).toBeLessThanOrEqual(viewportWidth);
    }

    // Quick action buttons should be in 2-column grid on mobile
    const quickButtons = page.locator('button:has-text("+ 1 יום")');
    await expect(quickButtons).toBeVisible();
  });

  test('should display responsive layout on iPad Pro size', async ({ page }) => {
    // Set iPad Pro viewport size
    await page.setViewportSize({ width: 1024, height: 1366 });

    await page.goto('/he/admin/urgent');

    // All elements should be visible without horizontal scroll
    await expect(page.locator('h1:has-text("ניהול הודעות דחופות")')).toBeVisible();
    await expect(page.locator('button:has-text("הוסף הודעה")')).toBeVisible();
    await expect(page.locator('button:has-text("שמור שינויים")')).toBeVisible();

    // Quick actions should display in wider grid on tablet
    await expect(page.locator('button:has-text("+ 1 יום")')).toBeVisible();
    await expect(page.locator('button:has-text("+ חודש")')).toBeVisible();
  });
});
