'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Save, Trash2, ClipboardList, Plus, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { AdminFormSection, AdminPageHeader, AiFormatButton } from '@/components/features/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import TaskDrawer from '@/components/protocols/TaskDrawer'
import ExpandableTaskMentionTextarea from '@/components/protocols/ExpandableTaskMentionTextarea'
import { ExpandableTextarea } from '@/components/ui/expandable-textarea'
import { useFormDraft } from '@/hooks/useFormDraft'
import { useAutoSave } from '@/hooks/useAutoSave'
import { DraftBanner, DraftSaveIndicator } from '@/components/ui/draft-banner'

function createProtocolSchema(messages: {
  titleMin: string
  dateRequired: string
  attendeesMin: string
}) {
  return z.object({
    title: z.string().min(2, messages.titleMin),
    protocol_date: z.string().min(1, messages.dateRequired),
    categories: z.array(z.string()),
    attendees: z.array(z.string()).min(1, messages.attendeesMin),
    is_public: z.boolean(),
    extracted_text: z.string().optional(),
    agenda: z.string().optional(),
    decisions: z.string().optional(),
    action_items: z.string().optional()
  })
}

type ProtocolFormData = z.infer<ReturnType<typeof createProtocolSchema>>

const categoryValues = ['regular', 'special', 'annual', 'emergency'] as const

export default function EditProtocolPage() {
  const t = useTranslations('admin.records.protocols')
  const tc = useTranslations('admin.common')
  const router = useRouter()
  const locale = useLocale()
  const params = useParams()
  const protocolId = params.id as string
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [protocolTitle, setProtocolTitle] = useState('')
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [attendeeInput, setAttendeeInput] = useState('')
  const [attendees, setAttendees] = useState<string[]>([])
  const [showDraftBanner, setShowDraftBanner] = useState(false)

  const protocolSchema = useMemo(
    () =>
      createProtocolSchema({
        titleMin: t('validation.titleMin'),
        dateRequired: t('validation.dateRequired'),
        attendeesMin: t('validation.attendeesMin'),
      }),
    [t]
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ProtocolFormData>({
    resolver: zodResolver(protocolSchema),
    defaultValues: {
      categories: ['regular'],
      attendees: [],
      is_public: true
    }
  })

  const isPublic = watch('is_public')
  const selectedCategory = watch('categories')?.[0] || 'regular'

  // Draft management
  const { saveDraft, restoreDraft, clearDraft, hasDraft, draftTimestamp } = useFormDraft<ProtocolFormData>({
    formType: 'protocol',
    action: 'edit',
    entityId: protocolId
  })

  // Auto-save
  const formData = watch()
  const { lastSaved, isSaving } = useAutoSave({
    data: { ...formData, attendees },
    onSave: (data) => saveDraft(data),
    delay: 3000,
    enabled: !isLoading // Only auto-save after protocol is loaded
  })

  // Check for existing draft on mount (after protocol is loaded)
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
      const draftData = draft as Record<string, unknown>
      Object.keys(draftData).forEach((key) => {
        if (key === 'attendees') {
          setAttendees(draftData[key] as string[])
        } else if (key in draftData) {
          setValue(key as keyof ProtocolFormData, draftData[key] as never)
        }
      })
      setShowDraftBanner(false)
      toast.success(t('draftRestored'))
    }
  }

  // Discard draft handler
  const handleDiscardDraft = () => {
    clearDraft()
    setShowDraftBanner(false)
    toast.success(t('draftDiscarded'))
  }

  const addAttendee = () => {
    if (attendeeInput.trim() && !attendees.includes(attendeeInput.trim())) {
      const newAttendees = [...attendees, attendeeInput.trim()]
      setAttendees(newAttendees)
      setValue('attendees', newAttendees)
      setAttendeeInput('')
    }
  }

  const removeAttendee = (index: number) => {
    const newAttendees = attendees.filter((_, i) => i !== index)
    setAttendees(newAttendees)
    setValue('attendees', newAttendees)
  }

  useEffect(() => {
    loadProtocol()
  }, [protocolId])

  async function loadProtocol() {
    try {
      setIsLoading(true)
      const supabase = createClient()

      const { data: protocol, error } = await supabase
        .from('protocols')
        .select('*')
        .eq('id', protocolId)
        .single()

      if (error || !protocol) {
        toast.error(t('edit.notFound'))
        router.push(`/${locale}/protocols`)
        return
      }

      // Populate form with existing data
      setProtocolTitle(protocol.title)
      setValue('title', protocol.title)
      setValue('protocol_date', protocol.protocol_date)
      setValue('categories', protocol.categories || ['regular'])
      setValue('is_public', protocol.is_public)
      setValue('extracted_text', protocol.extracted_text || '')
      setValue('agenda', protocol.agenda || '')
      setValue('decisions', protocol.decisions || '')
      setValue('action_items', protocol.action_items || '')

      // Set attendees
      const attendeesList = protocol.attendees || []
      setAttendees(attendeesList)
      setValue('attendees', attendeesList)
    } catch (error) {
      console.error('Error loading protocol:', error)
      toast.error(t('edit.loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/protocols/${protocolId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success(t('edit.deleteSuccess'))
        setShowDeleteDialog(false)
        router.push(`/${locale}/protocols`)
        router.refresh()
      } else {
        toast.error(result.error || t('edit.deleteError'))
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(t('edit.deleteError'))
    } finally {
      setIsDeleting(false)
    }
  }

  async function onSubmit(data: ProtocolFormData) {
    if (attendees.length === 0) {
      toast.error(t('attendeesRequiredToast'))
      return
    }

    setIsSubmitting(true)

    try {
      const year = new Date(data.protocol_date).getFullYear()

      const response = await fetch(`/api/protocols/${protocolId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          attendees,
          year
        })
      })

      const result = await response.json()

      if (result.success) {
        clearDraft() // Clear draft on successful save
        toast.success(t('edit.toastUpdated'))
        router.push(`/${locale}/protocols/${protocolId}`)
      } else {
        toast.error(result.error || t('edit.toastUpdateError'))
      }
    } catch (error) {
      console.error('Error updating protocol:', error)
      toast.error(t('edit.toastUpdateError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title={t('edit.title')} backHref="/admin/more" />
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="h-64 rounded bg-gray-200"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader title={t('edit.title')} subtitle={t('edit.subtitle')} backHref="/admin/more" />

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
        {/* Basic Information */}
        <AdminFormSection title={t('detailsTitle')} description={t('detailsDescription')}>
          <div>
            <Label htmlFor="title">{t('titleLabel')}</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder={t('titlePlaceholder')}
              className={`h-11 ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="protocol_date">{t('dateLabel')}</Label>
              <Input
                id="protocol_date"
                type="date"
                {...register('protocol_date')}
                className={`h-11 ${errors.protocol_date ? 'border-red-500' : ''}`}
              />
              {errors.protocol_date && (
                <p className="mt-1 text-sm text-red-500">{errors.protocol_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">{t('typeLabel')}</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setValue('categories', [value])}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryValues.map(value => (
                    <SelectItem key={value} value={value}>
                      {t(`type.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
            <div>
              <Label htmlFor="is_public">{t('publicLabel')}</Label>
              <p className="text-sm text-muted-foreground">{t('publicHint')}</p>
            </div>
            <Switch
              id="is_public"
              checked={isPublic}
              onCheckedChange={(checked) => setValue('is_public', checked)}
            />
          </div>
        </AdminFormSection>

        {/* Attendees */}
        <AdminFormSection title={t('attendeesTitle')} description={t('attendeesDescription')}>
          <div className="flex gap-2">
            <Input
              placeholder={t('attendeePlaceholder')}
              value={attendeeInput}
              onChange={(e) => setAttendeeInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addAttendee()
                }
              }}
              className="h-11"
            />
            <Button
              type="button"
              onClick={addAttendee}
              variant="outline"
              className="h-11 flex-none"
            >
              <Plus className="me-1 h-4 w-4" aria-hidden="true" />
              {t('addAttendee')}
            </Button>
          </div>

          {attendees.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attendees.map((attendee, index) => (
                <div
                  key={index}
                  className="flex items-center rounded-lg bg-secondary ps-3"
                >
                  <span className="text-sm">{attendee}</span>
                  <button
                    type="button"
                    onClick={() => removeAttendee(index)}
                    aria-label={t('removeAttendee')}
                    className="flex h-11 w-11 items-center justify-center hover:text-destructive"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {errors.attendees && (
            <p className="text-sm text-red-500">{errors.attendees.message}</p>
          )}
        </AdminFormSection>

        {/* Meeting Content */}
        <AdminFormSection title={t('contentTitle')} description={t('contentDescription')}>
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <Label htmlFor="agenda">{t('agendaLabel')}</Label>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <AiFormatButton
                  value={watch('agenda') || ''}
                  onChange={(value) => setValue('agenda', value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTaskDrawerOpen(true)}
                  className="min-h-[44px] gap-2"
                >
                  <ClipboardList className="h-4 w-4" aria-hidden="true" />
                  {t('viewTasks')}
                </Button>
              </div>
            </div>
            <ExpandableTaskMentionTextarea
              id="agenda"
              label={t('agendaLabel')}
              value={watch('agenda') || ''}
              onChange={(value) => setValue('agenda', value)}
              placeholder={t('agendaPlaceholder')}
              rows={4}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <Label htmlFor="decisions">{t('decisionsLabel')}</Label>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <AiFormatButton
                  value={watch('decisions') || ''}
                  onChange={(value) => setValue('decisions', value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTaskDrawerOpen(true)}
                  className="min-h-[44px] gap-2"
                >
                  <ClipboardList className="h-4 w-4" aria-hidden="true" />
                  {t('viewTasks')}
                </Button>
              </div>
            </div>
            <ExpandableTaskMentionTextarea
              id="decisions"
              label={t('decisionsLabel')}
              value={watch('decisions') || ''}
              onChange={(value) => setValue('decisions', value)}
              placeholder={t('decisionsPlaceholder')}
              rows={4}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <Label htmlFor="action_items">{t('actionItemsLabel')}</Label>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <AiFormatButton
                  value={watch('action_items') || ''}
                  onChange={(value) => setValue('action_items', value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTaskDrawerOpen(true)}
                  className="min-h-[44px] gap-2"
                >
                  <ClipboardList className="h-4 w-4" aria-hidden="true" />
                  {t('viewTasks')}
                </Button>
              </div>
            </div>
            <ExpandableTaskMentionTextarea
              id="action_items"
              label={t('actionItemsLabel')}
              value={watch('action_items') || ''}
              onChange={(value) => setValue('action_items', value)}
              placeholder={t('actionItemsPlaceholder')}
              rows={4}
            />
          </div>
          <p className="text-xs text-muted-foreground">{t('tasksHint')}</p>

          <div>
            <Label htmlFor="extracted_text">{t('edit.htmlLabel')}</Label>
            <ExpandableTextarea
              id="extracted_text"
              label={t('edit.htmlLabel')}
              value={watch('extracted_text') || ''}
              onChange={(e) => setValue('extracted_text', e.target.value)}
              placeholder={t('edit.htmlPlaceholder')}
              minRows={8}
              maxRows={30}
              className="font-mono text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">{t('edit.htmlHint')}</p>
          </div>
        </AdminFormSection>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {/* Draft Save Indicator */}
          <div className="flex items-center justify-start">
            <DraftSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || isDeleting}
            className="h-11 w-full bg-[#003153] text-white hover:bg-[#003153]/90"
          >
            {isSubmitting ? (
              <>{tc('loading')}</>
            ) : (
              <>
                <Save className="me-2 h-4 w-4" aria-hidden="true" />
                {t('edit.submit')}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting || isDeleting}
            className="h-11 w-full"
          >
            {tc('cancel')}
          </Button>

          {/* Delete Button */}
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting || isSubmitting}
            className="mt-2 h-11 w-full"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="me-2 h-4 w-4" aria-hidden="true" />
            {t('edit.deleteButton')}
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('edit.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              {t('edit.deleteText', { title: protocolTitle })}
              <br />
              {t('edit.deleteNoUndo')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              {tc('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? t('edit.deleting') : tc('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Task Drawer */}
      <TaskDrawer
        isOpen={taskDrawerOpen}
        onClose={() => setTaskDrawerOpen(false)}
      />
    </div>
  )
}
