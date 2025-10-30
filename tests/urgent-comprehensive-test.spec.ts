import { test, expect } from '@playwright/test'

test.describe('Urgent Messages - Comprehensive Test', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console logs
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('[Delete]') || text.includes('[Urgent') || text.includes('SUCCESS')) {
        console.log(`🖥️  BROWSER: ${text}`)
      }
    })

    // Capture errors
    page.on('pageerror', error => {
      console.error(`❌ PAGE ERROR: ${error.message}`)
    })

    // Login
    await page.goto('http://localhost:4500/login')
    await page.fill('input[type="password"]', 'admin1')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin')
  })

  test('Full workflow: Create, Save, Delete', async ({ page }) => {
    console.log('\n=== STARTING COMPREHENSIVE TEST ===\n')

    // Navigate to urgent messages
    await page.goto('http://localhost:4500/he/admin/urgent')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Check initial state
    const initialCount = await page.locator('[data-testid="urgent-message-card"]').count()
    console.log(`📊 Step 1: Initial message count = ${initialCount}`)

    // Delete all existing messages first
    if (initialCount > 0) {
      console.log(`🗑️  Step 2: Deleting ${initialCount} existing messages...`)

      for (let i = 0; i < initialCount; i++) {
        page.once('dialog', dialog => dialog.accept())
        await page.locator('[data-testid="urgent-message-card"]').first().locator('button.text-red-600').click()
        await page.waitForTimeout(2000)
      }

      const afterDeleteCount = await page.locator('[data-testid="urgent-message-card"]').count()
      console.log(`📊 After delete: ${afterDeleteCount} messages`)
    }

    // Verify database is empty
    console.log('\n🔍 Step 3: Verifying database is empty...')
    let apiResponse = await page.request.get('http://localhost:4500/api/urgent-messages?all=true')
    let apiData = await apiResponse.json()
    console.log(`📋 Database count: ${apiData.data?.length || 0}`)

    // Create a new message
    console.log('\n➕ Step 4: Creating new message...')
    await page.click('button:has-text("הוסף הודעה")')
    await page.waitForTimeout(500)

    const messageCountAfterAdd = await page.locator('[data-testid="urgent-message-card"]').count()
    console.log(`📊 Messages after clicking add: ${messageCountAfterAdd}`)

    // Fill the form
    console.log('📝 Step 5: Filling form...')
    await page.locator('input[placeholder*="כותרת"]').last().fill('Test Message הודעת בדיקה')
    await page.locator('input[placeholder*="כותרת"]').last().press('Tab')
    await page.locator('input[placeholder*="Заголовок"]').last().fill('Test Message')
    await page.locator('textarea[placeholder*="תיאור"]').last().fill('This is a test message')

    await page.waitForTimeout(500)

    // Save
    console.log('\n💾 Step 6: Clicking save...')
    await page.click('button:has-text("שמור שינויים")')

    // Wait for save to complete
    await page.waitForTimeout(3000)
    await page.waitForLoadState('networkidle')

    // Check message count after save
    const countAfterSave = await page.locator('[data-testid="urgent-message-card"]').count()
    console.log(`📊 Messages after save: ${countAfterSave}`)

    // Verify in database
    console.log('\n🔍 Step 7: Verifying in database...')
    apiResponse = await page.request.get('http://localhost:4500/api/urgent-messages?all=true')
    apiData = await apiResponse.json()
    console.log(`📋 Database count: ${apiData.data?.length || 0}`)
    if (apiData.data && apiData.data.length > 0) {
      console.log(`📋 Message in DB:`, apiData.data[0].title_he)
    }

    // Take screenshot
    await page.screenshot({ path: 'test-results/comprehensive-after-save.png', fullPage: true })

    // Now try to delete
    if (countAfterSave > 0) {
      console.log('\n🗑️  Step 8: Deleting the message...')
      page.once('dialog', dialog => {
        console.log(`💬 Dialog: "${dialog.message()}"`)
        dialog.accept()
      })

      await page.locator('[data-testid="urgent-message-card"]').first().locator('button.text-red-600').click()
      await page.waitForTimeout(3000)
      await page.waitForLoadState('networkidle')

      const finalCount = await page.locator('[data-testid="urgent-message-card"]').count()
      console.log(`📊 Final count after delete: ${finalCount}`)

      // Verify in database
      apiResponse = await page.request.get('http://localhost:4500/api/urgent-messages?all=true')
      apiData = await apiResponse.json()
      console.log(`📋 Final database count: ${apiData.data?.length || 0}`)

      expect(finalCount).toBe(0)
      expect(apiData.data?.length || 0).toBe(0)
    }

    console.log('\n✅ TEST COMPLETE\n')
  })
})
