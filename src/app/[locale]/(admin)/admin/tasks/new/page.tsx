'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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

export default function NewTaskPage() {
  const router = useRouter()
  const t = useTranslations('admin.tasks.form')
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    setValue,
    watch,
    formState: { errors }
  } = useForm<AdminTaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'normal',
      status: 'pending',
      auto_remind: true
    }
  })

  // Draft management
  const { saveDraft, restoreDraft, clearDraft, hasDraft, draftTimestamp } = useFormDraft<AdminTaskFormData>({
    formType: 'task',
    action: 'new'
  })

  // Auto-save
  const formData = watch()
  const { lastSaved, isSaving } = useAutoSave({
    data: formData,
    onSave: (data) => saveDraft(data),
    delay: 3000,
    enabled: true
  })

  // Check for existing draft on mount
  useEffect(() => {
    if (hasDraft && draftTimestamp) {
      setShowDraftBanner(true)
    }
  }, [hasDraft, draftTimestamp])

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

  // Fetch events and tasks for linking
  useEffect(() => {
    fetchEvents()
    fetchTasks()
  }, [])

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
        setTasks(data.data)
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

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      })

      const result = await response.json()

      if (result.success) {
        clearDraft() // Clear draft on successful save
        toast.success(t('toast.createSuccess'))
        router.push('/tasks')
        router.refresh() // Force refresh to show new task
      } else {
        toast.error(result.error || t('toast.createError'))
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error(t('toast.createError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader title={t('newTitle')} subtitle={t('newSubtitle')} backHref="/admin/tasks" />

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
          mode="new"
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
          <div className="flex flex-col gap-3">
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
                  {t('createButton')}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="min-h-[44px] w-full"
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
