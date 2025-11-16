import { test, expect } from '@playwright/test';

test.describe('Verify is_active checkbox save fix', () => {
  test('should save is_active checkbox state to database', async ({ page }) => {
    // Get current state from API
    const beforeResponse = await page.request.get('/api/highlights?all=true&limit=50');
    const beforeData = await beforeResponse.json();

    console.log('\n📊 Before state:');
    console.log(`   Total highlights: ${beforeData.data?.length || 0}`);

    // Find the highlight "תלמידי בארי השתתפו במירוץ חופים"
    const targetHighlight = beforeData.data?.find((h: any) =>
      h.title_he?.includes('תלמידי בארי השתתפו במירוץ חופים')
    );

    if (!targetHighlight) {
      console.log('❌ Target highlight not found in database');
      return;
    }

    console.log(`\n🎯 Target highlight: "${targetHighlight.title_he}"`);
    console.log(`   ID: ${targetHighlight.id}`);
    console.log(`   is_active BEFORE: ${targetHighlight.is_active}`);

    // Now toggle it via API (simulating what the admin page should do)
    const newActiveState = !targetHighlight.is_active;

    console.log(`\n🔄 Attempting to toggle is_active to: ${newActiveState}`);

    // Login first to get auth token
    await page.goto('/he/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'test');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Now make the PATCH request
    const updateResponse = await page.request.patch(`/api/highlights/${targetHighlight.id}`, {
      data: {
        is_active: newActiveState
      }
    });

    const updateData = await updateResponse.json();
    console.log(`\n📡 PATCH response status: ${updateResponse.status()}`);
    console.log(`   Success: ${updateData.success}`);

    if (!updateData.success) {
      console.log(`   Error: ${updateData.error}`);
      if (updateData.details) {
        console.log(`   Details: ${JSON.stringify(updateData.details)}`);
      }
    }

    // Verify the change
    const afterResponse = await page.request.get('/api/highlights?all=true&limit=50');
    const afterData = await afterResponse.json();

    const updatedHighlight = afterData.data?.find((h: any) => h.id === targetHighlight.id);

    console.log(`\n✅ After state:`);
    console.log(`   is_active AFTER: ${updatedHighlight.is_active}`);
    console.log(`   Expected: ${newActiveState}`);
    console.log(`   Match: ${updatedHighlight.is_active === newActiveState ? '✓ YES' : '✗ NO'}`);

    expect(updatedHighlight.is_active).toBe(newActiveState);
  });
});
