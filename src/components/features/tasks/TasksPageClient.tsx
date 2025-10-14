'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckSquare, Plus, X, AlertCircle, Clock, UserCheck, Tags as TagsIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TaskCard } from '@/components/features/tasks/TaskCard'
import Link from 'next/link'
import type { Task, Tag } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface TasksPageClientProps {
  initialTasks: Task[]
  initialStats: {
    pending: number
    inProgress: number
    completed: number
    overdue: number
  }
  availableTags: Tag[]
}

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'

export function TasksPageClient({ initialTasks, initialStats, availableTags }: TasksPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [stats] = useState(initialStats)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  const handleTaskTagsUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
  }

  const statusFilter = (searchParams?.get('status') as TaskStatus) || null

  // Filter tasks based on status and tags
  const filteredTasks = useMemo(() => {
    let filtered = tasks

    // Apply status filter
    if (statusFilter) {
      if (statusFilter === 'overdue') {
        filtered = filtered.filter(t => {
          if (t.status === 'completed' || !t.due_date) return false
          const dueDate = new Date(t.due_date)
          return dueDate < new Date()
        })
      } else {
        filtered = filtered.filter(t => t.status === statusFilter)
      }
    }

    // Apply tag filter
    if (selectedTagIds.length > 0) {
      filtered = filtered.filter(task => {
        // Task must have at least one of the selected tags
        return task.tags?.some(tag => selectedTagIds.includes(tag.id))
      })
    }

    return filtered
  }, [tasks, statusFilter, selectedTagIds])

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
    setSelectedTagIds([])
  }

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId)
      } else {
        return [...prev, tagId]
      }
    })
  }

  const handleClearTags = () => {
    setSelectedTagIds([])
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

      {/* Tag Filter Dropdown */}
      <div className="flex items-center gap-2 flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <TagsIcon className="h-4 w-4 ml-2" />
              סינון לפי תגיות
              {selectedTagIds.length > 0 && (
                <Badge variant="secondary" className="mr-2">
                  {selectedTagIds.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>בחר תגיות לסינון</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag.id}
                checked={selectedTagIds.includes(tag.id)}
                onCheckedChange={() => handleToggleTag(tag.id)}
              >
                <div className="flex items-center gap-2">
                  {tag.emoji && <span>{tag.emoji}</span>}
                  <span>{tag.name_he}</span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
            {selectedTagIds.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <button
                  onClick={handleClearTags}
                  className="w-full text-sm text-center py-2 text-muted-foreground hover:text-foreground"
                >
                  נקה סינון תגיות
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Active Tag Filters */}
        {selectedTagIds.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {selectedTagIds.map(tagId => {
              const tag = availableTags.find(t => t.id === tagId)
              if (!tag) return null
              return (
                <Badge
                  key={tag.id}
                  variant="outline"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    borderColor: tag.color,
                    color: tag.color
                  }}
                  className="cursor-pointer hover:opacity-75"
                  onClick={() => handleToggleTag(tag.id)}
                >
                  {tag.emoji && <span className="ml-1">{tag.emoji}</span>}
                  {tag.name_he}
                  <X className="h-3 w-3 mr-1" />
                </Badge>
              )
            })}
          </div>
        )}
      </div>

      {/* Active Filter Badge with Clear Button */}
      {(statusFilter || selectedTagIds.length > 0) && (
        <div className="flex items-center gap-2">
          {statusFilter && (
            <Badge variant="secondary" className="text-base py-2 px-4">
              סטטוס: {
                statusFilter === 'pending' ? 'ממתינות' :
                statusFilter === 'in_progress' ? 'בביצוע' :
                statusFilter === 'completed' ? 'הושלמו' :
                'באיחור'
              }
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilter}
            className="h-auto py-2"
          >
            <X className="h-4 w-4 ml-1" />
            נקה כל הסינונים
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
              <TaskCard
                key={task.id}
                task={task}
                variant="compact"
                availableTags={availableTags}
                onTagsUpdated={handleTaskTagsUpdated}
              />
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
              <TaskCard
                key={task.id}
                task={task}
                variant="compact"
                availableTags={availableTags}
                onTagsUpdated={handleTaskTagsUpdated}
              />
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
              <TaskCard
                key={task.id}
                task={task}
                variant="compact"
                availableTags={availableTags}
                onTagsUpdated={handleTaskTagsUpdated}
              />
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
              <TaskCard
                key={task.id}
                task={task}
                variant="minimal"
                availableTags={availableTags}
                onTagsUpdated={handleTaskTagsUpdated}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
