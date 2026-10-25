'use client'

import { useTranslations } from 'next-intl'
import {
  classKey,
  getCurrentShift,
  getNextShift,
  type KissRideClass,
  type KissRideShift,
} from '@/lib/data/kiss-and-ride'

interface Props {
  /** ISO date in Israel, or null before mount (the card then renders empty at full height, so nothing jumps). */
  today: string | null
  /** The parent's chosen class, if any: gets a yellow "your class" tag when it is now / next. */
  selected: KissRideClass | null
  /** Display name of a shift's class(es): "ו׳1", or "ד׳3 וג׳3" for a shared shift. */
  names: (shift: KissRideShift) => string
  /** "30 באוקטובר" / "30 октября", built from translated month names (no Intl: hydration-safe). */
  dayMonth: (iso: string) => string
}

/**
 * School-wide status, not the parent's class: which class is on duty now, and which one is next.
 * One "live status" card, not two equal tiles: what matters today is big, what comes next is a single
 * footer line under a divider (cf. Flighty's live flight card with its "Gate departure in…" footer,
 * Transit's lock-screen live activity, Apple Sports' "Q1 · In progress" card — all on Mobbin).
 * Titled "at school now" so it can't be read as the parent's own answer, which is the picker card below.
 */
export function KissRideNowNext({ today, selected, names, dayMonth }: Props) {
  const t = useTranslations('kissRide')

  const current = today ? getCurrentShift(today) : undefined
  const next = today ? getNextShift(today) : undefined
  const yearOver = today !== null && !current && !next

  const isMine = (shift: KissRideShift) =>
    selected ? shift.classes.some((x) => classKey(x) === classKey(selected)) : false

  const yourClass = (shift: KissRideShift) =>
    isMine(shift) ? (
      <span className="shrink-0 rounded-full bg-[#FFBA00] px-2 py-0.5 text-xs font-bold text-[#003153]">
        {t('school.yourClass')}
      </span>
    ) : null

  if (yearOver) {
    return (
      <section data-testid="school-status" aria-labelledby="kiss-school-title" className="mt-3">
        <h2 id="kiss-school-title" className="sr-only">
          {t('school.title')}
        </h2>
        <p
          data-testid="school-year-over"
          className="flex min-h-[160px] items-center rounded-2xl bg-[#0B4470] px-4 py-3 text-base font-bold leading-snug text-white ring-1 ring-inset ring-white/15"
        >
          {t('school.yearOver')}
        </p>
      </section>
    )
  }

  return (
    <section
      data-testid="school-status"
      aria-labelledby="kiss-school-title"
      className="mt-3 rounded-2xl bg-[#0B4470] ring-1 ring-inset ring-white/15"
    >
      <div data-testid="school-now" className="flex min-h-[104px] flex-col px-4 py-3">
        <h2 id="kiss-school-title" className="flex items-center gap-2 text-[13px] font-bold text-[#BFE3F2]">
          {/* Static "live" dot (no pulse: the page must stay calm); grey when nobody is on duty. */}
          <span className={`h-2 w-2 shrink-0 rounded-full ${current ? 'bg-[#87CEEB]' : 'bg-white/40'}`} aria-hidden="true" />
          {t('school.title')}
        </h2>
        {/* Heights are fixed (104 + 56 = 160px, the year-over box too), so filling in after mount
            moves nothing — even when a shared "next" plus the "your class" tag wraps the footer to two lines. */}
        {today === null ? null : current ? (
          <>
            {/* "Your class" sits on the class line, so a remembered class doesn't grow the card after mount. */}
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <bdi className="text-[28px] font-bold leading-tight text-white">{names(current)}</bdi>
              {yourClass(current)}
            </p>
            <p className="text-sm leading-snug text-[#D6E6EE]">
              {t('school.dutyUntil', { count: current.classes.length, date: dayMonth(current.end) })}
            </p>
          </>
        ) : (
          <p className="my-auto pt-1 text-xl font-bold leading-tight text-white">{t('school.nobody')}</p>
        )}
      </div>

      <div
        data-testid="school-next"
        className="flex min-h-[56px] flex-wrap items-center gap-x-2 gap-y-0.5 border-t border-white/15 px-4 py-1.5 text-sm leading-snug"
      >
        {today === null ? null : next ? (
          <>
            <span className="text-[#D6E6EE]">{t('school.next', { count: next.classes.length })}</span>
            <bdi className="font-bold text-white">{names(next)}</bdi>
            {yourClass(next)}
            <span className="ms-auto text-[#D6E6EE]">{t('school.from', { date: dayMonth(next.start) })}</span>
          </>
        ) : (
          <span className="text-[#D6E6EE]">{t('school.lastOne')}</span>
        )}
      </div>
    </section>
  )
}
