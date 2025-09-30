'use client'

import { Calendar, MessageSquare, ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MobileCalendar } from '@/components/ui/MobileCalendar'
import type { Event, CalendarEvent } from '@/types'
import Link from 'next/link'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

interface PublicHomepageProps {
  upcomingEvents: Event[]
  calendarEvents: CalendarEvent[]
}

function EventItem({ event }: { event: Event }) {
  const startDate = new Date(event.start_datetime)

  return (
    <Link href={`/events/${event.id}`}>
      <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border">
        <div className="flex-shrink-0 text-center">
          <div className="bg-primary text-primary-foreground rounded-lg p-3">
            <div className="text-2xl font-bold">
              {format(startDate, 'd', { locale: he })}
            </div>
            <div className="text-xs uppercase">
              {format(startDate, 'MMM', { locale: he })}
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {event.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {format(startDate, 'EEEE, d MMMM yyyy', { locale: he })}
            </span>
            <span className="mr-2">• {format(startDate, 'HH:mm', { locale: he })}</span>
          </div>
        </div>
        <ChevronLeft className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      </div>
    </Link>
  )
}

export function PublicHomepage({ upcomingEvents, calendarEvents }: PublicHomepageProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Welcome Header */}
      <div className="text-center space-y-3 mb-8">
        <h1 className="text-4xl font-bold text-foreground">
          ברוכים הבאים להורים בית הספר
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          צפו באירועים הקרובים, לוח השנה, ושלחו משוב לועד ההורים
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Events - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                אירועים קרובים
              </CardTitle>
              <CardDescription>
                האירועים הבאים בבית הספר
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.length > 0 ? (
                  <>
                    {upcomingEvents.slice(0, 5).map((event) => (
                      <EventItem key={event.id} event={event} />
                    ))}
                    {upcomingEvents.length > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/events">
                            צפה בכל האירועים ({upcomingEvents.length})
                          </Link>
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">אין אירועים קרובים כרגע</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Feedback CTA */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                יש לכם משוב?
              </CardTitle>
              <CardDescription>
                שתפו את דעתכם על האירועים שהשתתפתם בהם
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                המשוב שלכם עוזר לנו לשפר ולארגן אירועים טובים יותר עבור כולם.
                תוכלו לשלוח משוב אנונימי על כל אירוע.
              </p>
              <Button asChild className="w-full" size="sm">
                <Link href="/events">
                  <MessageSquare className="h-3 w-3 ml-2" />
                  בחרו אירוע לשליחת משוב
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Calendar - Takes 1 column */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                לוח שנה
              </CardTitle>
              <CardDescription>
                כל האירועים במבט אחד
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MobileCalendar
                events={calendarEvents}
                onEventClick={(event) => {
                  window.location.href = `/events/${event.id}`
                }}
                showLegend={false}
                showWeeklySummary={true}
                className="max-w-none"
              />
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/calendar">
                    <Calendar className="h-3 w-3 ml-2" />
                    לוח שנה מלא
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
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
              <h3 className="font-semibold mb-2">שאלות או הצעות?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                אנחנו כאן בשבילכם! לכל שאלה, הצעה או בקשה - נשמח לשמוע.
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
                    שלחו הודעה בוואטסאפ
                  </a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                חברי ועד ההורים יכולים להתחבר למערכת הניהול באמצעות כפתור "כניסת ועד" בתפריט.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}