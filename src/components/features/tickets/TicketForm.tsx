'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { AdminFormSection } from '@/components/features/admin'
import type { Ticket } from '@/types'

type Translate = (key: string) => string

function createTicketFormSchema(t: Translate) {
  return z.object({
    title: z.string().min(1, t('form.validation.titleRequired')),
    description: z.string().optional(),
    event_type: z.enum(['sport', 'theater', 'concert', 'other']),
    sport_type: z.string().optional(),
    team_home: z.string().optional(),
    team_away: z.string().optional(),
    venue: z.string().optional(),
    event_date: z.string().optional(),
    image_url: z.string().url(t('form.validation.imageUrlInvalid')).optional().or(z.literal('')),
    purchase_url: z.string().url(t('form.validation.purchaseUrlInvalid')).optional().or(z.literal('')),
    quantity_available: z.number().int().min(0).optional().nullable(),
    quantity_sold: z.number().int().min(0).default(0),
    price_per_ticket: z.number().min(0).optional().nullable(),
    status: z.enum(['active', 'sold_out', 'expired', 'draft', 'finished']),
    featured: z.boolean().default(false),
    display_order: z.number().int().default(0)
  })
}

export type TicketFormData = z.infer<ReturnType<typeof createTicketFormSchema>>

interface TicketFormProps {
  ticket?: Ticket
  onSubmit: (data: TicketFormData) => Promise<void>
  isSubmitting?: boolean
}

const EVENT_TYPES = ['sport', 'theater', 'concert', 'other'] as const
const STATUSES = ['draft', 'active', 'sold_out', 'expired', 'finished'] as const

export function TicketForm({ ticket, onSubmit, isSubmitting }: TicketFormProps) {
  const t = useTranslations('admin.tickets')
  const schema = useMemo(() => createTicketFormSchema((key) => t(key)), [t])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<TicketFormData>({
    resolver: zodResolver(schema),
    // The database returns null for empty columns, but the schema accepts only a value or
    // undefined. Passing nulls through made validation fail silently on fields with no input.
    defaultValues: ticket ? {
      title: ticket.title,
      description: ticket.description ?? '',
      event_type: ticket.event_type,
      sport_type: ticket.sport_type ?? undefined,
      team_home: ticket.team_home ?? undefined,
      team_away: ticket.team_away ?? undefined,
      venue: ticket.venue ?? undefined,
      event_date: ticket.event_date ?? undefined,
      image_url: ticket.image_url ?? undefined,
      purchase_url: ticket.purchase_url ?? '',
      quantity_available: ticket.quantity_available ?? undefined,
      quantity_sold: ticket.quantity_sold ?? 0,
      price_per_ticket: ticket.price_per_ticket ?? undefined,
      status: ticket.status,
      featured: ticket.featured ?? false,
      display_order: ticket.display_order ?? 0
    } : {
      status: 'active',
      event_type: 'sport',
      featured: false,
      display_order: 0,
      quantity_sold: 0
    }
  })

  const eventType = watch('event_type')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Basic Info */}
      <AdminFormSection title={t('form.basicInfo')}>
        <div>
          <Label htmlFor="title">{t('form.title')}</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder={t('form.titlePlaceholder')}
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">{t('form.description')}</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder={t('form.descriptionPlaceholder')}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="event_type">{t('form.eventType')}</Label>
          <Select
            value={eventType}
            onValueChange={(value) => setValue('event_type', value as TicketFormData['event_type'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`form.eventTypes.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </AdminFormSection>

      {/* Ticket Details */}
      <AdminFormSection title={t('form.ticketDetails')}>
        <div>
          <Label htmlFor="purchase_url">{t('form.purchaseUrl')}</Label>
          <Input
            id="purchase_url"
            {...register('purchase_url')}
            placeholder="https://example.com/tickets"
            type="url"
            dir="ltr"
          />
          {errors.purchase_url && (
            <p className="text-sm text-destructive mt-1">{errors.purchase_url.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="quantity_available">{t('form.quantityAvailable')}</Label>
            <Input
              id="quantity_available"
              type="number"
              {...register('quantity_available', {
                setValueAs: (v) => v === '' ? null : parseInt(v)
              })}
              placeholder={t('form.quantityAvailablePlaceholder')}
              min="0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('form.quantityAvailableHint')}
            </p>
          </div>

          <div>
            <Label htmlFor="quantity_sold">{t('form.quantitySold')}</Label>
            <Input
              id="quantity_sold"
              type="number"
              {...register('quantity_sold', {
                setValueAs: (v) => parseInt(v)
              })}
              min="0"
            />
          </div>
        </div>
      </AdminFormSection>

      {/* Status & Display */}
      <AdminFormSection title={t('form.statusAndDisplay')}>
        <div>
          <Label htmlFor="status">{t('form.status')}</Label>
          <Select
            value={watch('status')}
            onValueChange={(value) => setValue('status', value as TicketFormData['status'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`form.statusOptions.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="featured"
            checked={watch('featured')}
            onCheckedChange={(checked) => setValue('featured', checked as boolean)}
          />
          <Label htmlFor="featured" className="cursor-pointer">
            {t('form.featured')}
          </Label>
        </div>

        <div>
          <Label htmlFor="display_order">{t('form.displayOrder')}</Label>
          <Input
            id="display_order"
            type="number"
            {...register('display_order', {
              setValueAs: (v) => parseInt(v)
            })}
            min="0"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {t('form.displayOrderHint')}
          </p>
        </div>
      </AdminFormSection>

      {/* Submit */}
      <Button type="submit" disabled={isSubmitting} className="min-h-[44px] w-full">
        {isSubmitting ? t('form.submitting') : ticket ? t('form.submitUpdate') : t('form.submitCreate')}
      </Button>
    </form>
  )
}
