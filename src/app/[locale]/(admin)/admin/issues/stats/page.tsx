'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, Clock, TrendingUp, BarChart3, PieChart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface IssueStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  critical: number
  high: number
  medium: number
  low: number
  avgResolutionTime: number
  resolvedThisMonth: number
  openedThisMonth: number
}

export default function IssueStatsPage() {
  const [stats, setStats] = useState<IssueStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()

      // Get current month range
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

      // Fetch all issues
      const { data: issues } = await supabase
        .from('issues')
        .select('*')

      if (!issues) {
        setIsLoading(false)
        return
      }

      // Calculate statistics
      const total = issues.length
      const open = issues.filter(i => i.status === 'open').length
      const inProgress = issues.filter(i => i.status === 'in_progress').length
      const resolved = issues.filter(i => i.status === 'resolved').length
      const closed = issues.filter(i => i.status === 'closed').length

      const critical = issues.filter(i => i.priority === 'critical').length
      const high = issues.filter(i => i.priority === 'high').length
      const medium = issues.filter(i => i.priority === 'medium').length
      const low = issues.filter(i => i.priority === 'low').length

      // Calculate average resolution time for resolved/closed issues
      const resolvedIssues = issues.filter(i =>
        (i.status === 'resolved' || i.status === 'closed') && i.resolved_at
      )

      let avgResolutionTime = 0
      if (resolvedIssues.length > 0) {
        const totalTime = resolvedIssues.reduce((sum, issue) => {
          const created = new Date(issue.created_at).getTime()
          const resolved = new Date(issue.resolved_at!).getTime()
          return sum + (resolved - created)
        }, 0)
        avgResolutionTime = Math.round((totalTime / resolvedIssues.length) / (1000 * 60 * 60 * 24)) // Convert to days
      }

      // Issues this month
      const resolvedThisMonth = issues.filter(i =>
        i.resolved_at && new Date(i.resolved_at) >= firstDay
      ).length

      const openedThisMonth = issues.filter(i =>
        new Date(i.created_at) >= firstDay
      ).length

      setStats({
        total,
        open,
        inProgress,
        resolved,
        closed,
        critical,
        high,
        medium,
        low,
        avgResolutionTime,
        resolvedThisMonth,
        openedThisMonth,
      })
      setIsLoading(false)
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">שגיאה בטעינת נתונים</h3>
          <p className="text-muted-foreground">לא ניתן לטעון את הסטטיסטיקות</p>
        </div>
      </div>
    )
  }

  const activeIssues = stats.open + stats.inProgress
  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved + stats.closed) / stats.total * 100) : 0

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">סטטיסטיקות בעיות</h1>
          <p className="text-muted-foreground mt-2">
            מבט כולל על ביצועי טיפול בבעיות
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/issues">
            <AlertTriangle className="h-4 w-4 ml-2" />
            חזרה לבעיות
          </Link>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              סה"כ בעיות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeIssues} פעילות כעת
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              זמן פתרון ממוצע
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgResolutionTime}</div>
            <p className="text-xs text-muted-foreground mt-1">ימים</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              אחוז פתרון
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{resolutionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.resolved + stats.closed} נפתרו
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              החודש
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.openedThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.resolvedThisMonth} נפתרו
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              פילוח לפי סטטוס
            </CardTitle>
            <CardDescription>מצב בעיות נוכחי</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm">פתוחות</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats.open}</span>
                <span className="text-sm text-muted-foreground">
                  ({stats.total > 0 ? Math.round(stats.open / stats.total * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">בטיפול</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats.inProgress}</span>
                <span className="text-sm text-muted-foreground">
                  ({stats.total > 0 ? Math.round(stats.inProgress / stats.total * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">נפתרו</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats.resolved}</span>
                <span className="text-sm text-muted-foreground">
                  ({stats.total > 0 ? Math.round(stats.resolved / stats.total * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-sm">סגורות</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats.closed}</span>
                <span className="text-sm text-muted-foreground">
                  ({stats.total > 0 ? Math.round(stats.closed / stats.total * 100) : 0}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              פילוח לפי עדיפות
            </CardTitle>
            <CardDescription>חומרת הבעיות</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">קריטית</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats.critical}</span>
                <span className="text-sm text-muted-foreground">
                  ({stats.total > 0 ? Math.round(stats.critical / stats.total * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm">גבוהה</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats.high}</span>
                <span className="text-sm text-muted-foreground">
                  ({stats.total > 0 ? Math.round(stats.high / stats.total * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm">בינונית</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats.medium}</span>
                <span className="text-sm text-muted-foreground">
                  ({stats.total > 0 ? Math.round(stats.medium / stats.total * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">נמוכה</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats.low}</span>
                <span className="text-sm text-muted-foreground">
                  ({stats.total > 0 ? Math.round(stats.low / stats.total * 100) : 0}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>תובנות וביצועים</CardTitle>
          <CardDescription>ניתוח מגמות ודפוסים</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.critical > 0 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900">בעיות קריטיות זקוקות לתשומת לב</h4>
                <p className="text-sm text-red-700 mt-1">
                  יש {stats.critical} בעיות קריטיות שדורשות טיפול מיידי
                </p>
              </div>
            </div>
          )}

          {stats.avgResolutionTime > 7 && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900">זמן פתרון ארוך</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  זמן הפתרון הממוצע הוא {stats.avgResolutionTime} ימים. שקלו להגדיל את המשאבים או לשפר את התהליך
                </p>
              </div>
            </div>
          )}

          {resolutionRate >= 80 && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900">ביצועים מצוינים</h4>
                <p className="text-sm text-green-700 mt-1">
                  אחוז הפתרון שלכם הוא {resolutionRate}% - עבודה מעולה!
                </p>
              </div>
            </div>
          )}

          {stats.openedThisMonth > stats.resolvedThisMonth * 1.5 && (
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900">עלייה במספר הבעיות</h4>
                <p className="text-sm text-orange-700 mt-1">
                  נפתחו {stats.openedThisMonth} בעיות חדשות החודש, אך נפתרו רק {stats.resolvedThisMonth}. ייתכן שנדרש תיעדוף מחדש
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
