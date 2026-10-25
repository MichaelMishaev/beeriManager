import { test, expect, type Page } from '@playwright/test'

// Read-only: the schedule is static data, so there is no test data to clean up.
// The clock is pinned to 25 Oct 2026 (Israel), when ו׳2 is on duty (18–30 Oct), so statuses are deterministic.

test.use({ viewport: { width: 375, height: 812 } })

async function open(page: Page, path = '/he/kiss-and-ride', israelDate = '2026-10-25') {
  await page.clock.setFixedTime(new Date(`${israelDate}T10:00:00+03:00`))
  await page.goto(path)
  await page.waitForLoadState('networkidle') // dev server may self-reload on first hit
}

test.describe('Kiss & Ride — schedule page', () => {
  test('first visit: one obvious picker above the fold, no answer yet, no horizontal scroll', async ({ page }) => {
    await open(page)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('נשק וסע')

    const select = page.getByLabel('מתי הכיתה שלי תורנית?')
    await expect(select).toBeVisible()
    const box = await select.boundingBox()
    expect(box && box.y + box.height).toBeLessThan(812)

    await expect(page.getByTestId('my-shift')).toBeEmpty()
    await expect(page.getByTestId('full-schedule')).not.toHaveAttribute('open', '')

    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }))
    expect(sw).toBe(cw)
  })

  test('choosing a class shows its dates and how long is left, and highlights its row', async ({ page }) => {
    await open(page)
    await page.getByTestId('class-select').selectOption({ label: 'ו׳2' })

    const mine = page.getByTestId('my-shift')
    await expect(mine).toContainText('כיתה ו׳2 תורנית עכשיו')
    await expect(mine).toContainText('18–30 באוקטובר')
    await expect(page.getByTestId('my-shift-when')).toHaveText('נשארו עוד 5 ימים')
    await expect(page.locator('[data-testid="shift-row"][data-mine="true"]')).toHaveCount(1)
  })

  test('a class that shares a shift names its partner class', async ({ page }) => {
    await open(page)
    await page.getByTestId('class-select').selectOption({ label: 'ד׳3' })

    await expect(page.getByTestId('my-shift')).toContainText('29 בנובמבר – 4 בדצמבר')
    await expect(page.getByTestId('my-shift')).toContainText('יחד עם כיתה ג׳3')
    await expect(page.getByTestId('my-shift-when')).toHaveText('מתחילה בעוד כ־5 שבועות')
  })

  test('a class whose shift is over says so', async ({ page }) => {
    await open(page)
    await page.getByTestId('class-select').selectOption({ label: 'ו׳1' })
    await expect(page.getByTestId('my-shift-when')).toHaveText('התורנות של הכיתה הסתיימה — תודה!')
  })

  test('the chosen class is remembered on the next visit', async ({ page }) => {
    await open(page)
    await page.getByTestId('class-select').selectOption({ label: 'ב׳4' })

    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.getByTestId('class-select')).toHaveValue('ב4')
    await expect(page.getByTestId('my-shift')).toContainText('התורנות של כיתה ב׳4')
  })

  test('a shared link with ?class= opens with that class chosen', async ({ page }) => {
    await open(page, `/he/kiss-and-ride?class=${encodeURIComponent('ה1')}`)
    await expect(page.getByTestId('my-shift')).toContainText('התורנות של כיתה ה׳1')
    await expect(page.getByTestId('my-shift')).toContainText('15–27 בנובמבר')
  })

  test('the full schedule is collapsed and lists every shift in date order', async ({ page }) => {
    await open(page)
    const rows = page.getByTestId('shift-row')
    await expect(rows.first()).toBeHidden()

    await page.getByText('לוח התורנויות המלא').click()
    await expect(rows).toHaveCount(20)
    await expect(rows.first()).toBeVisible()
    await expect(rows.first()).toContainText('ו׳1')
    await expect(rows.first()).toHaveAttribute('data-status', 'past')
    await expect(rows.nth(1)).toHaveAttribute('data-status', 'now')
    await expect(rows.last()).toContainText('א׳4')
  })

  test('no calendar until a class is chosen; then it fills the class duty days (not Saturdays)', async ({ page }) => {
    await open(page)
    await expect(page.getByTestId('kiss-calendar')).toHaveCount(0)

    await page.getByTestId('class-select').selectOption({ label: 'ו׳2' }) // 18–30 Oct 2026, Sat 24 Oct excluded
    await expect(page.getByTestId('calendar-month')).toHaveText('אוקטובר 2026')
    await expect(page.locator('[data-testid="calendar-day"][data-duty="true"]')).toHaveCount(12)
    await expect(page.locator('[data-testid="calendar-day"][data-today="true"]')).toHaveText('25')
    await expect(page.locator('[data-testid="calendar-day"][data-duty="true"]').first()).toHaveText('18')

    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }))
    expect(sw).toBe(cw)
  })

  test('calendar opens on the shift month, navigates, and stops at the school-year bounds', async ({ page }) => {
    await open(page)
    await page.getByTestId('class-select').selectOption({ label: 'ד׳3' }) // 29 Nov – 4 Dec
    const month = page.getByTestId('calendar-month')
    await expect(month).toHaveText('נובמבר 2026')
    await expect(page.locator('[data-testid="calendar-day"][data-duty="true"]')).toHaveCount(2)

    await page.getByRole('button', { name: 'חודש הבא' }).click()
    await expect(month).toHaveText('דצמבר 2026')
    await expect(page.locator('[data-testid="calendar-day"][data-duty="true"]')).toHaveCount(4)

    // Back to October (first month of the schedule): previous is then disabled
    await page.getByRole('button', { name: 'חודש קודם' }).click()
    await page.getByRole('button', { name: 'חודש קודם' }).click()
    await expect(month).toHaveText('אוקטובר 2026')
    await expect(page.getByRole('button', { name: 'חודש קודם' })).toBeDisabled()

    // A different class re-opens the calendar on its own first month
    await page.getByTestId('class-select').selectOption({ label: 'א׳4' }) // 27–30 Jun 2027
    await expect(month).toHaveText('יוני 2027')
    await expect(page.getByRole('button', { name: 'חודש הבא' })).toBeDisabled()
  })

  test('before choosing a class: which class is on duty at school now, and which is next', async ({ page }) => {
    await open(page)
    const status = page.getByTestId('school-status')
    await expect(page.getByRole('heading', { name: 'בבית הספר עכשיו' })).toBeVisible()
    await expect(page.getByTestId('school-now')).toContainText('ו׳2')
    await expect(page.getByTestId('school-now')).toContainText('תורנית עד 30 באוקטובר')
    await expect(page.getByTestId('school-next')).toContainText('הבאה בתור:')
    await expect(page.getByTestId('school-next')).toContainText('ו׳3')
    await expect(page.getByTestId('school-next')).toContainText('מ־1 בנובמבר')
    await expect(status).not.toContainText('הכיתה שלכם') // nothing chosen: nothing is "yours"

    // status sits above the picker, both in the first screen
    const box = await status.boundingBox()
    expect(box && box.y + box.height).toBeLessThan(500)
  })

  test('a class that is next in line says so, and its row in the school status is marked', async ({ page }) => {
    await open(page)
    await page.getByTestId('class-select').selectOption({ label: 'ו׳3' })
    await expect(page.getByTestId('my-shift-when')).toHaveText('הכיתה שלכם הבאה בתור · מתחילה בעוד 7 ימים')
    await expect(page.getByTestId('school-next')).toContainText('הכיתה שלכם')
    await expect(page.getByTestId('school-now')).not.toContainText('הכיתה שלכם')
    await page.getByText('לוח התורנויות המלא').click()
    await expect(page.getByTestId('shift-row').nth(2)).toContainText('הבאה')
  })

  test('a gap day: nobody on duty now, next class and its start date', async ({ page }) => {
    await open(page, '/he/kiss-and-ride', '2026-12-08')
    await expect(page.getByTestId('school-now')).toContainText('אין כיתה תורנית')
    await expect(page.getByTestId('school-next')).toContainText('ה׳2')
    await expect(page.getByTestId('school-next')).toContainText('מ־13 בדצמבר')
  })

  test('a shared shift names both classes as on duty now', async ({ page }) => {
    await open(page, '/he/kiss-and-ride', '2026-12-01')
    await expect(page.getByTestId('school-now')).toContainText('ד׳3 וג׳3')
    await expect(page.getByTestId('school-now')).toContainText('תורניות עד 4 בדצמבר') // plural for two classes
  })

  test('while a class is on duty its calendar opens on this month, so today is visible', async ({ page }) => {
    await open(page, `/he/kiss-and-ride?class=${encodeURIComponent('ד3')}`, '2026-12-01') // shift 29 Nov – 4 Dec
    await expect(page.getByTestId('calendar-month')).toHaveText('דצמבר 2026')
    await expect(page.locator('[data-testid="calendar-day"][data-today="true"]')).toHaveText('1')
    await expect(page.getByTestId('school-now')).toContainText('הכיתה שלכם')
    await page.getByText('לוח התורנויות המלא').click()
    await expect(page.locator('[data-testid="shift-row"][data-status="now"]')).toContainText('ד׳3 וג׳3')
    await expect(page.locator('[data-testid="shift-row"][data-status="now"]')).toContainText('עכשיו')
  })

  test('before the first shift: nobody now, the first class is next', async ({ page }) => {
    await open(page, '/he/kiss-and-ride', '2026-09-20')
    await expect(page.getByTestId('school-now')).toContainText('אין כיתה תורנית')
    await expect(page.getByTestId('school-next')).toContainText('ו׳1')
    await expect(page.getByTestId('school-next')).toContainText('מ־4 באוקטובר')
  })

  test('during the last shift there is no "next" class', async ({ page }) => {
    await open(page, '/he/kiss-and-ride', '2027-06-28')
    await expect(page.getByTestId('school-now')).toContainText('א׳4')
    await expect(page.getByTestId('school-next')).toContainText('זו התורנות האחרונה השנה')
  })

  test('after the last shift: the year is over, no now/next rows', async ({ page }) => {
    await open(page, '/he/kiss-and-ride', '2027-07-10')
    await expect(page.getByTestId('school-year-over')).toBeVisible()
    await expect(page.getByTestId('school-now')).toHaveCount(0)
    await expect(page.getByTestId('school-next')).toHaveCount(0)
  })

  test('renders in Russian with LTR direction', async ({ page }) => {
    await open(page, '/ru/kiss-and-ride')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Поцелуй и поезжай')
    await expect(page.locator('div[dir="ltr"]').first()).toBeVisible()

    await page.getByLabel('Когда дежурит мой класс?').selectOption({ label: '6-2' })
    await expect(page.getByTestId('my-shift')).toContainText('18–30 октября')
    await expect(page.getByTestId('my-shift-when')).toHaveText('Осталось 5 дней')
    await expect(page.getByTestId('school-now')).toContainText('дежурит до 30 октября')
    await expect(page.getByTestId('school-next')).toContainText('Следующий:')
    await expect(page.getByTestId('school-next')).toContainText('с 1 ноября')
  })

  test('the school card keeps one height in every state, so nothing jumps when it fills in after mount', async ({ page }) => {
    const heightOn = async (path: string, date: string) => {
      await open(page, path, date)
      await expect(page.getByTestId('school-status')).not.toBeEmpty()
      return (await page.getByTestId('school-status').boundingBox())?.height
    }
    const shift = await heightOn('/he/kiss-and-ride', '2026-10-25')
    expect(shift).toBeGreaterThan(0)
    expect(await heightOn('/he/kiss-and-ride', '2026-12-08')).toBe(shift) // gap: nobody on duty
    expect(await heightOn('/he/kiss-and-ride', '2027-07-05')).toBe(shift) // year over: one line

    // Worst case for wrapping: Russian at 320px, a shared "next" shift that is the parent's class.
    await page.setViewportSize({ width: 320, height: 640 })
    expect(await heightOn(`/ru/kiss-and-ride?class=${encodeURIComponent('ד3')}`, '2026-11-25')).toBe(shift)
    await expect(page.getByTestId('school-next')).toContainText('Следующие:')
    await expect(page.getByTestId('school-next')).toContainText('Ваш класс')
    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }))
    expect(sw).toBe(cw)
  })
})
