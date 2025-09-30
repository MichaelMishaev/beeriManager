import { test, expect } from '@playwright/test';

test('complete login flow with redirect', async ({ page }) => {
  // Start at login page
  await page.goto('http://localhost:4500/login');

  console.log('1. On login page');

  // Fill password
  await page.fill('input[type="password"]', '6262');
  console.log('2. Password filled');

  // Click login button
  await page.click('button[type="submit"]');
  console.log('3. Login button clicked');

  // Wait for navigation
  await page.waitForTimeout(3000);

  console.log('4. Current URL:', page.url());

  // Check cookies
  const cookies = await page.context().cookies();
  console.log('5. Cookies:', cookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })));

  // Take screenshot
  await page.screenshot({ path: 'tests/screenshots/login-flow-result.png', fullPage: true });

  // Check if we're on admin page or back on login
  const isOnAdmin = page.url().includes('/admin');
  const isOnLogin = page.url().includes('/login');

  console.log('6. On admin page:', isOnAdmin);
  console.log('7. On login page:', isOnLogin);
});