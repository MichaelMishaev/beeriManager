import { test, expect } from '@playwright/test';

test.describe('Highlights Display Order', () => {
  test('should sort by display_order DESC (higher first), then created_at DESC', async ({ page }) => {
    // Get current highlights
    const apiResponse = await page.request.get('/api/highlights?all=true');
    const apiData = await apiResponse.json();

    console.log('\n📊 Current Highlights Order:');
    console.log('─'.repeat(80));

    apiData.data.forEach((h: any, i: number) => {
      console.log(`${i + 1}. ${h.title_he}`);
      console.log(`   display_order: ${h.display_order}`);
      console.log(`   created_at: ${h.created_at}`);
      console.log('');
    });

    console.log('─'.repeat(80));

    // Verify sorting logic
    if (apiData.data.length >= 2) {
      for (let i = 0; i < apiData.data.length - 1; i++) {
        const current = apiData.data[i];
        const next = apiData.data[i + 1];

        // Current should have higher or equal display_order than next
        if (current.display_order !== next.display_order) {
          expect(current.display_order).toBeGreaterThan(next.display_order);
          console.log(`✅ ${current.title_he.substring(0, 30)}... (order: ${current.display_order})`);
          console.log(`   appears BEFORE`);
          console.log(`   ${next.title_he.substring(0, 30)}... (order: ${next.display_order})`);
        } else {
          // If same display_order, check created_at (newer first)
          const currentDate = new Date(current.created_at);
          const nextDate = new Date(next.created_at);
          expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
          console.log(`✅ Same display_order (${current.display_order}), sorted by date (newer first)`);
        }
      }
    }

    console.log('\n✅ Sorting logic is correct!\n');
  });

  test('should explain how display_order works', async ({ page }) => {
    console.log('\n📚 How display_order Works:\n');
    console.log('1. Higher numbers appear FIRST');
    console.log('   Example: order 10 appears before order 5');
    console.log('');
    console.log('2. If two highlights have the same order number,');
    console.log('   the NEWER one (by created_at) appears first');
    console.log('');
    console.log('3. Default order is 0');
    console.log('');
    console.log('Examples:');
    console.log('─'.repeat(60));
    console.log('Highlight A: order=10, created=Nov 1  ← Shows FIRST');
    console.log('Highlight B: order=5,  created=Nov 8  ← Shows second');
    console.log('Highlight C: order=0,  created=Nov 10 ← Shows third');
    console.log('Highlight D: order=0,  created=Nov 5  ← Shows fourth');
    console.log('─'.repeat(60));
    console.log('\n✅ Use higher numbers to pin important highlights to the top!\n');
  });

  test('should show display_order field in admin with explanation', async ({ page, context }) => {
    // Login as admin
    await page.goto('/he/login');
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'test');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Navigate to highlights admin
    await page.goto('/he/admin/highlights');
    await page.waitForLoadState('networkidle');

    // Wait for highlights to load
    await page.waitForSelector('[data-testid="highlight-card"]', { timeout: 10000 });

    // Click edit on first highlight
    const editButton = page.locator('button').filter({ has: page.locator('svg[class*="lucide-edit"]') }).first();
    await editButton.click();
    await page.waitForTimeout(500);

    // Find display_order field
    const orderLabel = page.locator('label').filter({ hasText: /סדר תצוגה/ });
    await expect(orderLabel).toBeVisible();

    // Check for explanation text
    const explanation = page.locator('text=/מספר גבוה יותר = מוצג ראשון/');
    await expect(explanation).toBeVisible();

    console.log('\n✅ Admin panel shows display_order field with explanation');
    console.log('   Label: "סדר תצוגה (מספר גבוה יותר = מוצג ראשון)"');
  });
});
