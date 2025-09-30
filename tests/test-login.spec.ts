import { test, expect } from '@playwright/test';

test('test login with password 6262', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:4500/login');

  // Fill password field
  await page.fill('input[type="password"]', '6262');

  // Click login button
  await page.click('button:has-text("התחבר")');

  // Wait for response
  await page.waitForTimeout(2000);

  // Check if error message appears
  const errorMessage = await page.locator('text=סיסמה שגויה').isVisible().catch(() => false);

  if (errorMessage) {
    console.log('❌ Login failed with password 6262 - Wrong password error');
  } else {
    console.log('✅ Login successful with password 6262');
  }

  // Take screenshot
  await page.screenshot({ path: 'tests/screenshots/login-test.png', fullPage: true });

  // Log current URL
  console.log('Current URL:', page.url());
});