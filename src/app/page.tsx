'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dashboard } from '@/components/features/dashboard/Dashboard'
import { PublicHomepage } from '@/components/features/homepage/PublicHomepage'
import type { DashboardStats, Event, Task, CalendarEvent, Holiday } from '@/types'

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Check authentication
      const authResponse = await fetch('/api/auth/session')
      const authData = await authResponse.json()
      const isAuth = authData.authenticated && authData.role === 'admin'
      setIsAuthenticated(isAuth)

      // Load events (upcoming, published)
      const eventsResponse = await fetch('/api/events?upcoming=true&limit=10')
      const eventsData = await eventsResponse.json()
      if (eventsData.success) {
        setEvents(eventsData.data || [])
      }

      // Load holidays
      const holidaysResponse = await fetch('/api/holidays')
      const holidaysData = await holidaysResponse.json()
      if (holidaysData.success) {
        setHolidays(holidaysData.data || [])
      }

      // Load tasks (if authenticated)
      if (isAuth) {
        const tasksResponse = await fetch('/api/tasks?status=pending,in_progress&limit=10')
        const tasksData = await tasksResponse.json()
        if (tasksData.success) {
          setTasks(tasksData.data || [])
        }

        // Load dashboard stats
        const statsResponse = await fetch('/api/dashboard/stats')
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setStats(statsData.data)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isLoading || isAuthenticated === null) {
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
    ...holidays.map(h => ({
      id: h.id,
      title: h.name,
      date: new Date(h.start_date),
      type: 'holiday' as const,
      description: h.description
    }))
  ]

  // Show appropriate homepage based on auth status
  if (isAuthenticated) {
    // Committee member - show full dashboard
    return (
      <Dashboard
        stats={stats}
        upcomingEvents={events}
        pendingTasks={tasks}
        calendarEvents={calendarEvents}
      />
    )
  }

  // Regular parent - show public homepage
  return (
    <PublicHomepage
      upcomingEvents={events}
      calendarEvents={calendarEvents}
    />
  )
}