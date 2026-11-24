import { test, expect } from '@playwright/test'

// Read-only: only navigates public pages, so there is no test data to clean up.
// Regression: BackToHomeGuard used the instance-patched history.replaceState/pushState, so Next's router
// believed the page was `/he`, rewrote the address bar to `/he`, and a refresh then loaded the home page.

test.use({ viewport: { width: 375, height: 812 } })

const DEEP_PAGES = ['/he/kiss-and-ride', '/he/committee-corner']

for (const path of DEEP_PAGES) {
  test.describe(`Back-to-home guard on a directly opened deep link: ${path}`, () => {
    test('the address bar keeps the deep URL and the deep page stays on screen', async ({ page }) => {
      await page.addInitScript(() => {
        // Record every History API call made through the (Next-patched) window.history
        const w = window as unknown as { __h: string[] }
        w.__h = []
        for (const m of ['pushState', 'replaceState'] as const) {
          const original = history[m].bind(history)
          history[m] = (s: unknown, t: string, u?: string | URL | null) => {
            w.__h.push(`${m}(${u})`)
            return original(s, t, u)
          }
        }
      })
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500) // let the guard (a post-mount effect) run

      expect(new URL(page.url()).pathname).toBe(path)
      expect(await page.evaluate(() => (window as unknown as { __h: string[] }).__h)).not.toContain('replaceState(/he)')
      await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(/כל מה שקורה בבית הספר בארי/)
    })

    test('a refresh stays on the deep page (it used to load the home page)', async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)
      const heading = await page.getByRole('heading', { level: 1 }).innerText()

      await page.reload()
      await page.waitForLoadState('networkidle')
      expect(new URL(page.url()).pathname).toBe(path)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
    })

    test('Back from the deep page ends on the home page, not outside the app', async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1500)

      await page.evaluate(() => history.back())
      await expect(page).toHaveURL(/\/he\/?$/)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(/כל מה שקורה בבית הספר בארי/)
    })
  })
}

test('opening the home page directly does not insert extra history entries', async ({ page }) => {
  await page.goto('/he')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)
  // about:blank + the home page itself
  expect(await page.evaluate(() => history.length)).toBe(2)
})
