import { expect, type Page, type Route } from '@playwright/test'

/**
 * Shared helpers for the admin redesign specs.
 *
 * SAFETY: the dev server talks to the real database. Everything here is read-only.
 * Logging in only sets the auth cookie; mocks use page.route so nothing is written.
 */

/** Logs in through the API so the auth cookie lands in the browser context (needs ADMIN_PASSWORD). */
export async function loginViaApi(page: Page): Promise<void> {
  const res = await page.request.post('/api/auth/login', {
    data: { password: process.env.ADMIN_PASSWORD ?? '' },
  })
  expect(res.ok(), 'admin login must succeed (is ADMIN_PASSWORD exported?)').toBeTruthy()
}

export type CountsPayload = {
  events: { upcoming: number; drafts: number }
  highlights: { active: number }
  tickets: { active: number }
  inbox: { feedback: number; ideas: number; survey: number }
}

export const ZERO_COUNTS: CountsPayload = {
  events: { upcoming: 0, drafts: 0 },
  highlights: { active: 0 },
  tickets: { active: 0 },
  inbox: { feedback: 0, ideas: 0, survey: 0 },
}

export const COUNTS_URL = /\/api\/dashboard\/admin-counts/

export async function mockCounts(page: Page, data: CountsPayload): Promise<void> {
  await page.route(COUNTS_URL, (route: Route) =>
    route.fulfill({ json: { success: true, data } })
  )
}

export async function mockCountsFail(page: Page): Promise<void> {
  await page.route(COUNTS_URL, (route: Route) =>
    route.fulfill({ status: 500, json: { success: false, error: 'boom' } })
  )
}

/** Returns a function that releases the hanging counts request. */
export async function mockCountsHang(page: Page): Promise<() => void> {
  let release: () => void = () => undefined
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route(COUNTS_URL, async (route: Route) => {
    await gate
    await route.abort().catch(() => undefined)
  })
  return release
}

/** Answers the events list endpoint (list only, never /api/events/<id>) with a fixed set. */
export async function mockEventsList(page: Page, events: unknown[]): Promise<void> {
  await page.route(/\/api\/events(\?|$)/, (route: Route) => {
    if (route.request().method() !== 'GET') return route.abort()
    return route.fulfill({ json: { success: true, data: events } })
  })
}

/** Blocks any write verb to /api so a stray click can never reach the real database. */
export async function blockWrites(page: Page): Promise<string[]> {
  const blocked: string[] = []
  await page.route(/\/api\//, (route: Route) => {
    const method = route.request().method()
    if (method === 'GET' || method === 'HEAD') return route.fallback()
    // The login call is made through page.request (not subject to routing), so any write seen here is a bug.
    blocked.push(`${method} ${route.request().url()}`)
    return route.abort()
  })
  return blocked
}

/** True when the page scrolls sideways. */
export async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  )
}
