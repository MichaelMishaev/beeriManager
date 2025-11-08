import { test, expect } from '@playwright/test';

test('Verify both highlights show on homepage with newest first', async ({ page }) => {
  await page.goto('/he');
  await page.waitForLoadState('networkidle');

  // Get API data
  const apiResponse = await page.request.get('/api/highlights?limit=10');
  const apiData = await apiResponse.json();

  console.log('\n✅ API Check:');
  console.log(`   Total highlights: ${apiData.data.length}`);

  apiData.data.forEach((h: any, i: number) => {
    console.log(`   ${i + 1}. ${h.title_he} (created: ${h.created_at})`);
  });

  // Verify 2 highlights
  expect(apiData.data.length).toBe(2);

  // Verify order - newest first
  const firstHighlight = apiData.data[0];
  const secondHighlight = apiData.data[1];

  console.log('\n✅ Order Check:');
  console.log(`   First (newest): ${firstHighlight.title_he}`);
  console.log(`   Second (older): ${secondHighlight.title_he}`);

  // First should be the newer one about איתי חן
  expect(firstHighlight.title_he).toContain('איתי חן');

  // Check UI - wait for carousel
  await page.waitForSelector('.min-w-full', { timeout: 10000 });

  // Count dots
  const dots = page.locator('button[aria-label*="שקופית"]');
  const dotCount = await dots.count();

  console.log('\n✅ UI Check:');
  console.log(`   Carousel dots: ${dotCount}`);
  expect(dotCount).toBe(2);

  // Verify first slide shows the newer highlight
  const firstSlide = page.locator('h3').filter({ hasText: /איתי חן/ });
  await expect(firstSlide).toBeVisible({ timeout: 5000 });

  console.log(`   First slide visible: תלמידי שכבת ו יצאו לחלוק כבוד אחרון לסמ״ר איתי חן ✓`);

  console.log('\n🎉 Success! Both highlights are showing with newest first!\n');
});
