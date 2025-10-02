const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();

  try {
    console.log('\n🔐 Testing login with password: admin1\n');

    // Go to login page
    await page.goto('http://localhost:4500/he/login');
    await page.waitForLoadState('networkidle');
    console.log('✓ Login page loaded');

    // Fill password
    await page.fill('input[type="password"]', 'admin1');
    console.log('✓ Password entered: admin1');
    await page.waitForTimeout(500);

    // Click submit button
    await page.click('button[type="submit"]');
    console.log('✓ Submit button clicked');

    // Wait for navigation or error
    await Promise.race([
      page.waitForURL('**/admin**', { timeout: 5000 }),
      page.waitForSelector('text=סיסמה שגויה', { timeout: 5000 })
    ]);

    const currentUrl = page.url();
    const hasError = await page.locator('text=סיסמה שגויה').isVisible().catch(() => false);

    console.log(`\nCurrent URL: ${currentUrl}`);

    if (currentUrl.includes('/admin')) {
      console.log('\n✅ LOGIN SUCCESSFUL!');
      console.log('✓ Redirected to admin dashboard');

      // Take success screenshot
      await page.screenshot({ path: 'login-success.png', fullPage: true });
      console.log('✓ Screenshot saved: login-success.png');

      // Wait to see the dashboard
      await page.waitForTimeout(2000);
    } else if (hasError) {
      console.log('\n❌ LOGIN FAILED - Wrong password error shown');
      await page.screenshot({ path: 'login-failed.png', fullPage: true });
      console.log('Screenshot saved: login-failed.png');
    } else {
      console.log('\n⚠ Unexpected state');
      await page.screenshot({ path: 'login-unexpected.png', fullPage: true });
    }

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
