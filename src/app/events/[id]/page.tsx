'use client'

import { useParams, notFound } from 'next/navigation'
import { Calendar, MapPin, Clock, Users, ArrowRight, Camera } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EventFeedbackForm } from '@/components/features/feedback/EventFeedbackForm'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  description: string
  start_datetime: string
  end_datetime?: string
  location?: string
  event_type: string
  max_participants?: number
  current_participants?: number
  organizer_name?: string
  status: string
  photos_url?: string
}

function getEvent(id: string): Event | null {
  // Mock data for now - will be replaced with Supabase query
  const mockEvents: Record<string, Event> = {
    '1': {
      id: '1',
      title: 'ישיבת ועד חודשית',
      description: 'ישיבה חודשית לדיון בנושאים שוטפים של ועד ההורים. נדון בתקציב, אירועים קרובים ונושאים נוספים.',
      start_datetime: '2024-10-15T19:00:00Z',
      end_datetime: '2024-10-15T21:00:00Z',
      location: 'חדר המורים',
      event_type: 'meeting',
      max_participants: 20,
      current_participants: 12,
      organizer_name: 'דני כהן',
      status: 'published',
      photos_url: undefined
    },
    '2': {
      id: '2',
      title: 'יום ספורט',
      description: 'יום פעילות ספורטיבית לכל התלמידים במגרש בית הספר. פעילויות מגוונות למשפחות.',
      start_datetime: '2024-09-20T09:00:00Z',
      end_datetime: '2024-09-20T14:00:00Z',
      location: 'מגרש בית הספר',
      event_type: 'general',
      max_participants: 200,
      current_participants: 85,
      organizer_name: 'מיכל לוי',
      status: 'published',
      photos_url: 'https://drive.google.com/drive/folders/example123'
    },
    '3': {
      id: '3',
      title: 'מכירת עוגות לגיוס כספים',
      description: 'מכירת עוגות ביתיות לגיוס כספים לטיול שכבה. מוזמנים להביא עוגות ולקנות!',
      start_datetime: '2024-09-10T08:00:00Z',
      end_datetime: '2024-09-10T12:00:00Z',
      location: 'כניסה לבית הספר',
      event_type: 'fundraiser',
      organizer_name: 'שרה גולן',
      status: 'published',
      photos_url: 'https://drive.google.com/drive/folders/example456'
    }
  }

  return mockEvents[id] || null
}

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
  const event = getEvent(id)

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
          <Badge className={getEventTypeColor(event.event_type)}>
            {getEventTypeLabel(event.event_type)}
          </Badge>
        </div>
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
        {event.max_participants && (
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
                    {event.current_participants || 0} / {event.max_participants}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        ((event.current_participants || 0) / event.max_participants) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Organizer Card */}
        {event.organizer_name && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">מארגן</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{event.organizer_name}</p>
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
        <Button size="sm" className="flex-1">
          הרשמה לאירוע
        </Button>
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

      {/* Event Feedback Form */}
      <EventFeedbackForm eventId={event.id} eventTitle={event.title} />
    </div>
  )
}