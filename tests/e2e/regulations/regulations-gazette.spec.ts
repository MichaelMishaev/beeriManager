import { test, expect } from '@playwright/test'

// Read-only: the regulations page only renders static content, so there is no test data to clean up.

test.describe('Regulations page — gazette design', () => {
  test('he: renders the masthead, all sections and the pending-approval state', async ({ page }) => {
    await page.goto('/he/regulations')
    await page.waitForLoadState('networkidle') // dev server reloads once or twice on first hit (Firefox/WebKit)

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('תקנון הנהגת הורים')
    expect(await page.locator('main article').count()).toBeGreaterThanOrEqual(9)

    // Not approved yet: draft badge + red "pending approval" stamp, and no approval claim anywhere
    await expect(page.getByRole('status').first()).toContainText('ממתין לאישור')
    await expect(page.getByRole('img', { name: 'ממתין לאישור' })).toBeVisible()
    await expect(page.getByText('תקנון זה אושר')).toHaveCount(0)
  })

  test('ru: renders LTR with the Russian title', async ({ page }) => {
    await page.goto('/ru/regulations')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Устав')
    await expect(page.locator('[dir="ltr"] h1').first()).toBeVisible()
  })

  for (const locale of ['he', 'ru']) {
    test(`${locale}: no horizontal scroll at 375px`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await page.goto(`/${locale}/regulations`)
      await page.waitForLoadState('networkidle')

      const { sw, cw } = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
      }))
      expect(sw).toBe(cw)
    })
  }

  test('index jumps to a section and marks it current', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/he/regulations')
    await page.waitForLoadState('networkidle')

    const index = page.getByRole('navigation', { name: 'ניווט בין סעיפים' })
    const heading = page.locator('#regulations-section-9')
    const viewportHeight = page.viewportSize()!.height

    // In dev the page can reload itself once after load, which resets the scroll; retry click + check as one unit.
    await expect(async () => {
      await index.getByRole('button', { name: /החלפת יו״ר/ }).click()
      // smooth scroll takes ~1s; toBeInViewport is flaky under touch emulation, so check the real position
      await expect
        .poll(
          async () => {
            const box = await heading.boundingBox()
            return !!box && box.y >= 0 && box.y < viewportHeight
          },
          { timeout: 6000 }
        )
        .toBe(true)
    }).toPass({ timeout: 60000 })

    await expect(index.locator('[aria-current="true"]')).toContainText('החלפת יו״ר')
  })

  test('back button leaves to the homepage when opened directly (no in-app referrer)', async ({ page }) => {
    await page.goto('/he/regulations')
    await page.waitForLoadState('networkidle') // the click handler only exists after hydration
    await page.getByRole('button', { name: 'חזרה', exact: true }).click()
    await expect(page).toHaveURL(/\/he\/?$/)
  })

  test('footer has no extra bottom padding off the homepage', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/he/regulations')

    const pb = await page.locator('footer[role="contentinfo"]').evaluate((el) => getComputedStyle(el).paddingBottom)
    expect(pb).toBe('0px')
  })
})
