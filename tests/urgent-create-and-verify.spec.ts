import { test, expect } from '@playwright/test'

test.describe('Urgent Messages - Create and Verify', () => {
  test('Create message and verify it appears on both admin and public pages', async ({ page }) => {
    console.log('\n=== STARTING CREATE AND VERIFY TEST ===\n')

    // Step 1: Login as admin
    await page.goto('http://localhost:4500/login')
    await page.fill('input[type="password"]', 'admin1')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin')
    console.log('✅ Step 1: Logged in as admin')

    // Step 2: Navigate to urgent messages admin
    await page.goto('http://localhost:4500/he/admin/urgent')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    console.log('✅ Step 2: Navigated to urgent messages admin')

    // Step 3: Check if there are existing messages
    const existingCount = await page.locator('[data-testid="urgent-message-card"]').count()
    console.log(`📊 Step 3: Found ${existingCount} existing messages`)

    // Step 4: Create a new message
    const testId = Date.now()
    console.log(`\n➕ Step 4: Creating new message with ID ${testId}`)

    await page.click('button:has-text("הוסף הודעה")')
    await page.waitForTimeout(1000)

    // Fill the form
    await page.locator('input[placeholder*="כותרת"]').last().fill(`Test Message ${testId}`)
    await page.locator('input[placeholder*="Заголовок"]').last().fill(`Test Message ${testId} RU`)
    await page.locator('textarea[placeholder*="תיאור"]').last().fill('This message should appear for all parents')
    await page.locator('textarea[placeholder*="תיאור"]').last().press('Tab')
    await page.locator('textarea[placeholder*="Описание"]').last().fill('This message should appear for all parents RU')

    // Set dates (today to next week)
    const today = new Date().toISOString().split('T')[0]
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const dateInputs = await page.locator('input[type="date"]').all()
    await dateInputs[dateInputs.length - 2].fill(today)
    await dateInputs[dateInputs.length - 1].fill(nextWeek)

    console.log(`✅ Step 4: Filled form with dates ${today} to ${nextWeek}`)

    // Take screenshot before saving
    await page.screenshot({ path: 'test-results/before-save.png', fullPage: true })

    // Step 5: Save the message
    console.log('\n💾 Step 5: Saving message...')
    await page.click('button:has-text("שמור שינויים")')
    await page.waitForTimeout(3000)
    await page.waitForLoadState('networkidle')

    // Step 6: Verify in admin panel
    console.log('\n🔍 Step 6: Verifying in admin panel...')
    const finalCount = await page.locator('[data-testid="urgent-message-card"]').count()
    console.log(`📊 Messages in admin panel: ${finalCount}`)

    await page.screenshot({ path: 'test-results/after-save-admin.png', fullPage: true })

    expect(finalCount).toBeGreaterThan(existingCount)

    // Step 7: Check API
    console.log('\n📡 Step 7: Checking API...')
    const apiResponse = await page.request.get('http://localhost:4500/api/urgent-messages?all=true')
    const apiData = await apiResponse.json()
    console.log(`📋 Database has ${apiData.data?.length || 0} messages`)

    if (apiData.data && apiData.data.length > 0) {
      console.log('Messages in database:')
      apiData.data.forEach((msg: any) => {
        console.log(`  - ${msg.title_he} (${msg.is_active ? 'active' : 'inactive'})`)
      })
    }

    const ourMessage = apiData.data?.find((m: any) => m.title_he.includes(`Test Message ${testId}`))
    expect(ourMessage).toBeTruthy()
    console.log('✅ Message found in database')

    // Step 8: Check public API
    console.log('\n🌐 Step 8: Checking public API...')
    const publicApiResponse = await page.request.get('http://localhost:4500/api/urgent-messages')
    const publicApiData = await publicApiResponse.json()
    console.log(`📋 Public API returns ${publicApiData.data?.length || 0} messages`)

    const ourPublicMessage = publicApiData.data?.find((m: any) => m.title_he.includes(`Test Message ${testId}`))
    expect(ourPublicMessage).toBeTruthy()
    console.log('✅ Message found in public API')

    // Step 9: Visit public homepage
    console.log('\n🏠 Step 9: Visiting public homepage...')

    // Logout first
    await page.goto('http://localhost:4500/api/auth/logout')
    await page.waitForTimeout(1000)

    // Clear dismissed messages
    await page.goto('http://localhost:4500/he')
    await page.evaluate(() => {
      localStorage.removeItem('dismissed-urgent-messages')
    })

    // Reload
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Take screenshot
    await page.screenshot({ path: 'test-results/public-homepage-final.png', fullPage: true })

    // Step 10: Verify message is visible on public page
    console.log('\n✅ Step 10: Verifying message on public homepage...')
    const messageVisible = await page.getByText(`Test Message ${testId}`).first().isVisible({ timeout: 5000 }).catch(() => false)
    console.log(`🔍 Message visible on public page: ${messageVisible}`)

    expect(messageVisible).toBe(true)

    console.log('\n✅✅✅ TEST PASSED - MESSAGE APPEARS ON BOTH ADMIN AND PUBLIC PAGES ✅✅✅\n')
  })
})
