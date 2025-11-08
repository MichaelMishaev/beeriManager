import { test, expect } from '@playwright/test';

test.describe('Highlight Share Button Location', () => {
  test('should NOT show share button on carousel card', async ({ page }) => {
    await page.goto('/he');
    await page.waitForLoadState('networkidle');

    // Wait for carousel
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    console.log('\n🔍 Checking carousel card for share button...\n');

    // Look for share button in carousel (should NOT exist)
    const carouselShareButton = page.locator('.min-w-full button').filter({ hasText: /שתף/ }).first();
    const isVisible = await carouselShareButton.isVisible().catch(() => false);

    console.log(`✅ Share button in carousel: ${isVisible ? '❌ FOUND (should not be there!)' : '✓ NOT FOUND (correct!)'}\n`);

    expect(isVisible).toBe(false);
  });

  test('should ONLY show share button in modal', async ({ page }) => {
    await page.goto('/he');
    await page.waitForLoadState('networkidle');

    // Wait for carousel
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    console.log('\n🔍 Checking modal for share button...\n');

    // Click on slide to open modal
    const slide = page.locator('.min-w-full').first();
    await slide.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('✅ Modal opened\n');

    // Look for share button in modal (should exist)
    const modalShareButton = page.locator('[role="dialog"] button').filter({ hasText: /שתף/ });
    await expect(modalShareButton).toBeVisible();

    console.log('✅ Share button found in modal ✓\n');
    console.log('📋 Summary:');
    console.log('  • Carousel card: NO share button ✓');
    console.log('  • Modal: HAS share button ✓\n');
  });

  test('should verify clean carousel layout without share button', async ({ page }) => {
    await page.goto('/he');
    await page.waitForLoadState('networkidle');

    // Wait for carousel
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    console.log('\n📐 Verifying clean carousel layout...\n');

    // Find the badge (category)
    const badge = page.locator('.min-w-full').first().locator('span[class*="rounded-full"]').first();
    await expect(badge).toBeVisible();

    console.log('✅ Category badge is visible');

    // Verify badge is in a simple div (not flex-between with share button)
    const badgeContainer = page.locator('.min-w-full').first().locator('div.flex.items-center.gap-2').first();
    await expect(badgeContainer).toBeVisible();

    // Check that container doesn't have justify-between
    const containerClasses = await badgeContainer.getAttribute('class');
    const hasJustifyBetween = containerClasses?.includes('justify-between');

    console.log(`✅ Badge container layout: ${hasJustifyBetween ? 'flex-between (old)' : 'simple flex (new, correct!)'}\n`);

    expect(hasJustifyBetween).toBe(false);
  });
});
