'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dashboard } from '@/components/features/dashboard/Dashboard'
import { PublicHomepage } from '@/components/features/homepage/PublicHomepage'
import type { DashboardStats, Event, Task, CalendarEvent } from '@/types'

// Mock data - will be replaced with real API calls
function getMockData() {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'ישיבת ועד חודשית',
      description: 'ישיבת ועד שגרתית לסיכום החודש',
      start_datetime: '2025-10-15T19:00:00Z',
      end_datetime: '2025-10-15T21:00:00Z',
      location: 'בית הספר',
      event_type: 'meeting',
      status: 'published',
      visibility: 'public',
      priority: 'normal',
      registration_enabled: false,
      current_attendees: 0,
      rsvp_yes_count: 0,
      rsvp_no_count: 0,
      rsvp_maybe_count: 0,
      budget_spent: 0,
      requires_payment: false,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'חנוכה - אירוע משפחות',
      description: 'חגיגת חנוכה לכל המשפחות',
      start_datetime: '2025-12-15T17:00:00Z',
      end_datetime: '2025-12-15T20:00:00Z',
      location: 'חצר בית הספר',
      event_type: 'general',
      status: 'published',
      visibility: 'public',
      priority: 'normal',
      registration_enabled: false,
      current_attendees: 0,
      rsvp_yes_count: 0,
      rsvp_no_count: 0,
      rsvp_maybe_count: 0,
      budget_spent: 0,
      requires_payment: false,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      title: 'מסיבת סיום כיתות ו 2024',
      description: 'מסיבת סיום שנה מרגשת לתלמידי כיתות ו',
      start_datetime: '2024-06-25T18:00:00Z',
      end_datetime: '2024-06-25T22:00:00Z',
      location: 'אולם בית הספר',
      event_type: 'general',
      status: 'completed',
      visibility: 'public',
      priority: 'normal',
      registration_enabled: false,
      current_attendees: 287,
      rsvp_yes_count: 0,
      rsvp_no_count: 0,
      rsvp_maybe_count: 0,
      budget_spent: 0,
      requires_payment: false,
      photos_url: 'https://drive.google.com/drive/folders/1TlwKxDvwySmWSMgDGlxf7mC5Ts5Q1WHL?usp=sharing',
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '5',
      title: 'יום ספורט',
      description: 'יום פעילות ספורטיבית לכל התלמידים',
      start_datetime: '2024-09-20T09:00:00Z',
      end_datetime: '2024-09-20T14:00:00Z',
      location: 'מגרש בית הספר',
      event_type: 'general',
      status: 'completed',
      visibility: 'public',
      priority: 'normal',
      registration_enabled: false,
      current_attendees: 85,
      rsvp_yes_count: 0,
      rsvp_no_count: 0,
      rsvp_maybe_count: 0,
      budget_spent: 0,
      requires_payment: false,
      photos_url: 'https://drive.google.com/drive/folders/example123',
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  const mockTasks: Task[] = []

  const mockCalendarEvents: CalendarEvent[] = mockEvents.map(e => ({
    id: e.id,
    title: e.title,
    date: new Date(e.start_datetime),
    type: 'event' as const
  }))

  const mockStats: DashboardStats = {
    upcomingEvents: 5,
    pendingTasks: 12,
    activeIssues: 3,
    recentProtocols: 8,
    pendingExpenses: 2,
    thisMonthEvents: 5
  }

  return {
    events: mockEvents,
    tasks: mockTasks,
    calendarEvents: mockCalendarEvents,
    stats: mockStats
  }
}

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const data = getMockData()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      setIsAuthenticated(data.authenticated && data.role === 'admin')
    } catch (error) {
      setIsAuthenticated(false)
    }
  }

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">טוען...</p>
        </div>
      </div>
    )
  }

  // Show appropriate homepage based on auth status
  if (isAuthenticated) {
    // Committee member - show full dashboard
    return (
      <Dashboard
        stats={data.stats}
        upcomingEvents={data.events}
        pendingTasks={data.tasks}
        calendarEvents={data.calendarEvents}
      />
    )
  }

  // Regular parent - show public homepage
  return (
    <PublicHomepage
      upcomingEvents={data.events}
      calendarEvents={data.calendarEvents}
    />
  )
}