import { test, expect } from '@playwright/test'

test.describe('Task Mention Popover in Protocol View', () => {
  test('should display and interact with task mention popover', async ({ page }) => {
    // Navigate to a protocol page with task mentions
    // Note: You'll need to replace this with an actual protocol ID that has task mentions
    await page.goto('http://localhost:4500/he/protocols/19628a84-8021-4cc7-a456-fce610a598d7')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Take screenshot of the page
    await page.screenshot({ path: 'tests/screenshots/protocol-page.png', fullPage: true })

    // Look for task mention badges
    const taskBadges = page.locator('[class*="cursor-pointer"][class*="badge"]')
    const badgeCount = await taskBadges.count()

    console.log(`Found ${badgeCount} potential task badges`)

    if (badgeCount === 0) {
      console.log('No task badges found. Checking page HTML...')
      const pageContent = await page.content()
      console.log('Page content sample:', pageContent.substring(0, 1000))
    }

    // Try to find badges by text pattern (task mentions usually have specific format)
    const allBadges = page.locator('[class*="badge"]')
    const allBadgeCount = await allBadges.count()
    console.log(`Found ${allBadgeCount} total badges on page`)

    // List all badges
    for (let i = 0; i < Math.min(allBadgeCount, 10); i++) {
      const badge = allBadges.nth(i)
      const text = await badge.textContent()
      const classes = await badge.getAttribute('class')
      console.log(`Badge ${i}: "${text}" - Classes: ${classes}`)
    }

    // If we found cursor-pointer badges, try clicking one
    if (badgeCount > 0) {
      console.log('Attempting to click first task badge...')

      // Click the first task badge
      await taskBadges.first().click()

      // Wait a bit for popover to appear
      await page.waitForTimeout(500)

      // Take screenshot after click
      await page.screenshot({ path: 'tests/screenshots/after-badge-click.png', fullPage: true })

      // Check if popover appeared
      const popover = page.locator('[role="dialog"], [data-radix-popper-content-wrapper]')
      const popoverVisible = await popover.isVisible().catch(() => false)

      console.log(`Popover visible: ${popoverVisible}`)

      if (popoverVisible) {
        console.log('✅ Popover is visible!')
        const popoverText = await popover.textContent()
        console.log('Popover content:', popoverText)
      } else {
        console.log('❌ Popover is NOT visible')

        // Check if there are any errors in console
        page.on('console', msg => console.log('Browser console:', msg.text()))
        page.on('pageerror', err => console.log('Browser error:', err.message))
      }
    } else {
      console.log('No task mention badges found on the page')
    }
  })

  test('should check for task mentions in protocol content', async ({ page }) => {
    await page.goto('http://localhost:4500/he/protocols/19628a84-8021-4cc7-a456-fce610a598d7')
    await page.waitForLoadState('networkidle')

    // Check the actual content areas where task mentions should be
    const agendaContent = await page.locator('text=סדר יום').locator('..').locator('..').textContent()
    const decisionsContent = await page.locator('text=החלטות').locator('..').locator('..').textContent()

    console.log('Agenda content:', agendaContent?.substring(0, 500))
    console.log('Decisions content:', decisionsContent?.substring(0, 500))

    // Check if there are any @mentions in the content
    const hasMentions = agendaContent?.includes('@') || decisionsContent?.includes('@')
    console.log('Has @ mentions in text:', hasMentions)
  })
})
