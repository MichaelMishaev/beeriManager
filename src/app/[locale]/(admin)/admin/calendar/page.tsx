'use client'

import { useState, useEffect } from 'react'
import BeeriCalendar from '@/components/calendar/BeeriCalendar'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function AdminCalendarPage() {
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()

      if (data.success) {
        setEvents(data.data)
      } else {
        toast.error('שגיאה בטעינת האירועים')
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('שגיאה בטעינת האירועים')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEventClick = (event: any) => {
    router.push(`/admin/events/${event.id}/edit`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground">טוען לוח אירועים...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">לוח אירועים - מנהל</h1>
        <p className="text-muted-foreground">
          ניהול וצפייה באירועים. לחץ על אירוע לעריכה
        </p>
      </div>

      <BeeriCalendar
        events={events}
        view="month"
        showCreateButton={true}
        onEventClick={handleEventClick}
      />
    </div>
  )
}