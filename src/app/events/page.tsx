import { Suspense } from 'react'
import { Calendar, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

async function EventsList() {
  // This will be replaced with actual Supabase query
  const events = [
    {
      id: '1',
      title: 'ישיבת ועד חודשית',
      description: 'ישיבה חודשית לדיון בנושאים שוטפים',
      start_datetime: '2024-10-15T19:00:00Z',
      location: 'חדר המורים',
      event_type: 'meeting'
    },
    {
      id: '2',
      title: 'יום ספורט',
      description: 'יום פעילות ספורטיבית לכל התלמידים',
      start_datetime: '2024-10-20T09:00:00Z',
      location: 'מגרש בית הספר',
      event_type: 'general'
    },
    {
      id: '3',
      title: 'מכירת עוגות לגיוס כספים',
      description: 'מכירת עוגות ביתיות לגיוס כספים לטיול שכבה',
      start_datetime: '2024-10-25T08:00:00Z',
      location: 'כניסה לבית הספר',
      event_type: 'fundraiser'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Link key={event.id} href={`/events/${event.id}`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {new Date(event.start_datetime).toLocaleDateString('he-IL')}
                {event.location && ` • ${event.location}`}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
              <div className="mt-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  event.event_type === 'meeting'
                    ? 'bg-blue-100 text-blue-800'
                    : event.event_type === 'fundraiser'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {event.event_type === 'meeting' && 'ישיבה'}
                  {event.event_type === 'fundraiser' && 'גיוס כספים'}
                  {event.event_type === 'general' && 'כללי'}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

export default function EventsPage() {
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

      <Suspense fallback={<EventsLoadingSkeleton />}>
        <EventsList />
      </Suspense>
    </div>
  )
}