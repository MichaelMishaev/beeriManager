import { Suspense } from 'react'
import { AlertTriangle, Plus, Filter, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IssueCard } from '@/components/features/issues/IssueCard'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

// Fetch issues from database
async function getIssues() {
  const supabase = createClient()

  const { data: issues, error } = await supabase
    .from('issues')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching issues:', error)
    return []
  }

  return issues || []
}

// Get issue statistics
async function getIssueStats() {
  const supabase = createClient()

  const [open, inProgress, resolved, closed] = await Promise.all([
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('status', 'closed')
  ])

  return {
    open: open.count || 0,
    inProgress: inProgress.count || 0,
    resolved: resolved.count || 0,
    closed: closed.count || 0,
    total: (open.count || 0) + (inProgress.count || 0)
  }
}

function IssuesListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

async function IssuesList() {
  const issues = await getIssues()
  const stats = await getIssueStats()

  if (issues.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">אין בעיות פתוחות</h3>
        <p className="text-muted-foreground mb-6">
          מעולה! אין בעיות דחופות לטיפול
        </p>
        <Button asChild size="sm">
          <Link href="/admin/issues/new">
            <Plus className="h-4 w-4 ml-2" />
            דווח על בעיה
          </Link>
        </Button>
      </div>
    )
  }

  // Group issues by priority and status
  const criticalIssues = issues.filter(i => i.priority === 'critical' && i.status !== 'closed')
  const openIssues = issues.filter(i => i.status === 'open')
  const inProgressIssues = issues.filter(i => i.status === 'in_progress')
  const resolvedIssues = issues.filter(i => i.status === 'resolved' || i.status === 'closed').slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">פתוחות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">בטיפול</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">נפתרו</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">סה"כ פעילות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Issues */}
      {criticalIssues.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              בעיות קריטיות
            </CardTitle>
            <CardDescription>בעיות שדורשות טיפול דחוף</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} variant="compact" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Open Issues */}
      {openIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              בעיות פתוחות
            </CardTitle>
            <CardDescription>בעיות שממתינות לטיפול</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {openIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} variant="compact" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* In Progress Issues */}
      {inProgressIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              בעיות בטיפול
            </CardTitle>
            <CardDescription>בעיות שנמצאות כעת בתהליך פתרון</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inProgressIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} variant="compact" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Resolved Issues */}
      {resolvedIssues.length > 0 && (
        <Card className="opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              בעיות שנפתרו לאחרונה
            </CardTitle>
            <CardDescription>5 הבעיות האחרונות שנפתרו</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {resolvedIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} variant="minimal" />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function IssuesPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">בעיות לטיפול</h1>
          <p className="text-muted-foreground mt-2">
            מעקב אחר בעיות ונושאים הדורשים טיפול
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 ml-2" />
            סנן
          </Button>
          <Button asChild size="sm">
            <Link href="/feedback">
              <Plus className="h-4 w-4 ml-2" />
              דווח על בעיה
            </Link>
          </Button>
        </div>
      </div>

      {/* Issues List */}
      <Suspense fallback={<IssuesListSkeleton />}>
        <IssuesList />
      </Suspense>
    </div>
  )
}