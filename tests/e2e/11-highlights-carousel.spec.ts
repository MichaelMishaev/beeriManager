import { test, expect } from '@playwright/test';

test.describe('Highlights Carousel', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Hebrew homepage where carousel is displayed
    await page.goto('/he');
    await page.waitForLoadState('networkidle');
  });

  test('should display carousel on homepage', async ({ page }) => {
    // Check that carousel container exists
    const carousel = page.locator('[class*="animate-slide-down"]').filter({ has: page.locator('.min-w-full') });
    await expect(carousel).toBeVisible({ timeout: 10000 });

    // Verify carousel is between hero and school stats
    const heroSection = page.locator('h1').filter({ hasText: /ברוכים הבאים|Welcome/ });
    const schoolStats = page.locator('text=סה״כ מועמדים').or(page.locator('text=Total Candidates'));

    await expect(heroSection).toBeVisible();
    await expect(schoolStats).toBeVisible();
  });

  test('should display first highlight with mock data', async ({ page }) => {
    // Wait for carousel to be visible
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // Check for first mock highlight content (Math competition)
    const firstSlide = page.locator('.min-w-full').first();

    // Verify Hebrew title is visible
    await expect(firstSlide.locator('h2')).toContainText('הישג מדהים');

    // Verify icon is present
    await expect(firstSlide.locator('h2')).toContainText('🏆');

    // Verify category badge
    const badge = firstSlide.locator('[class*="bg-gradient-to-r"]').first();
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('הישגים');

    // Verify description
    await expect(firstSlide.locator('p')).toContainText('תלמידי כיתה ו');
  });

  test('should navigate to next slide using arrow button', async ({ page }) => {
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // Verify first slide content
    await expect(page.locator('h2').filter({ hasText: /הישג מדהים/ })).toBeVisible();

    // Click next button (ChevronRight - which is on the right for RTL)
    const nextButton = page.locator('button[aria-label*="הבא"]').or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-chevron-right"]') }));
    await nextButton.click();

    // Wait for transition
    await page.waitForTimeout(600);

    // Verify second slide content (Soccer finals)
    await expect(page.locator('h2').filter({ hasText: /כדורגל/ })).toBeVisible();
    await expect(page.locator('h2')).toContainText('⚽');
  });

  test('should navigate to previous slide using arrow button', async ({ page }) => {
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // First go to next slide
    const nextButton = page.locator('button[aria-label*="הבא"]').or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-chevron-right"]') }));
    await nextButton.click();
    await page.waitForTimeout(600);

    // Verify we're on second slide
    await expect(page.locator('h2').filter({ hasText: /כדורגל/ })).toBeVisible();

    // Click previous button (ChevronLeft - which is on the left for RTL)
    const prevButton = page.locator('button[aria-label*="הקודם"]').or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-chevron-left"]') }));
    await prevButton.click();
    await page.waitForTimeout(600);

    // Verify we're back to first slide
    await expect(page.locator('h2').filter({ hasText: /הישג מדהים/ })).toBeVisible();
  });

  test('should navigate using dot indicators', async ({ page }) => {
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // Find all dot indicators
    const dots = page.locator('button[aria-label*="שקופית"]').or(page.locator('button[aria-label*="Слайд"]'));
    const dotCount = await dots.count();

    // Should have 5 dots (5 mock highlights)
    expect(dotCount).toBe(5);

    // First dot should be active (wider)
    const firstDot = dots.nth(0);
    await expect(firstDot).toHaveClass(/w-8/);

    // Click third dot
    await dots.nth(2).click();
    await page.waitForTimeout(600);

    // Verify third slide content (Teacher award)
    await expect(page.locator('h2').filter({ hasText: /מורה מצטיינת/ })).toBeVisible();
    await expect(page.locator('h2')).toContainText('🎖️');

    // Third dot should now be active
    await expect(dots.nth(2)).toHaveClass(/w-8/);
  });

  test('should display share button on each slide', async ({ page }) => {
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // Check for share button with Share2 icon
    const shareButton = page.locator('button').filter({ has: page.locator('svg[class*="lucide-share"]') });
    await expect(shareButton).toBeVisible();

    // Verify button text
    await expect(shareButton).toContainText('שתף');
  });

  test('should display all 5 mock highlights', async ({ page }) => {
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    const expectedHighlights = [
      { icon: '🏆', keyword: 'מתמטיקה' },
      { icon: '⚽', keyword: 'כדורגל' },
      { icon: '🎖️', keyword: 'מורה מצטיינת' },
      { icon: '🏀', keyword: 'כדורסל' },
      { icon: '🎉', keyword: 'משפחות' }
    ];

    const nextButton = page.locator('button[aria-label*="הבא"]').or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-chevron-right"]') }));

    for (let i = 0; i < expectedHighlights.length; i++) {
      const { icon, keyword } = expectedHighlights[i];

      // Verify current slide content
      const slideTitle = page.locator('h2').filter({ hasText: new RegExp(icon) });
      await expect(slideTitle).toBeVisible({ timeout: 5000 });
      await expect(slideTitle).toContainText(keyword);

      // Navigate to next slide (except on last one)
      if (i < expectedHighlights.length - 1) {
        await nextButton.click();
        await page.waitForTimeout(700);
      }
    }
  });

  test('should display correctly in Russian locale', async ({ page }) => {
    // Navigate to Russian homepage
    await page.goto('/ru');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // Check for Russian content in first slide
    const firstSlide = page.locator('.min-w-full').first();
    await expect(firstSlide.locator('h2')).toContainText('Потрясающее достижение');

    // Verify Russian category
    const badge = firstSlide.locator('[class*="bg-gradient-to-r"]').first();
    await expect(badge).toContainText('Достижения');

    // Verify Russian share button
    const shareButton = page.locator('button').filter({ has: page.locator('svg[class*="lucide-share"]') });
    await expect(shareButton).toContainText('Поделиться');
  });

  test('should display date on slides that have dates', async ({ page }) => {
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // First slide has date '2025-10-25'
    const dateText = page.locator('span[dir="ltr"]').filter({ hasText: /2025|25/ });
    await expect(dateText.first()).toBeVisible();
  });

  test('should display CTA button when available', async ({ page }) => {
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // First slide has CTA "קרא עוד"
    const ctaButton = page.locator('button').filter({ hasText: /קרא עוד/ });
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveClass(/bg-gradient-to-r/);
  });

  test('should have proper RTL layout', async ({ page }) => {
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // Check carousel direction
    const carouselContainer = page.locator('.flex.transition-transform');
    await expect(carouselContainer).toBeVisible();

    // Verify text direction
    const title = page.locator('h2').first();
    const textDirection = await title.evaluate((el) => window.getComputedStyle(el).direction);
    expect(textDirection).toBe('rtl');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/he');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // Carousel should still be visible
    const carousel = page.locator('[class*="animate-slide-down"]').filter({ has: page.locator('.min-w-full') });
    await expect(carousel).toBeVisible();

    // Navigation arrows should be visible
    const nextButton = page.locator('button[aria-label*="הבא"]').or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-chevron-right"]') }));
    await expect(nextButton).toBeVisible();

    // Content should be readable
    const title = page.locator('h2').first();
    await expect(title).toBeVisible();
  });

  test('should auto-rotate slides after delay', async ({ page }) => {
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // Verify starting on first slide
    await expect(page.locator('h2').filter({ hasText: /הישג מדהים/ })).toBeVisible();

    // Wait for auto-rotation (6 seconds)
    await page.waitForTimeout(6500);

    // Should have moved to second slide automatically
    await expect(page.locator('h2').filter({ hasText: /כדורגל/ })).toBeVisible({ timeout: 2000 });
  });

  test('should stop auto-rotation when user interacts', async ({ page }) => {
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    // Click a dot to manually navigate
    const dots = page.locator('button[aria-label*="שקופית"]').or(page.locator('button[aria-label*="Слайд"]'));
    await dots.nth(3).click();
    await page.waitForTimeout(600);

    // Verify we're on fourth slide
    await expect(page.locator('h2').filter({ hasText: /כדורסל/ })).toBeVisible();

    // Wait more than 6 seconds - should NOT auto-rotate
    await page.waitForTimeout(7000);

    // Should still be on fourth slide
    await expect(page.locator('h2').filter({ hasText: /כדורסל/ })).toBeVisible();
  });

  test('should cycle through all slides', async ({ page }) => {
    await page.waitForSelector('.min-w-full', { timeout: 10000 });

    const nextButton = page.locator('button[aria-label*="הבא"]').or(page.locator('button').filter({ has: page.locator('svg[class*="lucide-chevron-right"]') }));

    // Click next 5 times (through all 5 slides)
    for (let i = 0; i < 5; i++) {
      await nextButton.click();
      await page.waitForTimeout(600);
    }

    // Should cycle back to first slide
    await expect(page.locator('h2').filter({ hasText: /הישג מדהים/ })).toBeVisible();
  });
});
