'use client'

import { useState, useEffect, type ComponentProps } from 'react'
import { useTranslations } from 'next-intl'
import BeeriCalendar from '@/components/calendar/BeeriCalendar'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/features/admin'

type CalendarProps = ComponentProps<typeof BeeriCalendar>
type CalendarEvent = CalendarProps['events'][number]

export default function AdminCalendarPage() {
  const t = useTranslations('admin.records.calendar')
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
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
        toast.error(t('loadError'))
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error(t('loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleEventClick = (event: CalendarEvent) => {
    router.push(`/admin/events/${event.id}/edit`)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title={t('title')} backHref="/admin/more" />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#0D98BA] border-t-transparent" />
            <p className="text-sm text-gray-500">{t('loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader title={t('title')} subtitle={t('subtitle')} backHref="/admin/more" />

      <BeeriCalendar
        events={events}
        view="month"
        showCreateButton={true}
        onEventClick={handleEventClick}
      />
    </div>
  )
}
