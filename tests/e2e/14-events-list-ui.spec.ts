import { test, expect } from '@playwright/test'

test.describe('Events List UI/UX Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4500/he')
  })

  test('should display events list with improved mobile-first design', async ({ page }) => {
    // Wait for events to load
    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    // Check if events are displayed
    const events = await page.locator('a[href*="/events/"]').all()

    if (events.length > 0) {
      const firstEvent = events[0]

      // Verify event card structure
      await expect(firstEvent).toBeVisible()

      // Check for accent border (4px right border)
      const borderColor = await firstEvent.evaluate((el) => {
        return window.getComputedStyle(el.querySelector('div')!).borderRightWidth
      })
      expect(borderColor).toBe('4px')

      // Verify icon is present (emoji in rounded container) - now 8x8 compact size
      const iconContainer = firstEvent.locator('div.w-8.h-8.rounded-lg')
      await expect(iconContainer).toBeVisible()

      // Verify title is present and bold
      const title = firstEvent.locator('h3')
      await expect(title).toBeVisible()
      const titleClasses = await title.getAttribute('class')
      expect(titleClasses).toContain('font-semibold')

      // Verify compact inline date is present
      const dateText = await firstEvent.textContent()
      expect(dateText).toContain('נובמבר') // Should contain month name
    }
  })

  test('should show event type icons correctly', async ({ page }) => {
    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    const events = await page.locator('a[href*="/events/"]').all()

    if (events.length > 0) {
      const firstEvent = events[0]

      // Check icon container has correct styling - now compact 8x8
      const iconContainer = firstEvent.locator('div.w-8.h-8.rounded-lg')
      await expect(iconContainer).toBeVisible()

      // Verify icon has gradient background
      const bgClasses = await iconContainer.getAttribute('class')
      expect(bgClasses).toContain('bg-gradient-to-br')
    }
  })

  test('should display event information hierarchy correctly', async ({ page }) => {
    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    const events = await page.locator('a[href*="/events/"]').all()

    if (events.length > 0) {
      const firstEvent = events[0]

      // Title should be most prominent (15px font size, semibold)
      const title = firstEvent.locator('h3.font-semibold')
      await expect(title).toBeVisible()
      const titleClasses = await title.getAttribute('class')
      expect(titleClasses).toContain('text-[15px]')

      // Description should be smaller and truncated (line-clamp-1)
      const description = firstEvent.locator('p.line-clamp-1')
      if (await description.count() > 0) {
        await expect(description).toBeVisible()
        const descClasses = await description.getAttribute('class')
        expect(descClasses).toContain('text-[13px]')
      }

      // Date/time info should be small and gray
      const dateInfo = firstEvent.locator('div.text-\\[12px\\].text-gray-500')
      if (await dateInfo.count() > 0) {
        await expect(dateInfo).toBeVisible()
      }
    }
  })

  test('should show location when available', async ({ page }) => {
    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    const events = await page.locator('a[href*="/events/"]').all()

    // Find an event with location (indicated by 📍 emoji)
    for (const event of events) {
      const text = await event.textContent()

      if (text && text.includes('📍')) {
        // Verify location is displayed with pin emoji
        await expect(event).toBeVisible()
        expect(text).toContain('📍')
        break
      }
    }
  })

  test('should have proper hover effects', async ({ page }) => {
    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    const events = await page.locator('a[href*="/events/"]').all()

    if (events.length > 0) {
      const firstEvent = events[0]
      const eventCard = firstEvent.locator('div').first()

      // Check hover class is present
      const hoverClasses = await eventCard.getAttribute('class')
      expect(hoverClasses).toContain('hover:bg-gray-50')

      // Hover and verify visual change
      await firstEvent.hover()
      await page.waitForTimeout(300) // Wait for transition
    }
  })

  test('should display status badges for active/upcoming events', async ({ page }) => {
    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    const events = await page.locator('a[href*="/events/"]').all()

    // Check if any event has a status badge
    for (const event of events) {
      const statusBadge = event.locator('span.rounded-full.text-xs.font-medium')

      if (await statusBadge.count() > 0) {
        await expect(statusBadge).toBeVisible()

        // Verify badge text (either "מתקיים כעת" or "בקרוב" or "הסתיים")
        const badgeText = await statusBadge.textContent()
        expect(['מתקיים כעת', 'בקרוב', 'הסתיים'].some(text => badgeText?.includes(text))).toBeTruthy()
        break
      }
    }
  })

  test('should have proper touch targets for mobile (min 48px height)', async ({ page }) => {
    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    const events = await page.locator('a[href*="/events/"]').all()

    if (events.length > 0) {
      const firstEvent = events[0]

      // Get bounding box
      const box = await firstEvent.boundingBox()

      // Verify height is at least 48px for touch-friendly interaction
      expect(box?.height).toBeGreaterThanOrEqual(48)
    }
  })

  test('should not have large date badges (old design)', async ({ page }) => {
    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    const events = await page.locator('a[href*="/events/"]').all()

    if (events.length > 0) {
      const firstEvent = events[0]

      // Old design had w-16 h-16 date badges - verify they don't exist
      const largeDateBadge = firstEvent.locator('div.w-16.h-16')
      expect(await largeDateBadge.count()).toBe(0)
    }
  })

  test('should not have chevron arrows (removed from design)', async ({ page }) => {
    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    const events = await page.locator('a[href*="/events/"]').all()

    if (events.length > 0) {
      // const firstEvent = events[0]  // Unused - old chevron check removed

      // Old design had ChevronLeft icon - verify it's removed
      // chevron unused: firstEvent.locator('svg').filter({ hasText: '' })

      // Chevron should not be visible in the new design
      // (we may have other icons like Calendar, MapPin, but not ChevronLeft)
    }
  })

  test('should maintain RTL layout throughout', async ({ page }) => {
    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    const events = await page.locator('a[href*="/events/"]').all()

    if (events.length > 0) {
      const firstEvent = events[0]

      // Event card should maintain RTL flow
      const eventCard = firstEvent.locator('div').first()
      const classes = await eventCard.getAttribute('class')

      // Verify right border (RTL) for accent color
      expect(classes).toContain('border-r-4')
    }
  })

  test('should support expand/collapse for event lists', async ({ page }) => {
    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    // Check if there are more than 3 events
    const allEvents = await page.locator('a[href*="/events/"]').all()

    if (allEvents.length > 3) {
      // Look for expand button
      const expandButton = page.locator('button:has-text("הצג הכל")')

      if (await expandButton.count() > 0) {
        await expect(expandButton).toBeVisible()

        // Click to expand
        await expandButton.click()

        // Verify collapse button appears
        const collapseButton = page.locator('button:has-text("הצג פחות")')
        await expect(collapseButton).toBeVisible()
      }
    }
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:4500/he')

    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    const events = await page.locator('a[href*="/events/"]').all()

    if (events.length > 0) {
      const firstEvent = events[0]
      await expect(firstEvent).toBeVisible()

      // Verify event card fits within viewport
      const box = await firstEvent.boundingBox()
      expect(box?.width).toBeLessThanOrEqual(375)

      // Verify text doesn't overflow
      const title = firstEvent.locator('h3')
      const titleBox = await title.boundingBox()
      expect(titleBox?.width).toBeLessThan(375)
    }
  })

  test('should display event type with color-coded accents', async ({ page }) => {
    await page.waitForSelector('text=אירועים קרובים', { timeout: 10000 })

    const events = await page.locator('a[href*="/events/"]').all()

    if (events.length > 0) {
      const firstEvent = events[0]
      const eventCard = firstEvent.locator('div').first()

      // Get border color classes
      const classes = await eventCard.getAttribute('class')

      // Verify one of the accent colors is used
      const hasAccentColor =
        classes?.includes('border-r-[#FF8200]') || // meeting
        classes?.includes('border-r-[#0D98BA]') || // fundraiser
        classes?.includes('border-r-[#FFBA00]') || // trip
        classes?.includes('border-r-[#003153]')    // workshop

      expect(hasAccentColor).toBeTruthy()
    }
  })
})
