'use client'

import { Suspense, useEffect, useState } from 'react'
import dynamicImport from 'next/dynamic'
import { Plus, Download, CheckSquare, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

const TasksPageClient = dynamicImport(
  () => import('@/components/features/tasks/TasksPageClient').then(mod => ({ default: mod.TasksPageClient })),
  { ssr: false }
)

interface TaskStats {
  pending: number
  inProgress: number
  completed: number
  overdue: number
  total: number
}

function TasksListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

function TaskStatsCards({ stats }: { stats: TaskStats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            סה"כ משימות
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            ממתינות
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            בביצוע
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            הושלמו
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardDescription className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            באיחור
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [stats, setStats] = useState<TaskStats>({
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    total: 0
  })
  const [tags, setTags] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      // Fetch tasks with tags
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          task_tags (
            tag_id,
            tags (
              id,
              name,
              name_he,
              emoji,
              color,
              is_system
            )
          )
        `)
        .order('due_date', { ascending: true })

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError)
      } else {
        // Transform the nested tags structure into a flat array
        const transformedTasks = tasksData?.map(task => ({
          ...task,
          tags: task.task_tags?.map((tt: any) => tt.tags).filter(Boolean) || []
        })) || []

        setTasks(transformedTasks)

        // Calculate stats
        const now = new Date()
        const pending = transformedTasks.filter(t => t.status === 'pending').length
        const inProgress = transformedTasks.filter(t => t.status === 'in_progress').length
        const completed = transformedTasks.filter(t => t.status === 'completed').length
        const overdue = transformedTasks.filter(t =>
          t.status !== 'completed' && t.due_date && new Date(t.due_date) < now
        ).length

        setStats({
          pending,
          inProgress,
          completed,
          overdue,
          total: transformedTasks.length
        })
      }

      // Fetch all available tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name_he', { ascending: true })

      if (tagsError) {
        console.error('Error fetching tags:', tagsError)
      } else {
        setTags(tagsData || [])
      }

      setIsLoading(false)
    }

    fetchData()
  }, [])

  const handleExportTasks = () => {
    // Export tasks to CSV
    const csv = [
      ['כותרת', 'תיאור', 'סטטוס', 'אחראי', 'תאריך יעד', 'נוצר ב'].join(','),
      ...tasks.map(task => [
        task.title,
        task.description || '',
        task.status,
        task.assigned_to || '',
        task.due_date || '',
        new Date(task.created_at).toLocaleDateString('he-IL')
      ].join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <TasksListSkeleton />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">ניהול משימות</h1>
          <p className="text-muted-foreground mt-2">
            מעקב וניהול כל המשימות של ועד ההורים
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExportTasks}>
            <Download className="h-4 w-4 ml-2" />
            ייצוא לאקסל
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/tasks/new">
              <Plus className="h-4 w-4 ml-2" />
              משימה חדשה
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <TaskStatsCards stats={stats} />

      {/* Tasks List */}
      <Suspense fallback={<TasksListSkeleton />}>
        <TasksPageClient
          initialTasks={tasks}
          initialStats={stats}
          availableTags={tags}
        />
      </Suspense>
    </div>
  )
}
