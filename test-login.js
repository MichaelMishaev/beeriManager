const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console messages
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  try {
    console.log('Testing login functionality...');

    // Navigate to login page
    await page.goto('http://localhost:4500/he/login', { waitUntil: 'domcontentloaded' });
    console.log('✓ Loaded login page');

    // Wait for page to be ready
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    console.log('✓ Password field visible');

    // Try with a test password
    const testPassword = process.env.ADMIN_PASSWORD || '6262';
    await page.fill('input[type="password"]', testPassword);
    console.log(`✓ Entered password: ${testPassword}`);

    // Click login button
    await page.click('button[type="submit"]');
    console.log('✓ Clicked login button');

    // Wait for either error or redirect
    await page.waitForTimeout(2000);

    // Check if error appeared
    const errorElement = await page.locator('text=סיסמה שגויה').isVisible().catch(() => false);
    if (errorElement) {
      console.log('❌ Login failed - wrong password error shown');

      // Check what hash is in env
      console.log('\n📋 Checking environment...');
      const envCheck = await page.evaluate(() => {
        return {
          hasPasswordHash: !!process.env.ADMIN_PASSWORD_HASH
        };
      });
      console.log('Env check:', envCheck);

      // Take screenshot
      await page.screenshot({ path: 'login-error.png', fullPage: true });
      console.log('Screenshot saved as login-error.png');
    } else {
      // Check if redirected to admin
      const currentUrl = page.url();
      if (currentUrl.includes('/admin')) {
        console.log('✅ Login successful - redirected to admin panel');
      } else {
        console.log(`⚠ Unexpected URL: ${currentUrl}`);
      }
    }

    console.log('\n💡 To fix this issue:');
    console.log('1. Check that ADMIN_PASSWORD_HASH is set in .env.local');
    console.log('2. Generate a new hash by running: node scripts/generate-password-hash.js <your-password>');
    console.log('3. Or use the default password from your environment');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'login-test-error.png', fullPage: true });
    console.log('Error screenshot saved as login-test-error.png');
  } finally {
    await browser.close();
  }
})();
