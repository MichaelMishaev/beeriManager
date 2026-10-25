'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { kissRideShifts, type KissRideShift } from '@/lib/data/kiss-and-ride'

interface Props {
  shift: KissRideShift
  /** Display label of the chosen class, e.g. "ו׳2". */
  classLabel: string
  /** ISO date in Israel, or null before mount. */
  today: string | null
  dir: 'rtl' | 'ltr'
}

interface Month {
  year: number
  month: number // 1-12
}

const monthOf = (iso: string): Month => {
  const [year, month] = iso.split('-').map(Number)
  return { year, month }
}
const monthIndex = (m: Month) => m.year * 12 + (m.month - 1)
const fromIndex = (i: number): Month => ({ year: Math.floor(i / 12), month: (i % 12) + 1 })
const pad = (n: number) => String(n).padStart(2, '0')

// The school year the schedule covers: navigation stops at its first and last month.
const FIRST = monthIndex(monthOf(kissRideShifts[0].start))
const LAST = monthIndex(monthOf(kissRideShifts[kissRideShifts.length - 1].end))

/**
 * Month grid in the style of the home-page calendar (white rounded card, month header with arrows,
 * Sunday-first 7-column grid, today in yellow). Duty days of the chosen class are filled navy;
 * Saturdays (no school) are never filled. Pure ISO-string/UTC maths so server and client render the same.
 */
export function KissRideCalendar({ shift, classLabel, today, dir }: Props) {
  const t = useTranslations('kissRide')
  const [view, setView] = useState(() => monthIndex(monthOf(shift.start)))

  // Opens on the shift's first month — or on this month while the shift is running, so "today" is in view.
  // Re-runs when a different class is chosen (and once "today" resolves after mount).
  useEffect(() => {
    const running = today !== null && today >= shift.start && today <= shift.end
    setView(monthIndex(monthOf(running ? today : shift.start)))
  }, [shift.start, shift.end, today])

  const cells = useMemo(() => {
    const { year, month } = fromIndex(view)
    const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay() // 0 = Sunday
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
    const list: Array<{ day: number; iso: string; weekday: number } | null> = Array(firstWeekday).fill(null)
    for (let day = 1; day <= daysInMonth; day++) {
      list.push({ day, iso: `${year}-${pad(month)}-${pad(day)}`, weekday: (firstWeekday + day - 1) % 7 })
    }
    return list
  }, [view])

  const { year, month } = fromIndex(view)
  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight
  const navButton =
    'flex h-11 w-11 items-center justify-center rounded-full text-[#0D98BA] transition-colors motion-reduce:transition-none hover:bg-[#E3F3F8] active:bg-[#E3F3F8] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA]'

  return (
    <section data-testid="kiss-calendar" className="rounded-2xl bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setView((v) => Math.max(FIRST, v - 1))}
          disabled={view <= FIRST}
          aria-label={t('calendar.prevMonth')}
          className={navButton}
        >
          <PrevIcon className="h-6 w-6" aria-hidden="true" />
        </button>
        <h2 aria-live="polite" data-testid="calendar-month" className="text-lg font-bold text-[#003153]">
          {t('calendar.monthYear', { month: t(`calendar.month${month}`), year })}
        </h2>
        <button
          type="button"
          onClick={() => setView((v) => Math.min(LAST, v + 1))}
          disabled={view >= LAST}
          aria-label={t('calendar.nextMonth')}
          className={navButton}
        >
          <NextIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500" aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="py-1.5 font-medium">
            {t(`calendar.weekday${i}`)}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`blank-${i}`} aria-hidden="true" />
          const duty = cell.weekday !== 6 && cell.iso >= shift.start && cell.iso <= shift.end
          const isToday = cell.iso === today
          return (
            <div
              key={cell.iso}
              data-testid="calendar-day"
              data-duty={duty}
              data-today={isToday}
              aria-label={duty ? t('calendar.dutyDay', { day: cell.day, month: t(`monthInRange.${month}`) }) : undefined}
              className={`flex aspect-square min-h-[40px] items-center justify-center rounded-lg text-sm ${
                duty ? 'bg-[#003153] font-bold text-white' : cell.weekday === 6 ? 'text-gray-300' : 'text-[#003153]'
              } ${isToday ? 'ring-2 ring-[#FFBA00] ring-offset-1 font-bold' : ''}`}
            >
              {cell.day}
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[#003153]" aria-hidden="true" />
          {t('calendar.legendDuty', { class: classLabel })}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded ring-2 ring-[#FFBA00]" aria-hidden="true" />
          {t('calendar.legendToday')}
        </span>
      </div>
    </section>
  )
}
