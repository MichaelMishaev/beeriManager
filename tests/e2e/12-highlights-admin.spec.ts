import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';

test.describe('Highlights Admin', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('should display highlights row on the admin hub', async ({ page }) => {
    await page.goto('/he/admin');

    // The hub (redesign, Nov 2026) has one row per job; highlights is the "carousel" row
    const highlightsRow = page.getByTestId('hub-row-highlights');
    await expect(highlightsRow).toBeVisible();

    // Click to navigate to highlights admin
    await highlightsRow.click();
    await expect(page).toHaveURL('/he/admin/highlights');
  });

  test('should display all admin controls properly', async ({ page }) => {
    await page.goto('/he/admin/highlights');

    // Check title is visible
    await expect(page.locator('h1:has-text("ניהול קרוסלת הדגשות")')).toBeVisible();

    // Check "הוסף הדגשה חדשה" button is visible
    const addButton = page.locator('button:has-text("הוסף הדגשה חדשה")');
    await expect(addButton).toBeVisible();
  });

  test('should create new achievement highlight', async ({ page }) => {
    await page.goto('/he/admin/highlights');

    // Get initial count
    const initialCount = await page.locator('[data-testid="highlight-card"]').count();

    // Click "הוסף הדגשה חדשה" button
    await page.locator('button:has-text("הוסף הדגשה חדשה")').click();
    await page.waitForTimeout(500);

    // Should create a new highlight card in edit mode
    const newCount = await page.locator('[data-testid="highlight-card"]').count();
    expect(newCount).toBe(initialCount + 1);

    // Fill out the form
    // Type should default to achievement
    const typeSelect = page.locator('select').first();
    await expect(typeSelect).toHaveValue('achievement');

    // Fill Hebrew title
    const titleHeInput = page.locator('input[placeholder="הישג מדהים!"]').last();
    await titleHeInput.fill('זכייה במקום הראשון');

    // Fill Russian title
    const titleRuInput = page.locator('input[placeholder="Потрясающее достижение!"]').last();
    await titleRuInput.fill('Первое место');

    // Fill Hebrew description
    const descHeInput = page.locator('textarea[placeholder="תיאור מפורט של ההישג..."]').last();
    await descHeInput.fill('תלמידי כיתה ו\' זכו במקום הראשון בתחרות המתמטיקה');

    // Fill Russian description
    const descRuInput = page.locator('textarea[placeholder="Подробное описание достижения..."]').last();
    await descRuInput.fill('Ученики 6 класса заняли первое место');

    // Fill Hebrew category
    const categoryHeInput = page.locator('input[placeholder="הישגים"]').last();
    await categoryHeInput.fill('הישגים');

    // Fill Russian category
    const categoryRuInput = page.locator('input[placeholder="Достижения"]').last();
    await categoryRuInput.fill('Достижения');

    // Click save button
    const saveButton = page.locator('button:has-text("שמור")').last();
    await saveButton.click();

    // Should show success toast
    await expect(page.locator('text=הדגשה נוצרה בהצלחה')).toBeVisible({ timeout: 5000 });

    // Should exit edit mode
    await page.waitForTimeout(1000);

    // Should display the new highlight
    await expect(page.locator('text=זכייה במקום הראשון')).toBeVisible();
  });

  test('should create sports highlight', async ({ page }) => {
    await page.goto('/he/admin/highlights');

    // Add new highlight
    await page.locator('button:has-text("הוסף הדגשה חדשה")').click();
    await page.waitForTimeout(500);

    // Select sports type
    const typeSelect = page.locator('select').first();
    await typeSelect.selectOption('sports');

    // Icon should automatically update to sports icon
    const iconInput = page.locator('input[placeholder="🏆"]').last();
    await expect(iconInput).toHaveValue('⚽');

    // Fill form fields
    await page.locator('input[placeholder="הישג מדהים!"]').last().fill('ניצחון גדול במשחק כדורגל');
    await page.locator('input[placeholder="Потрясающее достижение!"]').last().fill('Большая победа в футболе');
    await page.locator('textarea[placeholder="תיאור מפורט של ההישג..."]').last().fill('נבחרת בית הספר ניצחה 3-0');
    await page.locator('textarea[placeholder="Подробное описание достижения..."]').last().fill('Школьная команда победила 3-0');
    await page.locator('input[placeholder="הישגים"]').last().fill('ספורט');
    await page.locator('input[placeholder="Достижения"]').last().fill('Спорт');

    // Save
    await page.locator('button:has-text("שמור")').last().click();
    await expect(page.locator('text=הדגשה נוצרה בהצלחה')).toBeVisible({ timeout: 5000 });

    // Should display with sports badge
    await expect(page.locator('text=⚽ ספורט').last()).toBeVisible();
  });

  test('should edit existing highlight', async ({ page }) => {
    await page.goto('/he/admin/highlights');

    // Create a highlight first
    await page.locator('button:has-text("הוסף הדגשה חדשה")').click();
    await page.waitForTimeout(500);

    await page.locator('input[placeholder="הישג מדהים!"]').last().fill('הדגשה לעריכה');
    await page.locator('input[placeholder="Потрясающее достижение!"]').last().fill('Для редактирования');
    await page.locator('textarea[placeholder="תיאור מפורט של ההישג..."]').last().fill('תיאור ראשוני');
    await page.locator('textarea[placeholder="Подробное описание достижения..."]').last().fill('Начальное описание');
    await page.locator('input[placeholder="הישגים"]').last().fill('כללי');
    await page.locator('input[placeholder="Достижения"]').last().fill('Общее');

    // Save
    await page.locator('button:has-text("שמור")').last().click();
    await expect(page.locator('text=הדגשה נוצרה בהצלחה')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);

    // Now edit it
    const editButton = page.locator('button').filter({ has: page.locator('svg[class*="lucide-edit"]') }).last();
    await editButton.click();
    await page.waitForTimeout(300);

    // Modify the Hebrew title
    const titleInput = page.locator('input[value="הדגשה לעריכה"]').last();
    await titleInput.fill('הדגשה מעודכנת');

    // Save changes
    await page.locator('button:has-text("שמור")').last().click();
    await expect(page.locator('text=הדגשה עודכנה בהצלחה')).toBeVisible({ timeout: 5000 });

    // Should display updated title
    await expect(page.locator('text=הדגשה מעודכנת')).toBeVisible();
  });

  test('should delete highlight', async ({ page }) => {
    await page.goto('/he/admin/highlights');

    // Create a highlight
    await page.locator('button:has-text("הוסף הדגשה חדשה")').click();
    await page.waitForTimeout(500);

    await page.locator('input[placeholder="הישג מדהים!"]').last().fill('למחיקה');
    await page.locator('input[placeholder="Потрясающее достижение!"]').last().fill('Для удаления');
    await page.locator('textarea[placeholder="תיאור מפורט של ההישג..."]').last().fill('תיאור למחיקה');
    await page.locator('textarea[placeholder="Подробное описание достижения..."]').last().fill('Для удаления');
    await page.locator('input[placeholder="הישגים"]').last().fill('בדיקה');
    await page.locator('input[placeholder="Достижения"]').last().fill('Тест');

    // Save
    await page.locator('button:has-text("שמור")').last().click();
    await expect(page.locator('text=הדגשה נוצרה בהצלחה')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);

    // Get count before delete
    const countBefore = await page.locator('[data-testid="highlight-card"]').count();

    // Delete it
    page.on('dialog', dialog => dialog.accept()); // Accept confirmation dialog
    await page.locator('button[class*="text-red-600"]').last().click();

    // Should show success toast
    await expect(page.locator('text=ההדגשה נמחקה')).toBeVisible({ timeout: 5000 });

    // Should be removed from list
    await page.waitForTimeout(1000);
    const countAfter = await page.locator('[data-testid="highlight-card"]').count();
    expect(countAfter).toBe(countBefore - 1);
  });

  test('should cancel editing without saving', async ({ page }) => {
    await page.goto('/he/admin/highlights');

    // Create a highlight
    await page.locator('button:has-text("הוסף הדגשה חדשה")').click();
    await page.waitForTimeout(500);

    await page.locator('input[placeholder="הישג מדהים!"]').last().fill('בדיקת ביטול');
    await page.locator('input[placeholder="Потрясающее достижение!"]').last().fill('Тест отмены');
    await page.locator('textarea[placeholder="תיאור מפורט של ההישג..."]').last().fill('תיאור לביטול');
    await page.locator('textarea[placeholder="Подробное описание достижения..."]').last().fill('Описание отмены');
    await page.locator('input[placeholder="הישגים"]').last().fill('בדיקה');
    await page.locator('input[placeholder="Достижения"]').last().fill('Тест');

    // Click cancel (X button)
    const cancelButton = page.locator('button').filter({ has: page.locator('svg[class*="lucide-x"]') }).last();
    await cancelButton.click();

    // For temp highlights, should be removed from list
    await page.waitForTimeout(300);
    const highlights = await page.locator('text=בדיקת ביטול').count();
    expect(highlights).toBe(0);
  });

  test('should set badge color', async ({ page }) => {
    await page.goto('/he/admin/highlights');

    // Add new highlight
    await page.locator('button:has-text("הוסף הדגשה חדשה")').click();
    await page.waitForTimeout(500);

    // Fill required fields
    await page.locator('input[placeholder="הישג מדהים!"]').last().fill('בדיקת צבע');
    await page.locator('input[placeholder="Потрясающее достижение!"]').last().fill('Проверка цвета');
    await page.locator('textarea[placeholder="תיאור מפורט של ההישג..."]').last().fill('תיאור');
    await page.locator('textarea[placeholder="Подробное описание достижения..."]').last().fill('Описание');
    await page.locator('input[placeholder="הישגים"]').last().fill('בדיקה');
    await page.locator('input[placeholder="Достижения"]').last().fill('Тест');

    // Select badge color
    const colorSelect = page.locator('select').nth(1); // Second select is the color picker
    await colorSelect.selectOption('bg-gradient-to-r from-green-400 to-green-500 text-green-900');

    // Should show preview with selected color
    const badge = page.locator('.bg-gradient-to-r.from-green-400').last();
    await expect(badge).toBeVisible();

    // Save
    await page.locator('button:has-text("שמור")').last().click();
    await expect(page.locator('text=הדגשה נוצרה בהצלחה')).toBeVisible({ timeout: 5000 });
  });

  test('should set event date', async ({ page }) => {
    await page.goto('/he/admin/highlights');

    // Add new highlight
    await page.locator('button:has-text("הוסף הדגשה חדשה")').click();
    await page.waitForTimeout(500);

    // Fill required fields
    await page.locator('input[placeholder="הישג מדהים!"]').last().fill('אירוע עתידי');
    await page.locator('input[placeholder="Потрясающее достижение!"]').last().fill('Будущее событие');
    await page.locator('textarea[placeholder="תיאור מפורט של ההישג..."]').last().fill('תיאור אירוע');
    await page.locator('textarea[placeholder="Подробное описание достижения..."]').last().fill('Описание события');
    await page.locator('input[placeholder="הישגים"]').last().fill('אירועים');
    await page.locator('input[placeholder="Достижения"]').last().fill('События');

    // Set event date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const eventDateInput = page.locator('input[type="date"]').first();
    await eventDateInput.fill(tomorrowStr);

    // Save
    await page.locator('button:has-text("שמור")').last().click();
    await expect(page.locator('text=הדגשה נוצרה בהצלחה')).toBeVisible({ timeout: 5000 });

    // Should display with date
    await expect(page.locator('text=אירוע עתידי')).toBeVisible();
  });

  test('should set display order', async ({ page }) => {
    await page.goto('/he/admin/highlights');

    // Add new highlight
    await page.locator('button:has-text("הוסף הדגשה חדשה")').click();
    await page.waitForTimeout(500);

    // Fill required fields
    await page.locator('input[placeholder="הישג מדהים!"]').last().fill('סדר תצוגה');
    await page.locator('input[placeholder="Потрясающее достижение!"]').last().fill('Порядок отображения');
    await page.locator('textarea[placeholder="תיאור מפורט של ההישג..."]').last().fill('תיאור');
    await page.locator('textarea[placeholder="Подробное описание достижения..."]').last().fill('Описание');
    await page.locator('input[placeholder="הישגים"]').last().fill('בדיקה');
    await page.locator('input[placeholder="Достижения"]').last().fill('Тест');

    // Set display order
    const displayOrderInput = page.locator('input[type="number"]').last();
    await displayOrderInput.fill('5');

    // Should show order badge
    await expect(page.locator('text=סדר: 5').last()).toBeVisible();

    // Save
    await page.locator('button:has-text("שמור")').last().click();
    await expect(page.locator('text=הדגשה נוצרה בהצלחה')).toBeVisible({ timeout: 5000 });
  });

  test('should toggle active status', async ({ page }) => {
    await page.goto('/he/admin/highlights');

    // Add new highlight
    await page.locator('button:has-text("הוסף הדגשה חדשה")').click();
    await page.waitForTimeout(500);

    // Fill required fields
    await page.locator('input[placeholder="הישג מדהים!"]').last().fill('בדיקת סטטוס');
    await page.locator('input[placeholder="Потрясающее достижение!"]').last().fill('Проверка статуса');
    await page.locator('textarea[placeholder="תיאור מפורט של ההישג..."]').last().fill('תיאור');
    await page.locator('textarea[placeholder="Подробное описание достижения..."]').last().fill('Описание');
    await page.locator('input[placeholder="הישגים"]').last().fill('בדיקה');
    await page.locator('input[placeholder="Достижения"]').last().fill('Тест');

    // Should be active by default
    const activeCheckbox = page.locator('input[type="checkbox"]').last();
    await expect(activeCheckbox).toBeChecked();

    // Should show "פעילה" badge
    await expect(page.locator('text=פעילה').last()).toBeVisible();

    // Uncheck active status
    await activeCheckbox.uncheck();

    // Save
    await page.locator('button:has-text("שמור")').last().click();
    await expect(page.locator('text=הדגשה נוצרה בהצלחה')).toBeVisible({ timeout: 5000 });

    // Reload page to verify
    await page.reload();
    await page.waitForTimeout(1000);

    // Should not show "פעילה" badge for inactive highlight
    const highlightCard = page.locator('text=בדיקת סטטוס').locator('..');
    await expect(highlightCard.locator('text=פעילה')).not.toBeVisible();
  });

  test('should add CTA button with link', async ({ page }) => {
    await page.goto('/he/admin/highlights');

    // Add new highlight
    await page.locator('button:has-text("הוסף הדגשה חדשה")').click();
    await page.waitForTimeout(500);

    // Fill required fields
    await page.locator('input[placeholder="הישג מדהים!"]').last().fill('עם כפתור');
    await page.locator('input[placeholder="Потрясающее достижение!"]').last().fill('С кнопкой');
    await page.locator('textarea[placeholder="תיאור מפורט של ההישג..."]').last().fill('תיאור');
    await page.locator('textarea[placeholder="Подробное описание достижения..."]').last().fill('Описание');
    await page.locator('input[placeholder="הישגים"]').last().fill('בדיקה');
    await page.locator('input[placeholder="Достижения"]').last().fill('Тест');

    // Add CTA button
    await page.locator('input[placeholder="קרא עוד"]').last().fill('למידע נוסף');
    await page.locator('input[placeholder="Читать далее"]').last().fill('Подробнее');
    await page.locator('input[placeholder="https://..."]').last().fill('https://example.com');

    // Save
    await page.locator('button:has-text("שמור")').last().click();
    await expect(page.locator('text=הדגשה נוצרה בהצלחה')).toBeVisible({ timeout: 5000 });

    // Should display with CTA button badge in preview
    await expect(page.locator('text=למידע נוסף').last()).toBeVisible();
  });

  test('should display empty state when no highlights', async ({ page }) => {
    await page.goto('/he/admin/highlights');

    // Check if there are no highlights
    const highlightCount = await page.locator('[data-testid="highlight-card"]').count();

    if (highlightCount === 0) {
      // Should show empty state
      await expect(page.locator('text=אין הדגשות')).toBeVisible();
      await expect(page.locator('text=לחץ על "הוסף הדגשה חדשה" להתחיל')).toBeVisible();
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/he/admin/highlights');

    // Add new highlight
    await page.locator('button:has-text("הוסף הדגשה חדשה")').click();
    await page.waitForTimeout(500);

    // Try to save without filling required fields
    await page.locator('button:has-text("שמור")').last().click();

    // Should show validation errors (may vary based on Zod implementation)
    // Wait a bit to see if save fails
    await page.waitForTimeout(2000);

    // Should still be in edit mode (not saved successfully)
    await expect(page.locator('button:has-text("שמור")').last()).toBeVisible();
  });

  test('should create highlight with only Hebrew fields (Russian optional)', async ({ page }) => {
    await page.goto('/he/admin/highlights');

    // Click "הוסף הדגשה חדשה" button
    await page.locator('button:has-text("הוסף הדגשה חדשה")').click();
    await page.waitForTimeout(500);

    // Select surfing icon from dropdown
    const iconSelect = page.locator('select').nth(1); // Second select is icon
    await iconSelect.selectOption('🏄');

    // Fill ONLY Hebrew fields (leave Russian empty)
    await page.locator('input[placeholder="הישג מדהים!"]').last().fill('תלמידי בארי במירוץ חופים');

    // Fill Hebrew description
    await page.locator('textarea[placeholder="תיאור מפורט של ההישג..."]').last().fill('תלמידי בארי השתתפו במירוץ חופים פולג בשיתוף עיריית נתניה');

    // Fill Hebrew category
    await page.locator('input[placeholder="הישגים"]').last().fill('ספורט מים');

    // Verify Russian fields are marked as optional
    await expect(page.locator('text=(אופציונלי)').first()).toBeVisible();

    // Leave Russian fields EMPTY - they should be optional
    // Don't fill: title_ru, description_ru, category_ru

    // Click save button
    const saveButton = page.locator('button:has-text("שמור")').last();
    await saveButton.click();

    // Should show success toast (Russian fields are optional!)
    await expect(page.locator('text=הדגשה נוצרה בהצלחה')).toBeVisible({ timeout: 5000 });

    // Should exit edit mode
    await page.waitForTimeout(1000);

    // Should display the new highlight with surfing icon
    await expect(page.locator('text=תלמידי בארי במירוץ חופים')).toBeVisible();
    await expect(page.locator('text=🏄').last()).toBeVisible();
  });

  test('should display new emoji categories in dropdown', async ({ page }) => {
    await page.goto('/he/admin/highlights');

    // Add new highlight
    await page.locator('button:has-text("הוסף הדגשה חדשה")').click();
    await page.waitForTimeout(500);

    // Get icon select (second select)
    const iconSelect = page.locator('select').nth(1);

    // Should have optgroups for different categories
    await expect(iconSelect.locator('optgroup[label*="הישגים"]')).toBeAttached();
    await expect(iconSelect.locator('optgroup[label*="ספורט כדורים"]')).toBeAttached();
    await expect(iconSelect.locator('optgroup[label*="ספורט מים"]')).toBeAttached();
    await expect(iconSelect.locator('optgroup[label*="אירועים"]')).toBeAttached();
    await expect(iconSelect.locator('optgroup[label*="חינוך"]')).toBeAttached();

    // Should have surfing option in water sports
    await iconSelect.selectOption('🏄');
    await expect(iconSelect).toHaveValue('🏄');

    // Should have basketball
    await iconSelect.selectOption('🏀');
    await expect(iconSelect).toHaveValue('🏀');

    // Should have volleyball
    await iconSelect.selectOption('🏐');
    await expect(iconSelect).toHaveValue('🏐');
  });

  test('should show live emoji preview when selecting icon', async ({ page }) => {
    await page.goto('/he/admin/highlights');

    // Add new highlight
    await page.locator('button:has-text("הוסף הדגשה חדשה")').click();
    await page.waitForTimeout(500);

    // Get icon select
    const iconSelect = page.locator('select').nth(1);

    // Select surfing emoji
    await iconSelect.selectOption('🏄');

    // Should show large preview of selected emoji (text-3xl)
    await page.waitForTimeout(300);
    const preview = page.locator('span.text-3xl').filter({ hasText: '🏄' });
    await expect(preview).toBeVisible();

    // Select basketball
    await iconSelect.selectOption('🏀');
    await page.waitForTimeout(300);
    const preview2 = page.locator('span.text-3xl').filter({ hasText: '🏀' });
    await expect(preview2).toBeVisible();
  });
});

test.describe('Highlights Admin - Mobile Tests', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
  });

  test('should display responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/he/admin/highlights');

    // Check title is visible
    await expect(page.locator('h1:has-text("ניהול קרוסלת הדגשות")')).toBeVisible();

    // Check add button is visible and full width
    const addButton = page.locator('button:has-text("הוסף הדגשה חדשה")');
    await expect(addButton).toBeVisible();

    const addButtonBox = await addButton.boundingBox();
    if (addButtonBox) {
      // Button should not overflow viewport
      expect(addButtonBox.x + addButtonBox.width).toBeLessThanOrEqual(375);
    }
  });

  test('should handle form inputs on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/he/admin/highlights');

    // Add new highlight
    await page.locator('button:has-text("הוסף הדגשה חדשה")').click();
    await page.waitForTimeout(500);

    // Scroll to title input
    const titleInput = page.locator('input[placeholder="הישג מדהים!"]').last();
    await titleInput.scrollIntoViewIfNeeded();
    await titleInput.fill('בדיקה מובייל');

    // Check input is visible and filled
    await expect(titleInput).toHaveValue('בדיקה מובייל');

    // Scroll to description textarea
    const descInput = page.locator('textarea[placeholder="תיאור מפורט של ההישג..."]').last();
    await descInput.scrollIntoViewIfNeeded();
    await descInput.fill('תיאור למובייל');

    await expect(descInput).toHaveValue('תיאור למובייל');
  });
});
