import { test, expect } from '@playwright/test';

test.describe('Highlights Share Feature', () => {
  test('should have share button on carousel slide', async ({ page }) => {
    await page.goto('/he');
    await page.waitForLoadState('networkidle');

    // Wait for carousel to load
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // Find share button in carousel
    const shareButton = page.locator('button[title="שתף"]').first();
    await expect(shareButton).toBeVisible();

    // Verify it has Share2 icon
    const shareIcon = shareButton.locator('svg');
    await expect(shareIcon).toBeVisible();

    console.log('✅ Share button visible on carousel slide');
  });

  test('should copy formatted text when share button clicked', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/he');
    await page.waitForLoadState('networkidle');

    // Wait for carousel
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // Get highlight data from API
    const apiResponse = await page.request.get('/api/highlights?limit=1');
    const apiData = await apiResponse.json();

    expect(apiData.success).toBe(true);
    expect(apiData.data.length).toBeGreaterThan(0);

    const firstHighlight = apiData.data[0];
    console.log('\n📋 Testing share for highlight:', firstHighlight.title_he);

    // Click share button
    const shareButton = page.locator('button[title="שתף"]').first();
    await shareButton.click();

    // Wait for clipboard operation
    await page.waitForTimeout(500);

    // Read clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

    console.log('\n📝 Shared text format:');
    console.log('─'.repeat(60));
    console.log(clipboardText);
    console.log('─'.repeat(60));

    // Verify formatted text structure
    expect(clipboardText).toContain(firstHighlight.icon); // Icon
    expect(clipboardText).toContain(firstHighlight.title_he); // Title
    expect(clipboardText).toContain(firstHighlight.description_he); // Description
    expect(clipboardText).toContain('📌'); // Category marker
    expect(clipboardText).toContain(firstHighlight.category_he); // Category
    expect(clipboardText).toContain('https://beeri.online/he'); // Link to site

    // If highlight has event date, verify it's included
    if (firstHighlight.event_date) {
      expect(clipboardText).toContain('📅'); // Date marker
    }

    console.log('\n✅ All required elements present in share text');
    console.log('✅ Text is properly formatted with emojis and line breaks');
  });

  test('should have share button in modal', async ({ page }) => {
    await page.goto('/he');
    await page.waitForLoadState('networkidle');

    // Wait for carousel
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // Click on slide to open modal
    const firstSlide = page.locator('.min-w-full').first();
    await firstSlide.click();

    // Wait for modal to open
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Find share button in modal header
    const modalShareButton = page.locator('[role="dialog"] button[title="שתף"]');
    await expect(modalShareButton).toBeVisible();

    console.log('✅ Share button visible in modal');
  });

  test('should show success toast after copying', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/he');
    await page.waitForLoadState('networkidle');

    // Wait for carousel
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // Click share button
    const shareButton = page.locator('button[title="שתף"]').first();
    await shareButton.click();

    // Wait for toast notification
    await page.waitForTimeout(500);

    // Look for success toast
    const toast = page.locator('text=/הועתק ללוח|Скопировано/');
    await expect(toast).toBeVisible({ timeout: 3000 });

    console.log('✅ Success toast displayed');
  });

  test('should include all highlight details in share text', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/he');
    await page.waitForLoadState('networkidle');

    // Wait for carousel
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // Get API data
    const apiResponse = await page.request.get('/api/highlights?limit=10');
    const apiData = await apiResponse.json();

    for (let i = 0; i < Math.min(apiData.data.length, 2); i++) {
      const highlight = apiData.data[i];

      console.log(`\n📄 Testing highlight ${i + 1}: ${highlight.title_he}`);

      // Navigate to this slide if needed
      if (i > 0) {
        const nextButton = page.locator('button[aria-label="הבא"]').first();
        await nextButton.click();
        await page.waitForTimeout(700);
      }

      // Click share
      const shareButton = page.locator('button[title="שתף"]').first();
      await shareButton.click();
      await page.waitForTimeout(500);

      // Get clipboard
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

      // Verify structure
      const lines = clipboardText.split('\n');
      console.log(`   Lines in share text: ${lines.length}`);

      // First line should have icon + title
      expect(lines[0]).toContain(highlight.icon);
      expect(lines[0]).toContain(highlight.title_he);

      // Should have category line with 📌
      const categoryLine = lines.find(line => line.includes('📌'));
      expect(categoryLine).toBeDefined();
      expect(categoryLine).toContain(highlight.category_he);

      // Should have description
      expect(clipboardText).toContain(highlight.description_he);

      // Should end with link
      expect(clipboardText).toContain('🌐 https://beeri.online/he');

      console.log(`   ✅ Highlight ${i + 1} share text correctly formatted`);
    }
  });

  test('should work in Russian locale', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/ru');
    await page.waitForLoadState('networkidle');

    // Wait for carousel
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // Get API data
    const apiResponse = await page.request.get('/api/highlights?limit=1');
    const apiData = await apiResponse.json();
    const firstHighlight = apiData.data[0];

    // Find share button (Russian title)
    const shareButton = page.locator('button[title="Поделиться"]').first();
    await expect(shareButton).toBeVisible();

    // Click share
    await shareButton.click();
    await page.waitForTimeout(500);

    // Get clipboard
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

    console.log('\n📝 Russian share text:');
    console.log(clipboardText);

    // Verify Russian content (if available, otherwise Hebrew)
    const expectedTitle = firstHighlight.title_ru || firstHighlight.title_he;
    const expectedCategory = firstHighlight.category_ru || firstHighlight.category_he;
    const expectedDescription = firstHighlight.description_ru || firstHighlight.description_he;

    expect(clipboardText).toContain(expectedTitle);
    expect(clipboardText).toContain(expectedCategory);
    expect(clipboardText).toContain(expectedDescription);
    expect(clipboardText).toContain('https://beeri.online/ru'); // Russian URL

    console.log('✅ Russian locale share works correctly');
  });
});
