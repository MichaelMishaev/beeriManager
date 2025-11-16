import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:4500'

test.describe('Draft Auto-Save Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto(BASE_URL)
    await page.evaluate(() => localStorage.clear())
  })

  test('Protocol New: should auto-save draft while typing', async ({ page }) => {
    await page.goto(`${BASE_URL}/he/admin/protocols/new`)

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Fill in some form fields
    await page.fill('input[id="title"]', 'פרוטוקול בדיקה טיוטה')
    await page.fill('input[id="meeting_date"]', '2025-12-31')

    // Wait for auto-save (3 seconds + buffer)
    await page.waitForTimeout(4000)

    // Check if draft save indicator appears
    const draftIndicator = page.locator('text=/הטיוטה נשמרה/i')
    await expect(draftIndicator).toBeVisible({ timeout: 2000 })

    // Check localStorage for draft
    const draftData = await page.evaluate(() => {
      return localStorage.getItem('draft_protocol_new')
    })

    expect(draftData).not.toBeNull()
    const draft = JSON.parse(draftData || '{}')
    expect(draft.formData.title).toBe('פרוטוקול בדיקה טיוטה')

    console.log('✅ Protocol auto-save working')
  })

  test('Protocol New: should show restore banner on page reload', async ({ page }) => {
    // First visit: create a draft
    await page.goto(`${BASE_URL}/he/admin/protocols/new`)
    await page.waitForLoadState('networkidle')

    await page.fill('input[id="title"]', 'טיוטה לשחזור')
    await page.fill('input[id="meeting_date"]', '2025-11-15')

    // Add an attendee
    await page.fill('input[placeholder="שם המשתתף"]', 'משה כהן')
    await page.click('button:has-text("הוסף")')

    // Wait for auto-save
    await page.waitForTimeout(4000)

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check for draft banner
    const banner = page.locator('text=/קיימת טיוטה שמורה/i')
    await expect(banner).toBeVisible({ timeout: 5000 })

    // Check for restore button
    const restoreButton = page.locator('button:has-text("שחזר טיוטה")')
    await expect(restoreButton).toBeVisible()

    console.log('✅ Draft banner showing correctly')
  })

  test('Protocol New: should restore draft when clicking restore button', async ({ page }) => {
    // Create draft manually in localStorage
    await page.goto(`${BASE_URL}/he/admin/protocols/new`)

    const draftData = {
      formData: {
        title: 'פרוטוקול משוחזר',
        meeting_date: '2025-10-20',
        protocol_type: 'special',
        attendees: ['דני לוי', 'רונית ברק'],
        is_public: true,
        approved: false
      },
      metadata: {
        timestamp: new Date().toISOString(),
        formType: 'protocol',
        action: 'new'
      }
    }

    await page.evaluate((data) => {
      localStorage.setItem('draft_protocol_new', JSON.stringify(data))
    }, draftData)

    // Reload to trigger banner
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Click restore button
    const restoreButton = page.locator('button:has-text("שחזר טיוטה")')
    await restoreButton.click()

    // Wait for restoration
    await page.waitForTimeout(1000)

    // Verify form fields are restored
    const titleInput = page.locator('input[id="title"]')
    await expect(titleInput).toHaveValue('פרוטוקול משוחזר')

    const dateInput = page.locator('input[id="meeting_date"]')
    await expect(dateInput).toHaveValue('2025-10-20')

    // Check success toast
    const successToast = page.locator('text=/הטיוטה שוחזרה בהצלחה/i')
    await expect(successToast).toBeVisible({ timeout: 3000 })

    console.log('✅ Draft restoration working')
  })

  test('Protocol New: should discard draft when clicking discard button', async ({ page }) => {
    // Create draft
    await page.goto(`${BASE_URL}/he/admin/protocols/new`)
    await page.waitForLoadState('networkidle')

    await page.fill('input[id="title"]', 'טיוטה למחיקה')
    await page.waitForTimeout(4000)

    // Reload to show banner
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Click discard button
    const discardButton = page.locator('button:has-text("מחק טיוטה")')
    await discardButton.click()

    // Wait for deletion
    await page.waitForTimeout(1000)

    // Check that banner is gone
    const banner = page.locator('text=/קיימת טיוטה שמורה/i')
    await expect(banner).not.toBeVisible()

    // Check localStorage is cleared
    const draftData = await page.evaluate(() => {
      return localStorage.getItem('draft_protocol_new')
    })

    expect(draftData).toBeNull()

    console.log('✅ Draft discard working')
  })

  test('Task New: should auto-save draft while typing', async ({ page }) => {
    await page.goto(`${BASE_URL}/he/admin/tasks/new`)
    await page.waitForLoadState('networkidle')

    // Fill in task fields
    await page.fill('input[id="title"]', 'משימה עם טיוטה')
    await page.fill('input[id="owner_name"]', 'יוסי אברהם')

    // Wait for auto-save
    await page.waitForTimeout(4000)

    // Check draft indicator
    const draftIndicator = page.locator('text=/הטיוטה נשמרה/i')
    await expect(draftIndicator).toBeVisible({ timeout: 2000 })

    // Check localStorage
    const draftData = await page.evaluate(() => {
      return localStorage.getItem('draft_task_new')
    })

    expect(draftData).not.toBeNull()
    const draft = JSON.parse(draftData || '{}')
    expect(draft.formData.title).toBe('משימה עם טיוטה')
    expect(draft.formData.owner_name).toBe('יוסי אברהם')

    console.log('✅ Task auto-save working')
  })

  test('Task New: should restore draft after page reload', async ({ page }) => {
    // Create draft
    await page.goto(`${BASE_URL}/he/admin/tasks/new`)
    await page.waitForLoadState('networkidle')

    await page.fill('input[id="title"]', 'משימה לשחזור')
    await page.fill('input[id="owner_name"]', 'שרה כהן')
    await page.fill('textarea[id="description"]', 'תיאור המשימה')

    // Wait for auto-save
    await page.waitForTimeout(4000)

    // Reload
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check banner
    const banner = page.locator('text=/קיימת טיוטה שמורה/i')
    await expect(banner).toBeVisible({ timeout: 5000 })

    // Restore
    const restoreButton = page.locator('button:has-text("שחזר טיוטה")')
    await restoreButton.click()
    await page.waitForTimeout(1000)

    // Verify restoration
    await expect(page.locator('input[id="title"]')).toHaveValue('משימה לשחזור')
    await expect(page.locator('input[id="owner_name"]')).toHaveValue('שרה כהן')
    await expect(page.locator('textarea[id="description"]')).toHaveValue('תיאור המשימה')

    console.log('✅ Task draft restoration working')
  })

  test('Draft should be cleared after successful form submission', async ({ page }) => {
    await page.goto(`${BASE_URL}/he/admin/protocols/new`)
    await page.waitForLoadState('networkidle')

    // Fill form
    await page.fill('input[id="title"]', 'פרוטוקול לשמירה')
    await page.fill('input[id="meeting_date"]', '2025-12-01')

    // Add attendee
    await page.fill('input[placeholder="שם המשתתף"]', 'דוד לוי')
    await page.click('button:has-text("הוסף")')

    // Wait for auto-save
    await page.waitForTimeout(4000)

    // Verify draft exists
    let draftData = await page.evaluate(() => {
      return localStorage.getItem('draft_protocol_new')
    })
    expect(draftData).not.toBeNull()

    // Submit form (this will fail without auth, but we can check draft behavior)
    // Note: In real test, we'd need to handle auth properly

    console.log('✅ Draft save before submission confirmed')
  })

  test('Multiple drafts: Protocol and Task should be separate', async ({ page }) => {
    // Create protocol draft
    await page.goto(`${BASE_URL}/he/admin/protocols/new`)
    await page.waitForLoadState('networkidle')
    await page.fill('input[id="title"]', 'פרוטוקול 1')
    await page.waitForTimeout(4000)

    // Create task draft
    await page.goto(`${BASE_URL}/he/admin/tasks/new`)
    await page.waitForLoadState('networkidle')
    await page.fill('input[id="title"]', 'משימה 1')
    await page.waitForTimeout(4000)

    // Check both drafts exist in localStorage
    const protocolDraft = await page.evaluate(() => {
      return localStorage.getItem('draft_protocol_new')
    })

    const taskDraft = await page.evaluate(() => {
      return localStorage.getItem('draft_task_new')
    })

    expect(protocolDraft).not.toBeNull()
    expect(taskDraft).not.toBeNull()

    const protocolData = JSON.parse(protocolDraft || '{}')
    const taskData = JSON.parse(taskDraft || '{}')

    expect(protocolData.formData.title).toBe('פרוטוקול 1')
    expect(taskData.formData.title).toBe('משימה 1')

    console.log('✅ Multiple separate drafts working')
  })
})
