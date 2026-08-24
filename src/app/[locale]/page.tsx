'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dashboard } from '@/components/features/dashboard/Dashboard'
import { PublicHomepage } from '@/components/features/homepage/PublicHomepage'
import { ThankYouPopup } from '@/components/features/meetings/ThankYouPopup'
import { eachDayOfInterval, parseISO } from 'date-fns'
import type { DashboardStats, Event, Task, CalendarEvent, Holiday } from '@/types'
import { useAuthSession } from '@/hooks/useAuthSession'

export default function HomePage() {
  const { isAdmin: isAuthenticated, isLoading: isAuthLoading } = useAuthSession()
  const [isPublicDataLoading, setIsPublicDataLoading] = useState(true)
  const [isAdminDataLoading, setIsAdminDataLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    upcomingEvents: 0,
    pendingTasks: 0,
    activeIssues: 0,
    recentProtocols: 0,
    pendingExpenses: 0,
    thisMonthEvents: 0
  })

  // Events/holidays don't depend on auth, so fetch them immediately in parallel
  // rather than waiting on the session check first.
  useEffect(() => {
    loadPublicData()
  }, [])

  // Admin-only data loads once we know the session is authenticated
  useEffect(() => {
    if (isAuthLoading) return
    if (isAuthenticated) {
      loadAdminData()
    } else {
      setIsAdminDataLoading(false)
    }
  }, [isAuthLoading, isAuthenticated])

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

  async function loadAdminData() {
    try {
      const [tasksResponse, statsResponse] = await Promise.all([
        fetch('/api/tasks?status=pending,in_progress&limit=10'),
        fetch('/api/dashboard/stats')
      ])
      const [tasksData, statsData] = await Promise.all([
        tasksResponse.json(),
        statsResponse.json()
      ])
      if (tasksData.success) {
        setTasks(tasksData.data || [])
      }
      if (statsData.success) {
        setStats(statsData.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsAdminDataLoading(false)
    }
  }

  // Loading state - wait for auth + public data always, and admin data only
  // when the session turns out to be an authenticated admin.
  const isLoading = isAuthLoading || isPublicDataLoading || (isAuthenticated && isAdminDataLoading)
  if (isLoading) {
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

  // Show appropriate homepage based on auth status
  if (isAuthenticated) {
    // Committee member - show full dashboard
    return (
      <>
        <ThankYouPopup />
        <Dashboard
          stats={stats}
          upcomingEvents={events}
          pendingTasks={tasks}
          calendarEvents={calendarEvents}
        />
      </>
    )
  }

  // Regular parent - show public homepage
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