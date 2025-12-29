import { test } from '@playwright/test'

test('Debug new quotes page', async ({ page }) => {
  // Listen for console messages
  const consoleMessages: string[] = []
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`)
    console.log(`[CONSOLE ${msg.type()}]`, msg.text())
  })

  // Listen for page errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message)
  })

  // Navigate
  await page.goto('http://localhost:4500/he/admin/prom/7da4e5a7-672f-42d7-a83a-fdc011155d58/quotes')

  // Wait a bit for React to load
  await page.waitForTimeout(3000)

  // Take screenshot
  await page.screenshot({ path: 'debug-new-page.png', fullPage: true })

  // Check what's visible
  console.log('=== PAGE CONTENT ===')
  const bodyText = await page.locator('body').textContent()
  console.log(bodyText?.substring(0, 500))

  // Check for main elements
  const header = await page.locator('header').count()
  const main = await page.locator('main').count()
  const articles = await page.locator('article').count()

  console.log(`Header count: ${header}`)
  console.log(`Main count: ${main}`)
  console.log(`Article count: ${articles}`)

  // Check for error messages
  const errors = await page.locator('text=/error|שגיאה/i').count()
  console.log(`Error messages: ${errors}`)

  // Log all console messages
  console.log('=== CONSOLE MESSAGES ===')
  consoleMessages.forEach(msg => console.log(msg))
})
