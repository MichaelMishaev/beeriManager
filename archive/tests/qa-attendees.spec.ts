import { test, expect } from '@playwright/test'

test.describe('Protocol Attendees QA', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto('http://localhost:4500/he/login')

    // Login as admin
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'your-password')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/he/admin**', { timeout: 10000 })
  })

  test('should show attendees section on protocol edit page', async ({ page }) => {
    console.log('🔍 Testing Protocol Edit Page - Attendees Section')

    // Navigate to protocols admin page
    await page.goto('http://localhost:4500/he/admin/protocols')
    await page.waitForLoadState('networkidle')

    // Find first protocol and click edit
    const editButton = page.locator('a[href*="/admin/protocols/"]').first()
    await editButton.click()
    await page.waitForLoadState('networkidle')

    // Take screenshot of full page
    await page.screenshot({ path: 'tests/screenshots/edit-page-full.png', fullPage: true })

    // Check if attendees section exists
    const attendeesCard = page.locator('text=משתתפים *')
    const attendeesExists = await attendeesCard.count()

    console.log(`✅ Attendees card found: ${attendeesExists > 0}`)

    if (attendeesExists === 0) {
      console.log('❌ ATTENDEES SECTION NOT FOUND!')
      console.log('📸 Screenshot saved to: tests/screenshots/edit-page-full.png')

      // Get all card titles on page
      const allCardTitles = await page.locator('.space-y-6 [class*="CardTitle"]').allTextContents()
      console.log('📋 Found card titles:', allCardTitles)
    } else {
      console.log('✅ Attendees section exists!')

      // Check for input field
      const inputField = page.locator('input[placeholder="שם המשתתף"]')
      const inputExists = await inputField.count()
      console.log(`✅ Input field found: ${inputExists > 0}`)

      // Check for add button
      const addButton = page.locator('button:has-text("הוסף")')
      const buttonExists = await addButton.count()
      console.log(`✅ Add button found: ${buttonExists > 0}`)

      // Take screenshot of attendees section
      await attendeesCard.screenshot({ path: 'tests/screenshots/attendees-section.png' })
      console.log('📸 Attendees section screenshot saved')
    }

    // Check HTML structure
    const pageHTML = await page.content()
    const hasAttendeesInHTML = pageHTML.includes('משתתפים')
    console.log(`✅ "משתתפים" found in HTML: ${hasAttendeesInHTML}`)

    expect(attendeesExists).toBeGreaterThan(0)
  })

  test('should display attendees on protocol detail page', async ({ page }) => {
    console.log('🔍 Testing Protocol Detail Page - Attendees Display')

    // Navigate to first protocol
    await page.goto('http://localhost:4500/he/protocols')
    await page.waitForLoadState('networkidle')

    // Click on first protocol
    const firstProtocol = page.locator('a[href*="/protocols/"]').first()
    await firstProtocol.click()
    await page.waitForLoadState('networkidle')

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/detail-page-full.png', fullPage: true })

    // Check for attendees in sidebar
    const attendeesLabel = page.locator('text=משתתפים:')
    const attendeesExists = await attendeesLabel.count()

    console.log(`✅ Attendees label found in sidebar: ${attendeesExists > 0}`)

    if (attendeesExists === 0) {
      console.log('❌ ATTENDEES NOT SHOWN IN SIDEBAR!')

      // Get all sidebar text
      const sidebarText = await page.locator('.space-y-6 .space-y-4').allTextContents()
      console.log('📋 Sidebar content:', sidebarText)
    } else {
      console.log('✅ Attendees shown in sidebar!')

      // Get attendees list
      const attendeesList = await page.locator('text=משתתפים:').locator('..').locator('p').allTextContents()
      console.log(`👥 Attendees found: ${attendeesList.length}`)
      console.log(`👥 Attendees: ${attendeesList.join(', ')}`)
    }

    expect(attendeesExists).toBeGreaterThan(0)
  })
})
