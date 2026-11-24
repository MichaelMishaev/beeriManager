'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Star, Calendar, User, Mail, CheckCircle, Trash2, Plus, ListTodo, ArrowRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
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
import { Link } from '@/i18n/navigation'
import { AdminEmptyState, AdminFormSection, StatusPill } from '@/components/features/admin'

interface Task {
  id: string
  title: string
  status: string
  owner_name: string
  due_date?: string
}

type FeedbackCategory = 'general' | 'event' | 'task' | 'suggestion' | 'complaint' | 'other'
type FeedbackStatus = 'new' | 'read' | 'responded' | 'done' | 'in_progress' | 'other'
type PillTone = 'success' | 'neutral' | 'warning' | 'danger' | 'info'

interface Feedback {
  id: string
  category: FeedbackCategory
  subject: string
  message: string
  rating?: number
  parent_name?: string
  contact_email?: string
  is_anonymous: boolean
  status: FeedbackStatus
  status_comment?: string
  task_id?: string
  task?: Task | null
  response?: string
  responded_at?: string
  created_at: string
  updated_at: string
}

const CATEGORIES: FeedbackCategory[] = ['general', 'event', 'task', 'suggestion', 'complaint', 'other']
const STATUSES: FeedbackStatus[] = ['new', 'read', 'responded', 'done', 'in_progress', 'other']

const categoryTones: Record<FeedbackCategory, PillTone> = {
  general: 'info',
  event: 'info',
  task: 'success',
  suggestion: 'warning',
  complaint: 'danger',
  other: 'neutral',
}

const statusTones: Record<FeedbackStatus, PillTone> = {
  new: 'info',
  read: 'neutral',
  responded: 'success',
  done: 'success',
  in_progress: 'warning',
  other: 'neutral',
}

const TASK_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'] as const
type TaskStatusKey = (typeof TASK_STATUSES)[number]

function toTaskStatusKey(status: string): TaskStatusKey {
  return (TASK_STATUSES as readonly string[]).includes(status) ? (status as TaskStatusKey) : 'cancelled'
}

export function FeedbackPanel() {
  const t = useTranslations('admin.inbox.feedback')
  const locale = useLocale()
  const shareLocale = locale === 'ru' ? 'ru' : 'he'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedStatus])

  async function fetchFeedbacks() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      // Load everything, so the totals here match the "new" count on the admin home
      params.append('limit', '1000')
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)

      const response = await fetch(`/api/feedback?${params}`)
      const data = await response.json()

      if (data.success) {
        setFeedbacks(data.data)
      } else {
        toast.error(t('loadError'))
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
      toast.error(t('loadError'))
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

  async function updateStatus(id: string, status: FeedbackStatus, statusComment?: string) {
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
        toast.success(t('statusUpdated'))
      } else {
        toast.error(t('statusError'))
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error(t('statusError'))
    }
  }

  async function deleteFeedback(id: string) {
    if (!confirm(t('deleteConfirm'))) {
      return
    }

    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setFeedbacks(prev => prev.filter(f => f.id !== id))
        toast.success(t('deleted'))
      } else {
        toast.error(t('deleteError'))
      }
    } catch (error) {
      console.error('Error deleting feedback:', error)
      toast.error(t('deleteError'))
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
        toast.success(t('taskCreated'))
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
        toast.error(result.error || t('taskError'))
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error(t('taskError'))
    }
  }

  function openCreateTaskDialog(feedback: Feedback) {
    setSelectedFeedbackForTask(feedback)
    setTaskForm({
      ...taskForm,
      title: feedback.subject || t('defaultTaskTitle')
    })
    setCreateTaskDialogOpen(true)
  }

  const ratedFeedbacks = feedbacks.filter(f => f.rating)
  const stats = {
    total: feedbacks.length,
    new: feedbacks.filter(f => f.status === 'new').length,
    suggestions: feedbacks.filter(f => f.category === 'suggestion').length,
    complaints: feedbacks.filter(f => f.category === 'complaint').length,
    averageRating: ratedFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / ratedFeedbacks.length || 0
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-[#eef0f2] shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:grid-cols-4">
        <div className="bg-white p-3">
          <p className="text-xs font-medium text-gray-500">{t('statsTotal')}</p>
          <p className="mt-1 text-2xl font-bold text-[#003153]">{stats.total}</p>
          <p className="text-xs text-gray-500">{t('statsNew', { count: stats.new })}</p>
        </div>
        <div className="bg-white p-3">
          <p className="text-xs font-medium text-gray-500">{t('statsSuggestions')}</p>
          <p className="mt-1 text-2xl font-bold text-[#003153]">{stats.suggestions}</p>
          <p className="text-xs text-gray-500">{t('statsSuggestionsHint')}</p>
        </div>
        <div className="bg-white p-3">
          <p className="text-xs font-medium text-gray-500">{t('statsComplaints')}</p>
          <p className="mt-1 text-2xl font-bold text-[#003153]">{stats.complaints}</p>
          <p className="text-xs text-gray-500">{t('statsComplaintsHint')}</p>
        </div>
        <div className="bg-white p-3">
          <p className="text-xs font-medium text-gray-500">{t('statsRating')}</p>
          <p className="mt-1 flex items-center gap-1 text-2xl font-bold text-[#003153]">
            {stats.averageRating.toFixed(1)}
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
          </p>
          <p className="text-xs text-gray-500">{t('statsRatingHint')}</p>
        </div>
      </div>

      {/* Filters */}
      <AdminFormSection title={t('filterTitle')}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('categoryPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allCategories')}</SelectItem>
              {CATEGORIES.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`category.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('statusPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              {STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`status.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </AdminFormSection>

      {/* Feedbacks List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="rounded-2xl bg-white px-6 py-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#0D98BA] border-t-transparent" />
            <p className="text-sm text-gray-500">{t('loading')}</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <AdminEmptyState icon={MessageSquare} title={t('empty')} />
        ) : (
          feedbacks.map((feedback) => (
            <article
              key={feedback.id}
              className={cn(
                'cursor-pointer rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all',
                feedback.status === 'new' && 'ring-2 ring-[#0D98BA]'
              )}
              onClick={() => feedback.status === 'new' && markAsRead(feedback.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <h3 className="break-words text-[15px] font-bold text-[#003153]">{feedback.subject}</h3>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusPill tone={categoryTones[feedback.category]}>
                      {t(`category.${feedback.category}`)}
                    </StatusPill>
                    <StatusPill tone={statusTones[feedback.status]}>
                      {t(`status.${feedback.status}`)}
                    </StatusPill>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {format(new Date(feedback.created_at), 'dd/MM/yyyy HH:mm')}
                    </span>
                    {feedback.is_anonymous ? (
                      <span>{t('anonymous')}</span>
                    ) : (
                      <>
                        {feedback.parent_name && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" aria-hidden="true" />
                            {feedback.parent_name}
                          </span>
                        )}
                        {feedback.contact_email && (
                          <span className="flex min-w-0 items-center gap-1">
                            <Mail className="h-3 w-3 flex-none" aria-hidden="true" />
                            <span className="break-all">{feedback.contact_email}</span>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {feedback.rating && (
                  <div className="flex flex-none items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-3.5 w-3.5',
                          i < feedback.rating!
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        )}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                )}
              </div>

              <p className="mt-3 whitespace-pre-wrap break-words text-sm text-[#003153]">{feedback.message}</p>

              {/* Status Management Section */}
              <div className="mt-4 space-y-3 rounded-xl bg-[#f1f2f4] p-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-wrap items-center gap-2">
                  <Label className="text-sm font-medium">{t('statusLabel')}</Label>
                  <Select
                    value={feedback.status}
                    onValueChange={(value) => updateStatus(feedback.id, value as FeedbackStatus)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {t(`status.${value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Custom comment for 'other' status */}
                  {feedback.status === 'other' && (
                    <Input
                      placeholder={t('customNotePlaceholder')}
                      defaultValue={feedback.status_comment || ''}
                      onBlur={(e) => updateStatus(feedback.id, 'other', e.target.value)}
                      className="min-w-[200px] flex-1"
                    />
                  )}
                </div>

                {/* Linked Task Display */}
                {feedback.task && (
                  <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-3">
                    <div className="flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-green-600" aria-hidden="true" />
                      <span className="text-sm font-medium text-green-800">{t('linkedTask')}</span>
                    </div>
                    <div className="space-y-1 ps-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{feedback.task.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {t(`taskStatus.${toTaskStatusKey(feedback.task.status)}`)}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {t('taskOwner', { name: feedback.task.owner_name })}
                        {feedback.task.due_date && (
                          <> • {t('taskDue', { date: format(new Date(feedback.task.due_date), 'dd/MM/yyyy') })}</>
                        )}
                      </div>
                      <Link
                        href="/admin/tasks"
                        className="inline-flex min-h-[44px] items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        {t('viewTask')}
                        <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Status comment display */}
                {feedback.status === 'other' && feedback.status_comment && (
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{t('noteLabel')} </span>
                    {feedback.status_comment}
                  </div>
                )}
              </div>

              {/* Actions - Buttons */}
              <div className="flex flex-wrap gap-2 pt-4" onClick={(e) => e.stopPropagation()}>
                <ShareButton
                  shareData={formatFeedbackShareData(feedback)}
                  variant="outline"
                  size="sm"
                  locale={shareLocale}
                  className="min-h-[44px]"
                />

                {!feedback.task && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-[44px] gap-1"
                    onClick={() => openCreateTaskDialog(feedback)}
                  >
                    <Plus className="h-3 w-3" aria-hidden="true" />
                    {t('createTask')}
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-[44px] gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => deleteFeedback(feedback.id)}
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                  {t('delete')}
                </Button>
              </div>

              {feedback.response && (
                <div className="mt-4 rounded-xl bg-[#f1f2f4] p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                    <span className="text-sm font-medium">{t('committeeResponse')}</span>
                  </div>
                  <p className="text-sm">{feedback.response}</p>
                  {feedback.responded_at && (
                    <p className="mt-2 text-xs text-gray-500">
                      {t('respondedAt', { date: format(new Date(feedback.responded_at), 'dd/MM/yyyy HH:mm') })}
                    </p>
                  )}
                </div>
              )}
            </article>
          ))
        )}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={createTaskDialogOpen} onOpenChange={setCreateTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('taskDialogTitle')}</DialogTitle>
            <DialogDescription>{t('taskDialogDescription')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Task Title */}
            <div className="space-y-2">
              <Label htmlFor="task_title">{t('taskTitleLabel')}</Label>
              <Input
                id="task_title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder={t('taskTitlePlaceholder')}
              />
            </div>

            {/* Owner Name */}
            <div className="space-y-2">
              <Label htmlFor="owner_name">{t('ownerNameLabel')}</Label>
              <Input
                id="owner_name"
                value={taskForm.owner_name}
                onChange={(e) => setTaskForm({ ...taskForm, owner_name: e.target.value })}
                placeholder={t('ownerNamePlaceholder')}
              />
            </div>

            {/* Owner Phone */}
            <div className="space-y-2">
              <Label htmlFor="owner_phone">{t('ownerPhoneLabel')}</Label>
              <Input
                id="owner_phone"
                value={taskForm.owner_phone}
                onChange={(e) => setTaskForm({ ...taskForm, owner_phone: e.target.value })}
                placeholder={t('ownerPhonePlaceholder')}
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">{t('priorityLabel')}</Label>
              <Select
                value={taskForm.priority}
                onValueChange={(value) => setTaskForm({ ...taskForm, priority: value as 'low' | 'normal' | 'high' | 'urgent' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('priority.low')}</SelectItem>
                  <SelectItem value="normal">{t('priority.normal')}</SelectItem>
                  <SelectItem value="high">{t('priority.high')}</SelectItem>
                  <SelectItem value="urgent">{t('priority.urgent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="due_date">{t('dueDateLabel')}</Label>
              <Input
                id="due_date"
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
              />
            </div>

            {/* Feedback Preview */}
            {selectedFeedbackForTask && (
              <div className="rounded-lg bg-muted p-3">
                <p className="mb-1 text-sm font-medium">{t('feedbackContent')}</p>
                <p className="line-clamp-3 text-sm text-muted-foreground">
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
              {t('cancel')}
            </Button>
            <Button
              onClick={createTaskFromFeedback}
              disabled={!taskForm.title || !taskForm.owner_name}
            >
              <Plus className="me-2 h-4 w-4" aria-hidden="true" />
              {t('createTask')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
