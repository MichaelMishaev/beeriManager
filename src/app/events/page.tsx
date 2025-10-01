'use client'

import { Suspense, useState } from 'react'
import { Calendar, Plus, Camera } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

function EventsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EventsList({ filter }: { filter: 'all' | 'upcoming' | 'past' | 'photos' }) {
  // This will be replaced with actual Supabase query
  const allEvents = [
    {
      id: '1',
      title: 'ישיבת ועד חודשית',
      description: 'ישיבה חודשית לדיון בנושאים שוטפים',
      start_datetime: '2024-10-15T19:00:00Z',
      end_datetime: '2024-10-15T21:00:00Z',
      location: 'חדר המורים',
      event_type: 'meeting',
      photos_url: undefined
    },
    {
      id: '2',
      title: 'יום ספורט',
      description: 'יום פעילות ספורטיבית לכל התלמידים',
      start_datetime: '2024-09-20T09:00:00Z',
      end_datetime: '2024-09-20T14:00:00Z',
      location: 'מגרש בית הספר',
      event_type: 'general',
      photos_url: 'https://drive.google.com/drive/folders/example123'
    },
    {
      id: '3',
      title: 'מכירת עוגות לגיוס כספים',
      description: 'מכירת עוגות ביתיות לגיוס כספים לטיול שכבה',
      start_datetime: '2024-09-10T08:00:00Z',
      end_datetime: '2024-09-10T12:00:00Z',
      location: 'כניסה לבית הספר',
      event_type: 'fundraiser',
      photos_url: 'https://drive.google.com/drive/folders/example456'
    },
    {
      id: '4',
      title: 'מסיבת סיום כיתות ו 2024',
      description: 'מסיבת סיום שנה לתלמידי כיתות ו',
      start_datetime: '2024-06-25T18:00:00Z',
      end_datetime: '2024-06-25T22:00:00Z',
      location: 'אולם בית הספר',
      event_type: 'general',
      photos_url: 'https://drive.google.com/drive/folders/1TlwKxDvwySmWSMgDGlxf7mC5Ts5Q1WHL?usp=sharing'
    }
  ]

  const now = new Date()

  const filteredEvents = allEvents.filter(event => {
    const eventDate = new Date(event.start_datetime)
    const eventEnd = event.end_datetime ? new Date(event.end_datetime) : eventDate

    switch (filter) {
      case 'upcoming':
        return eventDate > now
      case 'past':
        return eventEnd < now
      case 'photos':
        return event.photos_url && eventEnd < now
      case 'all':
      default:
        return true
    }
  })

  if (filteredEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {filter === 'photos' ? 'אין עדיין תמונות מאירועים' : 'לא נמצאו אירועים'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredEvents.map((event) => (
        <Link key={event.id} href={`/events/${event.id}`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg flex-1">{event.title}</CardTitle>
                {event.photos_url && (
                  <Camera className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(event.start_datetime).toLocaleDateString('he-IL')}
                {event.location && ` • ${event.location}`}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {event.event_type === 'meeting' && 'ישיבה'}
                  {event.event_type === 'fundraiser' && 'גיוס כספים'}
                  {event.event_type === 'general' && 'כללי'}
                  {event.event_type === 'trip' && 'טיול'}
                  {event.event_type === 'workshop' && 'סדנה'}
                </Badge>
                {event.photos_url && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Camera className="h-3 w-3" />
                    תמונות
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past' | 'photos'>('all')

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 md:h-8 md:w-8" />
            אירועים
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mt-2">
            כל האירועים והפעילויות של ועד ההורים
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" asChild size="sm" className="flex-1 sm:flex-initial">
            <Link href="/calendar">
              <Calendar className="h-4 w-4 ml-2" />
              <span className="hidden sm:inline">תצוגת לוח שנה</span>
              <span className="sm:hidden">לוח שנה</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="flex-1 sm:flex-initial">
            <Link href="/admin/events/new">
              <Plus className="h-4 w-4 ml-2" />
              <span className="hidden sm:inline">אירוע חדש</span>
              <span className="sm:hidden">חדש</span>
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">הכל</TabsTrigger>
          <TabsTrigger value="upcoming">קרובים</TabsTrigger>
          <TabsTrigger value="past">עבר</TabsTrigger>
          <TabsTrigger value="photos" className="gap-1">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">עם תמונות</span>
            <span className="sm:hidden">תמונות</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <EventsList filter="all" />
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <EventsList filter="upcoming" />
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <EventsList filter="past" />
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          <EventsList filter="photos" />
        </TabsContent>
      </Tabs>
    </div>
  )
}