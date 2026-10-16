'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { Calendar, ChevronLeft, Camera, ArrowLeft, ChevronDown, Clock, MapPin } from 'lucide-react'
import { Reveal, EASE_OUT } from '@/components/ui/motion'
import { DuoButton, duoCard, duoPress } from '@/components/ui/duo'
import { cn } from '@/lib/utils'
import { ShareButton } from '@/components/ui/share-button'
import { formatEventShareData } from '@/lib/utils/share-formatters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SkillsSurveyCard } from './SkillsSurveyCard'
import { SchoolStats } from './SchoolStats'
import { DuoGreeting } from './DuoGreeting'
import { SchoolYearProgress } from './SchoolYearProgress'
import { WhatsAppCommunityCard } from '@/components/features/whatsapp/WhatsAppCommunityCard'
import { CommitteeCornerCard } from './CommitteeCornerCard'
import { WhiteShirtBanner } from './WhiteShirtBanner'
import { WelcomeBackBanner } from './WelcomeBackBanner'
import { UrgentMessagesBanner } from '@/components/features/urgent/UrgentMessagesBanner'
import { HighlightsCarousel } from '@/components/features/highlights/HighlightsCarousel'
import { NextHolidayWidget } from '@/components/features/holidays/NextHolidayWidget'
import { HolidaysModal } from '@/components/features/holidays/HolidaysModal'
import { MobileCalendar } from '@/components/ui/MobileCalendar'
import { FloatingActionMenu } from '@/components/ui/FloatingActionMenu'
import type { Event, CalendarEvent, Ticket } from '@/types'
import Link from 'next/link'
import { format } from 'date-fns'
import { he, ru } from 'date-fns/locale'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'

// Lazy load below-fold components for better performance
const TicketsSection = dynamic(() => import('@/components/features/tickets/TicketsSection').then(mod => ({ default: mod.TicketsSection })), {
  loading: () => (
    <Card className="shadow-sm">
      <CardContent className="p-8">
        <div className="h-40 bg-gray-100 animate-pulse rounded" />
      </CardContent>
    </Card>
  )
})

// 2025 Enhancement: Bento Box Layout - Connect With Us Card
const ConnectWithUsCard = dynamic(() => import('./ConnectWithUsCard').then(mod => ({ default: mod.ConnectWithUsCard })), {
  loading: () => (
    <Card className="shadow-sm">
      <CardContent className="p-8">
        <div className="h-48 bg-gray-100 animate-pulse rounded" />
      </CardContent>
    </Card>
  )
})

const heroItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
}

interface PublicHomepageProps {
  upcomingEvents: Event[]
  calendarEvents: CalendarEvent[]
}

// Upcoming Events Card Component with 2025 Enhancements
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
  const INITIAL_EVENTS_COUNT = 3 // Increased from 2 → 3 (2025: Show more options)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showAllEventsModal, setShowAllEventsModal] = useState(false)
  const [allEvents, setAllEvents] = useState<Event[]>([]) // State for all events (past + future)

  const displayedEvents = upcomingEvents.slice(0, INITIAL_EVENTS_COUNT)
  const hasMore = upcomingEvents.length > INITIAL_EVENTS_COUNT

  // Fetch all events (past + future) when modal opens
  useEffect(() => {
    if (showAllEventsModal && allEvents.length === 0) {
      async function fetchAllEvents() {
        try {
          const response = await fetch('/api/events?limit=100&status=published')
          const data = await response.json()
          if (data.success) {
            // Sort chronologically (oldest first, newest last)
            const sorted = [...(data.data || [])].sort((a, b) => {
              return new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
            })
            setAllEvents(sorted)
          }
        } catch (error) {
          console.error('Error fetching all events:', error)
        }
      }
      fetchAllEvents()
    }
  }, [showAllEventsModal, allEvents.length])

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  return (
    <Card className={cn(duoCard, 'group relative overflow-hidden')}>
      {/* Solid colored banner header — Duolingo "unit" header */}
      <CardHeader className="m-2 mb-0 p-4 rounded-xl bg-[#087A96] shadow-[0_4px_0_#05586d] space-y-1">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </span>
          <CardTitle className="text-lg md:text-xl font-extrabold text-white">
            {t('upcomingEvents')}
          </CardTitle>
        </div>
        <CardDescription className="text-xs md:text-sm font-medium text-white/90">
          {t('nextSchoolEvents')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-4 md:p-4 md:pt-5">
        <div className="space-y-3">
          {upcomingEvents.length > 0 ? (
            <>
              {displayedEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <EventItem
                    event={event}
                    dateLocale={dateLocale}
                    locale={locale}
                    onClick={() => handleEventClick(event)}
                  />
                </motion.div>
              ))}
              {hasMore && (
                <div className="pt-3 pb-1">
                  <DuoButton
                    variant="yellow"
                    onClick={() => setShowAllEventsModal(true)}
                    className="w-full"
                  >
                    {locale === 'ru'
                      ? `Показать все (${upcomingEvents.length})`
                      : `הצג הכל (${upcomingEvents.length})`
                    }
                    <ChevronLeft className="h-4 w-4" />
                  </DuoButton>
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
            <DialogHeader className="pl-12">
              <DialogTitle className="flex items-center gap-3 text-2xl leading-snug">
                <span className="text-3xl shrink-0">
                  {selectedEvent.event_type === 'meeting' ? '👥' :
                   selectedEvent.event_type === 'fundraiser' ? '💰' :
                   selectedEvent.event_type === 'trip' ? '🚌' :
                   selectedEvent.event_type === 'workshop' ? '📚' : '🎯'}
                </span>
                <span className="min-w-0">{(locale === 'ru' && selectedEvent.title_ru) ? selectedEvent.title_ru : selectedEvent.title}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-end">
                <ShareButton
                  shareData={formatEventShareData(selectedEvent, locale)}
                  variant="ghost"
                  size="icon"
                  locale={locale}
                  className="flex-shrink-0"
                />
              </div>

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
                  <Badge className="bg-emerald-500 text-white text-sm shadow-sm">
                    {locale === 'ru' ? '🔴 Сейчас' : '🔴 מתקיים כעת'}
                  </Badge>
                ) : isStartingSoon ? (
                  <Badge className="bg-[#0D98BA] text-white text-sm shadow-sm">
                    {locale === 'ru' ? '⚡ Скоро' : '⚡ בקרוב'}
                  </Badge>
                ) : null
              })()}

              {/* Date and Time */}
              <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <Clock className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    {format(new Date(selectedEvent.start_datetime), 'EEEE, d MMMM yyyy', { locale: dateLocale })}
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
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="font-medium text-gray-900">
                    {locale === 'ru' ? `💰 Стоимость: ₪${selectedEvent.payment_amount}` : `💰 עלות: ₪${selectedEvent.payment_amount}`}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* All Events Modal */}
      <AllEventsModal
        open={showAllEventsModal}
        onOpenChange={setShowAllEventsModal}
        events={allEvents.length > 0 ? allEvents : upcomingEvents}
        dateLocale={dateLocale}
        locale={locale}
        onEventClick={handleEventClick}
      />
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

  // Determine event status with countdown timers
  const isHappeningNow = now >= startDate && now <= endDate
  const timeDiff = startDate.getTime() - now.getTime()
  const hasEnded = now > endDate

  // 2025 Enhancement: Countdown Timer Logic (hours removed)
  const daysUntil = Math.floor(timeDiff / (1000 * 60 * 60 * 24))

  const isStartingToday = !isHappeningNow && timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000 // Within 24 hours
  const isStartingThisWeek = !isHappeningNow && timeDiff > 0 && timeDiff <= 7 * 24 * 60 * 60 * 1000 // Within 7 days

  // Date-block color + icon per event type (each pair verified ≥4.5:1 text contrast)
  const getEventVisual = () => {
    switch (event.event_type) {
      case 'meeting': return { bg: '#003153', text: '#FFFFFF', icon: '👥' }
      case 'fundraiser': return { bg: '#FFBA00', text: '#003153', icon: '💰' }
      case 'trip': return { bg: '#FF8200', text: '#003153', icon: '🚌' }
      case 'workshop': return { bg: '#87CEEB', text: '#003153', icon: '📚' }
      case 'general':
      default: return { bg: '#003153', text: '#FFFFFF', icon: '🎯' }
    }
  }
  const eventVisual = getEventVisual()

  // Countdown timers (pulse animation removed per user request)
  // Colors below are chosen for ≥4.5:1 text contrast (the previous white-on-yellow /
  // white-on-brand-blue / white-on-emerald pairings failed WCAG AA)
  const statusConfig = isHappeningNow
    ? {
        text: locale === 'ru' ? 'Сейчас' : 'מתקיים כעת',
        bgColor: 'bg-emerald-700',
        textColor: 'text-white',
        dotColor: 'bg-emerald-300'
      }
    : isStartingToday
    ? {
        text: locale === 'ru' ? 'Сегодня!' : 'היום!',
        bgColor: 'bg-[#FFBA00]',
        textColor: 'text-[#003153]',
        dotColor: 'bg-[#003153]/50'
      }
    : isStartingThisWeek
    ? {
        text: locale === 'ru' ? `Через ${daysUntil} дн.` : `בעוד ${daysUntil} ימים`,
        bgColor: 'bg-[#003153]',
        textColor: 'text-white',
        dotColor: 'bg-[#87CEEB]'
      }
    : hasEnded
    ? {
        text: locale === 'ru' ? 'Завершено' : 'הסתיים',
        bgColor: 'bg-gray-300',
        textColor: 'text-gray-700',
        dotColor: 'bg-gray-500'
      }
    : null

  return (
    <div
      onClick={onClick}
      className="block group cursor-pointer"
    >
      <div className={cn(
        duoCard, duoPress,
        'relative flex items-start gap-3 p-4 focus-within:ring-4 focus-within:ring-[#0D98BA]/20 min-h-[56px]'
      )}>
        {/* Date block - leading, colored by event type, chunky 3D tile */}
        <div className="relative flex-shrink-0">
          <div
            className="w-12 h-12 rounded-xl flex flex-col items-center justify-center leading-none"
            style={{ backgroundColor: eventVisual.bg, boxShadow: '0 3px 0 rgba(0,0,0,0.22)' }}
          >
            <span
              className="text-[9px] font-bold uppercase tracking-wide mb-0.5"
              style={{ color: eventVisual.text, opacity: 0.85 }}
            >
              {format(startDate, 'MMM', { locale: dateLocale })}
            </span>
            <span className="text-lg font-extrabold" style={{ color: eventVisual.text }}>
              {format(startDate, 'd')}
            </span>
          </div>
          <span className="absolute -bottom-1.5 -left-1.5 w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[10px]">
            {eventVisual.icon}
          </span>
        </div>

        {/* Event Info - Primary focus */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h3 className="text-base md:text-lg font-extrabold text-[#003153] leading-tight flex-1">
              {title}
            </h3>
            {statusConfig && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold tracking-wide ${statusConfig.bgColor} ${statusConfig.textColor} flex-shrink-0`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                {statusConfig.text}
              </span>
            )}
          </div>

          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
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

// All Events Modal Component
function AllEventsModal({
  open,
  onOpenChange,
  events,
  dateLocale,
  locale,
  onEventClick
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  events: Event[]
  dateLocale: typeof he | typeof ru
  locale: Locale
  onEventClick: (event: Event) => void
}) {
  const todayEventRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to today's event when modal opens
  useEffect(() => {
    if (open && todayEventRef.current) {
      setTimeout(() => {
        todayEventRef.current?.scrollIntoView({
          behavior: 'auto',
          block: 'start'
        })
      }, 150)
    }
  }, [open, events])

  // Find first upcoming event (today or later)
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const firstUpcomingIndex = events.findIndex(event => {
    const eventDate = new Date(event.start_datetime)
    return eventDate >= startOfToday
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Calendar className="h-7 w-7 text-[#0D98BA]" />
            <span>
              {locale === 'ru' ? 'Все события' : 'כל האירועים'} ({events.length})
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4 pb-1">
          {events.map((event, index) => {
            const isFirstUpcoming = index === firstUpcomingIndex

            return (
              <div key={event.id} ref={isFirstUpcoming ? todayEventRef : null}>
                <EventItem
                  event={event}
                  dateLocale={dateLocale}
                  locale={locale}
                  onClick={() => {
                    onEventClick(event)
                    onOpenChange(false) // Close "All Events" modal when viewing event details
                  }}
                />
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      {/* Skip Links for Accessibility */}
      <a
        href="#events-section"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0D98BA] focus:text-white focus:rounded focus:ring-4 focus:ring-[#0D98BA]/50"
      >
        קפיצה לאירועים
      </a>
      <a
        href="#whatsapp-section"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-24 focus:z-50 focus:px-4 focus:py-2 focus:bg-green-600 focus:text-white focus:rounded focus:ring-4 focus:ring-green-600/50"
      >
        קפיצה לWhatsApp
      </a>

      {/* Hero Section - 2025 Enhanced with Single Focused CTA */}
      <div className="bg-gradient-to-br from-[#0D98BA]/5 via-white to-[#003153]/5 py-8 md:py-12">
        <motion.div
          className="container mx-auto px-4 text-center max-w-4xl"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {/* Value Proposition - Clear & Outcome-Focused */}
          <motion.h1
            variants={heroItem}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#003153] mb-3 leading-tight"
          >
            {t('heroTitle')}
          </motion.h1>

          {/* Benefits - Scannable Bullet Format */}
          <motion.p
            variants={heroItem}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="text-base md:text-lg text-gray-700 mb-6 leading-relaxed"
          >
            {t('heroBenefits')}
          </motion.p>

          {/* Accent underline that draws in after the copy lands */}
          <motion.div
            aria-hidden
            className="mx-auto h-1 w-16 rounded-full bg-gradient-to-l from-[#FFBA00] to-[#FF8200] origin-center"
            variants={{ hidden: { scaleX: 0, opacity: 0 }, visible: { scaleX: 1, opacity: 1 } }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT }}
          />
        </motion.div>
      </div>

      {/* School Stats - Restored per user request */}
      <SchoolStats variant="cards" />

      <main aria-label="תוכן ראשי" className="container mx-auto px-4 py-4 md:py-6 max-w-6xl">
        {/* Urgent Messages Banner - Always on top! */}
        <div className="mb-3">
          <UrgentMessagesBanner />
        </div>

        {/* Duolingo-style mascot greeting */}
        <DuoGreeting upcomingEvents={upcomingEvents} />

        {/* Welcome Back Banner - Temporary, visible until Sept 2 2026 */}
        <WelcomeBackBanner />

        {/* Highlights Carousel */}
        <HighlightsCarousel />

        {/* School-year XP bar */}
        <Reveal>
          <SchoolYearProgress />
        </Reveal>

        {/* Next Holiday Widget - Right after carousel */}
        <div className="mb-3">
          <NextHolidayWidget onClick={() => setHolidaysModalOpen(true)} />
        </div>

        {/* Calendar Toggle - Single Button (2025: Reduce Choices) */}
        <aside aria-label="לוח שנה וחגים" className="mb-3 relative">
          {/* Single Unified Button - Reduces Decision Fatigue */}
          <div className="relative z-10">
            <DuoButton
              variant="navy"
              onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
              className="w-full"
              aria-expanded={isCalendarExpanded}
              title={isCalendarExpanded ? calendarT('hideCalendar') : calendarT('showCalendar')}
            >
              <Calendar className="h-5 w-5 ml-2" />
              <span className="font-medium">📅 {calendarT('calendarAndHolidays')}</span>
              <motion.span
                className="mr-2 inline-flex"
                animate={{ rotate: isCalendarExpanded ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <ChevronDown className="h-5 w-5" />
              </motion.span>
            </DuoButton>
          </div>

          {/* Collapsible Calendar - framer animates to the real "auto" height (no measuring) */}
          <AnimatePresence initial={false}>
            {isCalendarExpanded && (
              <motion.div
                key="calendar"
                className="overflow-hidden relative z-0"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ height: { duration: 0.4, ease: EASE_OUT }, opacity: { duration: 0.25 } }}
              >
                <motion.div
                  className="pt-3"
                  initial={{ y: -8 }}
                  animate={{ y: 0 }}
                  exit={{ y: -8 }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                >
                  <MobileCalendar
                    events={calendarEvents}
                    onEventClick={handleCalendarEventClick}
                    showLegend={false}
                    showWeeklySummary={true}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        <div className="space-y-3">
          {/* White Shirt Friday Reminder - Shows Thu 9:00 AM - Fri 9:00 AM */}
          <WhiteShirtBanner />
        </div>

        {/* PROMOTED: UPCOMING EVENTS - High Priority */}
        <div id="events-section" className="mb-4 scroll-mt-20">
          <UpcomingEventsCard
            upcomingEvents={upcomingEvents}
            dateLocale={dateLocale}
            locale={currentLocale}
          />
        </div>

        {/* PROMOTED: WhatsApp Community Card - High Priority */}
        <Reveal id="whatsapp-section" className="mb-4 scroll-mt-20">
          <WhatsAppCommunityCard />
        </Reveal>

        {/* Committee Corner - hub for regulations, protocols, members & contact */}
        <Reveal className="mb-4">
          <CommitteeCornerCard />
        </Reveal>

      {/* Photos Gallery Section */}
      {eventsWithPhotos.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
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
              {eventsWithPhotos.map((event, index) => {
                const eventDate = new Date(event.start_datetime)
                // Get localized content - fallback to Hebrew if Russian not available
                const title = (currentLocale === 'ru' && event.title_ru) ? event.title_ru : event.title
                const location = (currentLocale === 'ru' && event.location_ru) ? event.location_ru : event.location

                return (
                  <Reveal key={event.id} className="flex-shrink-0 snap-start" delay={index * 0.07} y={12}>
                  <Card
                    className={cn(duoCard, duoPress, 'w-[280px] h-full cursor-pointer')}
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
                        {/* Span, not button: it already sits inside the card's <a> */}
                        <span className="flex w-full items-center justify-center gap-2 min-h-[40px] rounded-xl border-2 border-[#e5e5e5] text-sm font-extrabold text-[#087A96]">
                          <Camera className="h-4 w-4" />
                          {t('viewPhotos')}
                        </span>
                      </CardContent>
                    </a>
                  </Card>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-1">
        {/* Main Content - Full width */}
        <div className="space-y-4">
          {/* Tickets Section - Only show if there are active tickets */}
          {tickets.length > 0 && (
            <Reveal>
              <TicketsSection tickets={tickets} />
            </Reveal>
          )}
        </div>
      </div>

      {/* 2025: Contact & Feedback - Consolidated Bento Box (WhatsApp + Feedback + Ideas) */}
      <Reveal className="mt-6">
        <ConnectWithUsCard />
      </Reveal>

      {/* 2025: Skills Survey - Moved to Bottom 30% (Progressive Disclosure) */}
      <Reveal id="survey-section" className="mt-6 scroll-mt-20">
        <SkillsSurveyCard />
      </Reveal>
    </main>

    {/* Footer Credit */}
    <footer className="text-center py-6 border-t mt-8 bg-gray-50">
      <p className="text-sm text-muted-foreground">
        {settings?.committee_name && settings?.school_name
          ? `נבנה באהבה על ידי ${settings.committee_name} ${settings.school_name} 💙`
          : 'נבנה באהבה על ידי ועד ההורים של בית ספר בארי 💙'}
      </p>
    </footer>

    {/* Holidays Modal */}
    <HolidaysModal
      open={holidaysModalOpen}
      onOpenChange={setHolidaysModalOpen}
    />

    {/* Floating Action Menu - Mobile Only */}
    <FloatingActionMenu />
    </>
  )
}