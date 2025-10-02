'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { MobileCalendar } from '@/components/ui/MobileCalendar'
import { NextHolidayWidget } from './NextHolidayWidget'
import { HolidayDetailModal } from './HolidayDetailModal'
import { HolidaysModal } from './HolidaysModal'
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
      {/* Action Buttons - At Top */}
      <div className="flex gap-2">
        {/* Toggle Calendar Button */}
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-sm transition-all hover:bg-primary/10 border-2 border-primary/20 hover:border-primary/40"
          onClick={handleToggle}
        >
          <Calendar className="h-4 w-4 ml-2" />
          {isExpanded ? (
            <>
              {t('hideCalendar')}
              <ChevronUp className="h-4 w-4 mr-2 transition-transform" />
            </>
          ) : (
            <>
              {t('showCalendar')}
              <ChevronDown className="h-4 w-4 mr-2 transition-transform" />
            </>
          )}
        </Button>

        {/* Holidays List Button */}
        <Button
          variant="outline"
          size="sm"
          className="text-sm transition-all border-2 hover:bg-orange-50"
          style={{
            borderColor: '#FF8200',
            color: '#FF8200'
          }}
          onClick={() => setHolidaysModalOpen(true)}
          title={t('holidaysAndEvents')}
        >
          <Calendar className="h-4 w-4" />
        </Button>
      </div>

      {/* Next Holiday Widget - Below Button */}
      <div className="relative">
        <NextHolidayWidget onClick={() => setHolidaysModalOpen(true)} />
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
