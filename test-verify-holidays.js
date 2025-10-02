const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('\n🎉 FINAL VERIFICATION - Holidays Display\n');

    await page.goto('http://localhost:4500/calendar', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check September 2025 (Rosh Hashanah)
    console.log('📅 Checking September 2025...');
    const sept = await page.locator('text=/ראש השנה/').count();
    console.log(`   Found "ראש השנה": ${sept > 0 ? '✅' : '❌'}`);

    // Check October 2025 (Yom Kippur, Sukkot)
    console.log('\n📅 Checking October 2025...');
    await page.locator('button').filter({ hasText: /›|▶|→|Next/ }).first().click();
    await page.waitForTimeout(500);

    const oct1 = await page.locator('text=/יום כיפור/').count();
    const oct2 = await page.locator('text=/סוכות/').count();
    console.log(`   Found "יום כיפור": ${oct1 > 0 ? '✅' : '❌'}`);
    console.log(`   Found "סוכות": ${oct2 > 0 ? '✅' : '❌'}`);

    // Take screenshot
    await page.screenshot({ path: 'holidays-verified.png', fullPage: true });
    console.log('\n📸 Screenshot: holidays-verified.png');

    if (sept > 0 && oct1 > 0 && oct2 > 0) {
      console.log('\n✅✅✅ SUCCESS! All holidays displaying correctly!\n');
    } else {
      console.log('\n⚠️  Some holidays not visible - check dates\n');
    }

    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
