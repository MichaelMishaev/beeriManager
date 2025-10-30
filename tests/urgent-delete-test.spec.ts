import { test, expect } from '@playwright/test'

test.describe('Urgent Messages - Delete Test', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:4500/login')
    await page.fill('input[type="password"]', 'admin1')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin')
  })

  test('Delete urgent message', async ({ page }) => {
    console.log('=== Starting Delete Test ===')

    // Navigate to urgent messages page
    await page.goto('http://localhost:4500/he/admin/urgent')
    await page.waitForLoadState('networkidle')
    console.log('✅ Navigated to urgent messages page')

    // Wait a bit for the page to fully load
    await page.waitForTimeout(1000)

    // Check initial message count
    const initialCount = await page.locator('[data-testid="urgent-message-card"]').count()
    console.log(`📊 Initial message count: ${initialCount}`)

    if (initialCount === 0) {
      console.log('⚠️ No messages to delete, creating one first...')

      // Create a test message
      await page.click('button:has-text("הוסף הודעה")')
      await page.waitForTimeout(500)

      // Find the form fields in the newly added message card
      await page.locator('input[placeholder*="כותרת"]').last().fill('Test Delete Message')
      await page.locator('textarea[placeholder*="תיאור"]').last().fill('This message should be deleted')

      // Click save
      await page.click('button:has-text("שמור שינויים")')

      // Wait for save and reload
      await page.waitForTimeout(2000)
      await page.waitForLoadState('networkidle')

      const countAfterCreate = await page.locator('[data-testid="urgent-message-card"]').count()
      console.log(`📊 Message count after create: ${countAfterCreate}`)
    }

    // Get current count
    const currentCount = await page.locator('[data-testid="urgent-message-card"]').count()
    console.log(`📊 Current message count: ${currentCount}`)

    // Click delete button on the first message
    console.log('🗑️ Clicking delete button...')
    // Find the delete button (the one with Trash2 icon and red color)
    const deleteButton = page.locator('[data-testid="urgent-message-card"]').first().locator('button.text-red-600').first()

    // Wait for confirmation dialog
    page.on('dialog', async dialog => {
      console.log(`💬 Dialog appeared: "${dialog.message()}"`)
      await dialog.accept()
      console.log('✅ Dialog accepted')
    })

    await deleteButton.click()
    console.log('🗑️ Delete button clicked, waiting for confirmation dialog...')

    // Wait for the delete operation to complete
    await page.waitForTimeout(2000)
    await page.waitForLoadState('networkidle')

    // Check final message count
    const finalCount = await page.locator('[data-testid="urgent-message-card"]').count()
    console.log(`📊 Final message count: ${finalCount}`)

    // Verify the message was deleted
    if (finalCount === currentCount - 1) {
      console.log('✅ Message deleted successfully!')
    } else {
      console.error(`❌ Delete failed! Expected ${currentCount - 1} messages, got ${finalCount}`)
    }

    // Take screenshot
    await page.screenshot({ path: 'test-results/urgent-delete-final.png', fullPage: true })

    // Verify via API
    const apiResponse = await page.request.get('http://localhost:4500/api/urgent-messages?all=true')
    const apiData = await apiResponse.json()
    console.log('\n📋 Database state:', JSON.stringify(apiData, null, 2))

    expect(finalCount).toBe(currentCount - 1)
  })
})
