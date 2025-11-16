import { test, expect } from '@playwright/test';

test('Debug highlight filtering - check why new highlight not showing', async ({ page }) => {
  // Get current time
  const now = new Date();
  console.log('\n⏰ Current Time:', now.toISOString());
  console.log('   Local Time:', now.toLocaleString('he-IL'));

  // Check API response
  const apiResponse = await page.request.get('/api/highlights?limit=10');
  const apiData = await apiResponse.json();

  console.log('\n📊 Public API Response:');
  console.log(`   Success: ${apiData.success}`);
  console.log(`   Count: ${apiData.data?.length || 0}`);

  if (apiData.data) {
    apiData.data.forEach((h: any, i: number) => {
      console.log(`\n   ${i + 1}. ${h.title_he}`);
      console.log(`      is_active: ${h.is_active}`);
      console.log(`      start_date: ${h.start_date || 'NULL'}`);
      console.log(`      end_date: ${h.end_date || 'NULL'}`);
      console.log(`      display_order: ${h.display_order}`);
    });
  }

  // Check admin API (all highlights)
  const adminResponse = await page.request.get('/api/highlights?all=true&limit=50');
  const adminData = await adminResponse.json();

  console.log('\n\n📋 Admin API Response (ALL highlights):');
  console.log(`   Count: ${adminData.data?.length || 0}`);

  if (adminData.data) {
    adminData.data.forEach((h: any, i: number) => {
      console.log(`\n   ${i + 1}. ${h.title_he}`);
      console.log(`      is_active: ${h.is_active}`);
      console.log(`      start_date: ${h.start_date || 'NULL'}`);
      console.log(`      end_date: ${h.end_date || 'NULL'}`);
      console.log(`      created_at: ${h.created_at}`);

      // Check if this highlight should be visible
      const startOk = !h.start_date || new Date(h.start_date) <= now;
      const endOk = !h.end_date || new Date(h.end_date) >= now;
      const shouldShow = h.is_active && startOk && endOk;

      console.log(`      ✓ Should show: ${shouldShow ? 'YES' : 'NO'}`);
      if (!shouldShow) {
        console.log(`        Reason: ${!h.is_active ? 'inactive' : !startOk ? 'start_date in future' : 'end_date in past'}`);
      }
    });
  }

  console.log('\n');
});
