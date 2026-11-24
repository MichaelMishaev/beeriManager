'use client'

import { Suspense, useEffect, useState } from 'react'
import dynamicImport from 'next/dynamic'
import { Plus, Download, CheckSquare, Clock, AlertCircle, CheckCircle2, AlarmClock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminGroup, AdminPageHeader, AdminRow } from '@/components/features/admin'
import type { Tag, Task } from '@/types'

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

interface TaskTagJoin {
  tag_id: string
  tags: Tag | null
}

type TaskRow = Task & { task_tags?: TaskTagJoin[] | null }

function TasksListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-2xl bg-white" />
      ))}
    </div>
  )
}

function TaskStatsGroup({ stats }: { stats: TaskStats }) {
  const t = useTranslations('admin.tasks.list.stats')

  const items = [
    { key: 'total', value: stats.total, icon: CheckSquare, tone: 'bg-[#87CEEB]/30 text-[#003153]' },
    { key: 'pending', value: stats.pending, icon: Clock, tone: 'bg-[#FFBA00]/25 text-[#8a5a00]' },
    { key: 'inProgress', value: stats.inProgress, icon: AlertCircle, tone: 'bg-[#0D98BA]/15 text-[#0D98BA]' },
    { key: 'completed', value: stats.completed, icon: CheckCircle2, tone: 'bg-[#d1fae5] text-[#065f46]' },
    { key: 'overdue', value: stats.overdue, icon: AlarmClock, tone: 'bg-[#fee2e2] text-[#991b1b]' },
  ] as const

  return (
    <AdminGroup title={t('title')}>
      {items.map((item) => (
        <AdminRow
          key={item.key}
          icon={item.icon}
          iconClassName={item.tone}
          title={t(item.key)}
          testId={`admin-tasks-stat-${item.key}`}
          trailing={<span className="text-lg font-bold text-[#003153]">{item.value}</span>}
        />
      ))}
    </AdminGroup>
  )
}

export default function AdminTasksPage() {
  const t = useTranslations('admin.tasks.list')
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats>({
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    total: 0
  })
  const [tags, setTags] = useState<Tag[]>([])
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
        const transformedTasks: Task[] = ((tasksData as TaskRow[] | null) ?? []).map(task => ({
          ...task,
          tags: (task.task_tags?.map(tt => tt.tags).filter((tag): tag is Tag => Boolean(tag))) || []
        }))

        setTasks(transformedTasks)

        // Calculate stats
        const now = new Date()
        const pending = transformedTasks.filter(task => task.status === 'pending').length
        const inProgress = transformedTasks.filter(task => task.status === 'in_progress').length
        const completed = transformedTasks.filter(task => task.status === 'completed').length
        const overdue = transformedTasks.filter(task =>
          task.status !== 'completed' && task.due_date && new Date(task.due_date) < now
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
        setTags((tagsData as Tag[] | null) || [])
      }

      setIsLoading(false)
    }

    fetchData()
  }, [])

  const handleExportTasks = () => {
    // Export tasks to CSV
    const csv = [
      [
        t('csv.title'),
        t('csv.description'),
        t('csv.status'),
        t('csv.owner'),
        t('csv.dueDate'),
        t('csv.createdAt')
      ].join(','),
      ...tasks.map(task => [
        task.title,
        task.description || '',
        task.status,
        (task as Task & { assigned_to?: string }).assigned_to || '',
        task.due_date || '',
        new Date(task.created_at).toLocaleDateString('he-IL')
      ].join(','))
    ].join('\n')

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const newTaskAction = (
    <Link
      href="/admin/tasks/new"
      aria-label={t('newTask')}
      data-testid="admin-tasks-new"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003153] text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#003153]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA]"
    >
      <Plus className="h-5 w-5" aria-hidden="true" />
    </Link>
  )

  if (isLoading) {
    return (
      <div className="space-y-5">
        <AdminPageHeader title={t('title')} backHref="/admin/more" action={newTaskAction} />
        <div className="h-64 animate-pulse rounded-2xl bg-white" />
        <TasksListSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        backHref="/admin/more"
        action={newTaskAction}
      />

      <AdminGroup>
        <AdminRow
          icon={Download}
          iconClassName="bg-[#87CEEB]/30 text-[#003153]"
          title={t('export')}
          onClick={handleExportTasks}
          testId="admin-tasks-export"
        />
      </AdminGroup>

      <TaskStatsGroup stats={stats} />

      {/* Tasks List (shared with the public /tasks route, left as is) */}
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
