const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console messages and errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  try {
    console.log('\n🔐 Testing committee login with password: admin1\n');

    // Navigate to login page
    await page.goto('http://localhost:4500/he/login', { waitUntil: 'domcontentloaded' });
    console.log('✓ Loaded login page');

    // Wait for password field
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    console.log('✓ Password field visible');

    // Enter password
    await page.fill('input[type="password"]', 'admin1');
    console.log('✓ Entered password: admin1');
    await page.waitForTimeout(500);

    // Take screenshot before login
    await page.screenshot({ path: 'before-login.png' });
    console.log('✓ Screenshot saved: before-login.png');

    // Click login button
    console.log('✓ Clicking login button...');
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(3000);

    // Check for error
    const hasError = await page.locator('text=סיסמה שגויה').isVisible().catch(() => false);

    if (hasError) {
      console.log('\n❌ LOGIN FAILED - Wrong password error shown');
      await page.screenshot({ path: 'login-failed-admin1.png', fullPage: true });
      console.log('Screenshot saved: login-failed-admin1.png');
      console.log('\n💡 Possible issues:');
      console.log('1. Password hash not updated in environment');
      console.log('2. Server needs restart to load new env variables');
      console.log('3. Bcrypt comparison failing');
    } else {
      // Check URL
      const url = page.url();
      console.log(`\nCurrent URL: ${url}`);

      if (url.includes('/admin')) {
        console.log('\n✅ LOGIN SUCCESSFUL!');
        console.log('✓ Redirected to admin panel');
        await page.screenshot({ path: 'login-success-admin1.png', fullPage: true });
        console.log('✓ Screenshot saved: login-success-admin1.png');

        // Verify we're on the dashboard
        await page.waitForSelector('text=ברוכים הבאים', { timeout: 3000 }).catch(() => {});
        const hasDashboard = await page.locator('text=ברוכים הבאים').isVisible().catch(() => false);
        if (hasDashboard) {
          console.log('✓ Dashboard loaded successfully');
        }
      } else {
        console.log(`\n⚠ Unexpected URL: ${url}`);
        await page.screenshot({ path: 'login-unexpected-admin1.png', fullPage: true });
      }
    }

    console.log('\n✅ Test completed!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-error-admin1.png', fullPage: true });
    console.log('Error screenshot saved: test-error-admin1.png\n');
  } finally {
    await browser.close();
  }
})();
