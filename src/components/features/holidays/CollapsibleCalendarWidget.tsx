'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { MobileCalendar } from '@/components/ui/MobileCalendar'
import { NextHolidayWidget } from './NextHolidayWidget'
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
  onEventClick,
  defaultExpanded = false
}: CollapsibleCalendarWidgetProps) {
  const t = useTranslations('calendar')
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [holidaysModalOpen, setHolidaysModalOpen] = useState(false)

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [calendarEvents])

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

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

      {/* Next Holiday Widget */}
      <div className="relative">
        <NextHolidayWidget onClick={() => setHolidaysModalOpen(true)} />
      </div>

      {/* Action Buttons - Simplified */}
      <div className="flex gap-2">
        {/* Holidays List Button - Now larger and more prominent */}
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-sm transition-all hover:bg-muted"
          onClick={() => setHolidaysModalOpen(true)}
        >
          <Calendar className="h-4 w-4 ml-2" />
          {t('holidaysAndEvents')}
        </Button>

        {/* Toggle Calendar Button - Now smaller */}
        <Button
          variant="outline"
          size="sm"
          className="text-sm transition-all hover:bg-muted gap-1.5 px-3"
          onClick={handleToggle}
          title={isExpanded ? t('hideCalendar') : t('showCalendar')}
        >
          <Calendar className="h-4 w-4" />
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 transition-transform" />
          ) : (
            <ChevronDown className="h-4 w-4 transition-transform" />
          )}
        </Button>
      </div>

      {/* Collapsible Calendar with Smooth Animation */}
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : '0px',
          opacity: isExpanded ? 1 : 0
        }}
      >
        <div ref={contentRef} className={isExpanded ? 'animate-in fade-in-50 slide-in-from-top-2 duration-500' : ''}>
          <MobileCalendar
            events={calendarEvents}
            onEventClick={handleEventClick}
            showLegend={false}
            showWeeklySummary={true}
          />
        </div>
      </div>

      {/* Hint when collapsed - Mobile only */}
      {!isExpanded && (
        <div className="text-center md:hidden">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <span className="animate-bounce">↑</span>
            לחץ על "הצג לוח שנה" למעלה לצפייה בלוח השנה
          </p>
        </div>
      )}

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
