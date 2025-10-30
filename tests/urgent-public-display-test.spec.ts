import { test, expect } from '@playwright/test'

test.describe('Urgent Messages - Public Display Test', () => {
  test('Public users should see active urgent messages', async ({ page }) => {
    console.log('=== Starting Public Display Test ===')

    // First, clear any dismissed messages from localStorage
    await page.goto('http://localhost:4500/he')
    await page.evaluate(() => {
      localStorage.removeItem('dismissed-urgent-messages')
    })
    console.log('✅ Cleared dismissed messages from localStorage')

    // Check what the API returns
    const apiResponse = await page.request.get('http://localhost:4500/api/urgent-messages')
    const apiData = await apiResponse.json()
    console.log(`\n📋 API Response:`, JSON.stringify(apiData, null, 2))

    const expectedCount = apiData.data?.length || 0
    console.log(`📊 Expected ${expectedCount} messages to be visible`)

    // Reload the homepage
    await page.goto('http://localhost:4500/he')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Take screenshot
    await page.screenshot({ path: 'test-results/public-homepage.png', fullPage: true })

    // Check if urgent messages banner is visible
    const bannerExists = await page.locator('.space-y-3').first().isVisible().catch(() => false)
    console.log(`🔍 Banner visible: ${bannerExists}`)

    if (expectedCount > 0) {
      // Should have messages
      expect(bannerExists).toBe(true)
      console.log('✅ Messages are displayed correctly')
    } else {
      console.log('ℹ️  No active messages to display')
    }

    console.log('\n✅ TEST COMPLETE\n')
  })

  test('Create message in admin and verify it appears on public page', async ({ page }) => {
    console.log('=== Starting End-to-End Test ===')

    // Step 1: Login as admin
    await page.goto('http://localhost:4500/login')
    await page.fill('input[type="password"]', 'admin1')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin')
    console.log('✅ Logged in as admin')

    // Step 2: Go to urgent messages admin
    await page.goto('http://localhost:4500/he/admin/urgent')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    console.log('✅ Navigated to urgent messages admin')

    // Step 3: Delete all existing messages
    const initialCount = await page.locator('[data-testid="urgent-message-card"]').count()
    console.log(`📊 Found ${initialCount} existing messages`)

    for (let i = 0; i < initialCount; i++) {
      page.once('dialog', dialog => dialog.accept())
      await page.locator('[data-testid="urgent-message-card"]').first().locator('button.text-red-600').click()
      await page.waitForTimeout(2000)
    }
    console.log('✅ Deleted all existing messages')

    // Step 4: Create a new test message
    const testId = Date.now()
    await page.click('button:has-text("הוסף הודעה")')
    await page.waitForTimeout(500)

    await page.locator('input[placeholder*="כותרת"]').last().fill(`Test Message ${testId}`)
    await page.locator('textarea[placeholder*="תיאור"]').last().fill('This is a test for public display')

    // Set active and dates
    const today = new Date().toISOString().split('T')[0]
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    await page.locator('input[type="date"]').first().fill(today)
    await page.locator('input[type="date"]').last().fill(nextWeek)

    console.log(`✅ Created message with title: Test Message ${testId}`)

    // Step 5: Save the message
    await page.click('button:has-text("שמור שינויים")')
    await page.waitForTimeout(3000)
    await page.waitForLoadState('networkidle')
    console.log('✅ Saved message')

    // Step 6: Verify in API
    const apiResponse = await page.request.get('http://localhost:4500/api/urgent-messages')
    const apiData = await apiResponse.json()
    console.log(`\n📋 Public API returned ${apiData.data?.length || 0} messages`)

    const ourMessage = apiData.data?.find((m: any) => m.title_he.includes(`Test Message ${testId}`))
    console.log(`🔍 Our message found: ${!!ourMessage}`)

    expect(ourMessage).toBeTruthy()

    // Step 7: Go to public homepage (logout first)
    await page.goto('http://localhost:4500/api/auth/logout')
    await page.waitForTimeout(1000)

    await page.goto('http://localhost:4500/he')
    await page.evaluate(() => {
      localStorage.removeItem('dismissed-urgent-messages')
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    console.log('✅ Navigated to public homepage')

    // Step 8: Take screenshot
    await page.screenshot({ path: 'test-results/public-with-message.png', fullPage: true })

    // Step 9: Verify message is displayed
    const messageVisible = await page.getByText(`Test Message ${testId}`).isVisible().catch(() => false)
    console.log(`🔍 Message visible on public page: ${messageVisible}`)

    expect(messageVisible).toBe(true)

    console.log('\n✅ END-TO-END TEST COMPLETE\n')
  })
})
