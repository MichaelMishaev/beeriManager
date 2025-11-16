import { test, expect } from '@playwright/test';

test('Debug urgent messages filtering - check why message not showing', async ({ page }) => {
  // Get current time
  const now = new Date();
  console.log('\n⏰ Current Time:', now.toISOString());
  console.log('   Local Time:', now.toLocaleString('he-IL'));
  console.log('   Date only:', now.toISOString().split('T')[0]);

  // Check API response
  const apiResponse = await page.request.get('/api/urgent-messages');
  const apiData = await apiResponse.json();

  console.log('\n📊 Public API Response:');
  console.log(`   Success: ${apiData.success}`);
  console.log(`   Count: ${apiData.data?.length || 0}`);

  if (apiData.data && apiData.data.length > 0) {
    apiData.data.forEach((m: any, i: number) => {
      console.log(`\n   ${i + 1}. ${m.title_he}`);
      console.log(`      type: ${m.type}`);
      console.log(`      is_active: ${m.is_active}`);
      console.log(`      start_date: ${m.start_date || 'NULL'}`);
      console.log(`      end_date: ${m.end_date || 'NULL'}`);
    });
  } else {
    console.log('   ⚠️ No messages returned');
  }

  // Check admin API (all messages)
  const adminResponse = await page.request.get('/api/urgent-messages?all=true');
  const adminData = await adminResponse.json();

  console.log('\n\n📋 Admin API Response (ALL messages):');
  console.log(`   Count: ${adminData.data?.length || 0}`);

  if (adminData.data) {
    adminData.data.forEach((m: any, i: number) => {
      console.log(`\n   ${i + 1}. ${m.title_he}`);
      console.log(`      type: ${m.type}`);
      console.log(`      is_active: ${m.is_active}`);
      console.log(`      start_date: ${m.start_date || 'NULL'}`);
      console.log(`      end_date: ${m.end_date || 'NULL'}`);
      console.log(`      created_at: ${m.created_at}`);

      // Check if this message should be visible
      const today = now.toISOString().split('T')[0];

      // Compare as strings (same as API does)
      const startOk = !m.start_date || m.start_date <= today;
      const endOk = !m.end_date || m.end_date >= today;
      const shouldShow = m.is_active && startOk && endOk;

      console.log(`\n      📅 Comparison:`);
      console.log(`         today: "${today}"`);
      console.log(`         start_date: "${m.start_date}"`);
      console.log(`         end_date: "${m.end_date}"`);
      console.log(`         start_date <= today: ${startOk} (${m.start_date} <= ${today})`);
      console.log(`         end_date >= today: ${endOk} (${m.end_date} >= ${today})`);
      console.log(`      ✓ Should show: ${shouldShow ? 'YES' : 'NO'}`);

      if (!shouldShow) {
        const reasons = [];
        if (!m.is_active) reasons.push('inactive');
        if (!startOk) reasons.push(`start_date (${m.start_date}) > today (${today})`);
        if (!endOk) reasons.push(`end_date (${m.end_date}) < today (${today})`);
        console.log(`        Reason: ${reasons.join(', ')}`);
      }
    });
  }

  console.log('\n');
});
