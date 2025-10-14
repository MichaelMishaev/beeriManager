import { Suspense } from 'react'
import { CheckSquare, Plus, Filter, UserCheck, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TaskCard } from '@/components/features/tasks/TaskCard'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

// Fetch tasks from database
async function getTasks() {
  const supabase = createClient()

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true })
    .limit(50)

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  return tasks || []
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
  const tasks = await getTasks()
  const stats = await getTaskStats()

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">אין משימות</h3>
        <p className="text-muted-foreground mb-6">
          עדיין לא נוספו משימות למערכת
        </p>
        <Button asChild>
          <Link href="/admin/tasks/new">
            <Plus className="h-4 w-4 ml-2" />
            צור משימה חדשה
          </Link>
        </Button>
      </div>
    )
  }

  // Group tasks by status
  const tasksByStatus = {
    urgent: tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed'),
    pending: tasks.filter(t => t.status === 'pending'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed').slice(0, 5) // Only show 5 recent completed
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ממתינות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">בביצוע</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">הושלמו</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">באיחור</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Tasks */}
      {tasksByStatus.urgent.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              משימות דחופות
            </CardTitle>
            <CardDescription>משימות שדורשות טיפול מיידי</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksByStatus.urgent.map((task) => (
              <TaskCard key={task.id} task={task} variant="compact" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending Tasks */}
      {tasksByStatus.pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              משימות ממתינות
            </CardTitle>
            <CardDescription>משימות שטרם החלו</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksByStatus.pending.map((task) => (
              <TaskCard key={task.id} task={task} variant="compact" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* In Progress Tasks */}
      {tasksByStatus.in_progress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              משימות בביצוע
            </CardTitle>
            <CardDescription>משימות שנמצאות כעת בטיפול</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksByStatus.in_progress.map((task) => (
              <TaskCard key={task.id} task={task} variant="compact" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Tasks */}
      {tasksByStatus.completed.length > 0 && (
        <Card className="opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckSquare className="h-5 w-5" />
              משימות שהושלמו לאחרונה
            </CardTitle>
            <CardDescription>5 המשימות האחרונות שהושלמו</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksByStatus.completed.map((task) => (
              <TaskCard key={task.id} task={task} variant="minimal" />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function TasksPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">משימות</h1>
          <p className="text-muted-foreground mt-2">
            ניהול משימות ומעקב אחר ביצוע
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 ml-2" />
            סנן
          </Button>
          <Button asChild>
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