import { test, expect, type Page } from '@playwright/test'
import {
  blockWrites,
  hasHorizontalScroll,
  loginViaApi,
  mockCounts,
  ZERO_COUNTS,
} from '../../helpers/admin.helper'

// READ-ONLY: navigation and layout measurements only. Any write request is blocked and fails the test.

test.use({ serviceWorkers: 'block' })

// First visit to a route makes the dev server compile it, which can take a while.
const SLOW = { timeout: 30_000 }

let blocked: string[] = []

test.beforeEach(async ({ page }) => {
  blocked = await blockWrites(page)
  await loginViaApi(page)
})

test.afterEach(() => {
  expect(blocked, 'no write request may leave the browser').toEqual([])
})

const BAR_KEYS = ['home', 'events', 'highlights', 'inbox', 'tickets'] as const

async function openAdmin(page: Page, path: string) {
  await page.goto(path)
  await expect(page.getByTestId('admin-bottom-bar')).toBeVisible(SLOW)
}

async function scrollToBottom(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  // Let layout settle (lazy content, fonts)
  await page.waitForTimeout(300)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
}

test.describe('Admin frame: bottom bar', () => {
  const PAGES: { name: string; path: string; current: (typeof BAR_KEYS)[number] | null }[] = [
    { name: 'hub', path: '/he/admin', current: 'home' },
    { name: 'events', path: '/he/admin/events', current: 'events' },
    { name: 'events/new (child of events)', path: '/he/admin/events/new', current: 'events' },
    { name: 'highlights', path: '/he/admin/highlights', current: 'highlights' },
    { name: 'inbox', path: '/he/admin/inbox', current: 'inbox' },
    { name: 'tickets', path: '/he/admin/tickets', current: 'tickets' },
    { name: 'more tools', path: '/he/admin/more', current: null },
    { name: 'a more-tools page (urgent)', path: '/he/admin/urgent', current: null },
  ]

  for (const p of PAGES) {
    test(`present on ${p.name}, aria-current ${p.current ?? 'on none'}`, async ({ page }) => {
      await mockCounts(page, ZERO_COUNTS)
      await openAdmin(page, p.path)

      for (const key of BAR_KEYS) {
        await expect(page.getByTestId(`admin-bar-${key}`)).toBeVisible()
      }
      const current = page.locator('[data-testid^="admin-bar-"][aria-current="page"]')
      if (p.current) {
        await expect(current).toHaveCount(1)
        await expect(page.getByTestId(`admin-bar-${p.current}`)).toHaveAttribute('aria-current', 'page')
      } else {
        await expect(current).toHaveCount(0)
      }
    })
  }

  test('bar items navigate', async ({ page }) => {
    await mockCounts(page, ZERO_COUNTS)
    await openAdmin(page, '/he/admin')
    await page.getByTestId('admin-bar-inbox').click()
    await expect(page).toHaveURL(/\/he\/admin\/inbox$/, SLOW)
    await expect(page.getByTestId('admin-bar-inbox')).toHaveAttribute('aria-current', 'page')
    await page.getByTestId('admin-bar-home').click()
    await expect(page).toHaveURL(/\/he\/admin$/, SLOW)
    await expect(page.getByTestId('admin-bar-home')).toHaveAttribute('aria-current', 'page')
  })

  test('absent on a prom quotes page (it brings its own bar)', async ({ page }) => {
    const res = await page.request.get('/api/prom')
    const body = (await res.json()) as { data?: { id: string }[] }
    const id = body.data?.[0]?.id
    test.skip(!id, 'no prom event exists to open')

    await mockCounts(page, ZERO_COUNTS)
    await page.goto(`/he/admin/prom/${id}/quotes`)
    // The page rendered inside the admin frame (admin banner / content) ...
    await expect(page.locator('body')).not.toContainText('404')
    await page.waitForLoadState('networkidle')
    // ... but without the admin bar
    await expect(page.getByTestId('admin-bottom-bar')).toHaveCount(0)
  })
})

test.describe('Admin frame: mobile (375px)', () => {
  test.use({ viewport: { width: 375, height: 700 } })

  test('the last hub row is not covered by the bar when scrolled to the bottom', async ({ page }) => {
    await mockCounts(page, ZERO_COUNTS)
    await openAdmin(page, '/he/admin')
    await scrollToBottom(page)

    const row = await page.getByTestId('hub-row-more').boundingBox()
    const bar = await page.getByTestId('admin-bottom-bar').locator('ul').boundingBox()
    expect(row && bar).toBeTruthy()
    expect(row!.y + row!.height).toBeLessThanOrEqual(bar!.y)
  })

  test('the submit button of the new-event form is not covered by the bar', async ({ page }) => {
    await openAdmin(page, '/he/admin/events/new')
    const submit = page.locator('form button[type="submit"]').last()
    await expect(submit).toBeVisible(SLOW)
    await page.waitForLoadState('networkidle')
    await scrollToBottom(page)

    const btn = await submit.boundingBox()
    const bar = await page.getByTestId('admin-bottom-bar').locator('ul').boundingBox()
    expect(btn && bar).toBeTruthy()
    expect(btn!.y + btn!.height).toBeLessThanOrEqual(bar!.y)

    // And it really is clickable there (nothing sits on top of it). Never clicked: it would save.
    const topmostIsButton = await submit.evaluate((el) => {
      const r = el.getBoundingClientRect()
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return hit === el || el.contains(hit)
    })
    expect(topmostIsButton).toBe(true)
  })

  const NO_SCROLL = [
    { name: 'hub', path: '/he/admin' },
    { name: 'events', path: '/he/admin/events' },
    { name: 'inbox', path: '/he/admin/inbox' },
    { name: 'tickets', path: '/he/admin/tickets' },
    { name: 'urgent', path: '/he/admin/urgent' },
  ]
  for (const lng of ['he', 'ru']) {
    for (const p of NO_SCROLL) {
      test(`no horizontal scroll on ${p.name} (${lng})`, async ({ page }) => {
        await openAdmin(page, p.path.replace('/he/', `/${lng}/`))
        await page.waitForLoadState('networkidle')
        expect(await hasHorizontalScroll(page)).toBe(false)
      })
    }
  }
})

test.describe('Admin frame: direction', () => {
  test('ru is LTR: back button on the left, arrow and chevrons not flipped', async ({ page }) => {
    await mockCounts(page, ZERO_COUNTS)
    await openAdmin(page, '/ru/admin/more')

    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')

    const back = page.getByTestId('admin-header-back')
    const title = page.getByTestId('admin-header-title')
    const [b, t] = [await back.boundingBox(), await title.boundingBox()]
    expect(b!.x + b!.width / 2).toBeLessThan(t!.x + t!.width / 2) // back sits at the start (left)

    // Arrow keeps its natural left-pointing shape (no rotation)
    expect(await back.locator('svg').evaluate((el) => getComputedStyle(el).transform)).toBe('none')
    // Row chevron points right (forward in LTR): no rotation
    const chevron = page.getByTestId('more-row-urgent').locator('svg.lucide-chevron-right')
    expect(await chevron.evaluate((el) => getComputedStyle(el).transform)).toBe('none')
  })

  test('he is RTL: back button on the right, arrow and chevrons flipped', async ({ page }) => {
    await mockCounts(page, ZERO_COUNTS)
    await openAdmin(page, '/he/admin/more')

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')

    const back = page.getByTestId('admin-header-back')
    const title = page.getByTestId('admin-header-title')
    const [b, t] = [await back.boundingBox(), await title.boundingBox()]
    expect(b!.x + b!.width / 2).toBeGreaterThan(t!.x + t!.width / 2) // back sits at the start (right)

    // Rotated by 180deg => matrix(-1, 0, 0, -1, 0, 0)
    const arrow = await back.locator('svg').evaluate((el) => getComputedStyle(el).transform)
    expect(arrow).toMatch(/^matrix\(-1, (-?0), (-?0), -1/)
    const chevron = page.getByTestId('more-row-urgent').locator('svg.lucide-chevron-right')
    expect(await chevron.evaluate((el) => getComputedStyle(el).transform)).toMatch(/^matrix\(-1, (-?0), (-?0), -1/)
    // Chevron sits at the far end of the row (left in RTL)
    const row = await page.getByTestId('more-row-urgent').boundingBox()
    const chev = await chevron.boundingBox()
    expect(chev!.x + chev!.width / 2).toBeLessThan(row!.x + row!.width / 2)
  })
})

test.describe('Admin frame: more tools links', () => {
  for (const lng of ['he', 'ru']) {
    test(`every link on /${lng}/admin/more returns a page (${lng})`, async ({ page }) => {
      test.setTimeout(240_000)
      await mockCounts(page, ZERO_COUNTS)
      await openAdmin(page, `/${lng}/admin/more`)

      const hrefs = await page
        .locator('a[data-testid^="more-row-"]')
        .evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''))
      expect(hrefs.length).toBeGreaterThanOrEqual(10)

      const failures: string[] = []
      for (const href of hrefs) {
        expect(href, 'link must be locale-prefixed').toMatch(new RegExp(`^/${lng}/admin/`))
        // Plain GET of the page: read-only
        const res = await page.request.get(href, { timeout: 90_000 })
        if (res.status() === 404 || res.status() >= 500) failures.push(`${href} -> ${res.status()}`)
      }
      expect(failures).toEqual([])
    })
  }
})
