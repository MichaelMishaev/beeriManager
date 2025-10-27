import { test } from '@playwright/test'

test('Click badge and check popover', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('[Browser]:', msg.text()))
  page.on('pageerror', err => console.log('[Error]:', err.message))

  await page.goto('http://localhost:4500/he/protocols/19628a84-8021-4cc7-a456-fce610a598d7')
  await page.waitForLoadState('networkidle')

  // Wait for hydration
  await page.waitForTimeout(3000)

  console.log('\n=== Looking for clickable badge ===\n')

  // Find the badge with cursor-pointer
  const badge = page.locator('[class*="cursor-pointer"]').first()

  // Check if it exists
  const exists = await badge.count()
  console.log(`Badge exists: ${exists > 0}`)

  if (exists > 0) {
    // Get badge text
    const badgeText = await badge.textContent()
    console.log(`Badge text: ${badgeText}`)

    // Take screenshot before click
    await page.screenshot({ path: 'tests/screenshots/before-click.png' })

    // Try to click the badge
    console.log('\n=== Clicking badge ===\n')
    await badge.click({ force: true })

    // Wait for popover to potentially appear
    await page.waitForTimeout(1000)

    // Take screenshot after click
    await page.screenshot({ path: 'tests/screenshots/after-click.png' })

    // Look for popover in various ways
    const popoverSelectors = [
      '[role="dialog"]',
      '[data-radix-popper-content-wrapper]',
      '[data-state="open"]',
      '[class*="popover"]',
      '.z-50.w-72.rounded-md.border'
    ]

    for (const selector of popoverSelectors) {
      const element = page.locator(selector)
      const count = await element.count()
      if (count > 0) {
        console.log(`✅ Found popover with selector: ${selector}`)
        const isVisible = await element.first().isVisible()
        console.log(`   Visible: ${isVisible}`)

        if (isVisible) {
          const content = await element.first().textContent()
          console.log(`   Content: ${content?.substring(0, 100)}`)
        }
      } else {
        console.log(`❌ No popover with selector: ${selector}`)
      }
    }

    // Check if there are any elements that appeared after click
    const allElements = await page.locator('body > *').evaluateAll(elements => {
      return elements.map(el => ({
        tag: el.tagName,
        classes: el.className,
        text: el.textContent?.substring(0, 50)
      }))
    })

    console.log('\n=== All direct body children ===')
    console.log(JSON.stringify(allElements, null, 2))
  } else {
    console.log('❌ No badge found')
  }
})
