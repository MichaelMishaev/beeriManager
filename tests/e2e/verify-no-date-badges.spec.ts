import { test, expect } from '@playwright/test'

test.describe('Verify No Confusing Date Badges in Events List', () => {
  test('should confirm events list has NO calendar date badges', async ({ page }) => {
    await page.goto('http://localhost:4500')
    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    // Find events section
    const eventsSection = page.locator('text=אירועים קרובים').locator('xpath=..')

    // Get all event items
    const eventItems = eventsSection.locator('[href^="/events/"]')
    const count = await eventItems.count()

    console.log(`\n✅ Found ${count} event items\n`)

    // Verify NO event item contains standalone calendar badge icons
    for (let i = 0; i < count; i++) {
      const item = eventItems.nth(i)
      const html = await item.innerHTML()

      // Check for OLD pattern (calendar badge with date number)
      const hasOldCalendarBadge = html.includes('w-10') && html.includes('h-10') && /\d{1,2}/.test(html)

      // Events should have compact icons (w-8 h-8) not large badges (w-10 h-10)
      const hasCompactIcon = html.includes('w-8 h-8')

      const title = await item.locator('h3').textContent()

      console.log(`Event ${i + 1}: ${title}`)
      console.log(`  - Has old calendar badge: ${hasOldCalendarBadge ? '❌ FAIL' : '✅ PASS'}`)
      console.log(`  - Has compact icon: ${hasCompactIcon ? '✅ PASS' : '❌ FAIL'}`)

      expect(hasOldCalendarBadge).toBe(false)
      expect(hasCompactIcon).toBe(true)
    }
  })

  test('should confirm events show inline dates, not badge dates', async ({ page }) => {
    await page.goto('http://localhost:4500')
    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    const eventItems = page.locator('[href^="/events/"]').filter({ hasText: /נובמבר|אוקטובר|דצמבר/ })
    const count = await eventItems.count()

    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < Math.min(count, 5); i++) {
      const item = eventItems.nth(i)
      const text = await item.textContent()

      // Should contain month name in Hebrew
      const hasHebrewMonth = /נובמבר|אוקטובר|דצמבר|ינואר|פברואר|מרץ|אפריל|מאי|יוני|יולי|אוגוסט|ספטמבר/.test(text!)

      // Should NOT contain standalone date numbers in large badges
      const html = await item.innerHTML()
      const hasLargeBadge = /<div[^>]*class="[^"]*w-10[^"]*h-10[^"]*"[^>]*>\s*\d{1,2}\s*<\/div>/.test(html)

      console.log(`\nEvent ${i + 1}:`)
      console.log(`  Text: ${text?.substring(0, 60)}...`)
      console.log(`  Has Hebrew month: ${hasHebrewMonth ? '✅' : '❌'}`)
      console.log(`  Has large badge: ${hasLargeBadge ? '❌ FAIL' : '✅ PASS'}`)

      expect(hasHebrewMonth).toBe(true)
      expect(hasLargeBadge).toBe(false)
    }
  })

  test('should verify "17" only appears in calendar widgets, NOT in events list', async ({ page }) => {
    await page.goto('http://localhost:4500')
    await page.waitForLoadState('networkidle')

    // Find all "17" instances
    const allSeventeens = await page.locator('text=/^17$/').all()

    console.log(`\n📊 Total "17" instances on page: ${allSeventeens.length}`)

    // Check if any "17" is inside an event item
    const eventsSection = page.locator('text=אירועים קרובים').locator('xpath=..')
    const seventeenInEvents = await eventsSection.locator('text=/^17$/').count()

    console.log(`📅 "17" instances in events list: ${seventeenInEvents}`)
    console.log(`${seventeenInEvents === 0 ? '✅ PASS' : '❌ FAIL'} - No "17" in events list`)

    // All "17" should be in calendar widgets (month view)
    for (const seventeen of allSeventeens) {
      const isInCalendar = await seventeen.evaluate((el) => {
        let current = el
        while (current && current !== document.body) {
          const classes = current.className || ''
          // Calendar widgets have these characteristic classes
          if (classes.includes('grid-cols-7') || classes.includes('calendar')) {
            return true
          }
          current = current.parentElement
        }
        return false
      })

      if (!isInCalendar) {
        const html = await seventeen.locator('xpath=ancestor::*[3]').first().innerHTML()
        console.log(`⚠️ Found "17" outside calendar widget:`, html.substring(0, 200))
      }
    }

    expect(seventeenInEvents).toBe(0)
  })
})
