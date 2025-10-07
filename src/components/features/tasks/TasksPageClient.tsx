'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckSquare, Plus, X, AlertCircle, Clock, UserCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TaskCard } from '@/components/features/tasks/TaskCard'
import Link from 'next/link'
import type { Task } from '@/types'

interface TasksPageClientProps {
  initialTasks: Task[]
  initialStats: {
    pending: number
    inProgress: number
    completed: number
    overdue: number
  }
}

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'

export function TasksPageClient({ initialTasks, initialStats }: TasksPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tasks] = useState<Task[]>(initialTasks)
  const [stats] = useState(initialStats)

  const statusFilter = searchParams.get('status') as TaskStatus | null

  // Filter tasks based on URL param
  const filteredTasks = useMemo(() => {
    if (!statusFilter) return tasks

    if (statusFilter === 'overdue') {
      return tasks.filter(t => {
        if (t.status === 'completed' || !t.due_date) return false
        const dueDate = new Date(t.due_date)
        return dueDate < new Date()
      })
    }

    return tasks.filter(t => t.status === statusFilter)
  }, [tasks, statusFilter])

  // Group filtered tasks
  const tasksByStatus = useMemo(() => ({
    urgent: filteredTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed'),
    pending: filteredTasks.filter(t => t.status === 'pending'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    completed: filteredTasks.filter(t => t.status === 'completed').slice(0, 5)
  }), [filteredTasks])

  const handleFilterClick = (status: TaskStatus) => {
    router.push(`/tasks?status=${status}`, { scroll: false })
  }

  const handleClearFilter = () => {
    router.push('/tasks', { scroll: false })
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">אין משימות</h3>
        <p className="text-muted-foreground mb-6">
          עדיין לא נוספו משימות למערכת
        </p>
        <Button asChild size="sm">
          <Link href="/admin/tasks/new">
            <Plus className="h-4 w-4 ml-2" />
            צור משימה חדשה
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics - Single Card with Click to Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <button
              onClick={() => handleFilterClick('pending')}
              className={`p-3 rounded-lg transition-all hover:bg-blue-50 ${
                statusFilter === 'pending' ? 'bg-blue-100 ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="text-sm font-medium text-muted-foreground mb-1">ממתינות</div>
              <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
            </button>

            <button
              onClick={() => handleFilterClick('in_progress')}
              className={`p-3 rounded-lg transition-all hover:bg-yellow-50 ${
                statusFilter === 'in_progress' ? 'bg-yellow-100 ring-2 ring-yellow-500' : ''
              }`}
            >
              <div className="text-sm font-medium text-muted-foreground mb-1">בביצוע</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            </button>

            <button
              onClick={() => handleFilterClick('completed')}
              className={`p-3 rounded-lg transition-all hover:bg-green-50 ${
                statusFilter === 'completed' ? 'bg-green-100 ring-2 ring-green-500' : ''
              }`}
            >
              <div className="text-sm font-medium text-muted-foreground mb-1">הושלמו</div>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </button>

            <button
              onClick={() => handleFilterClick('overdue')}
              className={`p-3 rounded-lg transition-all hover:bg-red-50 ${
                statusFilter === 'overdue' ? 'bg-red-100 ring-2 ring-red-500' : ''
              }`}
            >
              <div className="text-sm font-medium text-muted-foreground mb-1">באיחור</div>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Active Filter Badge with Clear Button */}
      {statusFilter && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-base py-2 px-4">
            מסנן פעיל: {
              statusFilter === 'pending' ? 'ממתינות' :
              statusFilter === 'in_progress' ? 'בביצוע' :
              statusFilter === 'completed' ? 'הושלמו' :
              'באיחור'
            }
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilter}
            className="h-auto py-2"
          >
            <X className="h-4 w-4 ml-1" />
            נקה סינון
          </Button>
          <span className="text-sm text-muted-foreground">
            ({filteredTasks.length} משימות)
          </span>
        </div>
      )}

      {/* No Results */}
      {filteredTasks.length === 0 && statusFilter && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">לא נמצאו משימות</h3>
            <p className="text-muted-foreground mb-4">
              אין משימות בסטטוס זה
            </p>
            <Button variant="outline" size="sm" onClick={handleClearFilter}>
              הצג את כל המשימות
            </Button>
          </CardContent>
        </Card>
      )}

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
