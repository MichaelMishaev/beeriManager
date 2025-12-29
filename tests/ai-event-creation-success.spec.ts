import { test, expect } from '@playwright/test'

test.describe('AI Event Creation - Success Confirmation', () => {
  test('should show beautiful success confirmation after creating event', async ({
    page,
  }) => {
    // Navigate to admin page
    await page.goto('http://localhost:4500/he/admin/events')

    // Click AI assistant button (if visible)
    const aiButton = page.locator('button:has-text("AI")')
    if (await aiButton.isVisible()) {
      await aiButton.click()

      // Wait for AI modal to open
      await expect(page.locator('text=עוזר AI - הוספה מהירה')).toBeVisible()

      // Type "אירוע" to select event type
      await page.fill('input[placeholder*="הקלד"]', 'אירוע')
      await page.keyboard.press('Enter')

      // Wait for AI response
      await page.waitForTimeout(2000)

      // Enter event details
      await page.fill(
        'input[placeholder*="הקלד"]',
        'מסיבת סיום שנה ביום שישי הקרוב בשעה 18:00 באולם בית הספר'
      )
      await page.keyboard.press('Enter')

      // Wait for confirmation modal
      await expect(page.locator('text=אישור לפני יצירה')).toBeVisible({
        timeout: 10000,
      })

      // Click confirm button
      await page.click('button:has-text("אישור ויצירה")')

      // Verify beautiful success confirmation appears
      await expect(page.locator('text=האירוע נוצר בהצלחה!')).toBeVisible({
        timeout: 5000,
      })

      // Verify success icon is visible (green checkmark)
      const successIcon = page.locator(
        '.bg-gradient-to-br.from-emerald-400.to-teal-500'
      )
      await expect(successIcon).toBeVisible()

      // Verify secondary message
      await expect(
        page.locator('text=האירוע נשמר במערכת ונוסף ללוח השנה')
      ).toBeVisible()

      // Verify auto-close message
      await expect(page.locator('text=סוגר אוטומטית...')).toBeVisible()

      // Wait for modal to auto-close (2 seconds)
      await page.waitForTimeout(2500)

      // Verify modal is closed
      await expect(page.locator('text=האירוע נוצר בהצלחה!')).not.toBeVisible()
    } else {
      console.log('AI assistant button not found, skipping test')
      test.skip()
    }
  })

  test('should NOT show ugly browser alert', async ({ page }) => {
    // Listen for browser dialogs (alerts)
    let alertShown = false
    page.on('dialog', async (dialog) => {
      alertShown = true
      await dialog.accept()
    })

    // Navigate to admin page
    await page.goto('http://localhost:4500/he/admin/events')

    // Click AI assistant button (if visible)
    const aiButton = page.locator('button:has-text("AI")')
    if (await aiButton.isVisible()) {
      await aiButton.click()

      // Create a quick event
      await page.fill('input[placeholder*="הקלד"]', 'אירוع')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(2000)

      await page.fill('input[placeholder*="הקלד"]', 'בדיקה מהירה מחר בצהריים')
      await page.keyboard.press('Enter')

      // Wait for confirmation and click
      await page.waitForSelector('text=אישור לפני יצירה', { timeout: 10000 })
      await page.click('button:has-text("אישור ויצירה")')

      // Wait a bit for any potential alert
      await page.waitForTimeout(3000)

      // Verify NO browser alert was shown
      expect(alertShown).toBe(false)
    } else {
      test.skip()
    }
  })
})
