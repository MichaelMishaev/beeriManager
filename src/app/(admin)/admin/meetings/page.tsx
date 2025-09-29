import { Suspense } from 'react'
import Link from 'next/link'
import { Users, Calendar, FileText, Plus, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { cn } from '@/lib/utils'

async function getMeetings() {
  const supabase = createClient()

  const { data: meetings, error } = await supabase
    .from('meeting_agendas')
    .select('*')
    .order('meeting_date', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching meetings:', error)
    return []
  }

  return meetings || []
}

async function getMeetingStats() {
  const supabase = createClient()

  const now = new Date()
  const [upcomingData, completedData, topicsData] = await Promise.all([
    supabase
      .from('meeting_agendas')
      .select('id', { count: 'exact', head: true })
      .gte('meeting_date', now.toISOString())
      .eq('status', 'planned'),

    supabase
      .from('meeting_agendas')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed'),

    supabase
      .from('agenda_topics')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
  ])

  return {
    upcoming: upcomingData.count || 0,
    completed: completedData.count || 0,
    pendingTopics: topicsData.count || 0
  }
}

function MeetingsListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

const statusLabels = {
  planned: 'מתוכנן',
  in_progress: 'מתבצע',
  completed: 'הסתיים',
  cancelled: 'בוטל'
}

const statusColors = {
  planned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

async function MeetingsList() {
  const meetings = await getMeetings()

  if (meetings.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">אין ישיבות מתוכננות</h3>
        <p className="text-muted-foreground mb-6">
          התחל לתכנן את הישיבה הראשונה
        </p>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4 ml-2" />
            צור ישיבה חדשה
          </Link>
        </Button>
      </div>
    )
  }

  // Separate upcoming and past meetings
  const now = new Date()
  const upcomingMeetings = meetings.filter(m => new Date(m.meeting_date) >= now)
  const pastMeetings = meetings.filter(m => new Date(m.meeting_date) < now)

  const MeetingCard = ({ meeting }: { meeting: typeof meetings[0] }) => {
    const isPast = new Date(meeting.meeting_date) < now
    const StatusIcon = meeting.status === 'completed' ? CheckCircle : Clock

    return (
      <Card className={cn(
        "hover:shadow-lg transition-shadow",
        isPast && 'opacity-75'
      )}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={statusColors[meeting.status as keyof typeof statusColors]}>
                  {statusLabels[meeting.status as keyof typeof statusLabels]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(meeting.meeting_date), 'dd MMMM yyyy, HH:mm', { locale: he })}
                </span>
              </div>
              <CardTitle className="text-lg">{meeting.title}</CardTitle>
              {meeting.description && (
                <CardDescription className="mt-2">
                  {meeting.description}
                </CardDescription>
              )}
            </div>
            <StatusIcon className={cn(
              "h-6 w-6 flex-shrink-0",
              meeting.status === 'completed' ? 'text-green-600' : 'text-blue-600'
            )} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {meeting.location && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">מיקום:</span> {meeting.location}
              </div>
            )}

            {meeting.attendees && meeting.attendees.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {meeting.attendees.length} משתתפים
                </span>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" asChild className="flex-1">
                <Link href={`/admin/meetings/${meeting.id}/agenda`}>
                  <FileText className="h-4 w-4 ml-2" />
                  סדר יום
                </Link>
              </Button>
              {meeting.status !== 'completed' && (
                <Button size="sm" asChild className="flex-1">
                  <Link href={`/admin/events/${meeting.related_event_id || ''}`}>
                    <Calendar className="h-4 w-4 ml-2" />
                    פרטי האירוע
                  </Link>
                </Button>
              )}
              {meeting.protocol_url && (
                <Button size="sm" variant="ghost" asChild>
                  <a href={meeting.protocol_url} target="_blank" rel="noopener noreferrer">
                    פרוטוקול
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Upcoming Meetings */}
      {upcomingMeetings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold">ישיבות קרובות</h2>
            <Badge variant="outline">{upcomingMeetings.length}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </div>
      )}

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-bold">ישיבות קודמות</h2>
            <Badge variant="outline">{pastMeetings.length}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {pastMeetings.slice(0, 6).map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
          {pastMeetings.length > 6 && (
            <div className="text-center mt-4">
              <Button variant="outline" size="sm">
                טען עוד {pastMeetings.length - 6} ישיבות
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

async function MeetingStats() {
  const stats = await getMeetingStats()

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">ישיבות קרובות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcoming}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">ישיבות שהתקיימו</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completed}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">נושאים ממתינים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingTopics}</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MeetingsPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ישיבות ועד הורים</h1>
          <p className="text-muted-foreground mt-2">
            ניהול ישיבות, סדר יום ופרוטוקולים
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/meetings/topics">
              <FileText className="h-4 w-4 ml-2" />
              נושאים להצבעה
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/events/new?type=meeting">
              <Plus className="h-4 w-4 ml-2" />
              ישיבה חדשה
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Suspense fallback={<div className="h-32 bg-gray-200 rounded animate-pulse" />}>
        <MeetingStats />
      </Suspense>

      {/* Meetings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            כל הישיבות
          </CardTitle>
          <CardDescription>
            ישיבות ועד הורים - קרובות ועבר
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<MeetingsListSkeleton />}>
            <MeetingsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}