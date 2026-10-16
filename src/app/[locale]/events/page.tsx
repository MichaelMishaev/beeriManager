'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, Camera, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { DuoTag, duoPress } from '@/components/ui/duo'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { Event } from '@/types'

// Map app locale to date format locale
const getDateLocale = (locale: string) => {
  const localeMap: Record<string, string> = {
    he: 'he-IL',
    ru: 'ru-RU',
    ar: 'ar-SA',
    en: 'en-US'
  }
  return localeMap[locale] || 'he-IL'
}

function EventsList({
  filter,
  showDrafts,
  locale
}: {
  filter: 'all' | 'upcoming' | 'past' | 'photos'
  showDrafts: boolean
  locale: string
}) {
  const t = useTranslations('Events')
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const todayEventRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadEvents()
  }, [showDrafts])

  async function loadEvents() {
    try {
      const statusParam = showDrafts ? 'all' : 'published'
      const response = await fetch(`/api/events?limit=100&status=${statusParam}`)
      const data = await response.json()
      if (data.success) {
        setAllEvents(data.data || [])
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-scroll to today's events when viewing "all" events (only on first load)
  useEffect(() => {
    if (!isLoading && filter === 'all' && todayEventRef.current) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        todayEventRef.current?.scrollIntoView({
          behavior: 'auto', // Changed from 'smooth' to 'auto' for instant scroll
          block: 'start'    // Changed from 'center' to 'start' to avoid blank space
        })
      }, 150)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isLoading, filter]) // Removed allEvents to prevent re-scroll on data change

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const now = new Date()
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0) // Start of today at midnight

  const filteredEvents = allEvents.filter(event => {
    const eventDate = new Date(event.start_datetime)
    const eventEnd = event.end_datetime ? new Date(event.end_datetime) : eventDate

    switch (filter) {
      case 'upcoming':
        return eventDate >= startOfToday // ✅ Include events happening today
      case 'past':
        return eventEnd < now
      case 'photos':
        return event.photos_url && eventEnd < now
      case 'all':
      default:
        return true
    }
  })

  // Sort events for optimal viewing experience
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.start_datetime)
    const dateB = new Date(b.start_datetime)

    if (filter === 'all') {
      // For "all" tab: chronological order (oldest first)
      // Past events appear at top, upcoming at bottom
      // Scroll UP to see older past events, scroll DOWN to see future events
      return dateA.getTime() - dateB.getTime()
    } else if (filter === 'upcoming') {
      // Upcoming events: sort ascending (soonest first)
      return dateA.getTime() - dateB.getTime()
    } else {
      // Past/photos: sort descending (most recent first)
      return dateB.getTime() - dateA.getTime()
    }
  })

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {filter === 'photos' ? t('emptyPhotos') : t('emptyEvents')}
        </p>
      </div>
    )
  }

  // Find the first upcoming event (today or later) for auto-scroll
  const firstUpcomingIndex = sortedEvents.findIndex(event => {
    const eventDate = new Date(event.start_datetime)
    return eventDate >= startOfToday
  })

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {sortedEvents.map((event, index) => {
        const isFirstUpcoming = filter === 'all' && index === firstUpcomingIndex
        const start = new Date(event.start_datetime)
        // All-day events are stored as UTC midnight (= 03:00 in Israel) — treat both
        // local and UTC midnight as "no specific time"
        const hasTime = !((start.getHours() === 0 && start.getMinutes() === 0) || (start.getUTCHours() === 0 && start.getUTCMinutes() === 0))
        const title = locale === 'ru' && event.title_ru ? event.title_ru : event.title
        const location = locale === 'ru' && event.location_ru ? event.location_ru : event.location
        const description = locale === 'ru' && event.description_ru ? event.description_ru : event.description

        return (
          <div key={event.id} ref={isFirstUpcoming ? todayEventRef : null} className="scroll-mt-24">
            <Link href={`/events/${event.id}`} className="block h-full">
              {/* Compact card: title, date·time·place, 1-line description, type */}
              <Card className={cn(duoPress, 'h-full cursor-pointer p-4')}>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base md:text-lg font-extrabold text-[#003153] leading-tight flex-1">
                    {title}
                  </h2>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* "Published" is the default state — only flag the exceptions */}
                    {event.status === 'draft' && <DuoTag tone="yellow">{t('badgeDraft')}</DuoTag>}
                    {event.status === 'cancelled' && <DuoTag tone="red">{t('badgeCancelled')}</DuoTag>}
                    {event.photos_url && <Camera className="h-5 w-5 text-[#087A96]" aria-label={t('badgePhotos')} />}
                  </div>
                </div>
                <p className="mt-1.5 text-sm font-medium text-gray-600">
                  {start.toLocaleDateString(getDateLocale(locale), { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                  {hasTime && ` · ${start.toLocaleTimeString(getDateLocale(locale), { hour: '2-digit', minute: '2-digit' })}`}
                  {location && ` · ${location}`}
                </p>
                {description && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-1">{description}</p>
                )}
                <div className="mt-2.5">
                  <Badge variant="secondary" className="text-xs">
                    {event.event_type === 'meeting' && t('typeMeeting')}
                    {event.event_type === 'fundraiser' && t('typeFundraiser')}
                    {event.event_type === 'general' && t('typeGeneral')}
                    {event.event_type === 'trip' && t('typeTrip')}
                    {event.event_type === 'workshop' && t('typeWorkshop')}
                  </Badge>
                </div>
              </Card>
            </Link>
          </div>
        )
      })}
    </div>
  )
}

export default function EventsPage() {
  const params = useParams()
  const locale = (params.locale as string) || 'he'
  const t = useTranslations('Events')

  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past' | 'photos'>('upcoming')
  const showDrafts = false // Only show published events

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 md:h-8 md:w-8" />
            {t('title')}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mt-2">
            {t('subtitle')}
          </p>
        </div>
        <Button variant="outline" asChild size="sm">
          <Link href="/calendar">
            <Calendar className="h-4 w-4 ml-2" />
            <span className="hidden sm:inline">{t('calendarView')}</span>
            <span className="sm:hidden">{t('calendarViewShort')}</span>
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="upcoming" className="min-h-[44px]">{t('tabUpcoming')}</TabsTrigger>
          <TabsTrigger value="all" className="min-h-[44px]">{t('tabAll')}</TabsTrigger>
          <TabsTrigger value="past" className="min-h-[44px]">{t('tabPast')}</TabsTrigger>
          <TabsTrigger value="photos" className="gap-1 min-h-[44px]">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabPhotos')}</span>
            <span className="sm:hidden">{t('tabPhotosShort')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <EventsList filter="all" showDrafts={showDrafts} locale={locale} />
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <EventsList filter="upcoming" showDrafts={showDrafts} locale={locale} />
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <EventsList filter="past" showDrafts={showDrafts} locale={locale} />
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          <EventsList filter="photos" showDrafts={showDrafts} locale={locale} />
        </TabsContent>
      </Tabs>
    </div>
  )
}