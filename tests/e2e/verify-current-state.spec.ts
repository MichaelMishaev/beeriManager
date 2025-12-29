import { test } from '@playwright/test'

test('Verify current state after fresh restart', async ({ page }) => {
  await page.goto('http://localhost:4500')
  await page.waitForLoadState('networkidle')

  // Take full screenshot
  await page.screenshot({
    path: '/Users/michaelmishayev/Desktop/current-state-after-restart.png',
    fullPage: true
  })

  // Check events section
  const eventsSection = page.locator('text=אירועים קרובים').locator('xpath=..')
  await eventsSection.screenshot({
    path: '/Users/michaelmishayev/Desktop/events-section-after-restart.png'
  })

  // Find all event items
  const eventItems = eventsSection.locator('[href^="/events/"]')
  const count = await eventItems.count()

  console.log(`\n✅ Found ${count} event items\n`)

  // Check first 3 events for calendar badges
  for (let i = 0; i < Math.min(count, 3); i++) {
    const item = eventItems.nth(i)
    const html = await item.innerHTML()
    const title = await item.locator('h3').first().textContent()

    // Check for OLD pattern (w-16 h-16 calendar badge)
    const hasOldBadge = html.includes('w-16') && html.includes('h-16')

    // Check for NEW pattern (w-8 h-8 icon)
    const hasNewIcon = html.includes('w-8') && html.includes('h-8')

    console.log(`Event ${i + 1}: ${title}`)
    console.log(`  OLD calendar badge (w-16 h-16): ${hasOldBadge ? '❌ FOUND!' : '✅ NOT FOUND'}`)
    console.log(`  NEW compact icon (w-8 h-8): ${hasNewIcon ? '✅ FOUND' : '❌ NOT FOUND'}`)
  }

  console.log('\n📸 Screenshots saved')
})
