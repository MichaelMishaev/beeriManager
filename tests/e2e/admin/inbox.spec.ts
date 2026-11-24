import { test, expect, type Page } from '@playwright/test'
import ru from '../../../messages/ru.json'
import he from '../../../messages/he.json'
import {
  blockWrites,
  loginViaApi,
  mockCounts,
  mockCountsFail,
  ZERO_COUNTS,
} from '../../helpers/admin.helper'

// READ-ONLY. The three list endpoints are mocked (empty), so no real feedback card ever renders and
// none can be clicked (clicking a "new" feedback item marks it read). Every write request is blocked
// and fails the test.

test.use({ serviceWorkers: 'block' })

const SLOW = { timeout: 30_000 }

let blocked: string[] = []

async function mockInboxLists(page: Page) {
  await page.route(/\/api\/feedback(\?|$)/, (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ json: { success: true, data: [] } })
      : route.abort()
  )
  await page.route(/\/api\/ideas(\?|$)/, (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ json: { success: true, data: [] } })
      : route.abort()
  )
  await page.route(/\/api\/surveys\/skills(\?|$)/, (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ json: { success: true, data: [], total: 0, stats: undefined } })
      : route.abort()
  )
}

test.beforeEach(async ({ page }) => {
  blocked = await blockWrites(page)
  await loginViaApi(page)
  await mockInboxLists(page)
  await mockCounts(page, ZERO_COUNTS)
})

test.afterEach(() => {
  expect(blocked, 'no write request may leave the browser').toEqual([])
})

type Tab = 'feedback' | 'ideas' | 'survey'
const tab = (page: Page, name: Tab) => page.getByTestId(`admin-tab-${name}`)
const panel = (page: Page, name: Tab) => page.getByTestId(`inbox-panel-${name}`)

async function expectOnlyTab(page: Page, name: Tab) {
  await expect(tab(page, name)).toHaveAttribute('aria-selected', 'true')
  for (const other of ['feedback', 'ideas', 'survey'] as Tab[]) {
    if (other === name) {
      await expect(panel(page, other)).toBeVisible()
    } else {
      await expect(tab(page, other)).toHaveAttribute('aria-selected', 'false')
      // Visited panels stay mounted but hidden; unvisited ones are not mounted at all
      await expect(panel(page, other)).not.toBeVisible()
    }
  }
}

test.describe('Inbox tabs', () => {
  test('feedback is the default tab', async ({ page }) => {
    await page.goto('/he/admin/inbox')
    await expect(tab(page, 'feedback')).toBeVisible(SLOW)
    await expectOnlyTab(page, 'feedback')
  })

  test('switching tabs updates ?tab= and shows the matching panel', async ({ page }) => {
    await page.goto('/he/admin/inbox')
    await expect(tab(page, 'feedback')).toBeVisible(SLOW)
    await page.waitForLoadState('networkidle')

    await tab(page, 'ideas').click()
    await expect(page).toHaveURL(/\/he\/admin\/inbox\?tab=ideas$/)
    await expectOnlyTab(page, 'ideas')

    await tab(page, 'survey').click()
    await expect(page).toHaveURL(/\/he\/admin\/inbox\?tab=survey$/)
    await expectOnlyTab(page, 'survey')

    await tab(page, 'feedback').click()
    await expect(page).toHaveURL(/\/he\/admin\/inbox\?tab=feedback$/)
    await expectOnlyTab(page, 'feedback')
  })

  test('the browser back button steps back through the tabs', async ({ page }) => {
    await page.goto('/he/admin/inbox')
    await expect(tab(page, 'feedback')).toBeVisible(SLOW)
    await page.waitForLoadState('networkidle')

    await tab(page, 'ideas').click()
    await tab(page, 'survey').click()
    await expect(page).toHaveURL(/tab=survey$/)

    await page.goBack()
    await expect(page).toHaveURL(/tab=ideas$/)
    await expectOnlyTab(page, 'ideas')

    await page.goBack()
    // Back at the entry with no ?tab=: feedback
    await expect(page).toHaveURL(/\/he\/admin\/inbox$/)
    await expectOnlyTab(page, 'feedback')

    await page.goForward()
    await expect(page).toHaveURL(/tab=ideas$/)
    await expectOnlyTab(page, 'ideas')
  })

  test('reload keeps the tab', async ({ page }) => {
    await page.goto('/he/admin/inbox?tab=ideas')
    await expect(tab(page, 'ideas')).toBeVisible(SLOW)
    await expectOnlyTab(page, 'ideas')

    await page.reload()
    await expect(tab(page, 'ideas')).toHaveAttribute('aria-selected', 'true', SLOW)
    await expect(page).toHaveURL(/tab=ideas$/)

    await page.goto('/he/admin/inbox?tab=survey')
    await expect(tab(page, 'survey')).toHaveAttribute('aria-selected', 'true', SLOW)
    await page.reload()
    await expect(tab(page, 'survey')).toHaveAttribute('aria-selected', 'true', SLOW)
  })

  test('an unknown ?tab= falls back to feedback', async ({ page }) => {
    await page.goto('/he/admin/inbox?tab=bogus')
    await expect(tab(page, 'feedback')).toHaveAttribute('aria-selected', 'true', SLOW)
  })

  test('the inbox bar item is current on every tab', async ({ page }) => {
    await page.goto('/he/admin/inbox?tab=survey')
    await expect(page.getByTestId('admin-bar-inbox')).toHaveAttribute('aria-current', 'page', SLOW)
  })
})

test.describe('Inbox redirects from the old URLs', () => {
  const CASES: { from: string; tab: Tab }[] = [
    { from: 'admin/feedback', tab: 'feedback' },
    { from: 'admin/ideas', tab: 'ideas' },
    { from: 'admin/surveys/skills', tab: 'survey' },
  ]

  for (const lng of ['he', 'ru'] as const) {
    for (const c of CASES) {
      test(`/${lng}/${c.from} -> ${lng} inbox, ${c.tab} tab`, async ({ page }) => {
        await page.goto(`/${lng}/${c.from}`)
        await expect(page).toHaveURL(new RegExp(`/${lng}/admin/inbox\\?tab=${c.tab}$`), SLOW)
        await expect(tab(page, c.tab)).toHaveAttribute('aria-selected', 'true', SLOW)
      })

      test(`/${lng}/${c.from}?ref=bell keeps the extra query param`, async ({ page }) => {
        await page.goto(`/${lng}/${c.from}?ref=bell&id=abc`)
        await expect(page).toHaveURL(/\/admin\/inbox\?/, SLOW)
        const url = new URL(page.url())
        expect(url.pathname).toBe(`/${lng}/admin/inbox`)
        expect(url.searchParams.get('tab')).toBe(c.tab)
        expect(url.searchParams.get('ref')).toBe('bell')
        expect(url.searchParams.get('id')).toBe('abc')
        await expect(tab(page, c.tab)).toHaveAttribute('aria-selected', 'true', SLOW)
      })
    }
  }

  test('a caller-supplied ?tab= does not override the redirect target', async ({ page }) => {
    await page.goto('/he/admin/ideas?tab=survey')
    await expect(page).toHaveURL(/\/he\/admin\/inbox\?tab=ideas$/, SLOW)
  })
})

test.describe('Inbox tab counts', () => {
  test('show the mocked counts', async ({ page }) => {
    await page.unroute(/\/api\/dashboard\/admin-counts/)
    await mockCounts(page, {
      ...ZERO_COUNTS,
      inbox: { feedback: 2, ideas: 6, survey: 9 },
    })
    await page.goto('/he/admin/inbox')
    await expect(tab(page, 'feedback')).toContainText('(2)', SLOW)
    await expect(tab(page, 'ideas')).toContainText('(6)')
    await expect(tab(page, 'survey')).toContainText('(9)')
  })

  test('show (0) when the inbox is empty', async ({ page }) => {
    await page.goto('/he/admin/inbox')
    for (const name of ['feedback', 'ideas', 'survey'] as Tab[]) {
      await expect(tab(page, name)).toContainText('(0)', SLOW)
    }
  })

  test('show no number at all when the counts request fails', async ({ page }) => {
    await page.unroute(/\/api\/dashboard\/admin-counts/)
    await mockCountsFail(page)
    await page.goto('/he/admin/inbox')
    await expect(tab(page, 'feedback')).toBeVisible(SLOW)
    await page.waitForLoadState('networkidle')
    for (const name of ['feedback', 'ideas', 'survey'] as Tab[]) {
      await expect(tab(page, name)).not.toContainText('(')
    }
  })

  test('Russian: translated tab labels with counts', async ({ page }) => {
    await page.unroute(/\/api\/dashboard\/admin-counts/)
    await mockCounts(page, { ...ZERO_COUNTS, inbox: { feedback: 3, ideas: 1, survey: 4 } })
    await page.goto('/ru/admin/inbox')
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
    await expect(tab(page, 'feedback')).toContainText(ru.admin.inbox.tabs.feedback, SLOW)
    await expect(tab(page, 'feedback')).toContainText('(3)')
    await expect(tab(page, 'survey')).toContainText('(4)')
  })

  test('Hebrew: translated tab labels', async ({ page }) => {
    await page.goto('/he/admin/inbox')
    await expect(tab(page, 'ideas')).toContainText(he.admin.inbox.tabs.ideas, SLOW)
  })
})
