import { test, expect } from '@playwright/test'
import {
  blockWrites,
  loginViaApi,
  mockCounts,
  mockCountsFail,
  mockCountsHang,
  ZERO_COUNTS,
} from '../../helpers/admin.helper'

// READ-ONLY: the dev server uses the real database. Only navigation; the counts endpoint is mocked
// wherever a scenario needs specific numbers, and any write request is blocked and fails the test.

const ROWS = [
  { id: 'events', path: '/he/admin/events' },
  { id: 'highlights', path: '/he/admin/highlights' },
  { id: 'tickets', path: '/he/admin/tickets' },
  { id: 'inbox', path: '/he/admin/inbox' },
  { id: 'more', path: '/he/admin/more' },
] as const

// The PWA service worker would answer fetches itself and bypass page.route mocks.
test.use({ serviceWorkers: 'block' })

// First visit to a route makes the dev server compile it, which can take a while.
const NAV = { timeout: 30_000 }

let blocked: string[] = []

test.beforeEach(async ({ page }) => {
  blocked = await blockWrites(page)
  await loginViaApi(page)
})

test.afterEach(() => {
  expect(blocked, 'no write request may leave the browser').toEqual([])
})

const rowLinks = (page: import('@playwright/test').Page) => page.locator('a[data-testid^="hub-row-"]')

test.describe('Admin hub', () => {
  test('shows exactly the five rows, in order', async ({ page }) => {
    await mockCounts(page, ZERO_COUNTS)
    await page.goto('/he/admin')

    await expect(rowLinks(page)).toHaveCount(5)
    const ids = await rowLinks(page).evaluateAll((els) =>
      els.map((el) => el.getAttribute('data-testid'))
    )
    expect(ids).toEqual(ROWS.map((r) => `hub-row-${r.id}`))
  })

  for (const row of ROWS) {
    test(`row "${row.id}" navigates to ${row.path}`, async ({ page }) => {
      await mockCounts(page, ZERO_COUNTS)
      await page.goto('/he/admin')
      await page.getByTestId(`hub-row-${row.id}`).click()
      await expect(page).toHaveURL(new RegExp(`${row.path}$`), NAV)
      // The destination rendered inside the admin frame, not a 404
      await expect(page.getByTestId('admin-bottom-bar')).toBeVisible()
      await expect(page.getByTestId('admin-header-title')).toBeVisible()
    })
  }

  test('the old clutter is gone: no stats row, quick actions or help dialog', async ({ page }) => {
    await mockCounts(page, ZERO_COUNTS)
    await page.goto('/he/admin')
    await expect(rowLinks(page)).toHaveCount(5)

    // Old quick actions linked straight to create pages and to pages that never existed
    for (const href of ['/admin/events/new', '/admin/tasks/new', '/admin/protocols/new', '/admin/broadcast', '/admin/reports']) {
      await expect(page.locator(`a[href$="${href}"]`)).toHaveCount(0)
    }
    // Old stats row linked to /events?showDrafts=true, /tasks, /issues
    await expect(page.locator('a[href*="showDrafts"]')).toHaveCount(0)
    // Old help dialog trigger
    const content = page
      .getByTestId('hub-row-events')
      .locator('xpath=ancestor::div[contains(@class,"max-w-2xl")][1]')
    await expect(content.locator('button')).toHaveCount(0)
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })

  test('counts request failing (500): rows still render and navigate, no numbers shown', async ({ page }) => {
    await mockCountsFail(page)
    await page.goto('/he/admin')

    await expect(rowLinks(page)).toHaveCount(5)
    // Subtitles for the four count-backed rows are omitted, so no digit appears in them
    for (const id of ['events', 'highlights', 'tickets', 'inbox']) {
      await expect(page.getByTestId(`hub-row-${id}`)).not.toContainText(/\d/)
    }
    await expect(page.getByTestId('hub-row-inbox-badge')).toHaveCount(0)
    // Skeletons are gone (failure is final, not "still loading")
    await expect(page.locator('[data-testid^="hub-row-"] .animate-pulse')).toHaveCount(0)

    await page.getByTestId('hub-row-highlights').click()
    await expect(page).toHaveURL(/\/he\/admin\/highlights$/, NAV)
  })

  test('counts request hanging: rows render with a skeleton and still navigate', async ({ page }) => {
    const release = await mockCountsHang(page)
    await page.goto('/he/admin')

    await expect(rowLinks(page)).toHaveCount(5)
    await expect(page.locator('[data-testid="hub-row-events"] .animate-pulse')).toBeVisible()

    await page.getByTestId('hub-row-tickets').click()
    await expect(page).toHaveURL(/\/he\/admin\/tickets$/, NAV)
    release()
  })

  test('known payload: subtitles and the orange badge show those numbers', async ({ page }) => {
    await mockCounts(page, {
      events: { upcoming: 7, drafts: 3 },
      highlights: { active: 5 },
      tickets: { active: 4 },
      inbox: { feedback: 2, ideas: 6, survey: 9 },
    })
    await page.goto('/he/admin')

    await expect(page.getByTestId('hub-row-events')).toContainText('7')
    await expect(page.getByTestId('hub-row-events')).toContainText('3')
    await expect(page.getByTestId('hub-row-highlights')).toContainText('5')
    await expect(page.getByTestId('hub-row-tickets')).toContainText('4')

    const inbox = page.getByTestId('hub-row-inbox')
    await expect(inbox).toContainText('2')
    await expect(inbox).toContainText('6')
    await expect(inbox).toContainText('9')
    // Badge = feedback + ideas (survey has no "new" state and is not added)
    await expect(page.getByTestId('hub-row-inbox-badge')).toHaveText('8')
    // The bar's inbox dot agrees
    await expect(page.getByTestId('admin-bar-inbox-dot')).toBeVisible()
  })

  test('drafts are omitted from the events subtitle when there are none', async ({ page }) => {
    await mockCounts(page, {
      ...ZERO_COUNTS,
      events: { upcoming: 7, drafts: 0 },
    })
    await page.goto('/he/admin')
    await expect(page.getByTestId('hub-row-events')).toContainText('7')
    await expect(page.getByTestId('hub-row-events')).not.toContainText('·')
  })

  test('badge and bar dot are hidden when the inbox has nothing new', async ({ page }) => {
    await mockCounts(page, {
      ...ZERO_COUNTS,
      inbox: { feedback: 0, ideas: 0, survey: 12 }, // survey alone never raises the badge
    })
    await page.goto('/he/admin')
    await expect(page.getByTestId('hub-row-inbox')).toContainText('12')
    await expect(page.getByTestId('hub-row-inbox-badge')).toHaveCount(0)
    await expect(page.getByTestId('admin-bar-inbox-dot')).toHaveCount(0)
  })

  test('Russian: same five rows, LTR', async ({ page }) => {
    await mockCounts(page, ZERO_COUNTS)
    await page.goto('/ru/admin')
    await expect(rowLinks(page)).toHaveCount(5)
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
    await page.getByTestId('hub-row-inbox').click()
    await expect(page).toHaveURL(/\/ru\/admin\/inbox$/, NAV)
  })
})
