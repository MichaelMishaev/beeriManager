'use client'

import { useState, useEffect } from 'react'
import { Calendar, MessageSquare, ChevronLeft, Camera, ArrowLeft, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CommitteeCard } from './CommitteeCard'
import { CollapsibleCalendarWidget } from '@/components/features/holidays/CollapsibleCalendarWidget'
import { SchoolStats } from './SchoolStats'
import { WhatsAppCommunityCard } from '@/components/features/whatsapp/WhatsAppCommunityCard'
import { TicketsSection } from '@/components/features/tickets/TicketsSection'
import { WhiteShirtBanner } from './WhiteShirtBanner'
import { UrgentMessagesBanner } from '@/components/features/urgent/UrgentMessagesBanner'
import { ShareIdeaButton } from '@/components/features/ideas/ShareIdeaButton'
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

function EventItem({ event, dateLocale, locale }: { event: Event; dateLocale: typeof he | typeof ru; locale: Locale }) {
  const startDate = new Date(event.start_datetime)
  const now = new Date()

  // Get localized content - fallback to Hebrew if Russian not available
  const title = (locale === 'ru' && event.title_ru) ? event.title_ru : event.title
  const description = (locale === 'ru' && event.description_ru) ? event.description_ru : event.description

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
    <Link href={`/events/${event.id}`} className="block group">
      <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200">
        {/* Larger, More Prominent Date Box */}
        <div className="flex-shrink-0">
          <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow ${
            isHappeningNow
              ? 'bg-gradient-to-br from-[#FF8200] to-[#FF8200]/80'
              : 'bg-gradient-to-br from-[#0D98BA] to-[#003153]'
          }`}>
            <div className="text-2xl font-bold leading-none">
              {format(startDate, 'd', { locale: dateLocale })}
            </div>
            <div className="text-xs uppercase mt-1 leading-none">
              {format(startDate, 'MMM', { locale: dateLocale })}
            </div>
          </div>
        </div>

        {/* Event Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-[#003153] group-hover:text-[#0D98BA] transition-colors leading-snug">
              {title}
            </h3>
            {statusConfig && (
              <div className="relative">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                  {statusConfig.showPulse && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#FF8200] opacity-75 animate-ping"></span>
                  )}
                  <span className="relative">{statusConfig.text}</span>
                </span>
              </div>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {description}
            </p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>
              {format(startDate, 'EEEE, d MMMM', { locale: dateLocale })}
            </span>
            <span>• {format(startDate, 'HH:mm', { locale: dateLocale })}</span>
          </div>
        </div>

        <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-[#0D98BA] transition-colors self-center flex-shrink-0" />
      </div>
    </Link>
  )
}

export function PublicHomepage({ upcomingEvents, calendarEvents }: PublicHomepageProps) {
  const t = useTranslations('homepage')
  const params = useParams()
  const currentLocale = params.locale as Locale
  const dateLocale = currentLocale === 'ru' ? ru : he

  const [tickets, setTickets] = useState<Ticket[]>([])

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
    loadTickets()
  }, [])

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
        {/* Urgent Messages Banner */}
        <UrgentMessagesBanner />

        {/* White Shirt Friday Reminder - Shows Thu 9:00 AM - Fri 9:00 AM */}
        <WhiteShirtBanner />

      {/* Photos Gallery Section */}
      {eventsWithPhotos.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Camera className="h-6 w-6 text-primary" />
              {t('photoGallery')}
            </h2>
            <Button variant="ghost" asChild size="sm">
              <Link href="/events?tab=photos" className="gap-1">
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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Events - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
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
            <CardContent>
              <div className="space-y-2">
                {upcomingEvents.length > 0 ? (
                  <>
                    {upcomingEvents.slice(0, 5).map((event) => (
                      <EventItem key={event.id} event={event} dateLocale={dateLocale} locale={currentLocale} />
                    ))}
                    {upcomingEvents.length > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/events">
                            {t('viewAllEvents')} ({upcomingEvents.length})
                          </Link>
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
          </Card>

          {/* Tickets Section - Placed in main content */}
          <TicketsSection tickets={tickets} />

          {/* Complaint CTA */}
          <Card className="bg-gradient-to-br from-[#0D98BA]/5 to-[#003153]/5 border-[#0D98BA]/20 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#0D98BA]/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-[#0D98BA]" />
                </div>
                <CardTitle className="text-xl text-[#003153]">
                  {t('haveFeedback')}
                </CardTitle>
              </div>
              <CardDescription className="text-base mt-2">
                {t('shareOpinion')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {t('feedbackHelps')}
              </p>
              <Button asChild className="w-full bg-[#0D98BA] hover:bg-[#0D98BA]/90" size="lg">
                <Link href="/complaint">
                  <MessageSquare className="h-5 w-5 ml-2" />
                  {t('sendComplaint')}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Ideas Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow relative">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-10 h-10 rounded-full bg-[#FFBA00]/10 flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-[#FFBA00]" />
                  </div>
                  <CardTitle className="text-xl text-[#003153]">
                    יש לכם רעיון?
                  </CardTitle>
                </div>
                <ShareIdeaButton
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10"
                />
              </div>
              <CardDescription className="text-base mt-2">
                שתפו אותנו ברעיונות לשיפור ותכונות חדשות
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                הרעיונות שלכם עוזרים לנו לשפר ולהתפתח. כל רעיון נבדק ונשקל!
              </p>
              <Button asChild className="w-full bg-[#FFBA00] hover:bg-[#FFBA00]/90 text-[#003153]" size="lg">
                <Link href="/ideas">
                  <Lightbulb className="h-5 w-5 ml-2" />
                  שלחו רעיון
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Committee Members Card */}
          <CommitteeCard />
        </div>

        {/* Calendar & Holidays - Takes 1 column */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="lg:sticky lg:top-20 space-y-4">
            {/* Collapsible Calendar Widget */}
            <CollapsibleCalendarWidget
              calendarEvents={calendarEvents}
              onEventClick={(event) => {
                // Only navigate for non-holiday events
                // Holiday events are handled by CollapsibleCalendarWidget
                if (event.type !== 'holiday') {
                  window.location.href = `/events/${event.id}`
                }
              }}
              defaultExpanded={false}
            />

            {/* WhatsApp Community Card */}
            <WhatsAppCommunityCard />
          </div>
        </div>
      </div>

      {/* Info Banner */}
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
        נבנה באהבה על ידי ועד ההורים של בית ספר בארי 💙
      </p>
    </div>
    </>
  )
}