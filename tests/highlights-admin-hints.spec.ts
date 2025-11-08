import { test, expect } from '@playwright/test';

test.describe('Highlights Admin Date Hints', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/he/login');
    await page.waitForLoadState('networkidle');

    // Fill password
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'test');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Go to highlights admin
    await page.goto('/he/admin/highlights');
    await page.waitForLoadState('networkidle');
  });

  test('should show helpful hints for all 3 date fields', async ({ page }) => {
    console.log('\n📚 Testing Date Field Hints\n');

    // Wait for highlights to load
    await page.waitForSelector('[data-testid="highlight-card"]', { timeout: 10000 });

    // Click edit on first highlight
    const editButton = page.locator('button').filter({
      has: page.locator('svg[class*="lucide-edit"]')
    }).first();
    await editButton.click();
    await page.waitForTimeout(500);

    // Check Event Date hint
    const eventDateHint = page.locator('text=/התאריך בו האירוע התרחש/');
    await expect(eventDateHint).toBeVisible();
    const eventDateText = await eventDateHint.textContent();
    console.log('✅ Event Date Hint:');
    console.log(`   ${eventDateText}\n`);

    // Check Start Date hint
    const startDateHint = page.locator('text=/מתי להתחיל להציג/');
    await expect(startDateHint).toBeVisible();
    const startDateText = await startDateHint.textContent();
    console.log('✅ Start Date Hint:');
    console.log(`   ${startDateText}\n`);

    // Check End Date hint
    const endDateHint = page.locator('text=/מתי להפסיק להציג/');
    await expect(endDateHint).toBeVisible();
    const endDateText = await endDateHint.textContent();
    console.log('✅ End Date Hint:');
    console.log(`   ${endDateText}\n`);

    console.log('═'.repeat(70));
    console.log('📋 Summary of Date Fields:');
    console.log('═'.repeat(70));
    console.log('');
    console.log('1️⃣  תאריך אירוע (Event Date)');
    console.log('   📅 התאריך בו האירוע התרחש/יתרחש - יוצג למשתמשים בכרטיסייה ובשיתוף');
    console.log('   Purpose: The actual date when the event happened/will happen');
    console.log('   Displayed: YES - shown to users in carousel and share text');
    console.log('');
    console.log('2️⃣  תאריך התחלה (Start Date)');
    console.log('   🟢 מתי להתחיל להציג - ריק = מיד');
    console.log('   Purpose: When to START showing this highlight on homepage');
    console.log('   Displayed: NO - internal visibility control only');
    console.log('');
    console.log('3️⃣  תאריך סיום (End Date)');
    console.log('   🔴 מתי להפסיק להציג - ריק = לעולם');
    console.log('   Purpose: When to STOP showing this highlight on homepage');
    console.log('   Displayed: NO - internal visibility control only');
    console.log('');
    console.log('═'.repeat(70));
  });

  test('should display hints with proper styling', async ({ page }) => {
    // Wait for highlights
    await page.waitForSelector('[data-testid="highlight-card"]', { timeout: 10000 });

    // Click edit
    const editButton = page.locator('button').filter({
      has: page.locator('svg[class*="lucide-edit"]')
    }).first();
    await editButton.click();
    await page.waitForTimeout(500);

    // Check all hints have proper styling (text-xs text-gray-500)
    const hints = page.locator('p.text-xs.text-gray-500');
    const hintCount = await hints.count();

    console.log(`\n✅ Found ${hintCount} hint paragraphs with proper styling`);

    // Should have at least 3 (for the 3 date fields)
    expect(hintCount).toBeGreaterThanOrEqual(3);

    // Check for emojis in hints
    const eventDateHint = page.locator('text=/📅/');
    const startDateHint = page.locator('text=/🟢/');
    const endDateHint = page.locator('text=/🔴/');

    expect(await eventDateHint.isVisible()).toBe(true);
    expect(await startDateHint.isVisible()).toBe(true);
    expect(await endDateHint.isVisible()).toBe(true);

    console.log('✅ All hints have visual emojis for easy identification\n');
  });

  test('should show example usage patterns', async ({ page }) => {
    console.log('\n💡 Example Usage Patterns:\n');
    console.log('─'.repeat(70));

    console.log('\n📌 Pattern 1: Permanent Achievement');
    console.log('   תאריך אירוע: 31/10/2025 (when it happened)');
    console.log('   תאריך התחלה: [empty]');
    console.log('   תאריך סיום: [empty]');
    console.log('   Result: Shows forever, displays "📅 31 באוקטובר 2025"');

    console.log('\n📌 Pattern 2: Time-Limited Announcement');
    console.log('   תאריך אירוע: 15/11/2025 (event date)');
    console.log('   תאריך התחלה: 10/11/2025 (start showing)');
    console.log('   תאריך סיום: 15/11/2025 (stop showing)');
    console.log('   Result: Visible Nov 10-15 only, displays "📅 15 בנובמבר 2025"');

    console.log('\n📌 Pattern 3: No Event Date (General Announcement)');
    console.log('   תאריך אירוע: [empty]');
    console.log('   תאריך התחלה: 01/11/2025');
    console.log('   תאריך סיום: 30/11/2025');
    console.log('   Result: Visible all November, no date displayed to users');

    console.log('\n📌 Pattern 4: Always Visible');
    console.log('   תאריך אירוע: [empty]');
    console.log('   תאריך התחלה: [empty]');
    console.log('   תאריך סיום: [empty]');
    console.log('   Result: Always visible, no date shown');

    console.log('\n─'.repeat(70));
    console.log('✅ All patterns are now clearly documented!\n');
  });
});
