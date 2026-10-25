'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import { ShareButton } from '@/components/ui/share-button'
import type { Locale } from '@/i18n/config'
import { KissRideCalendar } from './KissRideCalendar'
import { KissRideNowNext } from './KissRideNowNext'
import {
  KISS_RIDE_GRADES,
  classKey,
  daysBetween,
  getClassNumbers,
  getNextShift,
  getShiftForClass,
  getShiftStatus,
  kissRideShifts,
  parseClassKey,
  todayInIsrael,
  type KissRideClass,
  type KissRideShift,
  type ShiftStatus,
} from '@/lib/data/kiss-and-ride'

const STORAGE_KEY = 'kissRide.myClass'
/** `?class=ד3` preselects a class, so a parent can forward "our class's dates" to the class WhatsApp group. */
const URL_PARAM = 'class'

function readStoredClass(): KissRideClass | undefined {
  try {
    return parseClassKey(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return undefined // storage blocked (private mode etc.): start without a preselected class
  }
}

function storeClass(cls: KissRideClass) {
  try {
    window.localStorage.setItem(STORAGE_KEY, classKey(cls))
  } catch {
    // non-essential convenience; ignore when storage is unavailable
  }
}

const hasClass = (shift: KissRideShift, cls: KissRideClass) => shift.classes.some((x) => classKey(x) === classKey(cls))

export function KissAndRideContent() {
  const t = useTranslations('kissRide')
  const params = useParams()
  const locale = (params.locale || 'he') as Locale
  const dir = locale === 'ru' ? 'ltr' : 'rtl'

  // Resolved after mount so server and client render the same first paint.
  const [today, setToday] = useState<string | null>(null)
  const [selected, setSelected] = useState<KissRideClass | null>(null)
  const [origin, setOrigin] = useState('https://beeri.online')

  useEffect(() => {
    setToday(todayInIsrael())
    setOrigin(window.location.origin)
    // A shared link (?class=…) wins over the remembered class, but isn't saved: it may be someone else's class.
    const fromUrl = parseClassKey(new URLSearchParams(window.location.search).get(URL_PARAM))
    const initial = fromUrl ?? readStoredClass()
    if (initial) setSelected(initial)
  }, [])

  const label = (cls: KissRideClass) => t('classLabel', { grade: t(`gradeName.${cls.grade}`), num: cls.num })

  // Built from translated month names, not Intl: Intl output differs between Node's and the browser's ICU,
  // which caused a hydration mismatch on /ru.
  const formatRange = (shift: KissRideShift) => {
    const [, sm, sd] = shift.start.split('-').map(Number)
    const [, em, ed] = shift.end.split('-').map(Number)
    return sm === em
      ? t('rangeSameMonth', { from: sd, to: ed, month: t(`monthInRange.${sm}`) })
      : t('rangeCrossMonth', { from: sd, fromMonth: t(`monthInRange.${sm}`), to: ed, toMonth: t(`monthInRange.${em}`) })
  }

  /** "ו׳1" or, for a shared shift, "ד׳3 וג׳3" / "4-3 и 3-3". */
  const names = (shift: KissRideShift) => {
    const [a, b] = shift.classes.map(label)
    return b ? t('classPair', { a, b }) : a
  }

  const dayMonth = (iso: string) => {
    const [, m, d] = iso.split('-').map(Number)
    return t('dayMonth', { day: d, month: t(`monthInRange.${m}`) })
  }

  const whenText = (shift: KissRideShift, status: ShiftStatus, now: string) => {
    if (status === 'past') return t('pastThanks')
    if (status === 'now') return t('endsIn', { days: daysBetween(now, shift.end) })
    const days = daysBetween(now, shift.start)
    if (days <= 13) return t('startsInDays', { days })
    if (days < 60) return t('startsInWeeks', { weeks: Math.round(days / 7) })
    return t('startsInMonths', { months: Math.round(days / 30) })
  }

  const shift = selected ? getShiftForClass(selected) : undefined
  const status = shift && today ? getShiftStatus(shift, today) : null
  const nextShift = today ? getNextShift(today) : undefined
  const isNext = !!(selected && nextShift && hasClass(nextShift, selected))

  const onSelect = (value: string) => {
    const cls = parseClassKey(value)
    if (!cls) return
    setSelected(cls)
    storeClass(cls)
  }

  const shareData =
    selected && shift
      ? {
          title: t('title'),
          text: t('shareClassText', { class: label(selected), dates: formatRange(shift) }),
          url: `${origin}/${locale}/kiss-and-ride?${URL_PARAM}=${encodeURIComponent(classKey(selected))}`,
        }
      : { title: t('title'), text: t('subtitle'), url: `${origin}/${locale}/kiss-and-ride` }

  return (
    <div className="min-h-dvh bg-[#F4F8FA] text-[#003153]" dir={dir}>
      <header className="bg-[#003153] text-white">
        <div className="mx-auto flex max-w-md flex-col gap-1 px-4 pt-4 pb-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-[22px] font-bold leading-tight">
              {t('title')}
            </h1>
            <ShareButton
              shareData={shareData}
              showMenu={false}
              variant="ghost"
              size="icon"
              locale={locale === 'ru' ? 'ru' : 'he'}
              className="h-11 w-11 shrink-0 rounded-full border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              aria-label={t('share')}
            />
          </div>
          <p className="text-sm leading-snug text-[#D6E6EE]">{t('subtitle')}</p>
          <KissRideNowNext today={today} selected={selected} names={names} dayMonth={dayMonth} />
        </div>
      </header>

      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {/* One question, one answer: pick the class, see its dates. */}
        <section className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-4">
          <label htmlFor="kiss-ride-class" className="mb-2 block text-lg font-bold">
            {t('pickTitle')}
          </label>
          <div className="relative">
            {/* Native select: on phones it opens the system picker sheet — familiar, accessible, two taps. */}
            <select
              id="kiss-ride-class"
              data-testid="class-select"
              value={selected ? classKey(selected) : ''}
              onChange={(e) => onSelect(e.target.value)}
              className={`h-14 w-full cursor-pointer appearance-none bg-none rounded-xl border-2 px-4 pe-12 text-lg font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA] focus-visible:ring-offset-2 ${
                selected ? 'border-[#D6E6EE] bg-white text-[#003153]' : 'border-[#003153] bg-[#003153] text-white'
              }`}
            >
              <option value="" disabled>
                {t('selectPlaceholder')}
              </option>
              {KISS_RIDE_GRADES.map((grade) => (
                <optgroup key={grade} label={t('gradeGroup', { grade: t(`gradeName.${grade}`) })}>
                  {getClassNumbers(grade).map((num) => {
                    const cls = { grade, num }
                    return (
                      <option key={num} value={classKey(cls)}>
                        {label(cls)}
                      </option>
                    )
                  })}
                </optgroup>
              ))}
            </select>
            <ChevronDown
              className={`pointer-events-none absolute end-4 top-1/2 h-5 w-5 -translate-y-1/2 ${selected ? 'text-[#0D98BA]' : 'text-white'}`}
              aria-hidden="true"
            />
          </div>

          <div aria-live="polite" data-testid="my-shift">
            {selected && shift && (
              <div className={`mt-4 rounded-xl p-4 ${status === 'now' ? 'bg-[#FFBA00]' : 'bg-[#F4F8FA]'}`}>
                <p className="text-sm font-bold">
                  {status === 'now' ? t('myShiftNow', { class: label(selected) }) : t('myShift', { class: label(selected) })}
                </p>
                <p className={`mt-1 text-2xl font-bold leading-tight [text-wrap:balance] ${status === 'past' ? 'text-gray-500' : ''}`}>
                  <bdi>{formatRange(shift)}</bdi>
                </p>
                {shift.classes.length > 1 && (
                  <p className="mt-1 text-sm font-bold">
                    {t('alsoWith', {
                      class: shift.classes
                        .filter((x) => classKey(x) !== classKey(selected))
                        .map(label)
                        .join(', '),
                    })}
                  </p>
                )}
                {status && today && (
                  <p data-testid="my-shift-when" className="mt-1 text-sm">
                    {isNext && <strong className="font-bold">{t('youAreNext')} · </strong>}
                    {whenText(shift, status, today)}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Only once a class is chosen: the same answer, shown on a month grid. */}
        {selected && shift && (
          <KissRideCalendar shift={shift} classLabel={label(selected)} today={today} dir={dir} />
        )}

        {/* Secondary, collapsed by default: the full list and the how-to. */}
        <details data-testid="full-schedule" className="group rounded-2xl border-2 border-[#E5E5E5] bg-white">
          <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 font-bold transition-colors active:bg-[#F4F8FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA] motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
            {t('fullSchedule')}
            <ChevronDown className="h-5 w-5 shrink-0 text-[#0D98BA] transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
          </summary>
          <ul className="border-t border-[#EEF2F4]">
            {kissRideShifts.map((s) => {
              const rowStatus = today ? getShiftStatus(s, today) : 'upcoming'
              const mine = selected ? hasClass(s, selected) : false
              return (
                <li
                  key={s.start}
                  data-testid="shift-row"
                  data-mine={mine}
                  data-status={rowStatus}
                  className={`flex min-h-[44px] items-center justify-between gap-3 border-t border-[#EEF2F4] px-4 py-2 text-sm first:border-t-0 ${
                    mine ? 'bg-[#E3F3F8] font-bold' : rowStatus === 'past' ? 'text-gray-400' : ''
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block font-bold">{names(s)}</span>
                    {rowStatus === 'now' && <span className="block text-xs font-bold text-[#0D98BA]">{t('rowNow')}</span>}
                    {nextShift === s && <span className="block text-xs font-bold text-[#0D98BA]">{t('rowNext')}</span>}
                  </span>
                  <bdi className="shrink-0">{formatRange(s)}</bdi>
                </li>
              )
            })}
          </ul>
          <p className="border-t border-[#EEF2F4] px-4 py-3 text-xs text-gray-600">{t('source')}</p>
        </details>

        <details className="group rounded-2xl border-2 border-[#E5E5E5] bg-white">
          <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 font-bold transition-colors active:bg-[#F4F8FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA] motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
            {t('howTitle')}
            <ChevronDown className="h-5 w-5 shrink-0 text-[#0D98BA] transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
          </summary>
          <ol className="flex list-decimal flex-col gap-2 border-t border-[#EEF2F4] px-4 py-3 ps-9 text-sm leading-relaxed">
            <li>{t('step1')}</li>
            <li>{t('step2')}</li>
            <li>{t('step3')}</li>
          </ol>
        </details>
      </div>
    </div>
  )
}
