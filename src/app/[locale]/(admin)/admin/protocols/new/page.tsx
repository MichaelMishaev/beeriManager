'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Plus, X, ClipboardList } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { AdminFormSection, AdminPageHeader, AiFormatButton } from '@/components/features/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import FileUpload from '@/components/upload/FileUpload'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import TaskDrawer from '@/components/protocols/TaskDrawer'
import TaskMentionTextarea from '@/components/protocols/TaskMentionTextarea'
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
    meeting_date: z.string().min(1, messages.dateRequired),
    protocol_type: z.enum(['regular', 'special', 'annual', 'emergency']),
    attendees: z.array(z.string()).min(1, messages.attendeesMin),
    agenda: z.string().optional(),
    decisions: z.string().optional(),
    action_items: z.string().optional(),
    document_url: z.string().optional(),
    attachment_urls: z.array(z.string()).optional(),
    is_public: z.boolean(),
    approved: z.boolean()
  })
}

type ProtocolFormData = z.infer<ReturnType<typeof createProtocolSchema>>

const protocolTypeValues = ['regular', 'special', 'annual', 'emergency'] as const

export default function NewProtocolPage() {
  const t = useTranslations('admin.records.protocols')
  const tc = useTranslations('admin.common')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attendeeInput, setAttendeeInput] = useState('')
  const [attendees, setAttendees] = useState<string[]>([])
  const [formattedHTML, setFormattedHTML] = useState('')
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false)
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
      protocol_type: 'regular',
      attendees: [],
      is_public: true,
      approved: false,
      attachment_urls: []
    }
  })

  const isPublic = watch('is_public')
  const approved = watch('approved')

  // Draft management
  const { saveDraft, restoreDraft, clearDraft, hasDraft, draftTimestamp } = useFormDraft<ProtocolFormData>({
    formType: 'protocol',
    action: 'new'
  })

  // Auto-save
  const formData = watch()
  const { lastSaved, isSaving } = useAutoSave({
    data: { ...formData, attendees, formattedHTML },
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
      const draftData = draft as Record<string, unknown>
      Object.keys(draftData).forEach((key) => {
        if (key === 'attendees') {
          setAttendees(draftData[key] as string[])
        } else if (key === 'formattedHTML') {
          setFormattedHTML(draftData[key] as string)
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

  async function onSubmit(data: ProtocolFormData) {
    if (attendees.length === 0) {
      toast.error(t('attendeesRequiredToast'))
      return
    }

    setIsSubmitting(true)

    try {
      const protocolData = {
        ...data,
        attendees,
        extracted_text: formattedHTML
      }

      const response = await fetch('/api/protocols', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(protocolData)
      })

      const result = await response.json()

      if (result.success) {
        clearDraft() // Clear draft on successful save
        toast.success(t('new.toastCreated'))
        router.push('/protocols')
      } else {
        toast.error(result.error || t('new.toastCreateError'))
      }
    } catch (error) {
      console.error('Error creating protocol:', error)
      toast.error(t('new.toastCreateError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader title={t('new.title')} subtitle={t('new.subtitle')} backHref="/admin/more" />

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
              <Label htmlFor="meeting_date">{t('dateLabel')}</Label>
              <Input
                id="meeting_date"
                type="date"
                {...register('meeting_date')}
                className={`h-11 ${errors.meeting_date ? 'border-red-500' : ''}`}
              />
              {errors.meeting_date && (
                <p className="mt-1 text-sm text-red-500">{errors.meeting_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="protocol_type">{t('typeLabel')}</Label>
              <Select
                onValueChange={(value) => setValue('protocol_type', value as ProtocolFormData['protocol_type'])}
                defaultValue="regular"
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {protocolTypeValues.map(value => (
                    <SelectItem key={value} value={value}>
                      {t(`type.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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

            <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
              <div>
                <Label htmlFor="approved">{t('approvedLabel')}</Label>
                <p className="text-sm text-muted-foreground">{t('approvedHint')}</p>
              </div>
              <Switch
                id="approved"
                checked={approved}
                onCheckedChange={(checked) => setValue('approved', checked)}
              />
            </div>
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
            <TaskMentionTextarea
              id="agenda"
              value={watch('agenda') || ''}
              onChange={(value) => setValue('agenda', value)}
              placeholder={t('agendaPlaceholder')}
              rows={8}
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
            <TaskMentionTextarea
              id="decisions"
              value={watch('decisions') || ''}
              onChange={(value) => setValue('decisions', value)}
              placeholder={t('decisionsPlaceholder')}
              rows={8}
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
            <TaskMentionTextarea
              id="action_items"
              value={watch('action_items') || ''}
              onChange={(value) => setValue('action_items', value)}
              placeholder={t('actionItemsPlaceholder')}
              rows={8}
            />
          </div>
          <p className="text-xs text-muted-foreground">{t('tasksHint')}</p>
        </AdminFormSection>

        {/* Documents */}
        <AdminFormSection title={t('documentsTitle')} description={t('documentsDescription')}>
          <div>
            <Label>{t('mainFileLabel')}</Label>
            <FileUpload
              value={watch('document_url') || ''}
              onChange={(fileName, html) => {
                setValue('document_url', fileName as string)
                if (html) setFormattedHTML(html)
              }}
              multiple={false}
              accept=".pdf,.doc,.docx"
              maxSize={10}
              bucket="protocols"
            />
          </div>

          <div>
            <Label>{t('extraFilesLabel')}</Label>
            <FileUpload
              value={watch('attachment_urls') || []}
              onChange={(fileName, html) => {
                setValue('attachment_urls', [fileName] as string[])
                if (html) setFormattedHTML(prev => prev ? `${prev}\n\n${html}` : html)
              }}
              multiple={true}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              maxSize={10}
              bucket="protocols"
            />
          </div>
        </AdminFormSection>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full bg-[#003153] text-white hover:bg-[#003153]/90"
          >
            {isSubmitting ? (
              <>{tc('loading')}</>
            ) : (
              <>
                <Save className="me-2 h-4 w-4" aria-hidden="true" />
                {t('new.submit')}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="h-11 w-full"
          >
            {tc('cancel')}
          </Button>
        </div>

        {/* Draft Save Indicator */}
        <div className="flex items-center justify-start">
          <DraftSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
        </div>
      </form>

      {/* Task Drawer */}
      <TaskDrawer
        isOpen={taskDrawerOpen}
        onClose={() => setTaskDrawerOpen(false)}
      />
    </div>
  )
}
