import { test, expect } from '@playwright/test';
import { loginViaApi } from '../helpers/admin.helper';

/**
 * Admin panel: click every entry point.
 *
 * Rewritten for the Nov 2026 admin redesign. The old hub had ~16 sections, a stats row, a quick
 * actions bar and a help dialog, and several of its links led to pages that never existed
 * (/admin/broadcast, /admin/reports, /admin/tasks/assign, ...). The hub now has five rows and
 * everything else sits behind "more tools" (/admin/more). Read-only: navigation only.
 * See tests/e2e/admin/ for the detailed hub, frame, events-list and inbox specs.
 */
// Routes compile on first visit in dev, so navigations get a generous timeout.
test.describe('Admin Panel - Comprehensive Button Test', () => {
  test.use({ serviceWorkers: 'block' });

  test.beforeEach(async ({ page }) => {
    await loginViaApi(page);
    await page.goto('/he/admin');
    await page.waitForLoadState('networkidle');
  });

  test('Admin hub - shows the five rows', async ({ page }) => {
    await expect(page.getByTestId('admin-header-title')).toBeVisible();
    for (const row of ['events', 'highlights', 'tickets', 'inbox', 'more']) {
      await expect(page.getByTestId(`hub-row-${row}`)).toBeVisible();
    }
  });

  const hubRows = [
    { row: 'events', url: '/he/admin/events' },
    { row: 'highlights', url: '/he/admin/highlights' },
    { row: 'tickets', url: '/he/admin/tickets' },
    { row: 'inbox', url: '/he/admin/inbox' },
    { row: 'more', url: '/he/admin/more' },
  ];

  for (const { row, url } of hubRows) {
    test(`Admin hub - "${row}" row opens ${url}`, async ({ page }) => {
      await page.getByTestId(`hub-row-${row}`).click();
      await expect(page).toHaveURL(url, { timeout: 30_000 });
    });
  }

  test('Bottom bar - every item navigates', async ({ page }) => {
    const items = [
      { key: 'events', url: '/he/admin/events' },
      { key: 'highlights', url: '/he/admin/highlights' },
      { key: 'inbox', url: '/he/admin/inbox' },
      { key: 'tickets', url: '/he/admin/tickets' },
      { key: 'home', url: '/he/admin' },
    ];

    for (const { key, url } of items) {
      await page.getByTestId(`admin-bar-${key}`).click();
      await expect(page).toHaveURL(url, { timeout: 30_000 });
      await expect(page.getByTestId(`admin-bar-${key}`)).toHaveAttribute('aria-current', 'page');
    }
  });

  test('More tools - every tool link opens a real page', async ({ page }) => {
    test.setTimeout(240_000);
    await page.goto('/he/admin/more');

    const hrefs = await page
      .locator('a[data-testid^="more-row-"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''));
    expect(hrefs.length).toBeGreaterThanOrEqual(10);

    for (const href of hrefs) {
      const response = await page.goto(href, { timeout: 90_000 });
      expect(response?.status(), `${href} should not 404`).toBeLessThan(400);
      await expect(page.getByTestId('admin-bottom-bar')).toBeVisible();
    }
  });

  test('Old admin URLs redirect to the parents inbox', async ({ page }) => {
    test.setTimeout(120_000);
    const redirects = [
      { from: '/he/admin/feedback', tab: 'feedback' },
      { from: '/he/admin/ideas', tab: 'ideas' },
      { from: '/he/admin/surveys/skills', tab: 'survey' },
    ];

    for (const { from, tab } of redirects) {
      await page.goto(from);
      await expect(page).toHaveURL(new RegExp(`/he/admin/inbox\\?tab=${tab}`), { timeout: 30_000 });
    }
  });
});
