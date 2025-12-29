import { test } from '@playwright/test'

test('Check page loads and what content is shown', async ({ page }) => {
  test.use({ viewport: { width: 375, height: 667 } })

  // Navigate and wait
  await page.goto('http://localhost:4500/he/admin/prom/7da4e5a7-672f-42d7-a83a-fdc011155d58/quotes')
  await page.waitForTimeout(3000)

  // Take screenshot
  await page.screenshot({ path: 'test-page-load.png', fullPage: true })

  // Get all text content
  const bodyText = await page.locator('body').textContent()
  console.log('=== PAGE TEXT CONTENT ===')
  console.log(bodyText)

  // Check for errors
  const errorMessages = await page.locator('text=/error|שגיאה/i').count()
  console.log('=== ERROR COUNT ===', errorMessages)

  // Check what elements exist
  const articleCount = await page.locator('article').count()
  console.log('=== ARTICLE COUNT ===', articleCount)

  const cardCount = await page.locator('[class*="QuoteCard"]').count()
  console.log('=== CARD COUNT ===', cardCount)

  // Check main elements
  console.log('Header exists:', await page.locator('header').count())
  console.log('Main exists:', await page.locator('main').count())
  console.log('Mobile bottom bar:', await page.locator('text=/הוסף הצעה/').count())
})
