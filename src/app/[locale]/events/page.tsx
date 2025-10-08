'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, Camera, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import type { Event } from '@/types'

function EventsList({
  filter,
  showDrafts
}: {
  filter: 'all' | 'upcoming' | 'past' | 'photos'
  showDrafts: boolean
}) {
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [showDrafts])

  async function loadEvents() {
    try {
      const statusParam = showDrafts ? 'all' : 'published'
      const response = await fetch(`/api/events?limit=100&status=${statusParam}`)
      const data = await response.json()
      if (data.success) {
        setAllEvents(data.data || [])
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

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
                <div className="flex items-center gap-2 flex-shrink-0">
                  {event.status === 'draft' && (
                    <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">טיוטה</Badge>
                  )}
                  {event.status === 'published' && (
                    <Badge className="text-xs bg-green-100 text-green-800 border-green-300">פורסם</Badge>
                  )}
                  {event.status === 'cancelled' && (
                    <Badge className="text-xs bg-red-100 text-red-800 border-red-300">בוטל</Badge>
                  )}
                  {event.photos_url && (
                    <Camera className="h-5 w-5 text-primary" />
                  )}
                </div>
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
  const [showDrafts, setShowDrafts] = useState(false)

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

      <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg">
        <Checkbox
          id="show-drafts"
          checked={showDrafts}
          onCheckedChange={(checked) => setShowDrafts(checked as boolean)}
        />
        <Label
          htmlFor="show-drafts"
          className="text-sm cursor-pointer select-none"
        >
          הצג אירועים בטיוטה (מנהלים בלבד)
        </Label>
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
          <EventsList filter="all" showDrafts={showDrafts} />
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <EventsList filter="upcoming" showDrafts={showDrafts} />
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <EventsList filter="past" showDrafts={showDrafts} />
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          <EventsList filter="photos" showDrafts={showDrafts} />
        </TabsContent>
      </Tabs>
    </div>
  )
}