'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Calendar, CheckSquare, AlertTriangle, FileText, Users, DollarSign, MessageSquare, Settings, Plus, Edit, BarChart, GripVertical, HelpCircle, Ticket, Tags, Phone, Bell, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  },
  {
    id: 'ideas',
    title: 'רעיונות',
    description: 'רעיונות לשיפור ותכונות חדשות',
    icon: Lightbulb,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    links: [
      { href: '/admin/ideas', label: 'צפייה ברעיונות', icon: Lightbulb },
      { href: '/ideas', label: 'שליחת רעיון', icon: Plus }
    ]
  },
  {
    id: 'tickets',
    title: 'כרטיסים',
    description: 'כרטיסים למשחקי ספורט, הצגות ואירועים',
    icon: Ticket,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    links: [
      { href: '/admin/tickets/new', label: 'כרטיס חדש', icon: Plus },
      { href: '/admin/tickets', label: 'ניהול כרטיסים', icon: Edit },
      { href: '/tickets', label: 'צפייה ציבורית', icon: Ticket }
    ]
  },
  {
    id: 'contacts',
    title: 'אנשי קשר',
    description: 'ניהול אנשי קשר חשובים בבית הספר',
    icon: Phone,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    links: [
      { href: '/admin/contacts', label: 'ניהול אנשי קשר', icon: Edit }
    ]
  },
  {
    id: 'urgent',
    title: 'הודעות דחופות',
    description: 'ניהול הודעות דחופות ותזכורות (כולל חולצה לבנה)',
    icon: Bell,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    links: [
      { href: '/admin/urgent', label: 'ניהול הודעות דחופות', icon: Edit }
    ]
  },
  {
    id: 'notifications',
    title: 'התראות Push',
    description: 'שלח התראות למנויים (כולל תזכורות חולצה לבנה)',
    icon: Bell,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    links: [
      { href: '/admin/notifications', label: 'שלח התראות', icon: Bell }
    ]
  },
  {
    id: 'settings',
    title: 'הגדרות',
    description: 'הגדרות מערכת וניהול תצורה',
    icon: Settings,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    links: [
      { href: '/admin/tags', label: 'ניהול תגיות', icon: Tags },
      { href: '/admin/settings', label: 'הגדרות כלליות', icon: Settings }
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
        // Events this month (future only, until end of month)
        supabase
          .from('events')
          .select('id, status', { count: 'exact' })
          .gte('start_datetime', now.toISOString())
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

      const publishedEvents = eventsData.data?.filter(e => e.status === 'published').length || 0
      const draftEvents = eventsData.data?.filter(e => e.status === 'draft').length || 0

      setStats({
        eventsThisMonth: publishedEvents + draftEvents, // Only count published + draft (exclude cancelled)
        draftEvents: draftEvents,
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
          <Link href={stats.draftEvents > 0 ? "/events?showDrafts=true" : "/events"} className="text-center hover:bg-accent p-3 rounded-lg transition-colors">
            <div className="text-2xl md:text-3xl font-bold">{stats.eventsThisMonth}</div>
            <div className="text-sm font-medium text-muted-foreground mt-1">אירועים החודש</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stats.draftEvents > 0 ? `${stats.draftEvents} בטיוטה` : 'הכל פורסם'}
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
        <div className="flex gap-2 w-full sm:w-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                <HelpCircle className="h-4 w-4 ml-2" />
                הוראות שימוש
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">📚 הוראות שימוש למנהלים</DialogTitle>
                <DialogDescription>
                  מדריך פשוט ואינטראקטיבי לניהול ועד ההורים
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* אירועים */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg">אירועים 📅</h3>
                  </div>
                  <ul className="space-y-1 text-sm mr-9">
                    <li>• <strong>צרו אירוע חדש</strong> - הוסיפו אירוע ללוח השנה (ישתלב אוטומטית עם Google Calendar)</li>
                    <li>• <strong>רשימת אירועים</strong> - ערכו או מחקו אירועים קיימים</li>
                    <li>• <strong>ניהול הרשמות</strong> - צפו במי נרשם לכל אירוע</li>
                    <li className="text-muted-foreground mt-2">💡 טיפ: השתמשו בסטטוס "טיוטה" לאירועים שעדיין לא מוכנים לפרסום</li>
                  </ul>
                </div>

                {/* משימות */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-50 p-2 rounded-lg">
                      <CheckSquare className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg">משימות ✅</h3>
                  </div>
                  <ul className="space-y-1 text-sm mr-9">
                    <li>• <strong>צרו משימה</strong> - הקצו משימה לחבר ועד עם תאריך יעד</li>
                    <li>• <strong>רשימת משימות</strong> - עקבו אחרי התקדמות כל המשימות</li>
                    <li>• <strong>הקצאת משימות</strong> - חלקו משימות בין חברי הועד</li>
                    <li className="text-muted-foreground mt-2">💡 טיפ: הלוח מציג כמה משימות באיחור - תנו עדיפות לאלו!</li>
                  </ul>
                </div>

                {/* וועדות */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-teal-50 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-teal-600" />
                    </div>
                    <h3 className="font-bold text-lg">וועדות 👥</h3>
                  </div>
                  <ul className="space-y-1 text-sm mr-9">
                    <li>• <strong>וועדה חדשה</strong> - צרו וועדה תחומית (תרבות, ספורט, וכו')</li>
                    <li>• <strong>רשימת וועדות</strong> - נהלו חברים ותחומי אחריות</li>
                    <li className="text-muted-foreground mt-2">💡 טיפ: כל וועדה יכולה להיות בעלת תקציב משלה</li>
                  </ul>
                </div>

                {/* בעיות */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-50 p-2 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-lg">בעיות 🚨</h3>
                  </div>
                  <ul className="space-y-1 text-sm mr-9">
                    <li>• <strong>דווחו על בעיה</strong> - תעדו בעיה שדורשת טיפול</li>
                    <li>• <strong>רשימת בעיות</strong> - עקבו אחרי סטטוס כל בעיה</li>
                    <li>• <strong>סטטיסטיקות</strong> - ראו כמה בעיות נפתרו בזמן</li>
                    <li className="text-muted-foreground mt-2">💡 טיפ: הלוח מציג כמה בעיות קריטיות - טפלו בהן ראשונות!</li>
                  </ul>
                </div>

                {/* פרוטוקולים */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-50 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-lg">פרוטוקולים 📝</h3>
                  </div>
                  <ul className="space-y-1 text-sm mr-9">
                    <li>• <strong>הוסיפו פרוטוקול</strong> - העלו פרוטוקול של ישיבה</li>
                    <li>• <strong>ארכיון</strong> - כל הפרוטוקולים ההיסטוריים</li>
                    <li>• <strong>העלאת מסמכים</strong> - העלו קבצי PDF או DOCX (המערכת תמיר אותם אוטומטית)</li>
                    <li className="text-muted-foreground mt-2">💡 טיפ: ניתן להעלות קובץ והמערכת תחלץ את הטקסט ותעצב אותו</li>
                  </ul>
                </div>

                {/* כספים */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-emerald-50 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-lg">כספים 💰</h3>
                  </div>
                  <ul className="space-y-1 text-sm mr-9">
                    <li>• <strong>הוסיפו הוצאה</strong> - תעדו כל הוצאה של הועד</li>
                    <li>• <strong>רשימת הוצאות</strong> - צפו בכל ההוצאות</li>
                    <li>• <strong>דוחות כספיים</strong> - קבלו דוח מסודר לשקיפות מלאה</li>
                    <li className="text-muted-foreground mt-2">💡 טיפ: שמרו תמיד קבלות וצרפו אותן להוצאות</li>
                  </ul>
                </div>

                {/* משוב */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-lg">משוב הורים 💬</h3>
                  </div>
                  <ul className="space-y-1 text-sm mr-9">
                    <li>• <strong>צפייה במשובים</strong> - קראו משוב אנונימי מהורים</li>
                    <li>• <strong>סטטיסטיקות</strong> - ראו מגמות במשובים</li>
                    <li>• <strong>ייצוא נתונים</strong> - הורידו את כל המשובים לקובץ</li>
                    <li className="text-muted-foreground mt-2">💡 טיפ: משוב הוא אנונימי לחלוטין - עודדו הורים לשתף</li>
                  </ul>
                </div>

                {/* רעיונות */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-50 p-2 rounded-lg">
                      <Lightbulb className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-lg">רעיונות והצעות 💡</h3>
                  </div>
                  <ul className="space-y-1 text-sm mr-9">
                    <li>• <strong>צפייה ברעיונות</strong> - ראו רעיונות והצעות שהורים שלחו</li>
                    <li>• <strong>ניהול סטטוס</strong> - סמנו רעיונות כ"נבדק", "מאושר", "יושם" או "נדחה"</li>
                    <li>• <strong>תגובות</strong> - שלחו תגובה למשלח הרעיון (אם לא אנונימי)</li>
                    <li>• <strong>הערות פנימיות</strong> - כתבו הערות שרק מנהלים יראו</li>
                    <li>• <strong>סינון</strong> - סננו לפי קטגוריה (שיפור, תכונה, תהליך) וסטטוס</li>
                    <li className="text-muted-foreground mt-2">💡 טיפ: רעיונות חדשים מסומנים במסגרת צהובה - תנו עדיפות לאלו!</li>
                  </ul>
                </div>

                {/* כרטיסים */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-50 p-2 rounded-lg">
                      <Ticket className="h-5 w-5 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-lg">כרטיסים 🎟️</h3>
                  </div>
                  <ul className="space-y-1 text-sm mr-9">
                    <li>• <strong>כרטיס חדש</strong> - צרו כרטיס למשחק ספורט, הצגה או אירוע</li>
                    <li>• <strong>ניהול מלאי</strong> - עקבו אחרי כמות הכרטיסים הזמינים</li>
                    <li>• <strong>מחירים</strong> - הגדירו מחיר לכרטיס או השאירו בחינם</li>
                    <li>• <strong>סטטוסים</strong> - פעיל, אזל, פג תוקף, טיוטה או הסתיים</li>
                    <li>• <strong>סיום אירוע</strong> - סמנו אירוע כ"הסתיים" כדי להסיר מהתצוגה הציבורית</li>
                    <li className="text-muted-foreground mt-2">💡 טיפ: השתמשו ב"מומלץ" כדי להציג כרטיסים חשובים בראש העמוד!</li>
                  </ul>
                </div>

                {/* אנשי קשר */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-cyan-50 p-2 rounded-lg">
                      <Phone className="h-5 w-5 text-cyan-600" />
                    </div>
                    <h3 className="font-bold text-lg">אנשי קשר 📞</h3>
                  </div>
                  <ul className="space-y-1 text-sm mr-9">
                    <li>• <strong>ניהול אנשי קשר</strong> - הוסיפו אנשי קשר חשובים בבית הספר</li>
                    <li>• <strong>דו-לשוני</strong> - תמיכה בעברית ורוסית לשם ותפקיד</li>
                    <li>• <strong>קטגוריות</strong> - אחות, הנהלה, מורה, ועד, שירות</li>
                    <li>• <strong>מיון</strong> - שנו את הסדר בעזרת החצים למעלה/למטה</li>
                    <li>• <strong>פרטים</strong> - שם, תפקיד, טלפון ואימייל</li>
                    <li className="text-muted-foreground mt-2">💡 טיפ: סמנו אנשי קשר כ"ציבורי" כדי שכולם יוכלו לראות אותם!</li>
                  </ul>
                </div>

                {/* הודעות דחופות */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-red-50 p-2 rounded-lg">
                      <Bell className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="font-bold text-lg">הודעות דחופות 🔔</h3>
                  </div>
                  <ul className="space-y-1 text-sm mr-9">
                    <li>• <strong>ניהול הודעות</strong> - צרו הודעות דחופות שיופיעו בדף הבית</li>
                    <li>• <strong>חולצה לבנה</strong> - כפתורים מהירים לתזכורת חולצה לבנה (1 יום, שבוע, חודש וכו')</li>
                    <li>• <strong>סוגי הודעות</strong> - דחוף, מידע, אזהרה, חולצה לבנה</li>
                    <li>• <strong>טווח תאריכים</strong> - הגדירו מתי ההודעה תופיע (תאריך התחלה וסיום)</li>
                    <li>• <strong>דו-לשוני</strong> - כותרת ותיאור בעברית ורוסית</li>
                    <li className="text-muted-foreground mt-2">💡 טיפ: הודעות פעילות מסומנות במסגרת ירוקה - הן יופיעו בדף הבית!</li>
                  </ul>
                </div>

                {/* פעמון התראות */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Bell className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg">פעמון התראות 🔔</h3>
                  </div>
                  <ul className="space-y-1 text-sm mr-9">
                    <li>• <strong>התראות אוטומטיות</strong> - הפעמון בראש העמוד מציג התראות חדשות</li>
                    <li>• <strong>משימות חדשות</strong> - קבלו התראה על משימות שנוצרו</li>
                    <li>• <strong>רעיונות חדשים</strong> - קבלו התראה כשהורים שולחים רעיון</li>
                    <li>• <strong>משוב חדש</strong> - קבלו התראה על משוב חדש מהורים</li>
                    <li>• <strong>עדכון כל 30 שניות</strong> - המערכת בודקת התראות חדשות אוטומטית</li>
                    <li className="text-muted-foreground mt-2">💡 טיפ: פתיחת הפעמון מסמנת את כל ההתראות כנצפו!</li>
                  </ul>
                </div>

                {/* הגדרות ותגיות */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <Settings className="h-5 w-5 text-gray-600" />
                    </div>
                    <h3 className="font-bold text-lg">הגדרות ⚙️</h3>
                  </div>
                  <ul className="space-y-1 text-sm mr-9">
                    <li>• <strong>ניהול תגיות</strong> - צרו תגיות לקטגוריזציה של משימות (תחזוקה, אירועים, תקציב וכו')</li>
                    <li>• <strong>התאמה אישית</strong> - שנו צבעים ואימוג'י לכל תגית</li>
                    <li>• <strong>סינון חכם</strong> - השתמשו בתגיות כדי למצוא משימות במהירות</li>
                    <li>• <strong>הגדרות כלליות</strong> - נהלו הרשאות והגדרות מערכת</li>
                    <li className="text-muted-foreground mt-2">💡 טיפ: תגיות עוזרות לארגן ולמצוא משימות בקלות - השתמשו בהן!</li>
                  </ul>
                </div>

                {/* טיפים כלליים */}
                <div className="bg-sky-50 p-4 rounded-lg border-2 border-sky-200">
                  <h3 className="font-bold text-lg mb-2">🌟 טיפים לשימוש יעיל</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✨ <strong>גררו כרטיסים</strong> - לחצו על <GripVertical className="inline h-4 w-4" /> וגררו כדי לסדר את הלוח לפי העדפתכם</li>
                    <li>✨ <strong>הסטטיסטיקות למעלה</strong> - לחצו עליהן כדי לעבור ישירות למקטע המתאים</li>
                    <li>✨ <strong>פעמון ההתראות</strong> - שימו לב לפעמון בראש העמוד - הוא יתריע על פעילות חדשה!</li>
                    <li>✨ <strong>שתפו קישורים</strong> - כל עמוד במערכת יכול להישלח בווטסאפ</li>
                    <li>✨ <strong>גרסת מובייל</strong> - כל המערכת מותאמת לסלולר - עובדת גם ללא אינטרנט!</li>
                  </ul>
                </div>

                {/* רעיונות והצעות */}
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <h3 className="font-bold text-lg mb-2">💡 רעיונות והצעות לשיפור</h3>
                  <p className="text-sm mb-2">יש לכם רעיון לשיפור המערכת? הצעה לתכונה חדשה? נשמח לשמוע!</p>
                  <Button asChild variant="default" className="w-full bg-green-600 hover:bg-green-700">
                    <a
                      href="https://wa.me/972544345287?text=שלום, יש לי רעיון לשיפור המערכת:"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageSquare className="h-4 w-4 ml-2" />
                      שלחו הצעה בווטסאפ
                    </a>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button asChild size="sm" className="flex-1 sm:flex-initial">
            <Link href="/admin/settings">
              <Settings className="h-4 w-4 ml-2" />
              הגדרות
            </Link>
          </Button>
        </div>
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