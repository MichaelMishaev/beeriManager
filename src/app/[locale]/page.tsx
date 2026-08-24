'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { PublicHomepage } from '@/components/features/homepage/PublicHomepage'
import { ThankYouPopup } from '@/components/features/meetings/ThankYouPopup'
import { eachDayOfInterval, parseISO } from 'date-fns'
import type { Event, CalendarEvent, Holiday } from '@/types'

export default function HomePage() {
  const [isPublicDataLoading, setIsPublicDataLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])

  useEffect(() => {
    loadPublicData()
  }, [])

  async function loadPublicData() {
    try {
      const [eventsResponse, holidaysResponse] = await Promise.all([
        fetch('/api/events?upcoming=true&limit=50'),
        fetch('/api/holidays')
      ])
      const [eventsData, holidaysData] = await Promise.all([
        eventsResponse.json(),
        holidaysResponse.json()
      ])
      if (eventsData.success) {
        setEvents(eventsData.data || [])
      }
      if (holidaysData.success) {
        setHolidays(holidaysData.data || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsPublicDataLoading(false)
    }
  }

  if (isPublicDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">טוען...</p>
        </div>
      </div>
    )
  }

  // Combine events and holidays for calendar
  const calendarEvents: CalendarEvent[] = [
    ...events.map(e => ({
      id: e.id,
      title: e.title,
      date: new Date(e.start_datetime),
      type: 'event' as const
    })),
    // Expand holidays to include all days in the range (inclusive of start and end dates)
    ...holidays.flatMap(h => {
      const start = parseISO(h.start_date)
      const end = parseISO(h.end_date)

      // Use eachDayOfInterval to get all days from start to end (inclusive)
      const days = eachDayOfInterval({ start, end })

      return days.map(date => ({
        id: `${h.id}-${date.toISOString().split('T')[0]}`,
        title: h.hebrew_name,
        date,
        type: 'holiday' as const,
        description: h.description,
        isSchoolClosed: h.is_school_closed
      }))
    })
  ]

  // The homepage (/[locale]) always shows the public view, for everyone —
  // including logged-in admins. The admin dashboard lives at /[locale]/admin.
  return (
    <>
      <ThankYouPopup />
      <PublicHomepage
        upcomingEvents={events}
        calendarEvents={calendarEvents}
      />
    </>
  )
}
