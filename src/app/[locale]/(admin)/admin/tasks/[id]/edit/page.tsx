'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Trash2, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useFormDraft } from '@/hooks/useFormDraft'
import { useAutoSave } from '@/hooks/useAutoSave'
import { DraftBanner, DraftSaveIndicator } from '@/components/ui/draft-banner'
import { AdminPageHeader } from '@/components/features/admin'
import {
  AdminTaskFormFields,
  buildAdminTaskSchema,
  type AdminTaskFormData,
  type LinkOption
} from '@/components/features/tasks/admin/AdminTaskFormFields'

interface ToastAction {
  label: string
  onClick: () => void
}

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const t = useTranslations('admin.tasks.form')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [events, setEvents] = useState<LinkOption[]>([])
  const [tasks, setTasks] = useState<LinkOption[]>([])
  const [dueDate, setDueDate] = useState<string>('')
  const [reminderDate, setReminderDate] = useState<string>('')
  const [showDraftBanner, setShowDraftBanner] = useState(false)

  const taskSchema = useMemo(
    () =>
      buildAdminTaskSchema({
        titleMin: t('validation.titleMin'),
        ownerRequired: t('validation.ownerRequired'),
        phoneInvalid: t('validation.phoneInvalid')
      }),
    [t]
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<AdminTaskFormData>({
    resolver: zodResolver(taskSchema)
  })

  // Draft management
  const { saveDraft, restoreDraft, clearDraft, hasDraft, draftTimestamp } = useFormDraft<AdminTaskFormData>({
    formType: 'task',
    action: 'edit',
    entityId: params.id
  })

  // Auto-save
  const formData = watch()
  const { lastSaved, isSaving } = useAutoSave({
    data: formData,
    onSave: (data) => saveDraft(data),
    delay: 3000,
    enabled: !isLoading // Only auto-save after task is loaded
  })

  // Check for existing draft on mount (after task is loaded)
  useEffect(() => {
    if (!isLoading && hasDraft && draftTimestamp) {
      setShowDraftBanner(true)
    }
  }, [isLoading, hasDraft, draftTimestamp])

  // Restore draft handler
  const handleRestoreDraft = () => {
    const draft = restoreDraft()
    if (draft) {
      // Restore all form fields
      const draftData: Partial<AdminTaskFormData> = draft
      const keys = Object.keys(draftData) as (keyof AdminTaskFormData)[]
      keys.forEach((key) => {
        if (key === 'due_date') {
          setDueDate((draftData[key] as string | null | undefined) ?? '')
        } else if (key === 'reminder_date') {
          setReminderDate((draftData[key] as string | null | undefined) ?? '')
        }
        setValue(key, draftData[key] as never)
      })
      setShowDraftBanner(false)
      toast.success(t('toast.draftRestored'))
    }
  }

  // Discard draft handler
  const handleDiscardDraft = () => {
    clearDraft()
    setShowDraftBanner(false)
    toast.success(t('toast.draftDiscarded'))
  }

  useEffect(() => {
    fetchTask()
    fetchEvents()
    fetchTasks()
  }, [params.id])

  async function fetchTask() {
    try {
      const response = await fetch(`/api/tasks/${params.id}`)
      const data = await response.json()

      if (data.success) {
        const task = data.data
        const dueDateValue = task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : ''
        const reminderDateValue = task.reminder_date ? format(new Date(task.reminder_date), 'yyyy-MM-dd') : ''

        setDueDate(dueDateValue)
        setReminderDate(reminderDateValue)

        reset({
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          status: task.status,
          owner_name: task.owner_name,
          owner_phone: task.owner_phone || '',
          due_date: dueDateValue,
          reminder_date: reminderDateValue,
          event_id: task.event_id || '',
          parent_task_id: task.parent_task_id || '',
          auto_remind: task.auto_remind ?? true
        })
      } else {
        toast.error(t('toast.loadError'))
        router.push('/tasks')
      }
    } catch (error) {
      console.error('Error fetching task:', error)
      toast.error(t('toast.loadError'))
      router.push('/tasks')
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchEvents() {
    try {
      const response = await fetch('/api/events?upcoming=true&limit=20')
      const data = await response.json()
      if (data.success) {
        setEvents(data.data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  async function fetchTasks() {
    try {
      const response = await fetch('/api/tasks?status=pending,in_progress&limit=20')
      const data = await response.json()
      if (data.success) {
        // Filter out the current task from parent options
        setTasks((data.data as LinkOption[]).filter((task) => task.id !== params.id))
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  async function onSubmit(data: AdminTaskFormData) {
    setIsSubmitting(true)

    try {
      const taskData = {
        ...data,
        due_date: data.due_date || null,
        owner_phone: data.owner_phone || null,
        event_id: (data.event_id && data.event_id !== 'none') ? data.event_id : null,
        parent_task_id: (data.parent_task_id && data.parent_task_id !== 'none') ? data.parent_task_id : null,
        reminder_date: data.reminder_date || null
      }

      const response = await fetch(`/api/tasks/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      })

      // Handle HTTP errors
      if (!response.ok) {
        if (response.status === 404) {
          toast.error(t('toast.notFound'), {
            action: {
              label: t('toast.backToList'),
              onClick: () => router.push('/tasks')
            }
          })
          return
        }

        if (response.status === 401) {
          toast.error(t('toast.unauthorized'), {
            action: {
              label: t('toast.login'),
              onClick: () => router.push('/login')
            }
          })
          return
        }

        if (response.status >= 500) {
          toast.error(t('toast.serverError'), {
            action: {
              label: t('toast.retry'),
              onClick: () => onSubmit(data)
            }
          })
          return
        }
      }

      const result = await response.json()

      if (result.success) {
        clearDraft() // Clear draft on successful save
        toast.success(t('toast.updateSuccess'), { duration: 2000 })

        // Wait for toast to be visible
        await new Promise(resolve => setTimeout(resolve, 500))

        // Refresh BEFORE navigation
        await router.refresh()

        // Then navigate
        router.push('/tasks')

        // Don't set isSubmitting(false) - we're navigating away
      } else {
        // Handle validation errors
        if (result.fieldErrors) {
          const firstError = Object.values(result.fieldErrors)[0] as string
          toast.error(firstError || result.error)
        } else {
          const errorOptions: { action?: ToastAction } = {}
          if (result.action && result.action.onClick === 'retry') {
            errorOptions.action = {
              label: result.action.label,
              onClick: () => onSubmit(data)
            }
          }
          toast.error(result.error || t('toast.updateError'), errorOptions)
        }
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error updating task:', error)

      if (!navigator.onLine) {
        toast.error(t('toast.offline'), {
          action: {
            label: t('toast.retry'),
            onClick: () => onSubmit(data)
          }
        })
      } else if (error instanceof SyntaxError) {
        toast.error(t('toast.badResponse'))
      } else {
        toast.error(t('toast.unexpected'))
      }
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!confirm(t('confirmDelete'))) {
      return
    }

    // Lock ENTIRE form during delete (prevents double-action)
    setIsDeleting(true)
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/tasks/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        if (response.status === 404) {
          toast.error(t('toast.alreadyDeleted'), {
            action: {
              label: t('toast.backToList'),
              onClick: () => router.push('/tasks')
            }
          })
          return
        }

        throw new Error('Delete failed')
      }

      const result = await response.json()

      if (result.success) {
        toast.success(t('toast.deleteSuccess'), { duration: 1500 })

        // Wait for user to see toast
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Navigate (no need to unlock - we're leaving)
        router.push('/tasks')
      } else {
        toast.error(result.error || t('toast.deleteError'))
        // Unlock on error
        setIsDeleting(false)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error(t('toast.deleteErrorRetry'))
      // Unlock on error
      setIsDeleting(false)
      setIsSubmitting(false)
    }
    // Don't unlock in finally - if successful, we're navigating away
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title={t('editTitle')} backHref="/admin/tasks" />
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{t('loadingTask')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader title={t('editTitle')} subtitle={t('editSubtitle')} backHref="/admin/tasks" />

      {/* Draft Banner */}
      {showDraftBanner && draftTimestamp && (
        <DraftBanner
          timestamp={draftTimestamp}
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
          onDismiss={() => setShowDraftBanner(false)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AdminTaskFormFields
          mode="edit"
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
          dueDate={dueDate}
          reminderDate={reminderDate}
          onDueDateChange={(date) => {
            setDueDate(date)
            setValue('due_date', date)
          }}
          onReminderDateChange={(date) => {
            setReminderDate(date)
            setValue('reminder_date', date)
          }}
          events={events}
          tasks={tasks}
        />

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {/* Draft Save Indicator */}
          <div className="flex items-center justify-start">
            <DraftSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[44px] w-full bg-[#003153] hover:bg-[#003153]/90"
          >
            {isSubmitting ? (
              <>{t('loading')}</>
            ) : (
              <>
                <Save className="me-2 h-4 w-4" />
                {t('saveButton')}
              </>
            )}
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="min-h-[44px] flex-1"
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="min-h-[44px] flex-1"
            >
              {isDeleting ? (
                <>{t('deleting')}</>
              ) : (
                <>
                  <Trash2 className="me-2 h-4 w-4" />
                  {t('deleteButton')}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
