'use client'

import { useMemo, useState } from 'react'
import { MapPin, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { AdminFormSection, AdminPageHeader } from '@/components/features/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { CreatorPhoneInput } from '@/components/features/events/CreatorPhoneInput'
import { useRouter } from '@/i18n/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

function createEventSchema(messages: { titleMin: string; startDateRequired: string }) {
  return z.object({
    title: z.string().min(2, messages.titleMin),
    description: z.string().optional(),
    event_type: z.enum(['general', 'meeting', 'fundraiser', 'trip', 'workshop']),
    priority: z.enum(['low', 'normal', 'high', 'urgent']),
    status: z.enum(['draft', 'published', 'cancelled']),
    location: z.string().optional(),
    start_date: z.string().min(1, messages.startDateRequired),
    start_time: z.string().optional(),
    end_date: z.string().optional(),
    end_time: z.string().optional(),
    registration_enabled: z.boolean(),
    max_attendees: z.string().optional(),
    registration_deadline_date: z.string().optional(),
    registration_deadline_time: z.string().optional(),
    requires_payment: z.boolean(),
    payment_amount: z.string().optional(),
    budget_allocated: z.string().optional(),
    creator_phone: z.string().optional()
  })
}

type EventFormData = z.infer<ReturnType<typeof createEventSchema>>

export default function NewEventPage() {
  const t = useTranslations('admin.events')
  const tc = useTranslations('admin.common')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const eventSchema = useMemo(
    () =>
      createEventSchema({
        titleMin: t('form.validation.titleMin'),
        startDateRequired: t('form.validation.startDateRequired')
      }),
    [t]
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      event_type: 'general',
      priority: 'normal',
      status: 'draft',
      registration_enabled: false,
      requires_payment: false
    }
  })

  const registrationEnabled = watch('registration_enabled')
  const requiresPayment = watch('requires_payment')

  async function onSubmit(data: EventFormData) {
    setIsSubmitting(true)

    try {
      // Combine date and time fields
      // If no time provided, use 00:00 (midnight) for all-day events
      const startTime = data.start_time || '00:00'
      const startDateTime = new Date(`${data.start_date}T${startTime}`).toISOString()

      // If no end date, use start date for one-day events
      let endDateTime = null
      if (data.end_date || data.end_time) {
        const endDate = data.end_date || data.start_date
        const endTime = data.end_time || '23:59'
        endDateTime = new Date(`${endDate}T${endTime}`).toISOString()
      }

      const registrationDeadline = data.registration_deadline_date && data.registration_deadline_time
        ? new Date(`${data.registration_deadline_date}T${data.registration_deadline_time}`).toISOString()
        : null

      const eventData = {
        title: data.title,
        description: data.description,
        event_type: data.event_type,
        priority: data.priority,
        status: data.status,
        location: data.location,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        registration_enabled: data.registration_enabled,
        max_attendees: data.max_attendees ? parseInt(data.max_attendees) : null,
        registration_deadline: registrationDeadline,
        requires_payment: data.requires_payment,
        payment_amount: data.payment_amount ? parseFloat(data.payment_amount) : null,
        budget_allocated: data.budget_allocated ? parseFloat(data.budget_allocated) : null,
        creator_phone: data.creator_phone?.replace(/\D/g, '') || null
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      })

      const result = await response.json()

      if (result.success) {
        toast.success(t('new.toast.created'))
        router.push('/admin/events')
      } else {
        console.error('API Error:', result)
        toast.error(result.error || t('new.toast.createFailed'))
        if (result.details) {
          console.error('Validation errors:', result.details)
        }
      }
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error(t('new.toast.createFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title={t('new.title')}
        subtitle={t('new.subtitle')}
        backHref="/admin/events"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Information */}
        <AdminFormSection
          title={t('form.sections.basic.title')}
          description={t('form.sections.basic.description')}
        >
          <div>
            <Label htmlFor="title">{t('new.titleLabel')}</Label>
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
            <Label htmlFor="description">{t('new.descriptionLabel')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('form.descriptionPlaceholder')}
              rows={4}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="event_type">{t('form.eventType.label')}</Label>
              <Select
                onValueChange={(value) => setValue('event_type', value as EventFormData['event_type'])}
                defaultValue="general"
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
                defaultValue="normal"
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
          </div>

          <div>
            <Label htmlFor="status">{t('form.statusLabel')}</Label>
            <Select
              onValueChange={(value) => setValue('status', value as EventFormData['status'])}
              defaultValue="draft"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{t('new.status.draft')}</SelectItem>
                <SelectItem value="published">{t('new.status.published')}</SelectItem>
                <SelectItem value="cancelled">{t('new.status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">{t('new.status.hint')}</p>
          </div>
        </AdminFormSection>

        {/* Creator Phone */}
        <AdminFormSection
          title={t('form.sections.creator.title')}
          description={t('form.sections.creator.description')}
        >
          <CreatorPhoneInput
            value={watch('creator_phone') || ''}
            onChange={(value) => setValue('creator_phone', value)}
          />
        </AdminFormSection>

        {/* Date, Time & Location */}
        <AdminFormSection
          title={t('form.sections.timeLocation.title')}
          description={t('form.sections.timeLocation.description')}
        >
          <div>
            <Label htmlFor="location">{t('new.locationLabel')}</Label>
            <div className="relative">
              <MapPin className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="location"
                {...register('location')}
                placeholder={t('form.locationPlaceholder')}
                className="ps-10"
              />
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
              <Label htmlFor="start_time">{t('new.startTimeLabel')}</Label>
              <Input
                id="start_time"
                type="time"
                {...register('start_time')}
                placeholder={t('new.startTimePlaceholder')}
                className={errors.start_time ? 'border-red-500' : ''}
              />
              {errors.start_time && (
                <p className="text-sm text-red-500 mt-1">{errors.start_time.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{t('new.startTimeHint')}</p>
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
      </form>
    </div>
  )
}
