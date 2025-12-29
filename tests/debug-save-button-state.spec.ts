import { test } from '@playwright/test';

test('Debug save button state for problematic highlight', async ({ page }) => {
  // Login first
  await page.goto('/he/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'test');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  // Go to highlights admin
  await page.goto('/he/admin/highlights');
  await page.waitForLoadState('networkidle');

  console.log('\n🔍 Loading highlights admin page...\n');

  // Wait for highlights to load
  await page.waitForSelector('[data-testid="highlight-card"]', { timeout: 10000 });

  // Find all highlight cards
  const cards = page.locator('[data-testid="highlight-card"]');
  const count = await cards.count();

  console.log(`📊 Found ${count} highlight cards\n`);

  // Find the card with "תלמידי בארי השתתפו במירוץ חופים"
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const text = await card.textContent();

    if (text?.includes('תלמידי בארי השתתפו במירוץ חופים')) {
      console.log(`✅ Found the problematic highlight at index ${i}\n`);

      // Click edit button
      const editButton = card.locator('button').filter({
        has: page.locator('svg[class*="lucide-edit"]')
      }).first();

      await editButton.click();
      await page.waitForTimeout(500);

      console.log('📝 Edit mode opened\n');

      // Check checkbox state
      const checkbox = card.locator('input[type="checkbox"]#active-');
      const isChecked = await checkbox.evaluate((el: HTMLInputElement) => el.checked);
      console.log(`✅ Checkbox checked in UI: ${isChecked}`);

      // Check if save button exists and is enabled
      const saveButton = card.locator('button').filter({ hasText: /שמור/ }).first();
      const isDisabled = await saveButton.getAttribute('disabled');
      const buttonText = await saveButton.textContent();
      console.log(`✅ Save button text: "${buttonText}"`);
      console.log(`✅ Save button disabled: ${isDisabled !== null}`);

      // Check validation badges
      const validationBadge = card.locator('span').filter({ hasText: /חסרים שדות חובה/ }).first();
      const validationVisible = await validationBadge.isVisible().catch(() => false);
      console.log(`✅ "Missing required fields" badge visible: ${validationVisible}`);

      const readyBadge = card.locator('span').filter({ hasText: /מוכן לשמירה/ }).first();
      const readyVisible = await readyBadge.isVisible().catch(() => false);
      console.log(`✅ "Ready to save" badge visible: ${readyVisible}`);

      // Check all required fields
      const iconValue = await card.locator('select').nth(1).inputValue(); // Icon select
      const titleHeValue = await card.locator('input').first().inputValue();
      const descHeTextarea = card.locator('textarea').first();
      const descHeValue = await descHeTextarea.inputValue();
      const categoryInput = card.locator('input').nth(2); // Category input (after title)
      const categoryHeValue = await categoryInput.inputValue();

      console.log('\n📋 Required Field Values:');
      console.log(`   Icon: "${iconValue}" (length: ${iconValue.length})`);
      console.log(`   Title HE: "${titleHeValue}" (length: ${titleHeValue.length})`);
      console.log(`   Description HE: "${descHeValue}" (length: ${descHeValue.length})`);
      console.log(`   Category HE: "${categoryHeValue}" (length: ${categoryHeValue.length})`);

      // Check validation logic
      const iconValid = iconValue && iconValue.trim().length > 0;
      const titleValid = titleHeValue && titleHeValue.trim().length >= 2;
      const descValid = descHeValue && descHeValue.trim().length >= 10;
      const categoryValid = categoryHeValue && categoryHeValue.trim().length >= 2;

      console.log('\n✅ Field Validation:');
      console.log(`   Icon valid: ${iconValid}`);
      console.log(`   Title HE valid (>= 2 chars): ${titleValid}`);
      console.log(`   Description HE valid (>= 10 chars): ${descValid}`);
      console.log(`   Category HE valid (>= 2 chars): ${categoryValid}`);

      const allValid = iconValid && titleValid && descValid && categoryValid;
      console.log(`\n🎯 Overall validation should pass: ${allValid}`);

      // Now toggle the checkbox
      console.log('\n🔄 Toggling checkbox to TRUE...');
      await checkbox.click();
      await page.waitForTimeout(300);

      const isCheckedAfter = await checkbox.evaluate((el: HTMLInputElement) => el.checked);
      console.log(`✅ Checkbox after toggle: ${isCheckedAfter}`);

      // Check if save button is still enabled
      const isDisabledAfter = await saveButton.getAttribute('disabled');
      console.log(`✅ Save button disabled after toggle: ${isDisabledAfter !== null}`);

      // Try to click save button
      console.log('\n💾 Attempting to click save button...');

      // Monitor network requests
      const patchRequests: any[] = [];
      page.on('request', request => {
        if (request.method() === 'PATCH' && request.url().includes('/api/highlights/')) {
          console.log(`📡 PATCH request detected: ${request.url()}`);
          patchRequests.push({
            url: request.url(),
            body: request.postData()
          });
        }
      });

      page.on('response', response => {
        if (response.request().method() === 'PATCH' && response.url().includes('/api/highlights/')) {
          console.log(`📡 PATCH response: ${response.status()}`);
        }
      });

      // Click save
      await saveButton.click();
      await page.waitForTimeout(2000); // Wait for potential network request

      if (patchRequests.length > 0) {
        console.log(`\n✅ PATCH request WAS sent!`);
        console.log('Request body:', patchRequests[0].body);
      } else {
        console.log(`\n❌ NO PATCH request was sent!`);
        console.log('This confirms the bug: save button click does not trigger API call');
      }

      break;
    }
  }
});
