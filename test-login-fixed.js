const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console messages
  page.on('console', msg => console.log('BROWSER:', msg.text()));

  try {
    console.log('Testing login with password: 6262');

    // Navigate to login page
    await page.goto('http://localhost:4500/he/login', { waitUntil: 'domcontentloaded' });
    console.log('✓ Loaded login page');

    // Wait for password field
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    console.log('✓ Password field visible');

    // Enter password
    await page.fill('input[type="password"]', '6262');
    console.log('✓ Entered password: 6262');

    // Click login button and wait for navigation or error
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForTimeout(3000) // Give it time to process
    ]);
    console.log('✓ Clicked login button');

    // Check for error
    const hasError = await page.locator('text=סיסמה שגויה').isVisible().catch(() => false);

    if (hasError) {
      console.log('❌ Login FAILED - wrong password error shown');
      await page.screenshot({ path: 'login-failed.png', fullPage: true });
      console.log('Screenshot saved: login-failed.png');
    } else {
      // Check if redirected to admin
      const url = page.url();
      if (url.includes('/admin') || url.includes('/he/admin')) {
        console.log('✅ Login SUCCESSFUL - redirected to:', url);
        await page.screenshot({ path: 'login-success.png', fullPage: true });
        console.log('Screenshot saved: login-success.png');
      } else {
        console.log(`⚠ Unexpected URL: ${url}`);
        await page.screenshot({ path: 'login-unexpected.png', fullPage: true });
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'login-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
