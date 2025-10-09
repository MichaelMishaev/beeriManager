'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Ticket } from '@/types'

const TicketFormSchema = z.object({
  title: z.string().min(1, 'כותרת היא שדה חובה'),
  description: z.string().optional(),
  event_type: z.enum(['sport', 'theater', 'concert', 'other']),
  sport_type: z.string().optional(),
  team_home: z.string().optional(),
  team_away: z.string().optional(),
  venue: z.string().optional(),
  event_date: z.string().optional(),
  image_url: z.string().url('כתובת תמונה לא תקינה').optional().or(z.literal('')),
  purchase_url: z.string().url('כתובת קניה לא תקינה').optional().or(z.literal('')),
  quantity_available: z.number().int().min(0).optional().nullable(),
  quantity_sold: z.number().int().min(0).default(0),
  price_per_ticket: z.number().min(0).optional().nullable(),
  status: z.enum(['active', 'sold_out', 'expired', 'draft', 'finished']),
  featured: z.boolean().default(false),
  display_order: z.number().int().default(0)
})

type TicketFormData = z.infer<typeof TicketFormSchema>

interface TicketFormProps {
  ticket?: Ticket
  onSubmit: (data: TicketFormData) => Promise<void>
  isSubmitting?: boolean
}

export function TicketForm({ ticket, onSubmit, isSubmitting }: TicketFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<TicketFormData>({
    resolver: zodResolver(TicketFormSchema),
    defaultValues: ticket ? {
      ...ticket,
      quantity_available: ticket.quantity_available ?? undefined,
      price_per_ticket: ticket.price_per_ticket ?? undefined
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>מידע בסיסי</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">כותרת *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="לדוגמה: כרטיסים למשחק מכבי תל אביב"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">תיאור</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="פרטים נוספים על האירוע..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="event_type">סוג אירוע *</Label>
            <Select
              value={eventType}
              onValueChange={(value) => setValue('event_type', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sport">ספורט</SelectItem>
                <SelectItem value="theater">תיאטרון</SelectItem>
                <SelectItem value="concert">קונצרט</SelectItem>
                <SelectItem value="other">אחר</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Details */}
      <Card>
        <CardHeader>
          <CardTitle>פרטי כרטיס</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="purchase_url">קישור לקניה/הרשמה</Label>
            <Input
              id="purchase_url"
              {...register('purchase_url')}
              placeholder="https://example.com/tickets"
              type="url"
            />
            {errors.purchase_url && (
              <p className="text-sm text-destructive mt-1">{errors.purchase_url.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity_available">כמות זמינה</Label>
              <Input
                id="quantity_available"
                type="number"
                {...register('quantity_available', {
                  setValueAs: (v) => v === '' ? null : parseInt(v)
                })}
                placeholder="השאר ריק ללא הגבלה"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                השאר ריק אם אין הגבלת כמות
              </p>
            </div>

            <div>
              <Label htmlFor="quantity_sold">כמות שנמכרה</Label>
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

        </CardContent>
      </Card>

      {/* Status & Display */}
      <Card>
        <CardHeader>
          <CardTitle>סטטוס ותצוגה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="status">סטטוס *</Label>
            <Select
              value={watch('status')}
              onValueChange={(value) => setValue('status', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">טיוטה</SelectItem>
                <SelectItem value="active">פעיל</SelectItem>
                <SelectItem value="sold_out">אזל מהמלאי</SelectItem>
                <SelectItem value="expired">פג תוקף</SelectItem>
                <SelectItem value="finished">אזל מהתקף</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="featured"
              checked={watch('featured')}
              onCheckedChange={(checked) => setValue('featured', checked as boolean)}
            />
            <Label htmlFor="featured" className="cursor-pointer">
              הצג כמומלץ בעמוד הבית
            </Label>
          </div>

          <div>
            <Label htmlFor="display_order">סדר תצוגה</Label>
            <Input
              id="display_order"
              type="number"
              {...register('display_order', {
                setValueAs: (v) => parseInt(v)
              })}
              min="0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              מספר נמוך יותר = יופיע ראשון
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'שומר...' : ticket ? 'עדכן כרטיס' : 'צור כרטיס'}
        </Button>
      </div>
    </form>
  )
}
