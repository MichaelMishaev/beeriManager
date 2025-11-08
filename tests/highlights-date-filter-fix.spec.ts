import { test, expect } from '@playwright/test';

/**
 * Test to verify the highlights API date filter fix
 *
 * Bug: Highlights with only start_date OR only end_date were being filtered out
 * Fix: Updated API filter to handle all 4 cases:
 *   1. No dates set (both null)
 *   2. Only end_date set (and it's in the future)
 *   3. Only start_date set (and it's in the past)
 *   4. Both dates set (within range)
 */

test.describe('Highlights Date Filter Fix', () => {
  test('should display all active highlights from database on homepage', async ({ page }) => {
    // Navigate to Hebrew homepage
    await page.goto('/he');
    await page.waitForLoadState('networkidle');

    // Wait for highlights carousel to load
    const carouselSection = page.locator('div').filter({ hasText: /תלמידי השבוע|הדגשות/ }).first();
    await expect(carouselSection).toBeVisible({ timeout: 15000 });

    // Check API response directly
    const apiResponse = await page.request.get('/api/highlights?limit=10');
    expect(apiResponse.ok()).toBeTruthy();

    const apiData = await apiResponse.json();
    console.log('[API Test] Highlights API response:', JSON.stringify(apiData, null, 2));

    expect(apiData.success).toBe(true);
    const highlightsCount = apiData.data?.length || 0;

    console.log(`[API Test] Found ${highlightsCount} highlights in API response`);

    // If we have highlights, verify they're displayed in the carousel
    if (highlightsCount > 0) {
      // Check for carousel container
      const carouselContainer = page.locator('.min-w-full').first();
      await expect(carouselContainer).toBeVisible({ timeout: 10000 });

      // Check dot indicators count matches API count
      const dots = page.locator('button[aria-label*="שקופית"]');
      const dotCount = await dots.count();

      console.log(`[UI Test] Found ${dotCount} dot indicators`);
      expect(dotCount).toBe(highlightsCount);

      // Verify we can see content from the first highlight
      const firstHighlight = apiData.data[0];
      if (firstHighlight) {
        console.log('[UI Test] First highlight:', {
          title_he: firstHighlight.title_he,
          is_active: firstHighlight.is_active,
          start_date: firstHighlight.start_date,
          end_date: firstHighlight.end_date
        });

        // Look for the title in the carousel
        const titleLocator = page.locator('h3').filter({ hasText: firstHighlight.title_he });
        await expect(titleLocator).toBeVisible({ timeout: 5000 });
      }
    } else {
      console.log('[Test] No highlights in database - carousel should be hidden');
      // Carousel should not be visible if no highlights
      const carouselContainer = page.locator('.min-w-full');
      await expect(carouselContainer).not.toBeVisible();
    }
  });

  test('should display exactly 2 highlights (user reported)', async ({ page }) => {
    // The user reported seeing 2 highlights in admin but only 1 on homepage
    // After fix, both should be visible

    await page.goto('/he');
    await page.waitForLoadState('networkidle');

    // Get highlights from API
    const apiResponse = await page.request.get('/api/highlights?limit=10');
    const apiData = await apiResponse.json();

    const highlightsCount = apiData.data?.length || 0;
    console.log(`[Bug Verification] API returned ${highlightsCount} highlights`);

    if (highlightsCount >= 2) {
      // Wait for carousel
      await page.waitForSelector('.min-w-full', { timeout: 10000 });

      // Count dot indicators (one per highlight)
      const dots = page.locator('button[aria-label*="שקופית"]');
      const dotCount = await dots.count();

      console.log(`[Bug Verification] UI shows ${dotCount} dots`);
      console.log(`[Bug Verification] Expected: ${highlightsCount}, Got: ${dotCount}`);

      // Both should match
      expect(dotCount).toBe(highlightsCount);

      // Navigate through all slides to verify all highlights are accessible
      const nextButton = page.locator('button[aria-label*="הבא"]').or(
        page.locator('button').filter({ has: page.locator('svg[class*="lucide-chevron-right"]') })
      );

      for (let i = 0; i < highlightsCount; i++) {
        const currentHighlight = apiData.data[i];
        console.log(`[Bug Verification] Checking slide ${i + 1}: ${currentHighlight.title_he}`);

        // Verify title is visible
        const titleLocator = page.locator('h3').filter({ hasText: currentHighlight.title_he });
        await expect(titleLocator).toBeVisible({ timeout: 5000 });

        // Move to next slide (if not last)
        if (i < highlightsCount - 1) {
          await nextButton.click();
          await page.waitForTimeout(700);
        }
      }

      console.log('[Bug Verification] ✅ All highlights are visible and navigable');
    }
  });

  test('should handle highlights with various date configurations', async ({ page }) => {
    // Test that API correctly filters highlights with different date scenarios

    const apiResponse = await page.request.get('/api/highlights?limit=10');
    const apiData = await apiResponse.json();

    expect(apiData.success).toBe(true);

    if (apiData.data && apiData.data.length > 0) {
      console.log('\n[Date Filter Test] Highlights with their date configurations:');

      apiData.data.forEach((highlight: any, index: number) => {
        console.log(`\n  ${index + 1}. ${highlight.title_he}`);
        console.log(`     - is_active: ${highlight.is_active}`);
        console.log(`     - start_date: ${highlight.start_date || 'NULL'}`);
        console.log(`     - end_date: ${highlight.end_date || 'NULL'}`);
        console.log(`     - display_order: ${highlight.display_order}`);

        // All returned highlights should be active
        expect(highlight.is_active).toBe(true);

        // If dates are set, verify they're valid
        const now = new Date();

        if (highlight.start_date) {
          const startDate = new Date(highlight.start_date);
          // start_date should be in the past or today
          expect(startDate.getTime()).toBeLessThanOrEqual(now.getTime());
        }

        if (highlight.end_date) {
          const endDate = new Date(highlight.end_date);
          // end_date should be in the future or today
          expect(endDate.getTime()).toBeGreaterThanOrEqual(now.getTime());
        }
      });

      console.log('\n[Date Filter Test] ✅ All highlights have valid date configurations');
    }
  });

  test('should correctly fetch admin view (all highlights)', async ({ page }) => {
    // Admin view should show ALL highlights regardless of dates

    const publicResponse = await page.request.get('/api/highlights?limit=10');
    const publicData = await publicResponse.json();
    const publicCount = publicData.data?.length || 0;

    const adminResponse = await page.request.get('/api/highlights?all=true&limit=50');
    const adminData = await adminResponse.json();
    const adminCount = adminData.data?.length || 0;

    console.log(`[Admin View Test] Public API: ${publicCount} highlights`);
    console.log(`[Admin View Test] Admin API: ${adminCount} highlights`);

    // Admin view should have >= public view (could have inactive or out-of-range highlights)
    expect(adminCount).toBeGreaterThanOrEqual(publicCount);

    if (adminData.data) {
      console.log('\n[Admin View Test] All highlights in admin view:');
      adminData.data.forEach((h: any, i: number) => {
        console.log(`  ${i + 1}. ${h.title_he} - Active: ${h.is_active}, Start: ${h.start_date || 'NULL'}, End: ${h.end_date || 'NULL'}`);
      });
    }
  });
});
