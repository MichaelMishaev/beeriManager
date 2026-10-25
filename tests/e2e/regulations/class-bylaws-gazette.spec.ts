import { test, expect } from '@playwright/test'

// Read-only: static approved document, no test data to clean up.

test.describe('Class committee bylaws page — gazette design', () => {
  test('he: shows the bylaws as approved, not as a draft', async ({ page }) => {
    await page.goto('/he/class-committee-bylaws')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('תקנון ועדי כיתות')
    // data footer is shown verbatim in the notice box
    // (the same text also exists in the aria-hidden PDF layout, so take the first = visible one)
    await expect(page.getByText('תקנון זה אושר על ידי הנהגת ההורים').first()).toBeVisible()
    // no leftover draft wording
    await expect(page.getByText('טרם אושר')).toHaveCount(0)
  })

  test('ru: renders LTR', async ({ page }) => {
    await page.goto('/ru/class-committee-bylaws')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Устав классных комитетов')
    await expect(page.locator('[dir="ltr"] h1').first()).toBeVisible()
  })

  test('page <title> follows the locale (was hard-coded Hebrew)', async ({ page }) => {
    const open = async (path: string) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle') // let dev-mode self-reloads finish before the next navigation
    }

    await open('/ru/class-committee-bylaws')
    await expect(page).toHaveTitle(/Устав классных комитетов/)

    await open('/ru/regulations')
    await expect(page).toHaveTitle(/Устав родительского комитета/)

    await open('/he/regulations')
    await expect(page).toHaveTitle(/תקנון הנהגת הורים/)
  })

  for (const locale of ['he', 'ru']) {
    test(`${locale}: no horizontal scroll at 375px`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await page.goto(`/${locale}/class-committee-bylaws`)
      await page.waitForLoadState('networkidle')

      const { sw, cw } = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
      }))
      expect(sw).toBe(cw)
    })
  }
})
