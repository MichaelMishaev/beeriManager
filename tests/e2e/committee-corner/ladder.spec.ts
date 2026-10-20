import { test, expect } from '@playwright/test'

// Read-only: the committee corner renders static data, so there is no test data to clean up.

test.use({ viewport: { width: 375, height: 812 } })

test.describe('Committee corner — authority ladder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/he/committee-corner')
    await page.waitForLoadState('networkidle') // dev server may self-reload on first hit
  })

  test('shows the 4 levels in order, the proposal badge, and no horizontal scroll', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('פינת ועד ההורים של בארי')

    const levels = page.getByTestId('ladder-level').getByRole('heading', { level: 2 })
    await expect(levels).toHaveText([
      'ארצי · משרד החינוך',
      'עירוני · עיריית נתניה',
      'בית ספרי · ועד ההורים של בארי',
      'כיתתי · ועדי הכיתות',
    ])

    // Proposal status is visible on the class-level card without opening anything
    const classCard = page.getByRole('link', { name: /תקנון ועדי כיתות/ })
    await expect(classCard).toHaveAttribute('href', '/he/class-committee-bylaws')
    await expect(classCard.getByText('הצעה — טרם אושרה')).toBeVisible()

    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }))
    expect(sw).toBe(cw)
  })

  test('bottom button opens the class reps sheet; members without a phone have no call link', async ({ page }) => {
    await page.getByRole('button', { name: 'נציג/ת הכיתה שלי' }).click()

    const sheet = page.getByRole('dialog', { name: 'נציגי הכיתה' })
    await expect(sheet).toBeVisible()

    // ד׳ has both kinds of rows: ד1/ד2 without a phone, ד3/ד4 with one
    await sheet.getByRole('button', { name: /שכבה.*ד׳/ }).click()
    const rows = sheet.getByTestId('class-reps-list').getByRole('listitem')
    await expect(rows).toHaveCount(4)

    const noPhoneRow = rows.filter({ hasText: 'ד1' })
    await expect(noPhoneRow.getByText('אין מספר זמין')).toBeVisible()
    await expect(noPhoneRow.locator('a[href^="tel:"]')).toHaveCount(0)

    const phoneRow = rows.filter({ hasText: 'ד3' })
    await expect(phoneRow.locator('a[href^="tel:"]')).toHaveCount(1)

    // every row is either callable or says no number is available — never both
    const total = await rows.count()
    for (let i = 0; i < total; i++) {
      const row = rows.nth(i)
      const hasTel = (await row.locator('a[href^="tel:"]').count()) > 0
      const hasNoPhone = (await row.getByText('אין מספר זמין').count()) > 0
      expect(hasTel !== hasNoPhone).toBe(true)
    }

    await sheet.getByRole('button', { name: 'סגירה' }).click()
    await expect(sheet).toBeHidden()
  })
})
