import { test } from '@playwright/test'

test('Find calendar icon badges with numbers in events list', async ({ page }) => {
  await page.goto('http://localhost:4500')
  await page.waitForLoadState('networkidle')

  // Find the events section
  const eventsSection = page.locator('text=אירועים קרובים').locator('xpath=..')

  // Look for any calendar icon/badge patterns
  const calendarIcons = await eventsSection.locator('[class*="calendar"], img[src*="calendar"], svg[class*="calendar"]').all()

  console.log(`\n📅 Found ${calendarIcons.length} calendar icons/badges in events section\n`)

  // Also search for any icon that might contain a date number
  const eventItems = eventsSection.locator('[href^="/events/"]')
  const count = await eventItems.count()

  for (let i = 0; i < count; i++) {
    const item = eventItems.nth(i)
    const html = await item.innerHTML()

    // Look for calendar emoji or icon with date
    const hasCalendarEmoji = html.includes('📅')
    const hasDateNumber = />\s*\d{1,2}\s*</.test(html)

    const title = await item.locator('h3').first().textContent()

    console.log(`\nEvent: ${title}`)
    console.log(`  Has 📅 emoji: ${hasCalendarEmoji}`)
    console.log(`  Has date number in badge: ${hasDateNumber}`)

    if (hasCalendarEmoji || hasDateNumber) {
      console.log(`  HTML snippet:`, html.substring(0, 500))
    }
  }

  // Take screenshot
  await eventsSection.screenshot({
    path: '/Users/michaelmishayev/Desktop/events-section-with-badges.png'
  })

  console.log('\n✅ Screenshot saved')
})
