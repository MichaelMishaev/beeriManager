import Link from 'next/link'
import { Suspense } from 'react'
import { Calendar, CheckSquare, AlertTriangle, FileText, Users, DollarSign, MessageSquare, Settings, Plus, Edit, BarChart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

const adminSections = [
  {
    title: 'אירועים',
    description: 'ניהול אירועים, הרשמות ולוח שנה',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    links: [
      { href: '/admin/events/new', label: 'צור אירוע חדש', icon: Plus },
      { href: '/events', label: 'רשימת אירועים', icon: Edit },
      { href: '/admin/events/registrations', label: 'ניהול הרשמות', icon: Users }
    ]
  },
  {
    title: 'משימות',
    description: 'הקצאת משימות ומעקב ביצוע',
    icon: CheckSquare,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    links: [
      { href: '/admin/tasks/new', label: 'צור משימה חדשה', icon: Plus },
      { href: '/tasks', label: 'רשימת משימות', icon: Edit },
      { href: '/admin/tasks/assign', label: 'הקצאת משימות', icon: Users }
    ]
  },
  {
    title: 'בעיות',
    description: 'ניהול בעיות ופניות',
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    links: [
      { href: '/admin/issues/new', label: 'דווח על בעיה', icon: Plus },
      { href: '/issues', label: 'רשימת בעיות', icon: Edit },
      { href: '/admin/issues/stats', label: 'סטטיסטיקות', icon: BarChart }
    ]
  },
  {
    title: 'פרוטוקולים',
    description: 'ניהול מסמכים ופרוטוקולים',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    links: [
      { href: '/admin/protocols/new', label: 'הוסף פרוטוקול', icon: Plus },
      { href: '/protocols', label: 'ארכיון פרוטוקולים', icon: Edit },
      { href: '/admin/protocols/upload', label: 'העלאת מסמכים', icon: FileText }
    ]
  },
  {
    title: 'כספים',
    description: 'ניהול הוצאות ותקציבים',
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    links: [
      { href: '/admin/expenses/new', label: 'הוסף הוצאה', icon: Plus },
      { href: '/admin/expenses', label: 'רשימת הוצאות', icon: Edit },
      { href: '/admin/expenses/reports', label: 'דוחות כספיים', icon: BarChart }
    ]
  },
  {
    title: 'משוב',
    description: 'משוב אנונימי מהורים',
    icon: MessageSquare,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    links: [
      { href: '/admin/feedback', label: 'צפייה במשובים', icon: MessageSquare },
      { href: '/admin/feedback/stats', label: 'סטטיסטיקות', icon: BarChart },
      { href: '/admin/feedback/export', label: 'ייצוא נתונים', icon: FileText }
    ]
  }
]

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function DashboardStats() {
  const supabase = createClient()

  // Get current month date range
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Fetch all stats in parallel
  const [eventsData, tasksData, issuesData, registrationsData] = await Promise.all([
    // Events this month
    supabase
      .from('events')
      .select('id, status', { count: 'exact' })
      .gte('start_datetime', firstDay.toISOString())
      .lte('start_datetime', lastDay.toISOString()),

    // Open tasks
    supabase
      .from('tasks')
      .select('id, status, due_date', { count: 'exact' })
      .in('status', ['pending', 'in_progress']),

    // Open issues
    supabase
      .from('issues')
      .select('id, priority', { count: 'exact' })
      .neq('status', 'closed'),

    // Event registrations this month
    supabase
      .from('event_registrations')
      .select('id', { count: 'exact' })
      .gte('created_at', firstDay.toISOString())
  ])

  const eventsThisMonth = eventsData.count || 0
  const draftEvents = eventsData.data?.filter(e => e.status === 'draft').length || 0

  const openTasks = tasksData.count || 0
  const overdueTasks = tasksData.data?.filter(t =>
    t.due_date && new Date(t.due_date) < now
  ).length || 0

  const openIssues = issuesData.count || 0
  const criticalIssues = issuesData.data?.filter(i => i.priority === 'critical').length || 0

  const registrations = registrationsData.count || 0

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">אירועים החודש</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{eventsThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            {draftEvents > 0 ? `${draftEvents} ממתינים לאישור` : 'הכל מאושר'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">משימות פתוחות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{openTasks}</div>
          <p className="text-xs text-muted-foreground">
            {overdueTasks > 0 ? `${overdueTasks} באיחור` : 'הכל בזמן'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">בעיות לטיפול</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{openIssues}</div>
          <p className="text-xs text-muted-foreground">
            {criticalIssues > 0 ? `${criticalIssues} קריטיות` : 'אין קריטיות'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">נרשמים החודש</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{registrations}</div>
          <p className="text-xs text-muted-foreground">לאירועים</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">לוח בקרה למנהל</h1>
          <p className="text-muted-foreground mt-2">
            ניהול מרכזי של כל פעילויות ועד ההורים
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/settings">
            <Settings className="h-4 w-4 ml-2" />
            הגדרות
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Admin Sections */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => {
          const Icon = section.icon
          return (
            <Card key={section.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`inline-flex p-3 rounded-lg ${section.bgColor} mb-3`}>
                  <Icon className={`h-6 w-6 ${section.color}`} />
                </div>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {section.links.map((link) => {
                  const LinkIcon = link.icon
                  return (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href={link.href}>
                        <LinkIcon className="h-4 w-4 ml-2" />
                        {link.label}
                      </Link>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>פעולות מהירות</CardTitle>
          <CardDescription>פעולות נפוצות לניהול יומיומי</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/admin/events/new">
                <Calendar className="h-4 w-4 ml-2" />
                אירוע חדש
              </Link>
            </Button>
            <Button variant="outline" asChild size="sm">
              <Link href="/admin/tasks/new">
                <CheckSquare className="h-4 w-4 ml-2" />
                משימה חדשה
              </Link>
            </Button>
            <Button variant="outline" asChild size="sm">
              <Link href="/admin/protocols/new">
                <FileText className="h-4 w-4 ml-2" />
                פרוטוקול חדש
              </Link>
            </Button>
            <Button variant="outline" asChild size="sm">
              <Link href="/admin/broadcast">
                <MessageSquare className="h-4 w-4 ml-2" />
                שליחת הודעה
              </Link>
            </Button>
            <Button variant="outline" asChild size="sm">
              <Link href="/admin/reports">
                <BarChart className="h-4 w-4 ml-2" />
                דוחות
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}