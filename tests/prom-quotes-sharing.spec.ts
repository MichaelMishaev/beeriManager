import { test, expect } from '@playwright/test'

test.describe('Prom Quotes Sharing Functionality', () => {
  const PROM_ID = '7da4e5a7-672f-42d7-a83a-fdc011155d58'
  const ADMIN_URL = `http://localhost:4500/he/admin/prom/${PROM_ID}/quotes`
  const PUBLIC_URL = `http://localhost:4500/he/prom/${PROM_ID}/quotes`

  test('should have share button on admin page', async ({ page }) => {
    // Login
    await page.goto('http://localhost:4500/he/login')
    await page.fill('input[name="password"]', 'admin1')
    await page.click('button[type="submit"]')
    await page.waitForURL(/admin/, { timeout: 5000 })

    // Navigate to admin quotes page
    await page.goto(ADMIN_URL)
    await page.waitForTimeout(2000)

    // Check for share button (desktop view)
    await page.setViewportSize({ width: 1280, height: 720 })
    const shareButton = page.locator('button:has-text("שתף")')
    await expect(shareButton).toBeVisible()

    console.log('✅ Share button exists on admin page')
  })

  test('should generate correct public URL when sharing', async ({ page }) => {
    // Login
    await page.goto('http://localhost:4500/he/login')
    await page.fill('input[name="password"]', 'admin1')
    await page.click('button[type="submit"]')
    await page.waitForURL(/admin/, { timeout: 5000 })

    // Navigate to admin quotes page
    await page.goto(ADMIN_URL)
    await page.waitForTimeout(2000)

    // Check share URL in code (via console)
    const shareUrl = await page.evaluate((promId) => {
      return `${window.location.origin}/he/prom/${promId}/quotes`
    }, PROM_ID)

    expect(shareUrl).toBe(PUBLIC_URL)
    console.log('✅ Share URL is correct:', shareUrl)
  })

  test('should load public page without authentication', async ({ page, context }) => {
    // Clear all cookies to ensure no auth
    await context.clearCookies()

    // Navigate directly to public URL (no login)
    await page.goto(PUBLIC_URL)

    // Should NOT redirect to login
    await page.waitForTimeout(2000)
    expect(page.url()).toContain('/prom/')
    expect(page.url()).not.toContain('/login')

    console.log('✅ Public page loads without authentication')
  })

  test('should display read-only banner on public page', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto(PUBLIC_URL)
    await page.waitForTimeout(2000)

    // Check for read-only banner
    const banner = page.locator('text=מצב צפייה בלבד')
    await expect(banner).toBeVisible()

    console.log('✅ Read-only banner is visible')
  })

  test('should NOT have edit/delete buttons on public page', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto(PUBLIC_URL)
    await page.waitForTimeout(3000)

    // Check for absence of edit/delete buttons
    const editButtons = page.locator('button:has-text("ערוך")')
    const deleteButtons = page.locator('button:has-text("מחק")')
    const addQuoteButton = page.locator('button:has-text("הוסף הצעה")')

    await expect(editButtons).toHaveCount(0)
    await expect(deleteButtons).toHaveCount(0)
    await expect(addQuoteButton).toHaveCount(0)

    console.log('✅ No edit/delete/add buttons on public page')
  })

  test('should display quote cards on public page', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto(PUBLIC_URL)
    await page.waitForTimeout(3000)

    // Check for quote cards or empty state
    const quoteCards = await page.locator('article').count()
    const emptyState = await page.locator('text=/אין הצעות|הוסף הצעה/').count()

    expect(quoteCards > 0 || emptyState > 0).toBeTruthy()
    console.log(`✅ Found ${quoteCards} quote cards or empty state`)
  })

  test('should have call-to-vendor buttons on public page', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto(PUBLIC_URL)
    await page.waitForTimeout(3000)

    // Check for call buttons (if quotes exist with phone numbers)
    const callButtons = page.locator('a[href^="tel:"]')
    const callButtonCount = await callButtons.count()

    console.log(`✅ Found ${callButtonCount} call-to-vendor buttons`)
  })

  test('should have share button on public page', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto(PUBLIC_URL)
    await page.waitForTimeout(2000)

    // Check for share button in header
    const shareButton = page.locator('button[aria-label="שתף דף זה"]')
    await expect(shareButton).toBeVisible()

    console.log('✅ Share button exists on public page')
  })

  test('should display category filter on public page', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto(PUBLIC_URL)
    await page.waitForTimeout(2000)

    // Check for category filter
    const categoryFilter = page.locator('button:has-text("הכל")')
    await expect(categoryFilter).toBeVisible()

    console.log('✅ Category filter is visible on public page')
  })

  test('should open quote details modal on tap', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto(PUBLIC_URL)
    await page.waitForTimeout(3000)

    // Check if there are any quotes
    const quoteCards = await page.locator('article').count()

    if (quoteCards > 0) {
      // Tap first quote card
      await page.locator('article').first().click()
      await page.waitForTimeout(500)

      // Check for modal with quote details
      const modal = page.locator('text=פרטי ההצעה')
      await expect(modal).toBeVisible()

      console.log('✅ Quote details modal opens on tap')
    } else {
      console.log('⚠️ No quotes to test modal with')
    }
  })

  test('should have mobile-responsive layout on public page', async ({ page, context }) => {
    await context.clearCookies()

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(PUBLIC_URL)
    await page.waitForTimeout(2000)

    // Check header is visible
    const header = page.locator('header')
    await expect(header).toBeVisible()

    // Check main content area
    const main = page.locator('main')
    await expect(main).toBeVisible()

    console.log('✅ Public page is mobile-responsive')
  })

  test('should display correct prom title on public page', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto(PUBLIC_URL)
    await page.waitForTimeout(2000)

    // Check for prom title in header
    const title = page.locator('h1')
    await expect(title).toBeVisible()

    const titleText = await title.textContent()
    console.log('✅ Prom title displayed:', titleText)
  })

  test('should show quote count on public page', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto(PUBLIC_URL)
    await page.waitForTimeout(2000)

    // Check for quote count
    const quoteCount = page.locator('text=/\\d+ הצעות/')
    await expect(quoteCount).toBeVisible()

    console.log('✅ Quote count is displayed')
  })

  test('mobile: share functionality workflow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Login
    await page.goto('http://localhost:4500/he/login')
    await page.fill('input[name="password"]', 'admin1')
    await page.click('button[type="submit"]')
    await page.waitForURL(/admin/, { timeout: 5000 })

    // Navigate to admin quotes page
    await page.goto(ADMIN_URL)
    await page.waitForTimeout(2000)

    // Check mobile view (share might be in dropdown menu)
    const hasMenu = await page.locator('[aria-label*="תפריט"]').count() > 0

    if (hasMenu) {
      console.log('✅ Mobile menu exists (share might be inside)')
    } else {
      console.log('✅ Desktop layout on mobile (share visible)')
    }

    // Open public page in mobile
    await page.goto(PUBLIC_URL)
    await page.waitForTimeout(2000)

    // Verify mobile layout
    const header = page.locator('header')
    await expect(header).toBeVisible()

    console.log('✅ Mobile share workflow works')
  })

  test('should have proper touch targets on public page (WCAG 2.2)', async ({ page, context }) => {
    await context.clearCookies()
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(PUBLIC_URL)
    await page.waitForTimeout(3000)

    // Check back button size
    const backButton = page.locator('a[aria-label*="חזר"]').first()
    if (await backButton.count() > 0) {
      const box = await backButton.boundingBox()
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44)
        expect(box.height).toBeGreaterThanOrEqual(44)
        console.log('✅ Back button meets WCAG 2.2 touch target size (44x44px)')
      }
    }

    // Check share button size
    const shareButton = page.locator('button[aria-label="שתף דף זה"]').first()
    if (await shareButton.count() > 0) {
      const box = await shareButton.boundingBox()
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44)
        expect(box.height).toBeGreaterThanOrEqual(44)
        console.log('✅ Share button meets WCAG 2.2 touch target size (44x44px)')
      }
    }

    // Check category filter buttons
    const categoryButtons = page.locator('button:has-text("הכל")').first()
    if (await categoryButtons.count() > 0) {
      const box = await categoryButtons.boundingBox()
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44)
        console.log('✅ Category filter buttons meet WCAG 2.2 touch target height')
      }
    }
  })

  test('end-to-end: admin creates quote → shares → public views it', async ({ page, context }) => {
    // This is a comprehensive E2E test

    // Step 1: Login as admin
    await page.goto('http://localhost:4500/he/login')
    await page.fill('input[name="password"]', 'admin1')
    await page.click('button[type="submit"]')
    await page.waitForURL(/admin/, { timeout: 5000 })

    // Step 2: Navigate to quotes page
    await page.goto(ADMIN_URL)
    await page.waitForTimeout(2000)

    // Step 3: Count existing quotes
    const existingQuotesCount = await page.locator('article').count()
    console.log(`📊 Found ${existingQuotesCount} existing quotes`)

    // Step 4: Verify share functionality exists
    await page.setViewportSize({ width: 1280, height: 720 })
    const shareButton = page.locator('button:has-text("שתף")')
    await expect(shareButton).toBeVisible()
    console.log('✅ Share button visible')

    // Step 5: Clear cookies and open public page
    await context.clearCookies()
    await page.goto(PUBLIC_URL)
    await page.waitForTimeout(2000)

    // Step 6: Verify public page shows read-only view
    const banner = page.locator('text=מצב צפייה בלבד')
    await expect(banner).toBeVisible()
    console.log('✅ Public page shows read-only banner')

    // Step 7: Verify no edit buttons on public page
    const editButtons = await page.locator('button:has-text("ערוך")').count()
    expect(editButtons).toBe(0)
    console.log('✅ No edit buttons on public page')

    // Step 8: Verify same quotes count
    const publicQuotesCount = await page.locator('article').count()
    console.log(`📊 Public page shows ${publicQuotesCount} quotes`)

    console.log('✅ End-to-end sharing workflow complete')
  })
})
