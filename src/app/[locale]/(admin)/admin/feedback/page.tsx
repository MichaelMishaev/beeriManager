'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Star, Calendar, User, Mail, CheckCircle, Trash2, Plus, ListTodo } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ShareButton } from '@/components/ui/share-button'
import { formatFeedbackShareData } from '@/lib/utils/share-formatters'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  status: string
  owner_name: string
  due_date?: string
}

interface Feedback {
  id: string
  category: 'general' | 'event' | 'task' | 'suggestion' | 'complaint' | 'other'
  subject: string
  message: string
  rating?: number
  parent_name?: string
  contact_email?: string
  is_anonymous: boolean
  status: 'new' | 'read' | 'responded' | 'done' | 'in_progress' | 'other'
  status_comment?: string
  task_id?: string
  task?: Task | null
  response?: string
  responded_at?: string
  created_at: string
  updated_at: string
}

const categoryLabels = {
  general: 'כללי',
  event: 'אירוע',
  task: 'משימה',
  suggestion: 'הצעה',
  complaint: 'פניה',
  other: 'אחר'
}

const categoryColors = {
  general: 'bg-blue-100 text-blue-800',
  event: 'bg-purple-100 text-purple-800',
  task: 'bg-green-100 text-green-800',
  suggestion: 'bg-yellow-100 text-yellow-800',
  complaint: 'bg-red-100 text-red-800',
  other: 'bg-gray-100 text-gray-800'
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  read: 'bg-gray-100 text-gray-800',
  responded: 'bg-green-100 text-green-800',
  done: 'bg-green-500 text-white',
  in_progress: 'bg-amber-100 text-amber-800',
  other: 'bg-purple-100 text-purple-800'
}

const statusLabels = {
  new: 'חדש',
  read: 'נקרא',
  responded: 'נענה',
  done: 'בוצע',
  in_progress: 'בטיפול',
  other: 'אחר'
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false)
  const [selectedFeedbackForTask, setSelectedFeedbackForTask] = useState<Feedback | null>(null)
  const [taskForm, setTaskForm] = useState({
    title: '',
    owner_name: '',
    owner_phone: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    due_date: ''
  })

  useEffect(() => {
    fetchFeedbacks()
  }, [selectedCategory, selectedStatus])

  async function fetchFeedbacks() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)

      const response = await fetch(`/api/feedback?${params}`)
      const data = await response.json()

      if (data.success) {
        setFeedbacks(data.data)
      } else {
        toast.error('שגיאה בטעינת המשובים')
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
      toast.error('שגיאה בטעינת המשובים')
    } finally {
      setIsLoading(false)
    }
  }

  async function markAsRead(id: string) {
    try {
      const response = await fetch(`/api/feedback/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'read' })
      })

      if (response.ok) {
        setFeedbacks(prev => prev.map(f =>
          f.id === id ? { ...f, status: 'read' } : f
        ))
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  async function updateStatus(id: string, status: Feedback['status'], statusComment?: string) {
    try {
      const response = await fetch(`/api/feedback/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, status_comment: statusComment })
      })

      const result = await response.json()

      if (result.success) {
        setFeedbacks(prev => prev.map(f =>
          f.id === id ? { ...f, status, status_comment: statusComment } : f
        ))
        toast.success('הסטטוס עודכן בהצלחה')
      } else {
        toast.error('שגיאה בעדכון הסטטוס')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('שגיאה בעדכון הסטטוס')
    }
  }

  async function deleteFeedback(id: string) {
    if (!confirm('האם אתה בטוח שברצונך למחוק משוב זה?')) {
      return
    }

    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setFeedbacks(prev => prev.filter(f => f.id !== id))
        toast.success('המשוב נמחק בהצלחה')
      } else {
        toast.error('שגיאה במחיקת המשוב')
      }
    } catch (error) {
      console.error('Error deleting feedback:', error)
      toast.error('שגיאה במחיקת המשוב')
    }
  }

  async function createTaskFromFeedback() {
    if (!selectedFeedbackForTask) return

    try {
      const response = await fetch(`/api/feedback/${selectedFeedbackForTask.id}/create-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskForm)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('המשימה נוצרה בהצלחה!')
        setCreateTaskDialogOpen(false)
        setSelectedFeedbackForTask(null)
        setTaskForm({
          title: '',
          owner_name: '',
          owner_phone: '',
          priority: 'normal',
          due_date: ''
        })
        // Refresh feedbacks to show updated task_id
        fetchFeedbacks()
      } else {
        toast.error(result.error || 'שגיאה ביצירת המשימה')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('שגיאה ביצירת המשימה')
    }
  }

  function openCreateTaskDialog(feedback: Feedback) {
    setSelectedFeedbackForTask(feedback)
    setTaskForm({
      ...taskForm,
      title: feedback.subject || 'משימה ממשוב הורים'
    })
    setCreateTaskDialogOpen(true)
  }

  const stats = {
    total: feedbacks.length,
    new: feedbacks.filter(f => f.status === 'new').length,
    suggestions: feedbacks.filter(f => f.category === 'suggestion').length,
    complaints: feedbacks.filter(f => f.category === 'complaint').length,
    averageRating: feedbacks.filter(f => f.rating).reduce((sum, f) => sum + (f.rating || 0), 0) /
                   feedbacks.filter(f => f.rating).length || 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">ניהול משובים</h1>
        <p className="text-muted-foreground mt-2">
          צפייה וניהול משובים מהורים
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">סה"כ משובים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.new} חדשים
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">הצעות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suggestions}</div>
            <p className="text-xs text-muted-foreground">
              הצעות לשיפור
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">פניות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complaints}</div>
            <p className="text-xs text-muted-foreground">
              דורשות התייחסות
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">דירוג ממוצע</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {stats.averageRating.toFixed(1)}
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground">
              מתוך 5.0
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>סינון משובים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הקטגוריות</SelectItem>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="בחר סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feedbacks List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full" />
              <p className="text-muted-foreground">טוען משובים...</p>
            </CardContent>
          </Card>
        ) : feedbacks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">אין משובים להצגה</p>
            </CardContent>
          </Card>
        ) : (
          feedbacks.map((feedback) => (
            <Card
              key={feedback.id}
              className={cn(
                'transition-all cursor-pointer',
                feedback.status === 'new' && 'border-primary'
              )}
              onClick={() => feedback.status === 'new' && markAsRead(feedback.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{feedback.subject}</CardTitle>
                      <Badge className={categoryColors[feedback.category]}>
                        {categoryLabels[feedback.category]}
                      </Badge>
                      <Badge className={statusColors[feedback.status]}>
                        {statusLabels[feedback.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground text-right font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(feedback.created_at), 'dd/MM/yyyy HH:mm')}
                      </span>
                      {feedback.is_anonymous ? (
                        <span className="text-muted-foreground">משוב אנונימי</span>
                      ) : (
                        <>
                          {feedback.parent_name && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {feedback.parent_name}
                            </span>
                          )}
                          {feedback.contact_email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {feedback.contact_email}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {feedback.rating && (
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-4 w-4',
                            i < feedback.rating!
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{feedback.message}</p>

                {/* Status Management Section */}
                <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Label className="text-sm font-medium">סטטוס:</Label>
                    <Select
                      value={feedback.status}
                      onValueChange={(value) => {
                        if (value === 'other') {
                          // For 'other', we'll need to show the comment input
                          updateStatus(feedback.id, value as Feedback['status'])
                        } else {
                          updateStatus(feedback.id, value as Feedback['status'])
                        }
                      }}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Custom comment for 'other' status */}
                    {feedback.status === 'other' && (
                      <Input
                        placeholder="הערה מותאמת אישית..."
                        defaultValue={feedback.status_comment || ''}
                        onBlur={(e) => updateStatus(feedback.id, 'other', e.target.value)}
                        className="flex-1 min-w-[200px]"
                      />
                    )}
                  </div>

                  {/* Linked Task Display */}
                  {feedback.task && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <ListTodo className="h-4 w-4 text-green-600" />
                        <span className="text-green-800 font-medium text-sm">מקושר למשימה</span>
                      </div>
                      <div className="pr-6 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{feedback.task.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {feedback.task.status === 'pending' ? 'ממתין'
                              : feedback.task.status === 'in_progress' ? 'בביצוע'
                              : feedback.task.status === 'completed' ? 'הושלם'
                              : 'בוטל'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          אחראי: {feedback.task.owner_name}
                          {feedback.task.due_date && (
                            <> • יעד: {format(new Date(feedback.task.due_date), 'dd/MM/yyyy')}</>
                          )}
                        </div>
                        <Link
                          href={`/admin/tasks`}
                          className="text-xs text-blue-600 hover:underline inline-block"
                        >
                          צפה במשימה ←
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Status comment display */}
                  {feedback.status === 'other' && feedback.status_comment && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">הערה: </span>
                      {feedback.status_comment}
                    </div>
                  )}
                </div>

                {/* Actions - Buttons */}
                <div className="flex gap-2 pt-4 flex-wrap" onClick={(e) => e.stopPropagation()}>
                  <ShareButton
                    shareData={formatFeedbackShareData(feedback)}
                    variant="outline"
                    size="sm"
                  />

                  {!feedback.task && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => openCreateTaskDialog(feedback)}
                    >
                      <Plus className="h-3 w-3" />
                      צור משימה
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteFeedback(feedback.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                    מחק
                  </Button>
                </div>

                {feedback.response && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">תגובת הועד:</span>
                    </div>
                    <p className="text-sm">{feedback.response}</p>
                    {feedback.responded_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        נענה בתאריך: {format(new Date(feedback.responded_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={createTaskDialogOpen} onOpenChange={setCreateTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>יצירת משימה ממשוב</DialogTitle>
            <DialogDescription>
              צור משימה חדשה המקושרת למשוב זה. המשוב יעודכן אוטומטית לסטטוס "בטיפול".
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Task Title */}
            <div className="space-y-2">
              <Label htmlFor="task_title">כותרת המשימה *</Label>
              <Input
                id="task_title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="כותרת המשימה"
              />
            </div>

            {/* Owner Name */}
            <div className="space-y-2">
              <Label htmlFor="owner_name">שם האחראי *</Label>
              <Input
                id="owner_name"
                value={taskForm.owner_name}
                onChange={(e) => setTaskForm({ ...taskForm, owner_name: e.target.value })}
                placeholder="שם האחראי לביצוע המשימה"
              />
            </div>

            {/* Owner Phone */}
            <div className="space-y-2">
              <Label htmlFor="owner_phone">טלפון האחראי</Label>
              <Input
                id="owner_phone"
                value={taskForm.owner_phone}
                onChange={(e) => setTaskForm({ ...taskForm, owner_phone: e.target.value })}
                placeholder="050-1234567"
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">עדיפות</Label>
              <Select
                value={taskForm.priority}
                onValueChange={(value) => setTaskForm({ ...taskForm, priority: value as 'low' | 'normal' | 'high' | 'urgent' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">נמוכה</SelectItem>
                  <SelectItem value="normal">רגילה</SelectItem>
                  <SelectItem value="high">גבוהה</SelectItem>
                  <SelectItem value="urgent">דחופה</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="due_date">תאריך יעד</Label>
              <Input
                id="due_date"
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
              />
            </div>

            {/* Feedback Preview */}
            {selectedFeedbackForTask && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">תוכן המשוב:</p>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {selectedFeedbackForTask.message}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateTaskDialogOpen(false)
                setSelectedFeedbackForTask(null)
              }}
            >
              ביטול
            </Button>
            <Button
              onClick={createTaskFromFeedback}
              disabled={!taskForm.title || !taskForm.owner_name}
            >
              <Plus className="h-4 w-4 ml-2" />
              צור משימה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}