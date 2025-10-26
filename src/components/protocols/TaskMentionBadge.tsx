'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, User, Calendar, AlertCircle, Clock, Check, X, MessageSquare } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type Task = {
  id: string
  title: string
  description?: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  owner_name: string
  owner_phone?: string | null
  due_date?: string | null
  completion_comment?: string | null
  created_at?: string
  updated_at?: string
}

interface TaskMentionBadgeProps {
  taskId: string
  taskTitle: string
}

export default function TaskMentionBadge({ taskId, taskTitle }: TaskMentionBadgeProps) {
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  async function fetchTaskDetails() {
    if (task || isLoading) return // Don't fetch if already loaded or loading

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/tasks/${taskId}`)
      const result = await response.json()

      if (result.success && result.data) {
        setTask(result.data)
      } else {
        setError('לא ניתן לטעון את פרטי המשימה')
      }
    } catch (err) {
      console.error('Error fetching task:', err)
      setError('שגיאה בטעינת המשימה')
    } finally {
      setIsLoading(false)
    }
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open)
    if (open && !task && !isLoading && !error) {
      fetchTaskDetails()
    }
  }

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    normal: 'bg-blue-100 text-blue-700',
    high: 'bg-yellow-100 text-yellow-700',
    urgent: 'bg-red-100 text-red-700'
  }

  const priorityLabels = {
    low: 'נמוכה',
    normal: 'רגילה',
    high: 'גבוהה',
    urgent: 'דחוף'
  }

  const statusLabels = {
    pending: 'ממתין',
    in_progress: 'בביצוע',
    completed: 'הושלם',
    cancelled: 'בוטל'
  }

  const statusIcons = {
    pending: <div className="h-3 w-3 border-2 rounded-full border-gray-400" />,
    in_progress: <Clock className="h-3 w-3 text-blue-600 animate-pulse" />,
    completed: <Check className="h-3 w-3 text-green-600" />,
    cancelled: <X className="h-3 w-3 text-gray-400" />
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Badge
          variant="secondary"
          className="mx-1 my-0.5 inline-flex items-center gap-1 cursor-pointer hover:bg-secondary/80 transition-colors"
        >
          <CheckCircle2 className="h-3 w-3" />
          {taskTitle}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start" side="top">
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">טוען...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-4">
            <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {task && (
          <div className="space-y-3">
            {/* Task Title */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {statusIcons[task.status]}
                <h4 className="font-semibold text-sm">{task.title}</h4>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {statusLabels[task.status]}
                </Badge>
                <Badge
                  className={cn("text-xs", priorityColors[task.priority])}
                >
                  {priorityLabels[task.priority]}
                </Badge>
              </div>
            </div>

            {/* Task Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">אחראי:</span>
                <span className="font-medium">{task.owner_name}</span>
              </div>

              {task.due_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">תאריך יעד:</span>
                  <span className="font-medium">
                    {new Date(task.due_date).toLocaleDateString('he-IL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <div className="border-t pt-2">
                <p className="text-xs text-muted-foreground mb-1">תיאור:</p>
                <p className="text-sm leading-relaxed">{task.description}</p>
              </div>
            )}

            {/* Completion Comment */}
            {task.completion_comment && (task.status === 'completed' || task.status === 'cancelled') && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 space-y-1">
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-900">
                  <MessageSquare className="h-3 w-3" />
                  <span>הערת סיום</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  {task.completion_comment}
                </p>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
