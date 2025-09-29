'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { he } from 'date-fns/locale'

// Types
interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: 'meeting' | 'trip' | 'fundraising' | 'event' | 'volunteer' | 'holiday'
  description?: string
  time?: string
  location?: string
}

interface MobileCalendarProps {
  events?: CalendarEvent[]
  onDateClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  selectedDate?: Date
  showLegend?: boolean
  showWeeklySummary?: boolean
  className?: string
}

// Event type configurations with mobile-optimized colors
const EVENT_CONFIG = {
  meeting: {
    color: 'bg-red-400',
    label: 'ישיבות',
    lightBg: 'bg-red-50',
    textColor: 'text-red-800'
  },
  trip: {
    color: 'bg-green-400',
    label: 'טיולים',
    lightBg: 'bg-green-50',
    textColor: 'text-green-800'
  },
  fundraising: {
    color: 'bg-blue-400',
    label: 'גיוס כספים',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-800'
  },
  event: {
    color: 'bg-yellow-400',
    label: 'אירועים',
    lightBg: 'bg-yellow-50',
    textColor: 'text-yellow-800'
  },
  volunteer: {
    color: 'bg-purple-400',
    label: 'התנדבות',
    lightBg: 'bg-purple-50',
    textColor: 'text-purple-800'
  },
  holiday: {
    color: 'bg-white border-2 border-indigo-400',
    label: 'חגים',
    lightBg: 'bg-indigo-50',
    textColor: 'text-indigo-800'
  }
}

const HEBREW_DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
const HEBREW_DAYS_FULL = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

export function MobileCalendar({
  events = [],
  onDateClick,
  onEventClick,
  selectedDate,
  showLegend = true,
  showWeeklySummary = true,
  className = ''
}: MobileCalendarProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date())
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Touch gesture handling for mobile navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      setCurrentDate(prev => addMonths(prev, 1))
    }
    if (isRightSwipe) {
      setCurrentDate(prev => subMonths(prev, 1))
    }
  }, [touchStart, touchEnd])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const days = []
    let day = startDate

    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }

    return days
  }, [currentDate])

  // Get events for a specific date
  const getEventsForDate = useCallback((date: Date) => {
    return events.filter(event => isSameDay(event.date, date))
  }, [events])

  // Get event count for current week
  const getWeekEventCount = useCallback(() => {
    const today = new Date()
    const weekStart = startOfWeek(today, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 })

    return events.filter(event =>
      event.date >= weekStart && event.date <= weekEnd
    ).length
  }, [events])

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev =>
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    )
  }, [])

  const handleDateClick = useCallback((date: Date) => {
    onDateClick?.(date)
  }, [onDateClick])

  const handleEventClick = useCallback((event: CalendarEvent) => {
    onEventClick?.(event)
  }, [onEventClick])

  const isToday = (date: Date) => isSameDay(date, new Date())
  const isCurrentMonth = (date: Date) => isSameMonth(date, currentDate)
  const isSelected = (date: Date) => selectedDate && isSameDay(date, selectedDate)

  return (
    <div
      className={`w-full max-w-sm mx-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile-Optimized Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="text-indigo-400 hover:text-indigo-600 text-3xl p-3 hover:bg-indigo-50 rounded-full transition-colors touch-manipulation"
            aria-label="חודש קודם"
          >
            ‹
          </button>
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              {format(currentDate, 'MMMM yyyy', { locale: he })}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {format(new Date(), 'EEEE, d MMMM', { locale: he })}
            </p>
          </div>
          <button
            onClick={() => navigateMonth('next')}
            className="text-indigo-400 hover:text-indigo-600 text-3xl p-3 hover:bg-indigo-50 rounded-full transition-colors touch-manipulation"
            aria-label="חודש הבא"
          >
            ›
          </button>
        </div>

        {/* Mobile Week Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-3">
          {HEBREW_DAYS.map((day, index) => (
            <div key={day} className="py-2 font-medium">
              <span className="hidden sm:inline">{HEBREW_DAYS_FULL[index]}</span>
              <span className="sm:hidden">{day}</span>
            </div>
          ))}
        </div>

        {/* Mobile Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((date) => {
            const dayEvents = getEventsForDate(date)
            const isCurrentMonthDay = isCurrentMonth(date)
            const isTodayDate = isToday(date)
            const isSelectedDate = isSelected(date)

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`
                  relative flex flex-col items-center justify-center text-sm aspect-square rounded-lg transition-all touch-manipulation min-h-[44px]
                  ${isTodayDate
                    ? 'bg-indigo-600 text-white font-bold shadow-lg'
                    : isSelectedDate
                      ? 'bg-indigo-100 text-indigo-800 font-semibold ring-2 ring-indigo-400'
                      : isCurrentMonthDay
                        ? 'text-gray-800 hover:bg-indigo-50 active:bg-indigo-100'
                        : 'text-gray-300'
                  }
                  ${dayEvents.length > 0 ? 'cursor-pointer' : ''}
                `}
              >
                <span className={`${dayEvents.length > 0 && !isTodayDate ? 'mb-1' : ''}`}>
                  {format(date, 'd')}
                </span>

                {/* Mobile Event Indicators */}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 flex space-x-0.5 flex-wrap justify-center">
                    {dayEvents.slice(0, 3).map((event, index) => (
                      <button
                        key={`${event.id}-${index}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEventClick(event)
                        }}
                        className={`
                          w-1.5 h-1.5 rounded-full transition-all touch-manipulation
                          ${EVENT_CONFIG[event.type].color}
                          hover:scale-125 active:scale-150
                        `}
                        title={`${event.title} - ${event.time || ''}`}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className={`text-[10px] font-bold ${isTodayDate ? 'text-white' : 'text-indigo-600'}`}>
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Swipe Hint for Mobile */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400">
            החלק שמאלה/ימינה לניווט בין חודשים
          </p>
        </div>
      </div>

      {/* Mobile Event Legend */}
      {showLegend && (
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <h3 className="font-bold text-base mb-3">סוגי אירועים</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(EVENT_CONFIG).map(([type, config]) => (
              <div key={type} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${config.color}`} />
                <span className="text-sm text-gray-700 font-medium">{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Weekly Summary */}
      {showWeeklySummary && (
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-indigo-800 font-bold">השבוע הזה</div>
              <div className="text-xs text-indigo-600 mt-1">
                {getWeekEventCount()} אירועים מתוכננים
              </div>
            </div>
            <div className="text-2xl">
              📅
            </div>
          </div>

          {/* Quick Today's Events */}
          <div className="mt-3">
            {getEventsForDate(new Date()).slice(0, 2).map((event) => (
              <button
                key={event.id}
                onClick={() => handleEventClick(event)}
                className={`
                  w-full text-right p-3 rounded-lg mb-2 transition-all touch-manipulation
                  ${EVENT_CONFIG[event.type].lightBg}
                  hover:shadow-md active:scale-95
                `}
              >
                <div className={`font-medium text-sm ${EVENT_CONFIG[event.type].textColor}`}>
                  {event.title}
                </div>
                {event.time && (
                  <div className="text-xs text-gray-600 mt-1">
                    {event.time} {event.location && `• ${event.location}`}
                  </div>
                )}
              </button>
            ))}
            {getEventsForDate(new Date()).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-2">
                אין אירועים היום
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Export event configuration for use in other components
export { EVENT_CONFIG, type CalendarEvent }

export default MobileCalendar