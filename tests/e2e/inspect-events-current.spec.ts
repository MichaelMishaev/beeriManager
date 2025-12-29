import { test } from '@playwright/test'

test.describe('Inspect Current Events List State', () => {
  test('should capture and log current events list HTML structure', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:4500')

    // Wait for events section to load
    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    // Find all event items
    const eventItems = await page.locator('[href^="/events/"]').filter({ hasText: /נובמבר|אוקטובר|דצמבר/ })
    const count = await eventItems.count()

    console.log(`\n=== Found ${count} event items ===\n`)

    // Inspect each event item structure
    for (let i = 0; i < Math.min(count, 5); i++) {
      const item = eventItems.nth(i)
      const html = await item.innerHTML()
      const text = await item.innerText()

      console.log(`\n--- Event ${i + 1} ---`)
      console.log('Text content:', text)
      console.log('HTML structure:\n', html)

      // Check for calendar icons or badges
      const hasCalendarIcon = await item.locator('[class*="calendar"]').count() > 0
      const hasDateBadge = await item.locator('div').filter({ hasText: /^\d{1,2}$/ }).count() > 0

      console.log('Has calendar icon:', hasCalendarIcon)
      console.log('Has date badge (number only):', hasDateBadge)
    }
  })

  test('should check for calendar date badges with "17"', async ({ page }) => {
    await page.goto('http://localhost:4500')
    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    // Look for any element that shows "17" as a date badge
    const dateBadges = await page.locator('text=/^17$/').all()

    console.log(`\nFound ${dateBadges.length} elements with "17"`)

    for (let i = 0; i < dateBadges.length; i++) {
      const badge = dateBadges[i]
      const parent = await badge.locator('xpath=..').first()
      const parentHtml = await parent.innerHTML()

      console.log(`\n--- "17" instance ${i + 1} ---`)
      console.log('Parent HTML:', parentHtml)
    }
  })

  test('should take screenshot of events list', async ({ page }) => {
    await page.goto('http://localhost:4500')
    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    // Scroll to events section
    const eventsSection = await page.locator('text=אירועים קרובים')
    await eventsSection.scrollIntoViewIfNeeded()

    // Take screenshot of just the events section
    await eventsSection.locator('xpath=..').screenshot({
      path: '/Users/michaelmishayev/Desktop/current-events-list.png'
    })

    console.log('\nScreenshot saved to: /Users/michaelmishayev/Desktop/current-events-list.png')
  })
})
