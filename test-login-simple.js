const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  try {
    console.log('\n🔐 Testing login with admin1\n');

    // Go to login
    await page.goto('http://localhost:4500/he/login');
    await page.waitForLoadState('networkidle');
    console.log('✓ Page loaded');

    // Fill password
    const passwordField = await page.locator('input[type="password"]');
    await passwordField.fill('admin1');
    console.log('✓ Password filled: admin1');

    // Wait a moment
    await page.waitForTimeout(1000);

    // Check if button is enabled
    const submitButton = await page.locator('button[type="submit"]');
    const isDisabled = await submitButton.isDisabled();
    console.log(`Button disabled: ${isDisabled}`);

    if (isDisabled) {
      console.log('⚠ Button is disabled - checking why...');

      // Check password value
      const value = await passwordField.inputValue();
      console.log(`Password field value: "${value}" (length: ${value.length})`);
      console.log(`Trimmed: "${value.trim()}" (length: ${value.trim().length})`);
    }

    // Try to submit anyway
    await submitButton.click({ force: true });
    console.log('✓ Clicked submit button (forced)');

    // Wait for navigation or error
    await Promise.race([
      page.waitForURL('**/admin**', { timeout: 5000 }).then(() => 'navigated'),
      page.waitForSelector('text=סיסמה שגויה', { timeout: 5000 }).then(() => 'error'),
      page.waitForTimeout(5000).then(() => 'timeout')
    ]).then(result => {
      console.log(`Result: ${result}`);
    });

    const currentUrl = page.url();
    console.log(`\nFinal URL: ${currentUrl}`);

    if (currentUrl.includes('/admin')) {
      console.log('\n✅ LOGIN SUCCESSFUL!\n');
    } else if (await page.locator('text=סיסמה שגויה').isVisible().catch(() => false)) {
      console.log('\n❌ LOGIN FAILED - Wrong password\n');
    } else {
      console.log('\n⚠ Unknown state\n');
    }

    await page.screenshot({ path: 'final-state.png', fullPage: true });
    console.log('Screenshot: final-state.png');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'error-state.png' });
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
})();
