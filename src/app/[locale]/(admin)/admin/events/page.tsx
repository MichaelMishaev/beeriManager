'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CalendarX, Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import {
  AdminEmptyState,
  AdminGroup,
  AdminPageHeader,
  AdminRow,
  AdminSegmentedTabs,
  StatusPill,
} from '@/components/features/admin'
import { Button } from '@/components/ui/button'
import { Link, useRouter } from '@/i18n/navigation'
import { classifyEvent, SCHOOL_TIME_ZONE } from '@/lib/utils/admin-events'
import type { AdminEventTab } from '@/lib/utils/admin-events'
import type { Event } from '@/types'

const TABS: AdminEventTab[] = ['upcoming', 'drafts', 'past']
const PAST_PAGE_SIZE = 30

function parseTab(value: string | null): AdminEventTab {
  return TABS.find((tab) => tab === value) ?? 'upcoming'
}

function intlLocale(locale: string): string {
  return locale === 'ru' ? 'ru-RU' : 'he-IL'
}

function DateTile({ iso, locale }: { iso: string; locale: string }) {
  const date = new Date(iso)
  const day = new Intl.DateTimeFormat(intlLocale(locale), {
    day: 'numeric',
    timeZone: SCHOOL_TIME_ZONE,
  }).format(date)
  const month = new Intl.DateTimeFormat(intlLocale(locale), {
    month: 'short',
    timeZone: SCHOOL_TIME_ZONE,
  }).format(date)

  return (
    <span
      className="flex h-11 w-11 flex-none flex-col items-center justify-center rounded-[10px] bg-[#87CEEB]/30 text-[#003153]"
      aria-hidden="true"
    >
      <span className="text-[15px] font-bold leading-none">{day}</span>
      <span className="mt-0.5 text-[10px] font-semibold leading-none">{month}</span>
    </span>
  )
}

function EventsSkeleton() {
  return (
    <div
      className="divide-y divide-[#eef0f2] overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
      data-testid="admin-events-loading"
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <div className="h-11 w-11 animate-pulse rounded-[10px] bg-[#eef0f2]" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-[#eef0f2]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[#eef0f2]" />
          </div>
        </div>
      ))}
    </div>
  )
}

function AdminEventsList() {
  const t = useTranslations('admin.events')
  const tc = useTranslations('admin.common')
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = parseTab(searchParams.get('tab'))

  const [events, setEvents] = useState<Event[] | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [pastShown, setPastShown] = useState(PAST_PAGE_SIZE)

  const load = useCallback(async () => {
    setLoadFailed(false)
    setEvents(null)
    try {
      const res = await fetch(`/api/events?status=all&limit=1000&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
      const json = (await res.json()) as { success: boolean; data?: Event[] }
      if (!res.ok || !json.success || !json.data) throw new Error('events request failed')
      setEvents(json.data)
    } catch (error) {
      console.error('Error loading admin events:', error)
      setLoadFailed(true)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const grouped = useMemo(() => {
    const now = new Date()
    const result: Record<AdminEventTab, Event[]> = { upcoming: [], drafts: [], past: [] }
    for (const event of events ?? []) {
      result[classifyEvent(event, now)].push(event)
    }
    const byStart = (e: Event) => new Date(e.start_datetime).getTime()
    result.upcoming.sort((a, b) => byStart(a) - byStart(b)) // soonest first
    result.drafts.sort((a, b) => byStart(a) - byStart(b))
    result.past.sort((a, b) => byStart(b) - byStart(a)) // newest first
    return result
  }, [events])

  const changeTab = (next: AdminEventTab) => {
    setPastShown(PAST_PAGE_SIZE)
    router.replace(`/admin/events?tab=${next}`)
  }

  const timeFormatter = new Intl.DateTimeFormat(intlLocale(locale), {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: SCHOOL_TIME_ZONE,
  })

  const subtitleFor = (event: Event): string => {
    const start = new Date(event.start_datetime)
    const time = timeFormatter.format(start)
    const location = locale === 'ru' && event.location_ru ? event.location_ru : event.location
    // Imported calendar events are stored as midnight UTC with no end time: those are all-day too
    const isUtcMidnight =
      !event.end_datetime && start.getUTCHours() === 0 && start.getUTCMinutes() === 0
    const when = time === '00:00' || isUtcMidnight ? t('list.allDay') : time
    return location ? `${when} · ${location}` : when
  }

  const pillFor = (event: Event) => {
    switch (event.status) {
      case 'published':
        return <StatusPill tone="success">{tc('status.published')}</StatusPill>
      case 'draft':
        return <StatusPill tone="warning">{tc('status.draft')}</StatusPill>
      case 'cancelled':
        return <StatusPill tone="danger">{tc('status.cancelled')}</StatusPill>
      case 'ongoing':
        return <StatusPill tone="info">{t('list.status.ongoing')}</StatusPill>
      case 'completed':
        return <StatusPill tone="neutral">{t('list.status.completed')}</StatusPill>
    }
  }

  const newEventButton = (
    <Button asChild className="h-11 bg-[#003153] hover:bg-[#003153]/90">
      <Link href="/admin/events/new">
        <Plus className="h-4 w-4 me-2" aria-hidden="true" />
        {t('list.createEvent')}
      </Link>
    </Button>
  )

  const visible = tab === 'past' ? grouped.past.slice(0, pastShown) : grouped[tab]

  return (
    <div>
      <AdminPageHeader
        title={t('list.title')}
        action={
          <Link
            href="/admin/events/new"
            aria-label={t('list.newAria')}
            data-testid="admin-events-new"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003153] text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#003153]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA] focus-visible:ring-offset-2"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </Link>
        }
      />

      <AdminSegmentedTabs<AdminEventTab>
        tabs={TABS.map((value) => ({
          value,
          label: t(`list.tabs.${value}`),
          count: events ? grouped[value].length : undefined,
        }))}
        value={tab}
        onChange={changeTab}
      />

      {loadFailed ? (
        <AdminEmptyState
          icon={CalendarX}
          title={t('list.loadError')}
          action={
            <Button variant="outline" className="h-11" onClick={() => void load()}>
              {tc('retry')}
            </Button>
          }
        />
      ) : events === null ? (
        <EventsSkeleton />
      ) : visible.length === 0 ? (
        <AdminEmptyState
          icon={CalendarX}
          title={t(`list.empty.${tab}.title`)}
          description={t(`list.empty.${tab}.description`)}
          action={newEventButton}
        />
      ) : (
        <>
          <AdminGroup>
            {visible.map((event) => (
              <AdminRow
                key={event.id}
                href={`/admin/events/${event.id}/edit`}
                testId="admin-event-row"
                leading={<DateTile iso={event.start_datetime} locale={locale} />}
                title={locale === 'ru' && event.title_ru ? event.title_ru : event.title}
                subtitle={subtitleFor(event)}
                trailing={pillFor(event)}
              />
            ))}
          </AdminGroup>

          {tab === 'past' && grouped.past.length > pastShown && (
            <div className="mt-3 flex justify-center">
              <Button
                variant="outline"
                className="h-11"
                data-testid="admin-events-show-more"
                onClick={() => setPastShown((n) => n + PAST_PAGE_SIZE)}
              >
                {t('list.showMore')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function AdminEventsPage() {
  return (
    <Suspense fallback={null}>
      <AdminEventsList />
    </Suspense>
  )
}
