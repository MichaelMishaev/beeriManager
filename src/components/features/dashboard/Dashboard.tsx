'use client'

import React from 'react'
import { Calendar, CheckSquare, FileText, AlertCircle, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EventCard } from '@/components/features/events/EventCard'
import { TaskCard } from '@/components/features/tasks/TaskCard'
import { CollapsibleCalendarWidget } from '@/components/features/holidays/CollapsibleCalendarWidget'
import { WhiteShirtBanner } from '@/components/features/homepage/WhiteShirtBanner'
import type { DashboardStats, Event, Task, CalendarEvent } from '@/types'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface DashboardProps {
  stats: DashboardStats
  upcomingEvents: Event[]
  pendingTasks: Task[]
  calendarEvents: CalendarEvent[]
}

function StatsCard({
  title,
  value,
  icon: Icon,
  href,
  trend,
  trendLabel,
  color = 'text-primary'
}: {
  title: string
  value: number
  icon: React.ElementType
  href: string
  trend?: number
  trendLabel?: string
  color?: string
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold mt-2">{value.toLocaleString()}</p>
              {trend !== undefined && trendLabel && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${
                  trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-muted-foreground'
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  {trend > 0 && '+'}
                  {trend} {trendLabel}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-full bg-muted/50 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}


function QuickActions() {
  const t = useTranslations('dashboard')

  const actions = [
    {
      title: t('newEvent'),
      description: t('createEvent'),
      href: '/admin/events/new',
      icon: Calendar,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: t('newTask'),
      description: t('addTask'),
      href: '/admin/tasks/new',
      icon: CheckSquare,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: t('reportIssue'),
      description: t('reportProblem'),
      href: '/issues/new',
      icon: AlertCircle,
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: t('anonymousFeedback', { ns: 'homepage' }),
      description: t('sendAnonymousFeedback'),
      href: '/feedback',
      icon: Users,
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t('quickActions')}
        </CardTitle>
        <CardDescription>
          {t('quickAccessActions')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button key={action.title} asChild variant="outline" size="sm" className="h-auto p-4 flex-col gap-2">
                <Link href={action.href}>
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentActivity() {
  const t = useTranslations('dashboard')

  // Mock data - replace with real activity feed
  const activities = [
    {
      id: '1',
      type: 'event_created',
      title: t('eventAdded'),
      description: '"ישיבת ועד חודשית" - 15 באוקטובר 2024',
      time: '2 hours ago',
      icon: Calendar,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      id: '2',
      type: 'task_completed',
      title: t('taskCompleted'),
      description: '"הזמנת כיבוד לאירוע הפתיחה" - על ידי שרה כהן',
      time: '4 hours ago',
      icon: CheckSquare,
      color: 'text-green-600 bg-green-50'
    },
    {
      id: '3',
      type: 'protocol_added',
      title: t('newProtocol'),
      description: 'פרוטוקול ישיבה מספר 3 - ספטמבר 2024',
      time: '1 day ago',
      icon: FileText,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      id: '4',
      type: 'issue_resolved',
      title: t('issueResolved'),
      description: 'בעיית התאורה במסדרון תוקנה',
      time: '2 days ago',
      icon: AlertCircle,
      color: 'text-orange-600 bg-orange-50'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recentActivity')}</CardTitle>
        <CardDescription>
          {t('activityUpdates')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`p-2 rounded-full ${activity.color} flex-shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/activity">
              {t('viewAllActivity')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard({ stats, upcomingEvents, pendingTasks, calendarEvents }: DashboardProps) {
  const t = useTranslations('dashboard')

  return (
    <>
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          {t('welcome')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* White Shirt Friday Reminder - Shows Thu 9:00 AM - Fri 9:00 AM */}
      <WhiteShirtBanner />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('upcomingEvents')}
          value={stats.upcomingEvents}
          icon={Calendar}
          href="/events"
          color="text-blue-600"
        />
        <StatsCard
          title={t('pendingTasks')}
          value={stats.pendingTasks}
          icon={CheckSquare}
          href="/tasks"
          color="text-green-600"
        />
        <StatsCard
          title={t('activeIssues')}
          value={stats.activeIssues}
          icon={AlertCircle}
          href="/issues"
          color="text-orange-600"
        />
        <StatsCard
          title={t('protocols')}
          value={stats.recentProtocols}
          icon={FileText}
          href="/protocols"
          color="text-purple-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar & Holidays Column */}
        <div className="lg:col-span-1 order-1 lg:order-1">
          {/* Collapsible Calendar Widget */}
          <CollapsibleCalendarWidget
            calendarEvents={calendarEvents}
            onEventClick={(event) => {
              // Only navigate for non-holiday events
              // Holiday events are handled by CollapsibleCalendarWidget
              if (event.type !== 'holiday') {
                window.location.href = `/events/${event.id}`
              }
            }}
            defaultExpanded={false}
          />
        </div>

        {/* Content Columns */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-2">
          {/* Quick Actions */}
          <QuickActions />

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('upcomingEvents')}
                </CardTitle>
                <CardDescription>
                  {t('upcomingEventsInCalendar')}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/events">
                  {t('viewAllEvents')}
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    variant="compact"
                    showActions={false}
                  />
                ))}
                {upcomingEvents.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('noUpcomingEvents')}</p>
                    <Button variant="outline" className="mt-4" asChild size="sm">
                      <Link href="/admin/events/new">
                        {t('createNewEvent')}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  {t('pendingTasks')}
                </CardTitle>
                <CardDescription>
                  {t('tasksRequiringAttention')}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/tasks">
                  {t('viewAllTasks')}
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTasks.slice(0, 3).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    variant="compact"
                    showActions={false}
                  />
                ))}
                {pendingTasks.length === 0 && (
                  <div className="text-center py-8">
                    <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('noPendingTasks')}</p>
                    <Button variant="outline" className="mt-4" asChild size="sm">
                      <Link href="/admin/tasks/new">
                        {t('addNewTask')}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </div>
    </div>
    </>
  )
}