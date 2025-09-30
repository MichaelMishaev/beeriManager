'use client'

import React, { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { he } from 'date-fns/locale'

// Types
interface Event {
  id: string
  title: string
  date: Date
  type: 'meeting' | 'trip' | 'fundraising' | 'event' | 'volunteer' | 'holiday'
  description?: string
  time?: string
}

interface BeeriCalendarProps {
  events?: Event[]
  onDateClick?: (date: Date) => void
  onEventClick?: (event: Event) => void
  className?: string
}

// Event type configurations matching Template 9 design
const EVENT_TYPES = {
  meeting: { color: 'bg-red-400', label: 'ישיבות' },
  trip: { color: 'bg-green-400', label: 'טיולים' },
  fundraising: { color: 'bg-blue-400', label: 'גיוס כספים' },
  event: { color: 'bg-yellow-300', label: 'אירועים' },
  volunteer: { color: 'bg-purple-400', label: 'התנדבות' },
  holiday: { color: 'bg-white border-2 border-indigo-400', label: 'חגים' }
}

const HEBREW_DAYS = ['ש׳', 'ו׳', 'ה׳', 'ד׳', 'ג׳', 'ב׳', 'א׳']

export function BeeriCalendar({
  events = [],
  onDateClick,
  onEventClick,
  className = ''
}: BeeriCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday
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
  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date))
  }

  // Get event count for current week
  const getWeekEventCount = () => {
    const today = new Date()
    const weekStart = startOfWeek(today, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 })

    return events.filter(event =>
      event.date >= weekStart && event.date <= weekEnd
    ).length
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev =>
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    )
  }

  const handleDateClick = (date: Date) => {
    onDateClick?.(date)
  }

  const handleEventClick = (event: Event) => {
    onEventClick?.(event)
  }

  const isToday = (date: Date) => isSameDay(date, new Date())
  const isCurrentMonth = (date: Date) => isSameMonth(date, currentDate)

  return (
    <div className={`max-w-sm mx-auto bg-indigo-50 min-h-screen ${className}`}>
      {/* Header with Dots */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <button
            size="sm" onClick={() => navigateMonth('prev')}
            className="text-indigo-400 hover:text-indigo-600 text-2xl p-2 hover:bg-indigo-50 rounded-full transition-colors"
            aria-label="חודש קודם"
          >
            ‹
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {format(currentDate, 'MMMM yyyy', { locale: he })}
          </h2>
          <button
            size="sm" onClick={() => navigateMonth('next')}
            className="text-indigo-400 hover:text-indigo-600 text-2xl p-2 hover:bg-indigo-50 rounded-full transition-colors"
            aria-label="חודש הבא"
          >
            ›
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-4">
          {HEBREW_DAYS.map((day) => (
            <div key={day} className="py-2 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date) => {
            const dayEvents = getEventsForDate(date)
            const isCurrentMonthDay = isCurrentMonth(date)
            const isTodayDate = isToday(date)

            return (
              <button
                key={date.toISOString()}
                size="sm" onClick={() => handleDateClick(date)}
                className={`
                  day-cell flex flex-col items-center justify-center text-sm aspect-square rounded-lg transition-all
                  ${isTodayDate
                    ? 'bg-indigo-600 text-white font-bold'
                    : isCurrentMonthDay
                      ? 'text-gray-800 hover:bg-indigo-50'
                      : 'text-gray-300'
                  }
                  ${dayEvents.length > 0 ? 'cursor-pointer' : ''}
                `}
              >
                {format(date, 'd')}

                {/* Event Dots */}
                {dayEvents.length > 0 && (
                  <div className="flex space-x-1 mt-1 flex-wrap justify-center">
                    {dayEvents.slice(0, 3).map((event, index) => (
                      <button
                        key={`${event.id}-${index}`}
                        size="sm" onClick={(e) => {
                          e.stopPropagation()
                          handleEventClick(event)
                        }}
                        className={`
                          w-1.5 h-1.5 rounded-full transition-transform hover:scale-125
                          ${EVENT_TYPES[event.type].color}
                        `}
                        title={event.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className={`text-xs ${isTodayDate ? 'text-white' : 'text-indigo-600'}`}>
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Event Legend */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-lg mb-4">סוגי אירועים</h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(EVENT_TYPES).map(([type, config]) => (
            <div key={type} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${config.color}`} />
              <span className="text-sm text-gray-700">{config.label}</span>
            </div>
          ))}
        </div>

        {/* Weekly Event Summary */}
        <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
          <div className="text-sm text-indigo-800 font-medium">השבוע הזה</div>
          <div className="text-xs text-indigo-600 mt-1">
            {getWeekEventCount()} אירועים מתוכננים
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to create sample events for testing
export const createSampleEvents = (): Event[] => {
  const today = new Date()

  return [
    {
      id: '1',
      title: 'ישיבת ועד הורים',
      date: addDays(today, 2),
      type: 'meeting',
      time: '19:00',
      description: 'דיון על תקציב השנה'
    },
    {
      id: '2',
      title: 'טיול שכבה',
      date: addDays(today, 5),
      type: 'trip',
      time: '08:00',
      description: 'טיול ליער בן שמן'
    },
    {
      id: '3',
      title: 'גיוס כספים',
      date: addDays(today, 7),
      type: 'fundraising',
      time: '20:00',
      description: 'מכירת עוגות'
    },
    {
      id: '4',
      title: 'חג הפורים',
      date: addDays(today, 10),
      type: 'holiday',
      description: 'אירוע פורים בית ספרי'
    },
    {
      id: '5',
      title: 'התנדבות ספרייה',
      date: addDays(today, 3),
      type: 'volunteer',
      time: '16:00',
      description: 'עזרה בסידור ספרים'
    }
  ]
}

export default BeeriCalendar