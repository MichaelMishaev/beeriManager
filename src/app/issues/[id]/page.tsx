import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, CheckCircle, Clock, User, Calendar, ArrowRight, MessageSquare, Edit } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatHebrewDate, getHebrewRelativeTime } from '@/lib/utils/date'
import { createClient } from '@/lib/supabase/server'

const ISSUE_STATUSES = {
  open: 'פתוח',
  in_progress: 'בטיפול',
  resolved: 'נפתר',
  closed: 'סגור',
  cancelled: 'בוטל'
}

const ISSUE_CATEGORIES = {
  maintenance: 'תחזוקה',
  safety: 'בטיחות',
  equipment: 'ציוד',
  facility: 'מתקן',
  communication: 'תקשורת',
  event: 'אירוע',
  admin: 'ניהול',
  other: 'אחר'
}

const PRIORITY_LEVELS = {
  low: 'נמוכה',
  normal: 'רגילה',
  high: 'גבוהה',
  critical: 'קריטית'
}

async function getIssue(id: string) {
  const supabase = createClient()

  const { data: issue, error } = await supabase
    .from('issues')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !issue) {
    return null
  }

  return issue
}

async function getIssueComments(issueId: string) {
  const supabase = createClient()

  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true })

  return comments || []
}

async function getRelatedIssues(category: string, currentId: string) {
  const supabase = createClient()

  const { data: issues } = await supabase
    .from('issues')
    .select('id, title, status, priority, created_at')
    .eq('category', category)
    .neq('id', currentId)
    .neq('status', 'closed')
    .order('created_at', { ascending: false })
    .limit(5)

  return issues || []
}

function IssueDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
    </div>
  )
}

function getStatusColor(status: string) {
  const colors = {
    open: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    resolved: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  }
  return colors[status as keyof typeof colors] || colors.open
}

function getPriorityColor(priority: string) {
  const colors = {
    low: 'bg-green-100 text-green-800',
    normal: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800 animate-pulse'
  }
  return colors[priority as keyof typeof colors] || colors.low
}

function getCategoryColor(category: string) {
  const colors = {
    maintenance: 'bg-blue-100 text-blue-800',
    safety: 'bg-red-100 text-red-800',
    equipment: 'bg-purple-100 text-purple-800',
    facility: 'bg-green-100 text-green-800',
    communication: 'bg-yellow-100 text-yellow-800',
    event: 'bg-pink-100 text-pink-800',
    admin: 'bg-gray-100 text-gray-800',
    other: 'bg-indigo-100 text-indigo-800'
  }
  return colors[category as keyof typeof colors] || colors.other
}

async function IssueContent({ id }: { id: string }) {
  const issue = await getIssue(id)

  if (!issue) {
    notFound()
  }

  const comments = await getIssueComments(issue.id)
  const relatedIssues = await getRelatedIssues(issue.category, issue.id)

  const StatusIcon = issue.status === 'resolved' || issue.status === 'closed'
    ? CheckCircle
    : issue.status === 'in_progress'
    ? Clock
    : AlertTriangle

  const isUrgent = issue.priority === 'critical'

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="outline" size="sm" asChild size="sm">
        <Link href="/issues">
          <ArrowRight className="h-4 w-4 ml-2" />
          חזרה לבעיות
        </Link>
      </Button>

      {/* Header Card */}
      <Card className={isUrgent ? 'ring-2 ring-red-200' : ''}>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg flex-shrink-0 ${
              issue.status === 'resolved' || issue.status === 'closed'
                ? 'text-green-600 bg-green-50'
                : isUrgent
                ? 'text-red-600 bg-red-50'
                : 'text-orange-600 bg-orange-50'
            }`}>
              <StatusIcon className="h-8 w-8" />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <CardTitle className="text-2xl md:text-3xl mb-2">{issue.title}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getPriorityColor(issue.priority)}>
                    <AlertTriangle className="h-3 w-3 ml-1" />
                    {PRIORITY_LEVELS[issue.priority as keyof typeof PRIORITY_LEVELS]}
                  </Badge>
                  <Badge className={getStatusColor(issue.status)}>
                    {ISSUE_STATUSES[issue.status as keyof typeof ISSUE_STATUSES]}
                  </Badge>
                  {issue.category && (
                    <Badge variant="outline" className={getCategoryColor(issue.category)}>
                      {ISSUE_CATEGORIES[issue.category as keyof typeof ISSUE_CATEGORIES]}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>דווח על ידי: {issue.reporter_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatHebrewDate(new Date(issue.created_at))}</span>
                  <span className="text-xs">({getHebrewRelativeTime(new Date(issue.created_at))})</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {issue.description && (
            <Card>
              <CardHeader>
                <CardTitle>תיאור הבעיה</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {issue.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Resolution */}
          {issue.resolution && (
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  פתרון
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {issue.resolution}
                </p>
                {issue.resolved_at && (
                  <p className="text-sm text-muted-foreground mt-3">
                    נפתר בתאריך: {formatHebrewDate(new Date(issue.resolved_at))}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                תגובות ודיון
              </CardTitle>
              <CardDescription>
                {comments.length} תגובות
              </CardDescription>
            </CardHeader>
            <CardContent>
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">אין תגובות עדיין</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{comment.author_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatHebrewDate(new Date(comment.created_at))}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <Separator className="my-4" />

              <Button variant="outline" className="w-full" asChild size="sm">
                <Link href={`/feedback?issue_id=${issue.id}`}>
                  <MessageSquare className="h-4 w-4 ml-2" />
                  הוסף תגובה
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">פעולות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {issue.status !== 'resolved' && issue.status !== 'closed' && (
                <>
                  <Button variant="default" size="sm" className="w-full">
                    <CheckCircle className="h-4 w-4 ml-2" />
                    סמן כנפתר
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="h-4 w-4 ml-2" />
                    ערוך פרטים
                  </Button>
                </>
              )}
              <Button variant="outline" className="w-full" asChild size="sm">
                <Link href={`/feedback?issue_id=${issue.id}`}>
                  <MessageSquare className="h-4 w-4 ml-2" />
                  הוסף תגובה
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">פרטים נוספים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">מספר בעיה:</span>
                  <span className="font-mono text-xs">{issue.id.slice(0, 8)}</span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-muted-foreground">נפתח:</span>
                  <span>{formatHebrewDate(new Date(issue.created_at))}</span>
                </div>

                {issue.updated_at && issue.updated_at !== issue.created_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">עודכן:</span>
                    <span>{formatHebrewDate(new Date(issue.updated_at))}</span>
                  </div>
                )}

                {issue.resolved_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">נפתר:</span>
                    <span>{formatHebrewDate(new Date(issue.resolved_at))}</span>
                  </div>
                )}

                <Separator />

                {issue.reporter_email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">אימייל:</span>
                    <a href={`mailto:${issue.reporter_email}`} className="text-blue-600 hover:underline text-xs">
                      {issue.reporter_email}
                    </a>
                  </div>
                )}

                {issue.assigned_to && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">מטפל:</span>
                    <span className="font-medium">{issue.assigned_to}</span>
                  </div>
                )}

                {issue.location && (
                  <div>
                    <span className="text-muted-foreground block mb-1">מיקום:</span>
                    <span className="text-sm">{issue.location}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related Issues */}
          {relatedIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">בעיות דומות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {relatedIssues.map((related) => (
                  <Link
                    key={related.id}
                    href={`/issues/${related.id}`}
                    className="block p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium line-clamp-2 flex-1">
                        {related.title}
                      </p>
                      <Badge className={`${getPriorityColor(related.priority)} text-xs flex-shrink-0`}>
                        {PRIORITY_LEVELS[related.priority as keyof typeof PRIORITY_LEVELS]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getHebrewRelativeTime(new Date(related.created_at))}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function IssueDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense fallback={<IssueDetailSkeleton />}>
        <IssueContent id={params.id} />
      </Suspense>
    </div>
  )
}