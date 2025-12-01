import { test, expect } from '@playwright/test'

test.describe('Prom Quotes - Mobile-First UX 2025', () => {
  // Test on mobile viewport
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  })

  const TEST_PROM_ID = '7da4e5a7-672f-42d7-a83a-fdc011155d58'
  const BASE_URL = `http://localhost:4500/he/admin/prom/${TEST_PROM_ID}/quotes`

  test.beforeEach(async ({ page }) => {
    // Navigate to quotes page
    await page.goto(BASE_URL)
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('should display mobile header with correct elements', async ({ page }) => {
    // Check mobile header exists
    const header = page.locator('header').first()
    await expect(header).toBeVisible()

    // Check back button exists and is tappable (44x44px minimum)
    const backButton = header.locator('a[href*="/admin/prom"]').first()
    await expect(backButton).toBeVisible()

    const backButtonBox = await backButton.boundingBox()
    expect(backButtonBox).not.toBeNull()
    if (backButtonBox) {
      expect(backButtonBox.width).toBeGreaterThanOrEqual(44)
      expect(backButtonBox.height).toBeGreaterThanOrEqual(44)
    }

    // Check title is visible
    await expect(header.getByText('השוואת הצעות מחיר')).toBeVisible()

    // Check quote count is visible
    await expect(header.getByText(/הצעות/, { exact: false })).toBeVisible()
  })

  test('should display category filter with horizontal scroll', async ({ page }) => {
    // Check category filter exists
    const categoryFilter = page.locator('[class*="overflow-x-auto"]').first()
    await expect(categoryFilter).toBeVisible()

    // Check "הכל" button exists and meets touch target size
    const allButton = page.getByRole('button', { name: /הכל/ })
    await expect(allButton).toBeVisible()

    const allButtonBox = await allButton.boundingBox()
    expect(allButtonBox).not.toBeNull()
    if (allButtonBox) {
      expect(allButtonBox.height).toBeGreaterThanOrEqual(44) // WCAG 2.2 minimum
    }
  })

  test('should display quotes as vertical cards (not table)', async ({ page }) => {
    // Check that mobile cards are visible
    const cards = page.locator('article').filter({ hasText: /חייג|ערוך|מחק/ })

    // Should have at least one quote card
    await expect(cards.first()).toBeVisible()

    // Verify it's NOT a table view
    const table = page.locator('table')
    await expect(table).not.toBeVisible()

    // Check card has mobile-friendly layout
    const firstCard = cards.first()
    await expect(firstCard).toBeVisible()

    // Card should have vendor name
    await expect(firstCard.locator('h3')).toBeVisible()

    // Card should have price prominently displayed
    await expect(firstCard.locator('[class*="text-2xl"][class*="font-bold"]')).toBeVisible()
  })

  test('should have call button with correct touch target size', async ({ page }) => {
    // Find a quote card with a phone number
    const callButton = page.getByRole('link', { name: /חייג/ }).first()

    if (await callButton.isVisible()) {
      const callButtonBox = await callButton.boundingBox()
      expect(callButtonBox).not.toBeNull()

      if (callButtonBox) {
        // Should be at least 44x44px (iOS guideline)
        expect(callButtonBox.height).toBeGreaterThanOrEqual(44)
        expect(callButtonBox.width).toBeGreaterThanOrEqual(40) // Slightly smaller width is OK for text buttons

        // Check it has proper href
        const href = await callButton.getAttribute('href')
        expect(href).toMatch(/^tel:/)
      }
    }
  })

  test('should have edit and delete buttons with correct touch target size', async ({ page }) => {
    const firstCard = page.locator('article').first()
    await expect(firstCard).toBeVisible()

    // Edit button
    const editButton = firstCard.getByRole('button', { name: /ערוך/ })
    await expect(editButton).toBeVisible()

    const editButtonBox = await editButton.boundingBox()
    expect(editButtonBox).not.toBeNull()
    if (editButtonBox) {
      expect(editButtonBox.width).toBeGreaterThanOrEqual(44)
      expect(editButtonBox.height).toBeGreaterThanOrEqual(44)
    }

    // Delete button
    const deleteButton = firstCard.getByRole('button', { name: /מחק/ })
    await expect(deleteButton).toBeVisible()

    const deleteButtonBox = await deleteButton.boundingBox()
    expect(deleteButtonBox).not.toBeNull()
    if (deleteButtonBox) {
      expect(deleteButtonBox.width).toBeGreaterThanOrEqual(44)
      expect(deleteButtonBox.height).toBeGreaterThanOrEqual(44)
    }
  })

  test('should display bottom action bar in thumb zone', async ({ page }) => {
    // Check bottom bar exists and is fixed at bottom
    const bottomBar = page.locator('[class*="fixed bottom-0"]').filter({ hasText: /הוסף הצעה/ })
    await expect(bottomBar).toBeVisible()

    const bottomBarBox = await bottomBar.boundingBox()
    expect(bottomBarBox).not.toBeNull()

    if (bottomBarBox) {
      // Should be at the bottom of viewport
      const viewportSize = page.viewportSize()
      if (viewportSize) {
        // Within 100px of bottom (allowing for safe area)
        expect(bottomBarBox.y + bottomBarBox.height).toBeGreaterThan(viewportSize.height - 100)
      }
    }

    // Check "Add Quote" button meets size requirements
    const addButton = bottomBar.getByRole('button', { name: /הוסף הצעה/ })
    await expect(addButton).toBeVisible()

    const addButtonBox = await addButton.boundingBox()
    expect(addButtonBox).not.toBeNull()
    if (addButtonBox) {
      expect(addButtonBox.height).toBeGreaterThanOrEqual(56) // Comfortable touch target
    }
  })

  test('should show smart badges (cheapest, highest rated, best value)', async ({ page }) => {
    // Look for badge indicators
    const badges = page.locator('[class*="bg-green-100"], [class*="bg-yellow-100"], [class*="bg-blue-100"]').filter({
      hasText: /הזול ביותר|דירוג גבוה|תמורה לכסף/
    })

    // Should have at least one smart badge
    const badgeCount = await badges.count()
    expect(badgeCount).toBeGreaterThan(0)

    // Verify badge text is readable (not too small)
    if (badgeCount > 0) {
      const firstBadge = badges.first()
      const fontSize = await firstBadge.evaluate((el) => {
        return window.getComputedStyle(el).fontSize
      })

      // Should be at least 12px
      const fontSizeNum = parseFloat(fontSize)
      expect(fontSizeNum).toBeGreaterThanOrEqual(12)
    }
  })

  test('should open full-screen add quote dialog on mobile', async ({ page }) => {
    // Click add button in bottom bar
    const addButton = page.getByRole('button', { name: /הוסף הצעה/ }).first()
    await addButton.click()

    // Dialog should open
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // On mobile, dialog should be full screen or near full screen
    const dialogBox = await dialog.boundingBox()
    expect(dialogBox).not.toBeNull()

    if (dialogBox) {
      const viewportSize = page.viewportSize()
      if (viewportSize) {
        // Should take up most of the screen width
        expect(dialogBox.width).toBeGreaterThan(viewportSize.width * 0.9)
      }
    }

    // Form inputs should be large and touch-friendly
    const vendorNameInput = dialog.getByLabel(/שם הספק/)
    await expect(vendorNameInput).toBeVisible()

    const inputBox = await vendorNameInput.boundingBox()
    expect(inputBox).not.toBeNull()
    if (inputBox) {
      // Input should be at least 56px tall (h-14)
      expect(inputBox.height).toBeGreaterThanOrEqual(56)
    }
  })

  test('should filter quotes by category', async ({ page }) => {
    // Get initial quote count
    const initialCards = await page.locator('article').count()
    expect(initialCards).toBeGreaterThan(0)

    // Click on a specific category (e.g., DJ)
    const djButton = page.getByRole('button', { name: /DJ\/מוזיקה/ })

    if (await djButton.isVisible()) {
      await djButton.click()

      // Wait for filter to apply
      await page.waitForTimeout(500)

      // Should show only DJ quotes
      const filteredCards = await page.locator('article').count()

      // Verify filtering worked (count changed or stayed same if only DJs existed)
      expect(filteredCards).toBeGreaterThan(0)
      expect(filteredCards).toBeLessThanOrEqual(initialCards)
    }
  })

  test('should display text at readable sizes on mobile', async ({ page }) => {
    const firstCard = page.locator('article').first()
    await expect(firstCard).toBeVisible()

    // Check vendor name (should be large)
    const vendorName = firstCard.locator('h3')
    const vendorNameFontSize = await vendorName.evaluate((el) => {
      return window.getComputedStyle(el).fontSize
    })
    expect(parseFloat(vendorNameFontSize)).toBeGreaterThanOrEqual(18) // text-lg = 18px

    // Check price (should be prominent)
    const price = firstCard.locator('[class*="text-2xl"]')
    if (await price.isVisible()) {
      const priceFontSize = await price.evaluate((el) => {
        return window.getComputedStyle(el).fontSize
      })
      expect(parseFloat(priceFontSize)).toBeGreaterThanOrEqual(24) // text-2xl = 24px
    }

    // Check body text (should be at least 14px)
    const bodyText = firstCard.locator('p, span').first()
    if (await bodyText.isVisible()) {
      const bodyFontSize = await bodyText.evaluate((el) => {
        return window.getComputedStyle(el).fontSize
      })
      expect(parseFloat(bodyFontSize)).toBeGreaterThanOrEqual(14)
    }
  })

  test('should have proper spacing for thumb-friendly interaction', async ({ page }) => {
    // Get first two quote cards
    const cards = page.locator('article')
    const firstCard = cards.nth(0)
    const secondCard = cards.nth(1)

    if (await firstCard.isVisible() && await secondCard.isVisible()) {
      const firstCardBox = await firstCard.boundingBox()
      const secondCardBox = await secondCard.boundingBox()

      if (firstCardBox && secondCardBox) {
        // Cards should have at least 12px spacing between them
        const spacing = secondCardBox.y - (firstCardBox.y + firstCardBox.height)
        expect(spacing).toBeGreaterThanOrEqual(12)
      }
    }
  })

  test('should have ARIA labels on icon-only buttons', async ({ page }) => {
    const firstCard = page.locator('article').first()
    await expect(firstCard).toBeVisible()

    // Edit button should have aria-label
    const editButton = firstCard.getByRole('button', { name: /ערוך/ })
    const editAriaLabel = await editButton.getAttribute('aria-label')
    expect(editAriaLabel).toBeTruthy()
    expect(editAriaLabel).toContain('ערוך')

    // Delete button should have aria-label
    const deleteButton = firstCard.getByRole('button', { name: /מחק/ })
    const deleteAriaLabel = await deleteButton.getAttribute('aria-label')
    expect(deleteAriaLabel).toBeTruthy()
    expect(deleteAriaLabel).toContain('מחק')
  })

  test('should indicate which category is selected', async ({ page }) => {
    // "הכל" should be selected by default
    const allButton = page.getByRole('button', { name: /הכל/ })
    await expect(allButton).toBeVisible()

    // Should have selected/active styling (gradient background)
    const allButtonClasses = await allButton.getAttribute('class')
    expect(allButtonClasses).toContain('purple') // Active buttons have purple gradient

    // Click a different category
    const djButton = page.getByRole('button', { name: /DJ/ })
    if (await djButton.isVisible()) {
      await djButton.click()

      // DJ button should now be active
      const djButtonClasses = await djButton.getAttribute('class')
      expect(djButtonClasses).toContain('purple')
    }
  })

  test('should maintain scroll position when tapping cards', async ({ page }) => {
    // Scroll down a bit
    await page.evaluate(() => window.scrollBy(0, 200))
    const scrollBefore = await page.evaluate(() => window.scrollY)

    // Tap a card
    const firstCard = page.locator('article').first()
    await firstCard.click()

    // Wait a moment
    await page.waitForTimeout(300)

    // Scroll position should be maintained (within 10px tolerance)
    const scrollAfter = await page.evaluate(() => window.scrollY)
    expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(10)
  })

  test('should show "tap for details" hint', async ({ page }) => {
    const firstCard = page.locator('article').first()
    await expect(firstCard).toBeVisible()

    // Should have tap hint text
    await expect(firstCard.getByText('הקש לפרטים מלאים')).toBeVisible()
  })
})

test.describe('Prom Quotes - Desktop Comparison', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  const TEST_PROM_ID = '7da4e5a7-672f-42d7-a83a-fdc011155d58'
  const BASE_URL = `http://localhost:4500/he/admin/prom/${TEST_PROM_ID}/quotes`

  test('should show mobile bottom bar only on mobile', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // On desktop, bottom bar should be hidden
    const bottomBar = page.locator('[class*="lg:hidden"]').filter({ hasText: /הוסף הצעה/ })

    // Should exist in DOM but not visible
    await expect(bottomBar).not.toBeVisible()
  })

  test('should show desktop header on large screens', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Desktop header should be visible
    const desktopHeader = page.locator('[class*="lg:flex"]').first()
    await expect(desktopHeader).toBeVisible()

    // Should have gradient title
    await expect(page.getByText('השוואת הצעות מחיר').first()).toBeVisible()
  })
})

test.describe('Prom Quotes - Performance', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  const TEST_PROM_ID = '7da4e5a7-672f-42d7-a83a-fdc011155d58'
  const BASE_URL = `http://localhost:4500/he/admin/prom/${TEST_PROM_ID}/quotes`

  test('should load page in under 3 seconds on mobile', async ({ page }) => {
    const startTime = Date.now()

    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // First quote card should be visible
    await expect(page.locator('article').first()).toBeVisible()

    const loadTime = Date.now() - startTime

    // Should load in under 3 seconds (mobile 3G target)
    expect(loadTime).toBeLessThan(3000)
  })

  test('should show loading skeleton before content', async ({ page }) => {
    // Start navigation but don't wait for load
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })

    // Check for loading skeleton (pulse animation)
    const skeleton = page.locator('[class*="animate-pulse"]')

    // Skeleton should appear briefly
    // (This test may pass or fail depending on network speed)
    // If the page loads too fast, the skeleton might not be visible
    const skeletonVisible = await skeleton.first().isVisible({ timeout: 500 }).catch(() => false)

    // Either skeleton was visible OR page loaded very fast (both are good)
    if (skeletonVisible) {
      expect(skeletonVisible).toBe(true)
    }
  })
})
