const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console messages
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  try {
    console.log('Testing Holiday Modal...');

    // Navigate to homepage
    await page.goto('http://localhost:4500', { waitUntil: 'domcontentloaded' });
    console.log('✓ Loaded homepage');

    // Wait for loading to finish
    await page.waitForSelector('text=טוען...', { state: 'hidden', timeout: 10000 }).catch(() => {
      console.log('⚠ Loading indicator not found or still visible');
    });

    // Expand calendar if collapsed
    const expandButton = page.locator('button:has-text("הצג לוח שנה מלא")');
    if (await expandButton.isVisible()) {
      await expandButton.click();
      console.log('✓ Expanded calendar');
      await page.waitForTimeout(600); // Wait for animation
    }

    // Find red (school closure) days - October 2025 should have 10 red days
    const redDays = page.locator('button.bg-red-100.border-red-400');
    const count = await redDays.count();
    console.log(`✓ Found ${count} red school closure days`);

    if (count === 0) {
      throw new Error('No red school closure days found!');
    }

    // Click on the first red day (should be October 2, Yom Kippur)
    const firstRedDay = redDays.first();
    console.log('✓ Clicking on first red day...');
    await firstRedDay.click();

    // Wait for modal to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('✓ Modal opened successfully');

    // Verify modal content
    const modalTitle = await page.locator('[role="dialog"] h2').textContent();
    console.log(`✓ Modal title: "${modalTitle}"`);

    // Check for school closure badge in modal
    const schoolClosedBadge = page.locator('[role="dialog"] >> text=בית הספר סגור').first();
    if (await schoolClosedBadge.isVisible()) {
      console.log('✓ School closure badge visible in modal');
    } else {
      console.log('⚠ School closure badge not visible');
    }

    // Check for date display
    const dateSection = page.locator('[role="dialog"] >> text=תאריכים');
    if (await dateSection.isVisible()) {
      console.log('✓ Date section visible');
    }

    // Check for share button
    const shareButton = page.locator('[role="dialog"] >> button:has-text("שיתוף")');
    if (await shareButton.isVisible()) {
      console.log('✓ Share button visible');
    }

    // Take screenshot
    await page.screenshot({ path: 'holiday-modal-test.png', fullPage: true });
    console.log('✓ Screenshot saved as holiday-modal-test.png');

    // Close modal - use the main close button (not the X button)
    const closeButton = page.locator('[role="dialog"] >> button >> text="סגור"').nth(1);
    await closeButton.click();
    console.log('✓ Modal closed successfully');

    // Verify modal is gone
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 3000 });
    console.log('✓ Modal hidden after close');

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'holiday-modal-error.png', fullPage: true });
    console.log('Error screenshot saved as holiday-modal-error.png');
  } finally {
    await browser.close();
  }
})();
