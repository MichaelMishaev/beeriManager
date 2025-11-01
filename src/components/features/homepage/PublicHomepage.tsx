'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, ChevronLeft, Camera, ArrowLeft, ChevronDown, ChevronUp, MessageSquare, Clock, MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CommitteeCard } from './CommitteeCard'
import { SchoolStats } from './SchoolStats'
import { WhatsAppCommunityCard } from '@/components/features/whatsapp/WhatsAppCommunityCard'
import { TicketsSection } from '@/components/features/tickets/TicketsSection'
import { WhiteShirtBanner } from './WhiteShirtBanner'
import { UrgentMessagesBanner } from '@/components/features/urgent/UrgentMessagesBanner'
import { FeedbackAndIdeasCard } from './FeedbackAndIdeasCard'
import { HighlightsCarousel } from '@/components/features/highlights/HighlightsCarousel'
import { NextHolidayWidget } from '@/components/features/holidays/NextHolidayWidget'
import { HolidaysModal } from '@/components/features/holidays/HolidaysModal'
import { MobileCalendar } from '@/components/ui/MobileCalendar'
import type { Event, CalendarEvent, Ticket } from '@/types'
import Link from 'next/link'
import { format } from 'date-fns'
import { he, ru } from 'date-fns/locale'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'

interface PublicHomepageProps {
  upcomingEvents: Event[]
  calendarEvents: CalendarEvent[]
}

// Upcoming Events Card Component with Collapse/Expand
function UpcomingEventsCard({
  upcomingEvents,
  dateLocale,
  locale
}: {
  upcomingEvents: Event[]
  dateLocale: typeof he | typeof ru
  locale: Locale
}) {
  const t = useTranslations('homepage')
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const displayedEvents = isExpanded ? upcomingEvents : upcomingEvents.slice(0, 3)
  const hasMore = upcomingEvents.length > 3

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-[#0D98BA]" />
          <CardTitle className="text-2xl text-[#003153]">
            {t('upcomingEvents')}
          </CardTitle>
        </div>
        <CardDescription className="text-base mt-2">
          {t('nextSchoolEvents')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-1">
          {upcomingEvents.length > 0 ? (
            <>
              {displayedEvents.map((event) => (
                <EventItem
                  key={event.id}
                  event={event}
                  dateLocale={dateLocale}
                  locale={locale}
                  onClick={() => handleEventClick(event)}
                />
              ))}
              {hasMore && (
                <div className="text-center pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="gap-2"
                  >
                    {isExpanded
                      ? (locale === 'ru' ? 'Свернуть' : 'הצג פחות')
                      : `${locale === 'ru' ? 'Показать все' : 'הצג הכל'} (${upcomingEvents.length})`}
                    <ChevronLeft className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : '-rotate-90'}`} />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t('noUpcomingEvents')}</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <span className="text-3xl">
                  {selectedEvent.event_type === 'meeting' ? '👥' :
                   selectedEvent.event_type === 'fundraiser' ? '💰' :
                   selectedEvent.event_type === 'trip' ? '🚌' :
                   selectedEvent.event_type === 'workshop' ? '📚' : '📅'}
                </span>
                {(locale === 'ru' && selectedEvent.title_ru) ? selectedEvent.title_ru : selectedEvent.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              {/* Event Status Badge */}
              {(() => {
                const startDate = new Date(selectedEvent.start_datetime)
                const endDateTime = selectedEvent.end_datetime ? new Date(selectedEvent.end_datetime) : null
                const isValidEndDate = endDateTime && !isNaN(endDateTime.getTime()) && endDateTime.getTime() > startDate.getTime()
                const endDate = isValidEndDate ? endDateTime! : new Date(startDate.getTime() + 2 * 60 * 60 * 1000)
                const now = new Date()
                const isHappeningNow = now >= startDate && now <= endDate
                const timeDiff = startDate.getTime() - now.getTime()
                const isStartingSoon = !isHappeningNow && timeDiff > 0 && timeDiff <= 60 * 60 * 1000

                return isHappeningNow ? (
                  <Badge className="bg-[#FF8200] text-white text-sm">
                    {locale === 'ru' ? '🔴 Сейчас' : '🔴 מתקיים כעת'}
                  </Badge>
                ) : isStartingSoon ? (
                  <Badge className="bg-[#FFBA00] text-white text-sm">
                    {locale === 'ru' ? '⚡ Скоро' : '⚡ בקרוב'}
                  </Badge>
                ) : null
              })()}

              {/* Date and Time */}
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">
                    {format(new Date(selectedEvent.start_datetime), 'EEEE, d MMMM yyyy', { locale: dateLocale })}
                  </p>
                  <p className="text-sm text-blue-700">
                    {format(new Date(selectedEvent.start_datetime), 'HH:mm', { locale: dateLocale })}
                    {selectedEvent.end_datetime && (
                      <span> - {format(new Date(selectedEvent.end_datetime), 'HH:mm', { locale: dateLocale })}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Location */}
              {((locale === 'ru' && selectedEvent.location_ru) ? selectedEvent.location_ru : selectedEvent.location) && (
                <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <MapPin className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-800">
                    {(locale === 'ru' && selectedEvent.location_ru) ? selectedEvent.location_ru : selectedEvent.location}
                  </p>
                </div>
              )}

              {/* Description */}
              {((locale === 'ru' && selectedEvent.description_ru) ? selectedEvent.description_ru : selectedEvent.description) && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {(locale === 'ru' && selectedEvent.description_ru) ? selectedEvent.description_ru : selectedEvent.description}
                  </p>
                </div>
              )}

              {/* Registration Info */}
              {selectedEvent.registration_enabled && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-medium text-green-900 mb-2">
                    {locale === 'ru' ? '✓ Требуется регистрация' : '✓ נדרשת הרשמה'}
                  </p>
                  {selectedEvent.max_attendees && (
                    <p className="text-sm text-green-700">
                      {locale === 'ru' ? `Максимум участников: ${selectedEvent.max_attendees}` : `מקסימום משתתפים: ${selectedEvent.max_attendees}`}
                    </p>
                  )}
                  {selectedEvent.registration_deadline && (
                    <p className="text-sm text-green-700">
                      {locale === 'ru' ? 'Крайний срок регистрации: ' : 'מועד אחרון להרשמה: '}
                      {format(new Date(selectedEvent.registration_deadline), 'd MMMM, HH:mm', { locale: dateLocale })}
                    </p>
                  )}
                </div>
              )}

              {/* Payment Info */}
              {selectedEvent.requires_payment && selectedEvent.payment_amount && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-medium text-yellow-900">
                    {locale === 'ru' ? `💰 Стоимость: ₪${selectedEvent.payment_amount}` : `💰 עלות: ₪${selectedEvent.payment_amount}`}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}

function EventItem({
  event,
  dateLocale,
  locale,
  onClick
}: {
  event: Event
  dateLocale: typeof he | typeof ru
  locale: Locale
  onClick: () => void
}) {
  const startDate = new Date(event.start_datetime)
  const now = new Date()

  // Get localized content - fallback to Hebrew if Russian not available
  const title = (locale === 'ru' && event.title_ru) ? event.title_ru : event.title
  const description = (locale === 'ru' && event.description_ru) ? event.description_ru : event.description
  const location = (locale === 'ru' && event.location_ru) ? event.location_ru : event.location

  // Calculate end time: use end_datetime if available, otherwise start + 2 hours
  // Only use end_datetime if it's valid and after start time
  const endDateTime = event.end_datetime ? new Date(event.end_datetime) : null
  const isValidEndDate = endDateTime &&
                         !isNaN(endDateTime.getTime()) &&
                         endDateTime.getTime() > startDate.getTime()

  const endDate = isValidEndDate
    ? endDateTime!
    : new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // Fallback: start + 2 hours

  // Determine event status
  const isHappeningNow = now >= startDate && now <= endDate
  const timeDiff = startDate.getTime() - now.getTime()
  const isStartingSoon = !isHappeningNow && timeDiff > 0 && timeDiff <= 60 * 60 * 1000 // Within 1 hour (future only)
  const hasEnded = now > endDate

  // Get event type icon and color
  const getEventIcon = () => {
    switch (event.event_type) {
      case 'meeting': return '👥'
      case 'fundraiser': return '💰'
      case 'trip': return '🚌'
      case 'workshop': return '📚'
      case 'general': return '🎯'
      default: return '🎯'
    }
  }

  const getEventAccentColor = () => {
    switch (event.event_type) {
      case 'meeting': return 'border-r-[#FF8200]'
      case 'fundraiser': return 'border-r-[#0D98BA]'
      case 'trip': return 'border-r-[#FFBA00]'
      case 'workshop': return 'border-r-[#003153]'
      default: return 'border-r-[#0D98BA]'
    }
  }

  // Status badge configuration
  const statusConfig = isHappeningNow
    ? {
        text: locale === 'ru' ? 'Сейчас' : 'מתקיים כעת',
        bgColor: 'bg-[#FF8200]',
        textColor: 'text-white',
        showPulse: true
      }
    : isStartingSoon
    ? {
        text: locale === 'ru' ? 'Скоро' : 'בקרוב',
        bgColor: 'bg-[#FFBA00]',
        textColor: 'text-white',
        showPulse: false
      }
    : hasEnded
    ? {
        text: locale === 'ru' ? 'Завершено' : 'הסתיים',
        bgColor: 'bg-gray-400',
        textColor: 'text-white',
        showPulse: false
      }
    : null

  return (
    <div
      onClick={onClick}
      className="block group cursor-pointer"
    >
      <div className={`flex items-start gap-2.5 p-3 rounded-lg hover:bg-gray-50/80 transition-all duration-200 border-r-4 ${getEventAccentColor()} bg-white`}>
        {/* Icon - Square gradient (previous style) */}
        <div className="flex-shrink-0 mt-0.5">
          <div className={
            `w-8 h-8 rounded-lg bg-gradient-to-br from-[#0D98BA]/10 to-[#003153]/5 flex items-center justify-center`
          }>
            <span className="text-base">{getEventIcon()}</span>
          </div>
        </div>

        {/* Event Info - Primary focus */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h3 className="text-[15px] font-semibold text-[#003153] group-hover:text-[#0D98BA] transition-colors leading-tight flex-1">
              {title}
            </h3>
            {statusConfig && (
              <div className="relative flex-shrink-0">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                  {statusConfig.showPulse && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#FF8200] opacity-75 animate-ping"></span>
                  )}
                  <span className="relative">{statusConfig.text}</span>
                </span>
              </div>
            )}
          </div>

          {description && (
            <p className="text-[13px] text-gray-600 line-clamp-1 mb-1.5">
              {description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-gray-500">
            <div className="flex items-center gap-1">
              <span className="truncate">
                {format(startDate, 'd MMMM', { locale: dateLocale })}
                {event.end_datetime && isValidEndDate && (
                  <span className="mr-1"> • {format(startDate, 'HH:mm', { locale: dateLocale })}</span>
                )}
              </span>
            </div>
            {location && (
              <div className="flex items-center gap-1">
                <span className="truncate">📍 {location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PublicHomepage({ upcomingEvents, calendarEvents }: PublicHomepageProps) {
  const t = useTranslations('homepage')
  const params = useParams()
  const currentLocale = params.locale as Locale
  const dateLocale = currentLocale === 'ru' ? ru : he

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [settings, setSettings] = useState<{ committee_name?: string; school_name?: string } | null>(null)
  const [holidaysModalOpen, setHolidaysModalOpen] = useState(false)
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)
  const calendarContentRef = useRef<HTMLDivElement>(null)
  const [calendarContentHeight, setCalendarContentHeight] = useState(0)
  const calendarT = useTranslations('calendar')

  useEffect(() => {
    // Load active tickets (all or featured)
    async function loadTickets() {
      try {
        const response = await fetch('/api/tickets?limit=6')
        const data = await response.json()
        if (data.success) {
          setTickets(data.data || [])
        }
      } catch (error) {
        console.error('Error loading tickets:', error)
      }
    }

    // Load settings
    async function fetchSettings() {
      try {
        const response = await fetch('/api/settings')
        const data = await response.json()
        if (data.success && data.data) {
          setSettings(data.data)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }

    loadTickets()
    fetchSettings()
  }, [])

  // Update calendar content height when expanded or events change
  useEffect(() => {
    if (calendarContentRef.current) {
      setCalendarContentHeight(calendarContentRef.current.scrollHeight)
    }
  }, [calendarEvents, isCalendarExpanded])

  const handleCalendarEventClick = async (event: CalendarEvent) => {
    // If it's a holiday with school closure, navigate to holidays modal
    if (event.type === 'holiday' && event.isSchoolClosed) {
      setHolidaysModalOpen(true)
      return
    }

    // For regular events, navigate to event page
    if (event.type !== 'holiday') {
      window.location.href = `/${currentLocale}/events/${event.id}`
    }
  }

  // Get recent events with photos (past events only)
  const now = new Date()
  const eventsWithPhotos = upcomingEvents
    .filter(event => {
      const eventEnd = event.end_datetime ? new Date(event.end_datetime) : new Date(event.start_datetime)
      return event.photos_url && eventEnd < now
    })
    .sort((a, b) => new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime())
    .slice(0, 4)

  return (
    <>
      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-br from-[#0D98BA]/10 via-white to-[#003153]/5 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#003153] mb-4">
            {t('welcome')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* School Stats Cards - Overlapping Hero */}
      <SchoolStats variant="cards" />

      <div className="container mx-auto px-4 py-4 max-w-6xl">
        {/* Highlights Carousel */}
        <HighlightsCarousel />

        {/* Next Holiday Widget - Right after carousel */}
        <div className="mb-6">
          <NextHolidayWidget onClick={() => setHolidaysModalOpen(true)} />
        </div>

        {/* Calendar Action Buttons - Right under NextHolidayWidget */}
        <div className="mb-6 relative">
          {/* Buttons in a single row, 50/50 */}
          <div className="flex gap-2 relative z-10">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-sm transition-all hover:bg-blue-100/50"
              onClick={() => setHolidaysModalOpen(true)}
            >
              <Calendar className="h-4 w-4 ml-2" />
              {calendarT('holidaysAndEvents')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-sm transition-all hover:bg-muted"
              onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
              title={isCalendarExpanded ? calendarT('hideCalendar') : calendarT('showCalendar')}
            >
              <Calendar className="h-4 w-4" />
              {isCalendarExpanded ? (
                <ChevronUp className="h-4 w-4 transition-transform mr-2" />
              ) : (
                <ChevronDown className="h-4 w-4 transition-transform mr-2" />
              )}
              {isCalendarExpanded ? calendarT('hideCalendar') : calendarT('showCalendar')}
            </Button>
          </div>

          {/* Collapsible Calendar - Under the buttons with proper z-index */}
          <div
            className="overflow-hidden transition-all duration-500 ease-in-out mt-3 relative z-0"
            style={{
              maxHeight: isCalendarExpanded ? `${calendarContentHeight}px` : '0px',
              opacity: isCalendarExpanded ? 1 : 0
            }}
          >
            <div ref={calendarContentRef} className={isCalendarExpanded ? 'animate-in fade-in-50 slide-in-from-top-2 duration-500' : ''}>
              <MobileCalendar
                events={calendarEvents}
                onEventClick={handleCalendarEventClick}
                showLegend={false}
                showWeeklySummary={true}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Urgent Messages Banner */}
          <UrgentMessagesBanner />

          {/* White Shirt Friday Reminder - Shows Thu 9:00 AM - Fri 9:00 AM */}
          <WhiteShirtBanner />
        </div>

        {/* UPCOMING EVENTS */}
        <div className="mb-8">
          <UpcomingEventsCard
            upcomingEvents={upcomingEvents}
            dateLocale={dateLocale}
            locale={currentLocale}
          />
        </div>

        {/* WhatsApp Community Card - After Upcoming Events */}
        <div className="mb-8">
          <WhatsAppCommunityCard />
        </div>

      {/* Photos Gallery Section */}
      {eventsWithPhotos.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Camera className="h-6 w-6 text-primary" />
              {t('photoGallery')}
            </h2>
            <Button variant="ghost" asChild size="sm">
              <Link href={`/${currentLocale}/events?tab=photos`} className="gap-1">
                {t('allGalleries')}
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Horizontal Scroll Container */}
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {eventsWithPhotos.map((event) => {
                const eventDate = new Date(event.start_datetime)
                // Get localized content - fallback to Hebrew if Russian not available
                const title = (currentLocale === 'ru' && event.title_ru) ? event.title_ru : event.title
                const location = (currentLocale === 'ru' && event.location_ru) ? event.location_ru : event.location

                return (
                  <Card
                    key={event.id}
                    className="flex-shrink-0 w-[280px] snap-start hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <a href={event.photos_url} target="_blank" rel="noopener noreferrer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Camera className="h-12 w-12 text-primary/20 flex-shrink-0" />
                          <div className="text-xs text-muted-foreground text-left" dir="ltr">
                            {format(eventDate, 'd MMM yyyy', { locale: dateLocale })}
                          </div>
                        </div>
                        <CardTitle className="text-base leading-tight line-clamp-2">
                          {title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {location && (
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                            📍 {location}
                          </p>
                        )}
                        <Button size="sm" variant="outline" className="w-full gap-2">
                          <Camera className="h-4 w-4" />
                          {t('viewPhotos')}
                        </Button>
                      </CardContent>
                    </a>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-1">
        {/* Main Content - Full width */}
        <div className="space-y-8">
          {/* Tickets Section - Placed in main content */}
          <TicketsSection tickets={tickets} />

          {/* Committee Members Card */}
          <CommitteeCard />
        </div>
      </div>

      {/* Unified Feedback & Ideas Card - First */}
      <div className="mt-8">
        <FeedbackAndIdeasCard />
      </div>

      {/* Info Banner - Second */}
      <Card className="mt-8 border-muted">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-primary/10 rounded-full p-3">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">{t('questionsOrSuggestions')}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {t('hereForYou')}
              </p>
              <div className="mb-3">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                >
                  <a
                    href="https://wa.me/972544345287?text=יש%20לי%20הצעה%20לשיפור%3A%0A"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageSquare className="h-3 w-3 ml-2" />
                    {t('sendWhatsApp')}
                  </a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('committeeLoginInfo')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Footer Credit */}
    <div className="text-center py-8 border-t mt-8">
      <p className="text-sm text-muted-foreground">
        {settings?.committee_name && settings?.school_name
          ? `נבנה באהבה על ידי ${settings.committee_name} ${settings.school_name} 💙`
          : 'נבנה באהבה על ידי ועד ההורים של בית ספר בארי 💙'}
      </p>
    </div>

    {/* Holidays Modal */}
    <HolidaysModal
      open={holidaysModalOpen}
      onOpenChange={setHolidaysModalOpen}
    />
    </>
  )
}