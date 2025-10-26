'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  ClipboardList,
  X,
  Check,
  Clock,
  Plus,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Search,
  MessageSquare,
  Filter,
  ArrowUpDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Task type based on database schema
type Task = {
  id: string
  title: string
  description?: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  owner_name: string
  owner_phone?: string | null
  due_date?: string | null
  reminder_date?: string | null
  event_id?: string | null
  parent_task_id?: string | null
  auto_remind?: boolean
  attachment_urls?: string[]
  follow_up_count?: number
  created_at?: string
  updated_at?: string
  completion_comment?: string | null
}

interface TaskDrawerProps {
  isOpen: boolean
  onClose: () => void
}

type SortOption = 'priority' | 'dueDate' | 'status' | 'createdAt'

export default function TaskDrawer({ isOpen, onClose }: TaskDrawerProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [completionComment, setCompletionComment] = useState('')
  const [taskToComplete, setTaskToComplete] = useState<string | null>(null)
  const [hideCompleted, setHideCompleted] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('priority')

  // Fetch tasks when drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchTasks()
    }
  }, [isOpen])

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter(task => {
      // Exclude cancelled tasks
      if (task.status === 'cancelled') return false

      // Exclude completed tasks if filter is enabled
      if (hideCompleted && task.status === 'completed') return false

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return (
          task.title.toLowerCase().includes(query) ||
          task.owner_name.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
        )
      }

      return true
    })
    .sort((a, b) => {
      // Sort by selected option
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        }
        case 'dueDate': {
          if (!a.due_date && !b.due_date) return 0
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        }
        case 'status': {
          const statusOrder = { in_progress: 0, pending: 1, completed: 2, cancelled: 3 }
          return statusOrder[a.status] - statusOrder[b.status]
        }
        case 'createdAt': {
          if (!a.created_at && !b.created_at) return 0
          if (!a.created_at) return 1
          if (!b.created_at) return -1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        default:
          return 0
      }
    })

  async function fetchTasks() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/tasks?limit=50')
      const result = await response.json()

      if (result.success) {
        setTasks(result.data || [])
      } else {
        toast.error('שגיאה בטעינת המשימות')
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('שגיאה בטעינת המשימות')
    } finally {
      setIsLoading(false)
    }
  }

  function showCompletionCommentDialog(taskId: string) {
    setTaskToComplete(taskId)
    setCompletionComment('')
    setShowCompletionDialog(true)
  }

  async function handleMarkComplete(comment?: string) {
    if (!taskToComplete) return

    try {
      const response = await fetch(`/api/tasks/${taskToComplete}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          completion_comment: comment || null
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('המשימה סומנה כהושלמה!')
        // Update local state
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskToComplete ? { ...task, status: 'completed' as const, completion_comment: comment || null } : task
          )
        )
        // Refresh tasks from server
        fetchTasks()
        // Go back to list
        setSelectedTask(null)
        // Close dialog
        setShowCompletionDialog(false)
        setTaskToComplete(null)
        setCompletionComment('')
      } else {
        toast.error('שגיאה בעדכון המשימה')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('שגיאה בעדכון המשימה')
    }
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
  }

  const handleBack = () => {
    setSelectedTask(null)
  }

  const handleCloseDrawer = () => {
    setSelectedTask(null)
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={handleCloseDrawer}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-background border-t-2 border-primary rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out z-50",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-2 border-b sticky top-0 bg-background z-10">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              {selectedTask ? 'פרטי משימה' : 'משימות'}
            </h3>
            <Button
              onClick={handleCloseDrawer}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              טוען משימות...
            </div>
          ) : selectedTask ? (
            <TaskDetails
              task={selectedTask}
              onBack={handleBack}
              onShowCompletionDialog={showCompletionCommentDialog}
            />
          ) : (
            <>
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="חיפוש משימה..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filter and Sort Controls */}
              <div className="flex gap-2">
                {/* Hide Completed Toggle */}
                <Button
                  type="button"
                  variant={hideCompleted ? "default" : "outline"}
                  size="sm"
                  onClick={() => setHideCompleted(!hideCompleted)}
                  className="flex-1 gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {hideCompleted ? 'הצג הכל' : 'הסתר מושלמות'}
                </Button>

                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="flex-1">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">לפי עדיפות</SelectItem>
                    <SelectItem value="dueDate">לפי תאריך יעד</SelectItem>
                    <SelectItem value="status">לפי סטטוס</SelectItem>
                    <SelectItem value="createdAt">לפי תאריך יצירה</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tasks Count */}
              {tasks.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  מציג {filteredAndSortedTasks.length} מתוך {tasks.length} משימות
                  {(searchQuery || hideCompleted) && ' (מסוננות)'}
                </p>
              )}

              {filteredAndSortedTasks.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  {searchQuery ? (
                    <p>לא נמצאו משימות התואמות לחיפוש</p>
                  ) : hideCompleted ? (
                    <p>אין משימות פעילות להצגה</p>
                  ) : (
                    <p>אין משימות להצגה</p>
                  )}
                </div>
              ) : (
                <TaskList tasks={filteredAndSortedTasks} onTaskClick={handleTaskClick} />
              )}

              {/* Quick Add Button */}
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={() => toast.info('יצירת משימה חדשה - בקרוב...')}
              >
                <Plus className="h-3 w-3 ml-1" />
                הוסף משימה חדשה
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Completion Comment Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>סיום משימה</DialogTitle>
            <DialogDescription>
              ניתן להוסיף הערה המסבירה מדוע המשימה הושלמה (לא חובה)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="completion-comment">הערה</Label>
              <Textarea
                id="completion-comment"
                placeholder="למשל: הושלם לאחר פגישה עם הספק..."
                value={completionComment}
                onChange={(e) => setCompletionComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                ההערה תוצג ליד סטטוס המשימה
              </p>
            </div>
          </div>
          <DialogFooter className="flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCompletionDialog(false)
                setCompletionComment('')
                setTaskToComplete(null)
              }}
            >
              ביטול
            </Button>
            <Button
              type="button"
              onClick={() => handleMarkComplete(completionComment || undefined)}
            >
              <CheckCircle className="h-4 w-4 ml-2" />
              סמן כהושלם
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Task Details Component
function TaskDetails({
  task,
  onBack,
  onShowCompletionDialog
}: {
  task: Task
  onBack: () => void
  onShowCompletionDialog: (taskId: string) => void
}) {
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

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button
        onClick={onBack}
        variant="ghost"
        size="sm"
        className="mr-auto"
      >
        <ArrowLeft className="h-4 w-4 ml-2" />
        חזרה לרשימה
      </Button>

      {/* Task Title */}
      <div className="space-y-2">
        <h4 className="text-xl font-bold flex items-center gap-2">
          {task.status === 'completed' && (
            <CheckCircle className="h-5 w-5 text-green-600" />
          )}
          {task.status === 'in_progress' && (
            <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
          )}
          {task.status === 'pending' && (
            <AlertCircle className="h-5 w-5 text-gray-600" />
          )}
          {task.status === 'cancelled' && (
            <X className="h-5 w-5 text-gray-400" />
          )}
          {task.title}
        </h4>
        <span className={cn(
          "inline-block text-xs px-3 py-1 rounded-full font-medium",
          priorityColors[task.priority]
        )}>
          עדיפות {priorityLabels[task.priority]}
        </span>
      </div>

      {/* Task Info Grid */}
      <div className="grid gap-3 bg-muted p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">אחראי</p>
            <p className="font-medium">{task.owner_name}</p>
            {task.owner_phone && (
              <p className="text-xs text-muted-foreground">{task.owner_phone}</p>
            )}
          </div>
        </div>

        {task.due_date && (
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">תאריך יעד</p>
              <p className="font-medium">
                {new Date(task.due_date).toLocaleDateString('he-IL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="h-4 w-4 flex items-center justify-center">
            {task.status === 'completed' && <Check className="h-4 w-4 text-green-600" />}
            {task.status === 'in_progress' && <Clock className="h-4 w-4 text-blue-600" />}
            {task.status === 'pending' && <div className="h-3 w-3 border-2 rounded-full" />}
            {task.status === 'cancelled' && <X className="h-4 w-4 text-gray-400" />}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">סטטוס</p>
            <p className="font-medium">{statusLabels[task.status]}</p>
          </div>
        </div>
      </div>

      {/* Completion Comment */}
      {task.completion_comment && (task.status === 'completed' || task.status === 'cancelled') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
            <MessageSquare className="h-4 w-4" />
            <span>הערת סיום</span>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed pr-6">
            {task.completion_comment}
          </p>
        </div>
      )}

      {/* Description */}
      {task.description && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">תיאור המשימה</Label>
          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg leading-relaxed">
            {task.description}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        {task.status !== 'completed' && task.status !== 'cancelled' && (
          <Button
            onClick={() => onShowCompletionDialog(task.id)}
            className="flex-1"
            variant="default"
          >
            <CheckCircle className="h-4 w-4 ml-2" />
            סמן כהושלם
          </Button>
        )}
        {task.status === 'completed' && (
          <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">המשימה הושלמה!</span>
          </div>
        )}
        {task.status === 'cancelled' && (
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center gap-2 text-gray-700">
            <X className="h-5 w-5" />
            <span className="font-semibold">המשימה בוטלה</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Task List Component
function TaskList({
  tasks,
  onTaskClick
}: {
  tasks: Task[]
  onTaskClick: (task: Task) => void
}) {
  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <div
          key={task.id}
          onClick={() => onTaskClick(task)}
          className="border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                {task.status === 'completed' && (
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                )}
                {task.status === 'in_progress' && (
                  <Clock className="h-4 w-4 text-blue-600 animate-pulse flex-shrink-0" />
                )}
                {task.status === 'pending' && (
                  <div className="h-4 w-4 border-2 rounded-full flex-shrink-0" />
                )}
                {task.status === 'cancelled' && (
                  <X className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
                <span className={cn(
                  "font-medium",
                  task.status === 'completed' && "line-through text-muted-foreground",
                  task.status === 'cancelled' && "text-muted-foreground"
                )}>
                  {task.title}
                </span>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>👤 {task.owner_name}</span>
                {task.due_date && (
                  <span>📅 {new Date(task.due_date).toLocaleDateString('he-IL')}</span>
                )}
              </div>
            </div>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full flex-shrink-0",
              task.status === 'completed' && "bg-green-100 text-green-700",
              task.status === 'in_progress' && "bg-blue-100 text-blue-700",
              task.status === 'pending' && "bg-gray-100 text-gray-700",
              task.status === 'cancelled' && "bg-gray-100 text-gray-500"
            )}>
              {task.status === 'completed' && 'הושלם'}
              {task.status === 'in_progress' && 'בביצוע'}
              {task.status === 'pending' && 'ממתין'}
              {task.status === 'cancelled' && 'בוטל'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
