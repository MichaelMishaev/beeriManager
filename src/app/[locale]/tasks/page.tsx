import { Suspense } from 'react'
import dynamicImport from 'next/dynamic'
import { Plus, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const TasksPageClient = dynamicImport(
  () => import('@/components/features/tasks/TasksPageClient').then(mod => ({ default: mod.TasksPageClient })),
  { ssr: false }
)

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Fetch tasks from database with tags
async function getTasks() {
  const supabase = createClient()

  const { data: tasks, error } = await supabase
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
    .limit(50)

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  // Transform the nested tags structure into a flat array
  const transformedTasks = tasks?.map(task => ({
    ...task,
    tags: task.task_tags?.map((tt: any) => tt.tags).filter(Boolean) || []
  })) || []

  return transformedTasks
}

// Fetch all available tags for filtering
async function getAllTags() {
  const supabase = createClient()

  const { data: tags, error } = await supabase
    .from('tags')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('name_he', { ascending: true })

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  return tags || []
}

// Get task statistics
async function getTaskStats() {
  const supabase = createClient()

  const [pending, inProgress, completed, overdue] = await Promise.all([
    supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'overdue')
  ])

  return {
    pending: pending.count || 0,
    inProgress: inProgress.count || 0,
    completed: completed.count || 0,
    overdue: overdue.count || 0
  }
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

async function TasksList() {
  const [tasks, stats, tags] = await Promise.all([
    getTasks(),
    getTaskStats(),
    getAllTags()
  ])

  return <TasksPageClient initialTasks={tasks} initialStats={stats} availableTags={tags} />
}

export default function TasksPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">משימות</h1>
          <p className="text-muted-foreground mt-2">
            ניהול משימות ומעקב אחר ביצוע
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
            <Filter className="h-4 w-4 ml-2" />
            סנן
          </Button>
          <Button asChild size="sm" className="flex-1 sm:flex-initial">
            <Link href="/admin/tasks/new">
              <Plus className="h-4 w-4 ml-2" />
              משימה חדשה
            </Link>
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <Suspense fallback={<TasksListSkeleton />}>
        <TasksList />
      </Suspense>
    </div>
  )
}