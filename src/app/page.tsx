import { Suspense } from 'react'
import { Calendar, CheckSquare, FileText, AlertCircle, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

async function getStats() {
  // This will be replaced with actual Supabase queries
  return {
    upcomingEvents: 5,
    pendingTasks: 12,
    activeIssues: 3,
    recentProtocols: 8
  }
}

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
      </CardContent>
    </Card>
  )
}

async function StatsCards() {
  const stats = await getStats()

  const cards = [
    {
      title: 'אירועים קרובים',
      value: stats.upcomingEvents,
      icon: Calendar,
      href: '/events',
      color: 'text-primary'
    },
    {
      title: 'משימות פתוחות',
      value: stats.pendingTasks,
      icon: CheckSquare,
      href: '/tasks',
      color: 'text-secondary'
    },
    {
      title: 'בעיות פעילות',
      value: stats.activeIssues,
      icon: AlertCircle,
      href: '/issues',
      color: 'text-destructive'
    },
    {
      title: 'פרוטוקולים',
      value: stats.recentProtocols,
      icon: FileText,
      href: '/protocols',
      color: 'text-muted'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Link key={card.title} href={card.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          ברוכים הבאים לועד ההורים
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          מערכת ניהול מקיפה לפעילות ועד ההורים - אירועים, משימות, הוצאות ועוד
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      }>
        <StatsCards />
      </Suspense>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            פעולות מהירות
          </CardTitle>
          <CardDescription>
            גישה מהירה לפעולות נפוצות במערכת
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/events" className="flex flex-col items-center gap-2">
                <Calendar className="h-6 w-6" />
                <span>צפייה בלוח השנה</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/tasks" className="flex flex-col items-center gap-2">
                <CheckSquare className="h-6 w-6" />
                <span>רשימת משימות</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/feedback" className="flex flex-col items-center gap-2">
                <AlertCircle className="h-6 w-6" />
                <span>משוב אנונימי</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Updates */}
      <Card>
        <CardHeader>
          <CardTitle>עדכונים אחרונים</CardTitle>
          <CardDescription>
            פעילות אחרונה במערכת
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">אירוע חדש נוסף</p>
                <p className="text-xs text-muted-foreground">
                  "ישיבת ועד חודשית" - 15/10/2024
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <CheckSquare className="h-5 w-5 mt-0.5 text-secondary" />
              <div className="flex-1">
                <p className="text-sm font-medium">משימה הושלמה</p>
                <p className="text-xs text-muted-foreground">
                  "הזמנת כיבוד לאירוע הפתיחה" - על ידי שרה כהן
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <FileText className="h-5 w-5 mt-0.5 text-muted" />
              <div className="flex-1">
                <p className="text-sm font-medium">פרוטוקול חדש</p>
                <p className="text-xs text-muted-foreground">
                  פרוטוקול ישיבה מספר 3 - ספטמבר 2024
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}