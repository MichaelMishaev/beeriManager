'use client'

import React, { useState } from 'react'
import { MobileCalendar } from '@/components/ui/MobileCalendar'
import { HolidayDetailModal } from './HolidayDetailModal'
import { HolidaysModal } from './HolidaysModal'
import { ShareNextClosureButton } from './ShareNextClosureButton'
import type { CalendarEvent, Holiday } from '@/types'

interface CollapsibleCalendarWidgetProps {
  calendarEvents?: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  defaultExpanded?: boolean
}

export function CollapsibleCalendarWidget({
  calendarEvents = [],
  onEventClick
}: CollapsibleCalendarWidgetProps) {
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [holidaysModalOpen, setHolidaysModalOpen] = useState(false)

  const handleEventClick = async (event: CalendarEvent) => {
    // If it's a holiday with school closure, show the modal
    if (event.type === 'holiday' && event.isSchoolClosed) {
      try {
        // Extract the holiday ID from the event ID
        // Format is: "uuid-YYYY-MM-DD" where uuid is 8-4-4-4-12 format with hyphens
        // Example: "e7107fbb-c123-4567-89ab-cdef12345678-2025-10-07"
        // We need to remove the last 3 segments (date)
        const parts = event.id.split('-')
        const holidayId = parts.slice(0, -3).join('-')

        // Fetch the full holiday details
        const response = await fetch(`/api/holidays/${holidayId}`)
        const data = await response.json()

        if (data.success && data.data) {
          setSelectedHoliday(data.data)
          setIsModalOpen(true)
        }
      } catch (error) {
        console.error('Error fetching holiday details:', error)
      }
    }

    // Call the original onEventClick if provided
    if (onEventClick) {
      onEventClick(event)
    }
  }

  return (
    <div className="space-y-3">
      {/* Share Next Closure Button - At Very Top */}
      <ShareNextClosureButton />

      {/* Calendar - Always visible in sidebar */}
      <MobileCalendar
        events={calendarEvents}
        onEventClick={handleEventClick}
        showLegend={false}
        showWeeklySummary={true}
      />

      {/* Holiday Detail Modal */}
      <HolidayDetailModal
        holiday={selectedHoliday}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* All Holidays Modal */}
      <HolidaysModal
        open={holidaysModalOpen}
        onOpenChange={setHolidaysModalOpen}
      />
    </div>
  )
}
