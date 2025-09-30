import * as React from "react"
import { Calendar, User, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, formatHebrewDateTime } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description?: string
  due_date?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to?: {
    name: string
    email: string
  }
  category: 'general' | 'event' | 'fundraising' | 'communication' | 'maintenance'
  estimated_hours?: number
  completion_percentage?: number
}

interface TaskCardProps {
  task: Task
  variant?: 'full' | 'compact'
  showActions?: boolean
  onEdit?: () => void
  onComplete?: () => void
  onAssign?: () => void
  className?: string
}

const categoryLabels = {
  general: 'כללי',
  event: 'אירוע',
  fundraising: 'התרמה',
  communication: 'תקשורת',
  maintenance: 'תחזוקה'
}

const statusLabels = {
  pending: 'בהמתנה',
  in_progress: 'בביצוע',
  completed: 'הושלם',
  cancelled: 'בוטל'
}

const priorityColors = {
  low: 'secondary',
  normal: 'default',
  high: 'warning',
  urgent: 'destructive'
} as const

const priorityLabels = {
  low: 'נמוך',
  normal: 'רגיל',
  high: 'גבוה',
  urgent: 'דחוף'
}

const statusColors = {
  pending: 'secondary',
  in_progress: 'default',
  completed: 'default',
  cancelled: 'secondary'
} as const

export function TaskCard({
  task,
  variant = 'full',
  showActions = true,
  onEdit,
  onComplete,
  onAssign,
  className
}: TaskCardProps) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  const isCompleted = task.status === 'completed'

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-200 border-r-4",
        task.priority === 'urgent' && "border-r-red-500 shadow-red-100",
        task.priority === 'high' && "border-r-yellow-500",
        task.priority === 'normal' && "border-r-blue-500",
        task.priority === 'low' && "border-r-gray-400",
        isOverdue && "border-r-red-600 bg-red-50",
        isCompleted && "bg-green-50 border-r-green-500",
        className
      )}
      data-testid="task-card"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className={cn(
              "text-lg font-bold text-right leading-tight",
              isCompleted && "line-through text-muted-foreground"
            )}>
              {task.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2 justify-end flex-wrap">
              <Badge variant={priorityColors[task.priority]} className="text-xs">
                {priorityLabels[task.priority]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {categoryLabels[task.category]}
              </Badge>
              <Badge variant={statusColors[task.status]} className="text-xs">
                {statusLabels[task.status]}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 ml-1" />
                  איחור
                </Badge>
              )}
              {isCompleted && (
                <Badge variant="default" className="text-xs bg-green-600">
                  <CheckCircle className="h-3 w-3 ml-1" />
                  הושלם
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {variant === 'full' && task.description && (
          <p className="text-sm text-muted-foreground text-right leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="space-y-2 text-sm">
          {task.due_date && (
            <div className="flex items-center gap-2 justify-end">
              <span className={cn(
                "font-medium text-right",
                isOverdue ? "text-red-600" : "text-muted-foreground"
              )}>
                {formatHebrewDateTime(new Date(task.due_date))}
              </span>
              <Calendar className={cn(
                "h-4 w-4",
                isOverdue ? "text-red-600" : "text-muted-foreground"
              )} />
            </div>
          )}

          {task.assigned_to && (
            <div className="flex items-center gap-2 justify-end">
              <span className="text-right">{task.assigned_to.name}</span>
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {task.estimated_hours && (
            <div className="flex items-center gap-2 justify-end">
              <span className="text-right text-muted-foreground">
                {task.estimated_hours} שעות
              </span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {task.completion_percentage !== undefined && task.status === 'in_progress' && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{task.completion_percentage}%</span>
                <span className="text-xs text-muted-foreground">התקדמות</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${task.completion_percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="flex gap-2 justify-start pt-3">
          <Button
            variant="outline"
            size="sm"
            size="sm" onClick={onEdit}
            className="flex-1"
          >
            עריכה
          </Button>

          {!isCompleted && task.status !== 'cancelled' && (
            <Button
              size="sm"
              size="sm" onClick={onComplete}
              className="flex-1"
              variant={task.status === 'in_progress' ? 'default' : 'secondary'}
            >
              {task.status === 'pending' ? 'התחל' : 'השלם'}
            </Button>
          )}

          {!task.assigned_to && onAssign && (
            <Button
              variant="ghost"
              size="sm"
              size="sm" onClick={onAssign}
            >
              הקצה
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

// Compact version for mobile or lists
export function TaskCardCompact({ task, ...props }: TaskCardProps) {
  return (
    <TaskCard
      {...props}
      task={task}
      variant="compact"
      className={cn("p-3", props.className)}
    />
  )
}