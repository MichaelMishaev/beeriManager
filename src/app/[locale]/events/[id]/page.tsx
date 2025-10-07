'use client'

import { useParams, notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Calendar, MapPin, Clock, Users, ArrowRight, Camera, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EventFeedbackForm } from '@/components/features/feedback/EventFeedbackForm'
import { EventActions } from '@/components/events/event-actions'
import Link from 'next/link'
import type { Event } from '@/types'

function getEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'meeting': 'ישיבה',
    'fundraiser': 'גיוס כספים',
    'general': 'כללי',
    'social': 'חברתי',
    'educational': 'חינוכי'
  }
  return labels[type] || type
}

function getEventTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'meeting': 'bg-blue-100 text-blue-800',
    'fundraiser': 'bg-green-100 text-green-800',
    'general': 'bg-gray-100 text-gray-800',
    'social': 'bg-purple-100 text-purple-800',
    'educational': 'bg-yellow-100 text-yellow-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

export default function EventPage() {
  const params = useParams()
  const id = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    loadEvent()
    checkAuth()
  }, [id])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      setIsAdmin(data.authenticated && data.user?.role === 'admin')
    } catch (error) {
      setIsAdmin(false)
    }
  }

  async function loadEvent() {
    try {
      const response = await fetch(`/api/events/${id}`)
      const data = await response.json()
      if (data.success && data.data) {
        setEvent(data.data)
      } else {
        setEvent(null)
      }
    } catch (error) {
      console.error('Error loading event:', error)
      setEvent(null)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!event) {
    return notFound()
  }

  const startDate = new Date(event.start_datetime)
  const endDate = event.end_datetime ? new Date(event.end_datetime) : null

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/events"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="h-4 w-4 ml-1 rotate-180" />
          חזרה לאירועים
        </Link>
      </div>

      {/* Event Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
          <div className="flex items-center gap-2">
            <Badge className={getEventTypeColor(event.event_type)}>
              {getEventTypeLabel(event.event_type)}
            </Badge>
          </div>
        </div>
        {/* Admin Actions */}
        {isAdmin && (
          <div className="mt-4">
            <EventActions eventId={event.id} eventTitle={event.title} />
          </div>
        )}
      </div>

      {/* Event Details Grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Date & Time Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              תאריך ושעה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {startDate.toLocaleDateString('he-IL', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 mr-6">
              <span className="text-sm text-muted-foreground">
                {startDate.toLocaleTimeString('he-IL', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                {endDate && (
                  <>
                    {' - '}
                    {endDate.toLocaleTimeString('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </>
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        {event.location && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                מיקום
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{event.location}</p>
            </CardContent>
          </Card>
        )}

        {/* Participants Card */}
        {event.max_attendees && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                משתתפים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">נרשמו:</span>
                  <span className="font-medium">
                    {event.current_attendees || 0} / {event.max_attendees}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        ((event.current_attendees || 0) / event.max_attendees) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Description Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">תיאור</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        </CardContent>
      </Card>

      {/* Photos Section - Only show if event has ended and has photos */}
      {event.photos_url && event.end_datetime && new Date(event.end_datetime) < new Date() && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="h-5 w-5 text-primary" />
              גלריית תמונות מהאירוע
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              התמונות מהאירוע זמינות לצפייה ב-Google Drive
            </p>
            <Button asChild className="w-full sm:w-auto">
              <a href={event.photos_url} target="_blank" rel="noopener noreferrer">
                <Camera className="h-4 w-4 ml-2" />
                פתח גלריה
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mb-8">
        <Button variant="outline" asChild size="sm" className="flex-1">
          <Link href={`/calendar?event=${event.id}`}>
            הצג בלוח שנה
          </Link>
        </Button>
        {event.photos_url && (
          <Button variant="outline" asChild size="sm" className="flex-1">
            <a href={event.photos_url} target="_blank" rel="noopener noreferrer">
              <Camera className="h-4 w-4 ml-2" />
              תמונות
            </a>
          </Button>
        )}
      </div>

      {/* Event Feedback Form - Only show after event has ended */}
      {event.end_datetime && new Date(event.end_datetime) < new Date() && (
        <EventFeedbackForm eventId={event.id} eventTitle={event.title} />
      )}
    </div>
  )
}