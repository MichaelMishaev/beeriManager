'use client'

import { useState, useEffect, useMemo } from 'react'
import { MapPin, Save, Trash2, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { AdminFormSection, AdminPageHeader } from '@/components/features/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'

function createEventSchema(messages: {
  titleMin: string
  startDateRequired: string
  startTimeRequired: string
}) {
  return z.object({
    title: z.string().min(2, messages.titleMin),
    title_ru: z.string().optional(),
    description: z.string().optional(),
    description_ru: z.string().optional(),
    event_type: z.enum(['general', 'meeting', 'fundraiser', 'trip', 'workshop']),
    priority: z.enum(['low', 'normal', 'high', 'urgent']),
    status: z.enum(['draft', 'published', 'cancelled']),
    location: z.string().optional(),
    location_ru: z.string().optional(),
    start_date: z.string().min(1, messages.startDateRequired),
    start_time: z.string().min(1, messages.startTimeRequired),
    end_date: z.string().optional(),
    end_time: z.string().optional(),
    registration_enabled: z.boolean(),
    max_attendees: z.string().optional(),
    registration_deadline_date: z.string().optional(),
    registration_deadline_time: z.string().optional(),
    requires_payment: z.boolean(),
    payment_amount: z.string().optional(),
    budget_allocated: z.string().optional()
  })
}

type EventFormData = z.infer<ReturnType<typeof createEventSchema>>

export default function EditEventPage({ params }: { params: { id: string } }) {
  const t = useTranslations('admin.events')
  const tc = useTranslations('admin.common')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const eventSchema = useMemo(
    () =>
      createEventSchema({
        titleMin: t('form.validation.titleMin'),
        startDateRequired: t('form.validation.startDateRequired'),
        startTimeRequired: t('form.validation.startTimeRequired')
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
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema)
  })

  const registrationEnabled = watch('registration_enabled')
  const requiresPayment = watch('requires_payment')

  useEffect(() => {
    fetchEvent()
  }, [params.id])

  async function fetchEvent() {
    try {
      const response = await fetch(`/api/events/${params.id}`)
      const data = await response.json()

      if (data.success) {
        const event = data.data

        // Format dates for input fields
        const startDate = new Date(event.start_datetime)
        const endDate = event.end_datetime ? new Date(event.end_datetime) : null
        const regDeadline = event.registration_deadline ? new Date(event.registration_deadline) : null

        reset({
          title: event.title,
          title_ru: event.title_ru || '',
          description: event.description || '',
          description_ru: event.description_ru || '',
          event_type: event.event_type,
          priority: event.priority,
          status: event.status,
          location: event.location || '',
          location_ru: event.location_ru || '',
          start_date: format(startDate, 'yyyy-MM-dd'),
          start_time: format(startDate, 'HH:mm'),
          end_date: endDate ? format(endDate, 'yyyy-MM-dd') : '',
          end_time: endDate ? format(endDate, 'HH:mm') : '',
          registration_enabled: event.registration_enabled,
          max_attendees: event.max_attendees?.toString() || '',
          registration_deadline_date: regDeadline ? format(regDeadline, 'yyyy-MM-dd') : '',
          registration_deadline_time: regDeadline ? format(regDeadline, 'HH:mm') : '',
          requires_payment: event.requires_payment,
          payment_amount: event.payment_amount?.toString() || '',
          budget_allocated: event.budget_allocated?.toString() || ''
        })
      } else {
        toast.error(t('edit.toast.loadFailed'))
        router.push('/admin/events')
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error(t('edit.toast.loadFailed'))
      router.push('/admin/events')
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(data: EventFormData) {
    setIsSubmitting(true)

    try {
      // Combine date and time fields
      const startDateTime = new Date(`${data.start_date}T${data.start_time}`).toISOString()
      const endDateTime = data.end_date && data.end_time
        ? new Date(`${data.end_date}T${data.end_time}`).toISOString()
        : null
      const registrationDeadline = data.registration_deadline_date && data.registration_deadline_time
        ? new Date(`${data.registration_deadline_date}T${data.registration_deadline_time}`).toISOString()
        : null

      const eventData = {
        title: data.title,
        title_ru: data.title_ru || null,
        description: data.description,
        description_ru: data.description_ru || null,
        event_type: data.event_type,
        priority: data.priority,
        status: data.status,
        location: data.location,
        location_ru: data.location_ru || null,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        registration_enabled: data.registration_enabled,
        max_attendees: data.max_attendees ? parseInt(data.max_attendees) : null,
        registration_deadline: registrationDeadline,
        requires_payment: data.requires_payment,
        payment_amount: data.payment_amount ? parseFloat(data.payment_amount) : null,
        budget_allocated: data.budget_allocated ? parseFloat(data.budget_allocated) : null
      }

      const response = await fetch(`/api/events/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      })

      const result = await response.json()

      if (result.success) {
        toast.success(t('edit.toast.updated'))
        router.push('/admin/events')
      } else {
        toast.error(result.error || t('edit.toast.updateFailed'))
      }
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error(t('edit.toast.updateFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!confirm(t('edit.confirmDelete'))) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/events/${params.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.success(t('edit.toast.deleted'))
        router.push('/admin/events')
      } else {
        toast.error(result.error || t('edit.toast.deleteFailed'))
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error(t('edit.toast.deleteFailed'))
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#0D98BA]" aria-hidden="true" />
          <p className="text-muted-foreground">{t('edit.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AdminPageHeader
        title={t('edit.title')}
        subtitle={t('edit.subtitle')}
        backHref="/admin/events"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Information */}
        <AdminFormSection
          title={t('form.sections.basic.title')}
          description={t('form.sections.basic.description')}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="title">{t('edit.titleLabel')}</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder={t('form.titlePlaceholder')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="title_ru">{t('edit.titleRuLabel')}</Label>
              <Input
                id="title_ru"
                {...register('title_ru')}
                placeholder={t('edit.titleRuPlaceholder')}
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">{t('edit.ruOptionalHint')}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="description">{t('edit.descriptionLabel')}</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder={t('form.descriptionPlaceholder')}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="description_ru">{t('edit.descriptionRuLabel')}</Label>
              <Textarea
                id="description_ru"
                {...register('description_ru')}
                placeholder={t('edit.descriptionRuPlaceholder')}
                rows={4}
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">{t('edit.ruOptionalHint')}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="event_type">{t('form.eventType.label')}</Label>
              <Select
                onValueChange={(value) => setValue('event_type', value as EventFormData['event_type'])}
                value={watch('event_type')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{t('form.eventType.general')}</SelectItem>
                  <SelectItem value="meeting">{t('form.eventType.meeting')}</SelectItem>
                  <SelectItem value="fundraiser">{t('form.eventType.fundraiser')}</SelectItem>
                  <SelectItem value="trip">{t('form.eventType.trip')}</SelectItem>
                  <SelectItem value="workshop">{t('form.eventType.workshop')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">{t('form.priority.label')}</Label>
              <Select
                onValueChange={(value) => setValue('priority', value as EventFormData['priority'])}
                value={watch('priority')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('form.priority.low')}</SelectItem>
                  <SelectItem value="normal">{t('form.priority.normal')}</SelectItem>
                  <SelectItem value="high">{t('form.priority.high')}</SelectItem>
                  <SelectItem value="urgent">{t('form.priority.urgent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">{t('form.statusLabel')}</Label>
              <Select
                onValueChange={(value) => setValue('status', value as EventFormData['status'])}
                value={watch('status')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t('edit.status.draft')}</SelectItem>
                  <SelectItem value="published">{t('edit.status.published')}</SelectItem>
                  <SelectItem value="cancelled">{t('edit.status.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </AdminFormSection>

        {/* Date, Time & Location */}
        <AdminFormSection
          title={t('form.sections.timeLocation.title')}
          description={t('form.sections.timeLocation.description')}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {t('edit.locationLabel')}
              </Label>
              <Input
                id="location"
                {...register('location')}
                placeholder={t('form.locationPlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="location_ru" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {t('edit.locationRuLabel')}
              </Label>
              <Input
                id="location_ru"
                {...register('location_ru')}
                placeholder={t('edit.locationRuPlaceholder')}
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">{t('edit.ruOptionalHint')}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="start_date">{t('form.startDate')}</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
                className={errors.start_date ? 'border-red-500' : ''}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500 mt-1">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="start_time">{t('edit.startTimeLabel')}</Label>
              <Input
                id="start_time"
                type="time"
                {...register('start_time')}
                className={errors.start_time ? 'border-red-500' : ''}
              />
              {errors.start_time && (
                <p className="text-sm text-red-500 mt-1">{errors.start_time.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="end_date">{t('form.endDate')}</Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
              />
            </div>

            <div>
              <Label htmlFor="end_time">{t('form.endTime')}</Label>
              <Input
                id="end_time"
                type="time"
                {...register('end_time')}
              />
            </div>
          </div>
        </AdminFormSection>

        {/* Registration Settings */}
        <AdminFormSection
          title={t('form.sections.registration.title')}
          description={t('form.sections.registration.description')}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label htmlFor="registration_enabled">{t('form.registrationEnabled')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('form.registrationEnabledHint')}
              </p>
            </div>
            <Switch
              id="registration_enabled"
              checked={registrationEnabled}
              onCheckedChange={(checked) => setValue('registration_enabled', checked)}
            />
          </div>

          {registrationEnabled && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="max_attendees">{t('form.maxAttendees')}</Label>
                  <Input
                    id="max_attendees"
                    type="number"
                    {...register('max_attendees')}
                    placeholder={t('form.maxAttendeesPlaceholder')}
                  />
                </div>

                <div className="grid gap-2 grid-cols-2">
                  <div>
                    <Label htmlFor="registration_deadline_date">{t('form.deadlineDate')}</Label>
                    <Input
                      id="registration_deadline_date"
                      type="date"
                      {...register('registration_deadline_date')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="registration_deadline_time">{t('form.deadlineTime')}</Label>
                    <Input
                      id="registration_deadline_time"
                      type="time"
                      {...register('registration_deadline_time')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="requires_payment">{t('form.requiresPayment')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('form.requiresPaymentHint')}
                  </p>
                </div>
                <Switch
                  id="requires_payment"
                  checked={requiresPayment}
                  onCheckedChange={(checked) => setValue('requires_payment', checked)}
                />
              </div>

              {requiresPayment && (
                <div>
                  <Label htmlFor="payment_amount">{t('form.paymentAmount')}</Label>
                  <Input
                    id="payment_amount"
                    type="number"
                    step="0.01"
                    {...register('payment_amount')}
                    placeholder="0.00"
                  />
                </div>
              )}
            </>
          )}
        </AdminFormSection>

        {/* Budget */}
        <AdminFormSection
          title={t('form.sections.budget.title')}
          description={t('form.sections.budget.description')}
        >
          <div>
            <Label htmlFor="budget_allocated">{t('form.budgetAllocated')}</Label>
            <Input
              id="budget_allocated"
              type="number"
              step="0.01"
              {...register('budget_allocated')}
              placeholder="0.00"
            />
          </div>
        </AdminFormSection>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full bg-[#003153] hover:bg-[#003153]/90"
          >
            {isSubmitting ? (
              <>{tc('loading')}</>
            ) : (
              <>
                <Save className="h-4 w-4 me-2" aria-hidden="true" />
                {t('edit.submit')}
              </>
            )}
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-11 flex-1"
            >
              {isDeleting ? (
                <>{t('edit.deleting')}</>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 me-2" aria-hidden="true" />
                  {t('edit.delete')}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="h-11 flex-1"
            >
              {tc('cancel')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
