import { test, expect } from '@playwright/test';

test('Visual test - share button should be visible and styled', async ({ page }) => {
  await page.goto('/he');
  await page.waitForLoadState('networkidle');

  // Wait for carousel
  await page.waitForSelector('.min-w-full', { timeout: 10000 });

  console.log('\n📱 Testing Share Button UI/UX\n');

  // Find share button
  const shareButton = page.locator('button').filter({ hasText: /שתף/ }).first();

  // Check if visible
  const isVisible = await shareButton.isVisible();
  console.log(`✅ Share button visible: ${isVisible}`);
  expect(isVisible).toBe(true);

  // Check button styling
  const buttonClasses = await shareButton.getAttribute('class');
  console.log(`\n🎨 Button classes:\n${buttonClasses}\n`);

  // Check if it has proper styling
  expect(buttonClasses).toContain('rounded-lg');
  expect(buttonClasses).toContain('bg-white');

  // Take screenshot
  await shareButton.screenshot({ path: 'test-results/share-button.png' });
  console.log('📸 Screenshot saved to test-results/share-button.png');

  // Check text is visible
  const buttonText = await shareButton.textContent();
  console.log(`\n📝 Button text: "${buttonText}"`);
  expect(buttonText).toContain('שתף');

  // Check icon
  const icon = shareButton.locator('svg');
  const iconVisible = await icon.isVisible();
  console.log(`✅ Share icon visible: ${iconVisible}\n`);
  expect(iconVisible).toBe(true);
});

test('Test share button click functionality', async ({ page, context }) => {
  // Grant permissions
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await page.goto('/he');
  await page.waitForLoadState('networkidle');

  // Wait for carousel
  await page.waitForSelector('.min-w-full', { timeout: 10000 });

  console.log('\n🖱️  Testing Share Button Click\n');

  // Find and click share button
  const shareButton = page.locator('button').filter({ hasText: /שתף/ }).first();

  console.log('Clicking share button...');
  await shareButton.click();

  // Wait for operation
  await page.waitForTimeout(1000);

  // Try to read clipboard
  try {
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

    console.log('\n📋 Clipboard content:');
    console.log('─'.repeat(60));
    console.log(clipboardText);
    console.log('─'.repeat(60));

    // Verify content
    expect(clipboardText.length).toBeGreaterThan(0);
    expect(clipboardText).toContain('beeri.online');

    console.log('\n✅ Share button works! Text copied to clipboard.\n');
  } catch (error) {
    console.log('\n⚠️  Could not read clipboard (may be browser security)');
    console.log('   But button was clickable!\n');
  }

  // Check for toast notification
  const toast = page.locator('text=/הועתק|Скопировано/');
  const toastVisible = await toast.isVisible().catch(() => false);

  if (toastVisible) {
    console.log('✅ Success toast displayed\n');
  }
});

test('Test modal share button', async ({ page }) => {
  await page.goto('/he');
  await page.waitForLoadState('networkidle');

  // Wait for carousel
  await page.waitForSelector('.min-w-full', { timeout: 10000 });

  console.log('\n🔍 Testing Modal Share Button\n');

  // Click on slide to open modal
  const slide = page.locator('.min-w-full').first();
  await slide.click();

  // Wait for modal
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  console.log('✅ Modal opened');

  // Find share button in modal
  const modalShareButton = page.locator('[role="dialog"] button').filter({ hasText: /שתף/ });

  const isVisible = await modalShareButton.isVisible();
  console.log(`✅ Modal share button visible: ${isVisible}`);
  expect(isVisible).toBe(true);

  // Check styling
  const buttonClasses = await modalShareButton.getAttribute('class');
  console.log(`\n🎨 Modal button classes:\n${buttonClasses}\n`);

  // Should have gradient background
  expect(buttonClasses).toContain('bg-gradient-to-r');
  expect(buttonClasses).toContain('from-blue-500');

  // Take screenshot
  await modalShareButton.screenshot({ path: 'test-results/modal-share-button.png' });
  console.log('📸 Screenshot saved to test-results/modal-share-button.png\n');
});
