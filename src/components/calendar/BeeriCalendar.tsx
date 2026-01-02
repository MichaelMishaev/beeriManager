'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { he } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import EventPopup from './EventPopup'

interface Event {
  id: string
  title: string
  description?: string
  start_datetime: string
  end_datetime?: string
  location?: string
  event_type: 'general' | 'meeting' | 'fundraiser' | 'trip' | 'workshop'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
  registration_enabled: boolean
  max_attendees?: number
  current_attendees?: number
}

interface Holiday {
  id: string
  name: string
  hebrew_name: string
  description?: string
  start_date: string
  end_date: string
  holiday_type: 'religious' | 'national' | 'school_break' | 'other'
  is_school_closed: boolean
  icon_emoji?: string
  color: string
  academic_year: string
  hebrew_date?: string
}

interface BeeriCalendarProps {
  events: Event[]
  holidays?: Holiday[]
  view?: 'month' | 'week' | 'list'
  onEventClick?: (event: Event) => void
  showCreateButton?: boolean
}

const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const hebrewMonths = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
]

const eventTypeColors = {
  general: 'bg-blue-100 text-blue-800 border-blue-200',
  meeting: 'bg-purple-100 text-purple-800 border-purple-200',
  fundraiser: 'bg-green-100 text-green-800 border-green-200',
  trip: 'bg-orange-100 text-orange-800 border-orange-200',
  workshop: 'bg-indigo-100 text-indigo-800 border-indigo-200'
}

const priorityBadgeVariants = {
  low: 'bg-gray-100 text-gray-700',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
}

const priorityLabels = {
  low: 'נמוכה',
  normal: 'רגילה',
  high: 'גבוהה',
  urgent: 'דחוף'
}

export default function BeeriCalendar({
  events = [],
  holidays = [],
  view = 'month',
  onEventClick,
  showCreateButton = false
}: BeeriCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentView, setCurrentView] = useState(view)
  const [showHolidays] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [eventPopupOpen, setEventPopupOpen] = useState(false)

  // Show published, ongoing, and completed events (exclude draft, cancelled)
  const visibleEvents = events.filter(e =>
    ['published', 'ongoing', 'completed'].includes(e.status)
  )

  // Group events by date
  const eventsByDate = visibleEvents.reduce((acc, event) => {
    const dateKey = format(new Date(event.start_datetime), 'yyyy-MM-dd')
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(event)
    return acc
  }, {} as Record<string, Event[]>)

  // Group holidays by date (handle date ranges)
  const holidaysByDate = holidays.reduce((acc, holiday) => {
    const start = new Date(holiday.start_date)
    const end = new Date(holiday.end_date)

    // Add holiday to all dates in range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = format(d, 'yyyy-MM-dd')
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(holiday)
    }
    return acc
  }, {} as Record<string, Holiday[]>)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)

  // Adjust for Hebrew calendar (Sunday = 0 is first day)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleEventClick = (event: Event, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (onEventClick) {
      onEventClick(event)
    } else {
      setSelectedEvent(event)
      setEventPopupOpen(true)
    }
  }

  const getEventsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return eventsByDate[dateKey] || []
  }

  const getHolidaysForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return holidaysByDate[dateKey] || []
  }

  const renderMonthView = () => (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="text-xl font-bold">
          {hebrewMonths[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
          >
            היום
          </Button>
          {showCreateButton && (
            <Button asChild size="sm">
              <Link href="/admin/events/new">
                אירוע חדש
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-px bg-muted rounded-t-lg overflow-hidden">
        {hebrewDays.map((day) => (
          <div
            key={day}
            className="bg-background p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-px bg-muted rounded-b-lg overflow-hidden">
        {days.map((day) => {
          const dayEvents = getEventsForDate(day)
          const dayHolidays = showHolidays ? getHolidaysForDate(day) : []
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isTodayDate = isToday(day)
          const hasHoliday = dayHolidays.length > 0
          const firstHoliday = dayHolidays[0]

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'bg-background p-2 min-h-[100px] cursor-pointer hover:bg-accent transition-colors',
                !isCurrentMonth && 'text-muted-foreground bg-muted/50',
                isSelected && 'ring-2 ring-primary',
                isTodayDate && 'bg-primary/5'
              )}
              style={
                hasHoliday && firstHoliday
                  ? { background: `linear-gradient(135deg, ${firstHoliday.color}10, ${firstHoliday.color}05)` }
                  : undefined
              }
              onClick={() => handleDateClick(day)}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex flex-col items-center">
                  <span className={cn(
                    'text-sm font-medium',
                    isTodayDate && 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center'
                  )}>
                    {format(day, 'd')}
                  </span>
                  {/* Holiday indicator dots */}
                  {hasHoliday && dayHolidays.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayHolidays.slice(0, 3).map((holiday, idx) => (
                        <div
                          key={idx}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: holiday.color }}
                          title={holiday.name}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 items-center">
                  {hasHoliday && firstHoliday?.icon_emoji && (
                    <span className="text-lg" title={firstHoliday.name}>
                      {firstHoliday.icon_emoji}
                    </span>
                  )}
                  {(dayEvents.length > 0 || dayHolidays.length > 0) && (
                    <Badge variant="secondary" className="text-xs">
                      {dayEvents.length + dayHolidays.length}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Holiday Pills */}
              <div className="space-y-1">
                {dayHolidays.slice(0, 1).map((holiday) => (
                  <div
                    key={holiday.id}
                    className="text-xs px-2 py-1 rounded-md cursor-pointer hover:opacity-90 transition-all truncate border-2 font-semibold shadow-sm"
                    style={{
                      backgroundColor: holiday.color + '40',
                      borderColor: holiday.color,
                      color: '#1a1a1a'
                    }}
                    title={`${holiday.name} - ${holiday.hebrew_date || ''}`}
                  >
                    <span className="text-sm">{holiday.icon_emoji}</span> {holiday.name}
                  </div>
                ))}

                {/* Event Pills */}
                {dayEvents.slice(0, hasHoliday ? 2 : 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => handleEventClick(event, e)}
                    className={cn(
                      'text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity truncate border',
                      eventTypeColors[event.event_type]
                    )}
                    title={event.title}
                  >
                    {format(new Date(event.start_datetime), 'HH:mm')} {event.title}
                  </div>
                ))}

                {(dayEvents.length + dayHolidays.length) > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{(dayEvents.length + dayHolidays.length) - 3} נוספים
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              אירועים וחגים ב-{format(selectedDate, 'd בMMMM yyyy', { locale: he })}
            </CardTitle>
            <CardDescription>
              {getEventsForDate(selectedDate).length} אירועים
              {getHolidaysForDate(selectedDate).length > 0 && ` • ${getHolidaysForDate(selectedDate).length} חגים`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Show Holidays First */}
            {getHolidaysForDate(selectedDate).length > 0 && (
              <div className="space-y-3 mb-4">
                {getHolidaysForDate(selectedDate).map((holiday) => (
                  <Card
                    key={holiday.id}
                    className="border-2"
                    style={{
                      background: `linear-gradient(135deg, ${holiday.color}20, ${holiday.color}08)`,
                      borderColor: holiday.color + '60'
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {holiday.icon_emoji && (
                          <div className="text-3xl flex-shrink-0">
                            {holiday.icon_emoji}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg">{holiday.name}</h4>
                            {holiday.is_school_closed && (
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                בית הספר סגור
                              </Badge>
                            )}
                          </div>
                          {holiday.hebrew_date && (
                            <p className="text-sm text-muted-foreground">
                              {holiday.hebrew_date}
                            </p>
                          )}
                          {holiday.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {holiday.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {getEventsForDate(selectedDate).length === 0 && getHolidaysForDate(selectedDate).length === 0 ? (
              <p className="text-muted-foreground">אין אירועים או חגים בתאריך זה</p>
            ) : getEventsForDate(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map((event) => (
                  <Card key={event.id} className="cursor-pointer hover:bg-accent transition-colors">
                    <Link href={`/events/${event.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <h4 className="font-medium">{event.title}</h4>
                            {event.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {event.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(event.start_datetime), 'HH:mm')}
                                {event.end_datetime && ` - ${format(new Date(event.end_datetime), 'HH:mm')}`}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </span>
                              )}
                              {event.registration_enabled && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {event.current_attendees || 0}
                                  {event.max_attendees && `/${event.max_attendees}`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={priorityBadgeVariants[event.priority]}>
                              {priorityLabels[event.priority]}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderListView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">רשימת אירועים</h2>
        {showCreateButton && (
          <Button asChild size="sm">
            <Link href="/admin/events/new">
              אירוע חדש
            </Link>
          </Button>
        )}
      </div>

      {visibleEvents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">אין אירועים מתוכננים</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleEvents
            .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
            .map((event) => (
              <Card key={event.id} className="cursor-pointer hover:bg-accent transition-colors">
                <Link href={`/events/${event.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-start gap-3">
                          <div className="text-center bg-primary/10 rounded-lg p-2 min-w-[60px]">
                            <div className="text-2xl font-bold text-primary">
                              {format(new Date(event.start_datetime), 'd')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(event.start_datetime), 'MMM', { locale: he })}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            {event.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {event.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {format(new Date(event.start_datetime), 'HH:mm')}
                                {event.end_datetime && ` - ${format(new Date(event.end_datetime), 'HH:mm')}`}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {event.location}
                                </span>
                              )}
                              {event.registration_enabled && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {event.current_attendees || 0}
                                  {event.max_attendees && `/${event.max_attendees}`} רשומים
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={eventTypeColors[event.event_type]}>
                          {event.event_type === 'general' ? 'כללי' :
                           event.event_type === 'meeting' ? 'ישיבה' :
                           event.event_type === 'fundraiser' ? 'גיוס כספים' :
                           event.event_type === 'trip' ? 'טיול' : 'סדנה'}
                        </Badge>
                        <Badge className={priorityBadgeVariants[event.priority]}>
                          {priorityLabels[event.priority]}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="w-full">
      {/* View Toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg border p-1">
          <Button
            variant={currentView === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('month')}
          >
            חודש
          </Button>
          <Button
            variant={currentView === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('list')}
          >
            רשימה
          </Button>
        </div>
      </div>

      {/* Render Current View */}
      {currentView === 'month' ? renderMonthView() : renderListView()}

      {/* Event Popup */}
      <EventPopup
        event={selectedEvent}
        open={eventPopupOpen}
        onOpenChange={setEventPopupOpen}
      />
    </div>
  )
}