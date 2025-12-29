import { test, expect } from '@playwright/test'

test.describe('Mobile Quotes Page', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should load and display mobile-first layout', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:4500/he/login')
    await page.fill('input[name="password"]', 'admin1')
    await page.click('button[type="submit"]')

    // Wait for redirect
    await page.waitForURL(/admin/, { timeout: 5000 })

    // Navigate to quotes page
    await page.goto('http://localhost:4500/he/admin/prom/7da4e5a7-672f-42d7-a83a-fdc011155d58/quotes')

    // Wait for loading to finish (loading skeleton should disappear)
    await page.waitForTimeout(5000)

    // Take screenshot
    await page.screenshot({ path: 'mobile-page-loaded.png', fullPage: true })

    // Check for mobile header
    const header = page.locator('header')
    await expect(header).toBeVisible({ timeout: 10000 })

    // Check for main content
    const main = page.locator('main')
    await expect(main).toBeVisible()

    // Check for quote cards or empty state
    const hasCards = await page.locator('article').count()
    const hasEmptyState = await page.locator('text=/אין הצעות|הוסף הצעה ראשונה/').count()

    console.log(`Cards found: ${hasCards}`)
    console.log(`Empty state: ${hasEmptyState}`)

    // Either should have cards OR empty state
    expect(hasCards > 0 || hasEmptyState > 0).toBeTruthy()

    // Check for bottom action bar
    const bottomBar = page.locator('[class*="fixed bottom"]').filter({ hasText: /הוסף הצעה/ })
    await expect(bottomBar).toBeVisible()

    console.log('✅ Mobile page loaded successfully!')
  })
})
