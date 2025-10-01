'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Calendar, CheckSquare, AlertTriangle, FileText, Users, DollarSign, MessageSquare, Settings, Plus, Edit, BarChart, GripVertical } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/supabase/client'

const defaultAdminSections = [
  {
    id: 'events',
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
    id: 'tasks',
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
    id: 'committees',
    title: 'וועדות',
    description: 'ניהול וועדות תחומיות ותחומי אחריות',
    icon: Users,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    links: [
      { href: '/admin/committees/new', label: 'וועדה חדשה', icon: Plus },
      { href: '/admin/committees', label: 'רשימת וועדות', icon: Edit }
    ]
  },
  {
    id: 'issues',
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
    id: 'protocols',
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
    id: 'expenses',
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
    id: 'feedback',
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

function SortableCard({ section }: { section: typeof defaultAdminSections[0] }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = section.icon

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className={`inline-flex p-3 rounded-lg ${section.bgColor} mb-3`}>
              <Icon className={`h-6 w-6 ${section.color}`} />
            </div>
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded touch-none"
              onTouchStart={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
            </button>
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
    </div>
  )
}

function DashboardStats() {
  const [stats, setStats] = useState({
    eventsThisMonth: 0,
    draftEvents: 0,
    openTasks: 0,
    overdueTasks: 0,
    openIssues: 0,
    criticalIssues: 0,
    registrations: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
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

      setStats({
        eventsThisMonth: eventsData.count || 0,
        draftEvents: eventsData.data?.filter(e => e.status === 'draft').length || 0,
        openTasks: tasksData.count || 0,
        overdueTasks: tasksData.data?.filter(t => t.due_date && new Date(t.due_date) < now).length || 0,
        openIssues: issuesData.count || 0,
        criticalIssues: issuesData.data?.filter(i => i.priority === 'critical').length || 0,
        registrations: registrationsData.count || 0,
      })
      setIsLoading(false)
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-12 mx-auto mb-1" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Link href="/events" className="text-center hover:bg-accent p-3 rounded-lg transition-colors">
            <div className="text-2xl md:text-3xl font-bold">{stats.eventsThisMonth}</div>
            <div className="text-sm font-medium text-muted-foreground mt-1">אירועים החודש</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stats.draftEvents > 0 ? `${stats.draftEvents} ממתינים` : 'הכל מאושר'}
            </p>
          </Link>

          <Link href="/tasks" className="text-center hover:bg-accent p-3 rounded-lg transition-colors">
            <div className="text-2xl md:text-3xl font-bold">{stats.openTasks}</div>
            <div className="text-sm font-medium text-muted-foreground mt-1">משימות פתוחות</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stats.overdueTasks > 0 ? `${stats.overdueTasks} באיחור` : 'הכל בזמן'}
            </p>
          </Link>

          <Link href="/issues" className="text-center hover:bg-accent p-3 rounded-lg transition-colors">
            <div className="text-2xl md:text-3xl font-bold">{stats.openIssues}</div>
            <div className="text-sm font-medium text-muted-foreground mt-1">בעיות לטיפול</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stats.criticalIssues > 0 ? `${stats.criticalIssues} קריטיות` : 'אין קריטיות'}
            </p>
          </Link>

          <Link href="/events" className="text-center hover:bg-accent p-3 rounded-lg transition-colors">
            <div className="text-2xl md:text-3xl font-bold">{stats.registrations}</div>
            <div className="text-sm font-medium text-muted-foreground mt-1">נרשמים החודש</div>
            <p className="text-xs text-muted-foreground mt-0.5">לאירועים</p>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const [sections, setSections] = useState(defaultAdminSections)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load saved order from localStorage on mount
  useEffect(() => {
    const savedOrder = localStorage.getItem('admin-sections-order')
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder)
        const reordered = orderIds
          .map((id: string) => defaultAdminSections.find(s => s.id === id))
          .filter(Boolean)

        // Add any new sections that weren't in saved order
        const existingIds = new Set(orderIds)
        const newSections = defaultAdminSections.filter(s => !existingIds.has(s.id))

        setSections([...reordered, ...newSections])
      } catch (e) {
        console.error('Failed to load sections order:', e)
      }
    }
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const newOrder = arrayMove(items, oldIndex, newIndex)

        // Save to localStorage
        localStorage.setItem('admin-sections-order', JSON.stringify(newOrder.map(s => s.id)))

        return newOrder
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">לוח בקרה למנהל</h1>
          <p className="text-muted-foreground mt-2">
            ניהול מרכזי של כל פעילויות ועד ההורים
          </p>
        </div>
        <Button asChild size="sm" className="w-full sm:w-auto">
          <Link href="/admin/settings">
            <Settings className="h-4 w-4 ml-2" />
            הגדרות
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <DashboardStats />

      {/* Admin Sections - Draggable */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <SortableCard key={section.id} section={section} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>פעולות מהירות</CardTitle>
          <CardDescription>פעולות נפוצות לניהול יומיומי</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
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