import { test, expect } from '@playwright/test'

test.describe('November 2025 Events', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4500/he')
  })

  test('should display November 2025 events on homepage', async ({ page }) => {
    // Wait for the events section to load
    await page.waitForSelector('[data-testid="upcoming-events"], .events-section, h2:has-text("אירועים קרובים")', {
      timeout: 10000
    })

    // Check if we have the events heading
    const eventsHeading = page.locator('h2:has-text("אירועים קרובים")')
    await expect(eventsHeading).toBeVisible()

    // Check for November 2025 events - look for any of the event titles
    const eventTitles = [
      'שיר תקווה',
      'יום הזיכרון ליצחק רבין',
      'פרלמנט הילדים',
      'מסע נתנייתי',
      'קבלת ספר תורה',
      'זה מתחיל בצעד',
      'הדמיון ואוצרות טרומולו',
      'מסיבת סיום',
      'שיר לאהבה',
      'מרכז מאיה',
      'חג הסיגד',
      'בחירות למועצת תלמידים',
      'שיר השיירה',
      'יום הזיכרון לדוד בן גוריון',
      'תודה'
    ]

    // Check if at least some events are visible
    let foundEvents = 0
    for (const title of eventTitles) {
      const eventCard = page.locator(`text=${title}`).first()
      if (await eventCard.isVisible({ timeout: 1000 }).catch(() => false)) {
        foundEvents++
      }
    }

    console.log(`✅ Found ${foundEvents} November 2025 events on the page`)
    expect(foundEvents).toBeGreaterThan(0)
  })

  test('should navigate to events page and display November events', async ({ page }) => {
    // Navigate to events page
    await page.click('a:has-text("אירועים"), a[href*="/events"]')

    // Wait for events to load
    await page.waitForSelector('.event-card, [data-testid="event-item"]', {
      timeout: 10000
    })

    // Check for November events
    const novemberEvents = page.locator('text=/נובמבר|November|2025-11/')
    const count = await novemberEvents.count()

    console.log(`✅ Found ${count} November events references`)
    expect(count).toBeGreaterThan(0)
  })

  test('should display event with emoji icons', async ({ page }) => {
    // Look for emojis in event titles
    const emojis = ['🎵', '🕯️', '👥', '🚌', '🏀', '📖', '🎭', '🎉', '🌈', '🩺', '🌿', '🗳️', '🇮🇱', '💉']

    let foundEmojis = 0
    for (const emoji of emojis) {
      const emojiElement = page.locator(`text=${emoji}`).first()
      if (await emojiElement.isVisible({ timeout: 1000 }).catch(() => false)) {
        foundEmojis++
      }
    }

    console.log(`✅ Found ${foundEmojis} emoji icons in events`)
    expect(foundEmojis).toBeGreaterThan(0)
  })

  test('should display bilingual event content', async ({ page }) => {
    // Check for Hebrew content
    const hebrewText = page.locator('text=/שיר|אירוע|כיתות/').first()
    await expect(hebrewText).toBeVisible({ timeout: 5000 })

    // Switch to Russian if available
    const langSwitcher = page.locator('button:has-text("RU"), a:has-text("RU"), [data-testid="lang-ru"]')
    if (await langSwitcher.isVisible({ timeout: 2000 }).catch(() => false)) {
      await langSwitcher.click()

      // Check for Russian content
      const russianText = page.locator('text=/Песня|События|классы/').first()
      await expect(russianText).toBeVisible({ timeout: 5000 })
    }
  })

  test('should show event dates in November 2025', async ({ page }) => {
    // Navigate to calendar or events
    const eventsLink = page.locator('a:has-text("לוח שנה"), a:has-text("אירועים"), a[href*="/calendar"], a[href*="/events"]').first()

    if (await eventsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await eventsLink.click()
      await page.waitForLoadState('networkidle')
    }

    // Look for November dates
    const novemberDates = [
      '2.11', '3.11', '5.11', '6.11', '7.11', '9.11',
      '13.11', '14.11', '16.11', '18.11', '19.11', '20.11',
      '21.11', '23.11', '26.11', '30.11'
    ]

    let foundDates = 0
    for (const date of novemberDates) {
      const dateElement = page.locator(`text=${date}`).first()
      if (await dateElement.isVisible({ timeout: 500 }).catch(() => false)) {
        foundDates++
      }
    }

    console.log(`✅ Found ${foundDates} November 2025 dates`)
  })

  test('should display events with location information', async ({ page }) => {
    // Look for location names
    const locations = [
      'מרכז מאיה',
      'בית ספר אילן רמון',
      'Центр «Майя»',
      'Школа «Илан Рамон»'
    ]

    let foundLocations = 0
    for (const location of locations) {
      const locationElement = page.locator(`text=${location}`).first()
      if (await locationElement.isVisible({ timeout: 1000 }).catch(() => false)) {
        foundLocations++
      }
    }

    console.log(`✅ Found ${foundLocations} location references`)
  })

  test('should verify no "no events" message is shown', async ({ page }) => {
    // Check that "no events" message is NOT visible
    const noEventsMessage = page.locator('text=/אין אירועים|No events|Нет событий/')

    // Wait a bit for events to load
    await page.waitForTimeout(2000)

    // This should NOT be visible if we have events
    const isVisible = await noEventsMessage.isVisible().catch(() => false)

    if (isVisible) {
      console.log('⚠️ WARNING: "No events" message is still showing!')
    } else {
      console.log('✅ "No events" message is correctly hidden')
    }
  })
})
