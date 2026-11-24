import { test, expect, type Page } from '@playwright/test'
import he from '../../../messages/he.json'
import ru from '../../../messages/ru.json'
import { classifyEvent, startOfTodayIsrael } from '../../../src/lib/utils/admin-events'
import {
  blockWrites,
  loginViaApi,
  mockCounts,
  mockEventsList,
  ZERO_COUNTS,
} from '../../helpers/admin.helper'

// READ-ONLY: /api/events is mocked with a fixed set, so no real event is read or touched, and
// every write request is blocked and fails the test. No form is ever submitted.

test.use({ serviceWorkers: 'block' })

const SLOW = { timeout: 30_000 }
const HOUR = 3_600_000
const DAY = 24 * HOUR

type MockEvent = {
  id: string
  title: string
  title_ru?: string
  start_datetime: string
  end_datetime?: string
  location?: string
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
}

const todayStart = startOfTodayIsrael(new Date())
const iso = (ms: number) => new Date(ms).toISOString()
// "Midnight UTC" on a day well in the future: how calendar imports store all-day events
const utcMidnight = (() => {
  const d = new Date(Date.now() + 7 * DAY)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
})()

const EVENTS: MockEvent[] = [
  { id: 'e-pub-future', title: 'Published future', title_ru: 'RU published future', start_datetime: iso(todayStart + 3 * DAY + 10 * HOUR), end_datetime: iso(todayStart + 3 * DAY + 12 * HOUR), location: 'Hall A', status: 'published' },
  // Starts exactly at the start of today: the boundary belongs to "upcoming"
  { id: 'e-ongoing', title: 'Ongoing today', start_datetime: iso(todayStart), status: 'ongoing' },
  { id: 'e-draft-future', title: 'Draft future', start_datetime: iso(todayStart + 5 * DAY + 9 * HOUR), status: 'draft' },
  { id: 'e-draft-past', title: 'Draft past', start_datetime: iso(todayStart - 5 * DAY + 9 * HOUR), status: 'draft' },
  { id: 'e-completed', title: 'Completed past', start_datetime: iso(todayStart - 10 * DAY + 9 * HOUR), status: 'completed' },
  { id: 'e-cancel-future', title: 'Cancelled future', start_datetime: iso(todayStart + 2 * DAY + 9 * HOUR), status: 'cancelled' },
  { id: 'e-cancel-past', title: 'Cancelled past', start_datetime: iso(todayStart - 3 * DAY + 9 * HOUR), status: 'cancelled' },
  { id: 'e-allday', title: 'All day import', start_datetime: utcMidnight, status: 'published' },
]

const TITLES = {
  upcoming: ['Ongoing today', 'Cancelled future', 'Published future', 'All day import'], // soonest first
  drafts: ['Draft future'],
  past: ['Cancelled past', 'Draft past', 'Completed past'], // newest first
}

let blocked: string[] = []

test.beforeEach(async ({ page }) => {
  blocked = await blockWrites(page)
  await loginViaApi(page)
  await mockCounts(page, ZERO_COUNTS)
})

test.afterEach(() => {
  expect(blocked, 'no write request may leave the browser').toEqual([])
})

const rows = (page: Page) => page.getByTestId('admin-event-row')
const tab = (page: Page, name: 'upcoming' | 'drafts' | 'past') => page.getByTestId(`admin-tab-${name}`)

async function open(page: Page, events: unknown[], path = '/he/admin/events') {
  await mockEventsList(page, events)
  await page.goto(path)
  await expect(page.getByTestId('admin-events-loading')).toHaveCount(0, SLOW)
}

async function titlesIn(page: Page): Promise<string[]> {
  return rows(page).evaluateAll((els) =>
    els.map((el) => el.querySelector('span.truncate')?.textContent ?? '')
  )
}

test.describe('Admin events list: tabs', () => {
  test('upcoming is the default and holds published, ongoing, cancelled-future and all-day events', async ({ page }) => {
    await open(page, EVENTS)
    await expect(tab(page, 'upcoming')).toHaveAttribute('aria-selected', 'true')
    expect(await titlesIn(page)).toEqual(TITLES.upcoming)
  })

  test('drafts tab holds only the future draft (a past draft is "past")', async ({ page }) => {
    await open(page, EVENTS)
    await tab(page, 'drafts').click()
    await expect(rows(page)).toHaveCount(1)
    expect(await titlesIn(page)).toEqual(TITLES.drafts)
  })

  test('past tab holds cancelled-past, past drafts and completed, newest first', async ({ page }) => {
    await open(page, EVENTS)
    await tab(page, 'past').click()
    await expect(rows(page)).toHaveCount(3)
    expect(await titlesIn(page)).toEqual(TITLES.past)
  })

  test('tab counts match the rows in each tab', async ({ page }) => {
    await open(page, EVENTS)
    await expect(tab(page, 'upcoming')).toContainText(`(${TITLES.upcoming.length})`)
    await expect(tab(page, 'drafts')).toContainText(`(${TITLES.drafts.length})`)
    await expect(tab(page, 'past')).toContainText(`(${TITLES.past.length})`)

    for (const name of ['upcoming', 'drafts', 'past'] as const) {
      await tab(page, name).click()
      await expect(rows(page)).toHaveCount(TITLES[name].length)
    }
  })

  test('cancelled rows show the cancelled pill in both tabs; others do not', async ({ page }) => {
    const cancelled = he.admin.common.status.cancelled
    await open(page, EVENTS)
    await expect(rows(page).filter({ hasText: 'Cancelled future' })).toContainText(cancelled)
    await expect(rows(page).filter({ hasText: 'Published future' })).not.toContainText(cancelled)

    await tab(page, 'past').click()
    await expect(rows(page).filter({ hasText: 'Cancelled past' })).toContainText(cancelled)
    await expect(rows(page).filter({ hasText: 'Completed past' })).not.toContainText(cancelled)
    // A cancelled event can still be opened (and reopened)
    await expect(rows(page).filter({ hasText: 'Cancelled past' })).toHaveAttribute('href', '/he/admin/events/e-cancel-past/edit')
  })

  test('a midnight-UTC import without end time shows "all day", not a clock time', async ({ page }) => {
    await open(page, EVENTS)
    const row = rows(page).filter({ hasText: 'All day import' })
    await expect(row).toContainText(he.admin.events.list.allDay)
    await expect(row).not.toContainText(/\b0[0-9]:00\b/)

    // A timed event keeps its time
    const timed = rows(page).filter({ hasText: 'Published future' })
    await expect(timed).toContainText('10:00')
    await expect(timed).toContainText('Hall A')
  })

  test('?tab= survives a reload', async ({ page }) => {
    await open(page, EVENTS)
    await tab(page, 'drafts').click()
    await expect(page).toHaveURL(/\/he\/admin\/events\?tab=drafts$/)

    await page.reload()
    await expect(tab(page, 'drafts')).toHaveAttribute('aria-selected', 'true', SLOW)
    await expect(rows(page)).toHaveCount(1)
    expect(await titlesIn(page)).toEqual(TITLES.drafts)

    // Deep link to past
    await page.goto('/he/admin/events?tab=past')
    await expect(tab(page, 'past')).toHaveAttribute('aria-selected', 'true', SLOW)
    await expect(rows(page)).toHaveCount(3)
  })

  test('an unknown ?tab= falls back to upcoming', async ({ page }) => {
    await open(page, EVENTS, '/he/admin/events?tab=nonsense')
    await expect(tab(page, 'upcoming')).toHaveAttribute('aria-selected', 'true')
  })
})

test.describe('Admin events list: navigation', () => {
  test('rows link to the existing edit page', async ({ page }) => {
    await open(page, EVENTS)
    const hrefs = await rows(page).evaluateAll((els) => els.map((el) => el.getAttribute('href')))
    expect(hrefs).toEqual(
      ['e-ongoing', 'e-cancel-future', 'e-pub-future', 'e-allday'].map((id) => `/he/admin/events/${id}/edit`)
    )
  })

  test('the "+" button goes to /admin/events/new', async ({ page }) => {
    await open(page, EVENTS)
    const plus = page.getByTestId('admin-events-new')
    await expect(plus).toHaveAttribute('href', '/he/admin/events/new')
    await plus.click()
    await expect(page).toHaveURL(/\/he\/admin\/events\/new$/, SLOW)
    // The form is only looked at, never submitted
    await expect(page.locator('form button[type="submit"]').last()).toBeVisible(SLOW)
  })
})

test.describe('Admin events list: states', () => {
  test('an empty tab shows the empty state with a create button', async ({ page }) => {
    await open(page, [EVENTS[0]]) // only one published future event
    await tab(page, 'drafts').click()
    await expect(rows(page)).toHaveCount(0)
    const empty = page.getByTestId('admin-empty-state')
    await expect(empty).toBeVisible()
    await expect(empty).toContainText(he.admin.events.list.empty.drafts.title)
    await expect(empty.locator('a[href="/he/admin/events/new"]')).toBeVisible()

    await tab(page, 'past').click()
    await expect(empty).toContainText(he.admin.events.list.empty.past.title)
  })

  test('no events at all: every tab is empty and counts read (0)', async ({ page }) => {
    await open(page, [])
    for (const name of ['upcoming', 'drafts', 'past'] as const) {
      await expect(tab(page, name)).toContainText('(0)')
    }
    await expect(page.getByTestId('admin-empty-state')).toBeVisible()
  })

  test('a failing list request shows an error state with a retry, not a blank page', async ({ page }) => {
    await page.route(/\/api\/events(\?|$)/, (route) =>
      route.fulfill({ status: 500, json: { success: false, error: 'boom' } })
    )
    await page.goto('/he/admin/events')
    const empty = page.getByTestId('admin-empty-state')
    await expect(empty).toContainText(he.admin.events.list.loadError, SLOW)
    await expect(empty.getByRole('button')).toBeVisible()
  })

  test('past tab pages its list: "show more" appears beyond 30 rows', async ({ page }) => {
    const many: MockEvent[] = Array.from({ length: 35 }, (_, i) => ({
      id: `e-old-${i}`,
      title: `Old ${i}`,
      start_datetime: iso(todayStart - (i + 1) * DAY + 9 * HOUR),
      status: 'completed',
    }))
    await open(page, many, '/he/admin/events?tab=past')
    await expect(rows(page)).toHaveCount(30)
    await page.getByTestId('admin-events-show-more').click()
    await expect(rows(page)).toHaveCount(35)
    await expect(page.getByTestId('admin-events-show-more')).toHaveCount(0)
  })

  test('Russian: uses the Russian title and translated tabs, LTR', async ({ page }) => {
    await open(page, EVENTS, '/ru/admin/events')
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
    await expect(tab(page, 'upcoming')).toContainText(ru.admin.events.list.tabs.upcoming)
    await expect(rows(page).filter({ hasText: 'RU published future' })).toHaveAttribute('href', '/ru/admin/events/e-pub-future/edit')
  })
})

test.describe('Admin events list: long titles (375px)', () => {
  test.use({ viewport: { width: 375, height: 800 } })

  test('a very long title truncates and does not push the pill or chevron off screen', async ({ page }) => {
    const unbroken = 'A'.repeat(300)
    const spaced = 'כותרת ארוכה מאוד '.repeat(25)
    await open(page, [
      { ...EVENTS[0], id: 'e-long-1', title: unbroken, status: 'cancelled' },
      { ...EVENTS[0], id: 'e-long-2', title: spaced, status: 'published' },
    ])
    await expect(rows(page)).toHaveCount(2)

    for (let i = 0; i < 2; i++) {
      const row = rows(page).nth(i)
      const rowBox = (await row.boundingBox())!
      expect(rowBox.x).toBeGreaterThanOrEqual(0)
      expect(rowBox.x + rowBox.width).toBeLessThanOrEqual(375)

      const chevron = (await row.locator('svg.lucide-chevron-right').boundingBox())!
      expect(chevron.x).toBeGreaterThanOrEqual(rowBox.x)
      expect(chevron.x + chevron.width).toBeLessThanOrEqual(rowBox.x + rowBox.width)

      const pill = (await row.locator('span.rounded-md').boundingBox())!
      expect(pill.x).toBeGreaterThanOrEqual(rowBox.x)
      expect(pill.x + pill.width).toBeLessThanOrEqual(rowBox.x + rowBox.width)
      expect(pill.width).toBeGreaterThan(20) // not squashed to nothing

      // Title is ellipsised rather than wrapped
      const title = row.locator('span.truncate').first()
      const clipped = await title.evaluate((el) => el.scrollWidth > el.clientWidth)
      expect(clipped).toBe(true)
      expect((await title.boundingBox())!.height).toBeLessThan(30)
    }

    const scrolls = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    )
    expect(scrolls).toBe(false)
  })
})

test.describe('classifyEvent (pure)', () => {
  // 2026-11-24 12:00 in Israel (UTC+2): today started at 2026-11-23T22:00:00Z
  const NOW = new Date('2026-11-24T10:00:00Z')
  const START = Date.parse('2026-11-23T22:00:00Z')
  const at = (ms: number, status: MockEvent['status']) => ({ start_datetime: new Date(ms).toISOString(), status })

  test('startOfTodayIsrael is midnight Israel time', () => {
    expect(startOfTodayIsrael(NOW)).toBe(START)
    // Same answer all day, whatever the viewer's time zone
    expect(startOfTodayIsrael(new Date('2026-11-24T00:00:01Z'))).toBe(START)
    expect(startOfTodayIsrael(new Date('2026-11-24T21:59:59Z'))).toBe(START)
    expect(startOfTodayIsrael(new Date('2026-11-24T22:00:00Z'))).toBe(START + DAY)
  })

  test('boundary: start exactly at the start of today is upcoming; one ms earlier is past', () => {
    expect(classifyEvent(at(START, 'published'), NOW)).toBe('upcoming')
    expect(classifyEvent(at(START - 1, 'published'), NOW)).toBe('past')
  })

  test('yesterday 23:59 (Israel) is past, today 00:00 is upcoming', () => {
    expect(classifyEvent({ start_datetime: '2026-11-23T21:59:00Z', status: 'published' }, NOW)).toBe('past')
    expect(classifyEvent({ start_datetime: '2026-11-23T22:00:00Z', status: 'published' }, NOW)).toBe('upcoming')
  })

  test('each status in the future', () => {
    const future = START + 3 * DAY
    expect(classifyEvent(at(future, 'published'), NOW)).toBe('upcoming')
    expect(classifyEvent(at(future, 'ongoing'), NOW)).toBe('upcoming')
    expect(classifyEvent(at(future, 'cancelled'), NOW)).toBe('upcoming')
    expect(classifyEvent(at(future, 'draft'), NOW)).toBe('drafts')
    expect(classifyEvent(at(future, 'completed'), NOW)).toBe('past') // completed is past whatever the date
  })

  test('each status in the past', () => {
    const past = START - 3 * DAY
    for (const status of ['published', 'ongoing', 'cancelled', 'draft', 'completed'] as const) {
      expect(classifyEvent(at(past, status), NOW)).toBe('past')
    }
  })

  test('a draft starting today is still a draft', () => {
    expect(classifyEvent(at(START + HOUR, 'draft'), NOW)).toBe('drafts')
  })

  // Regression: the helper used to subtract wall-clock time since midnight, which was an hour off
  // on the days the clocks change.
  test('start of today is correct on the spring DST-change day', () => {
    const now = new Date('2026-03-27T09:00:00Z') // 12:00 in Israel (UTC+3)
    expect(startOfTodayIsrael(now)).toBe(Date.parse('2026-03-26T22:00:00Z'))
  })
})
