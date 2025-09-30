'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarIcon, MapPin, Users, DollarSign, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { EVENT_TYPES, PRIORITY_LEVELS } from '@/lib/utils/constants'
import type { Event } from '@/types'

const eventSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  description: z.string().optional(),
  event_type: z.enum(['general', 'meeting', 'fundraiser', 'trip', 'workshop'], {
    required_error: 'יש לבחור סוג אירוע'
  }),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  location: z.string().optional(),
  start_datetime: z.string().min(1, 'יש להזין תאריך ושעת התחלה'),
  end_datetime: z.string().optional(),
  registration_enabled: z.boolean().default(false),
  registration_deadline: z.string().optional(),
  max_attendees: z.number().min(1, 'מספר משתתפים מקסימלי חייב להיות לפחות 1').optional(),
  requires_payment: z.boolean().default(false),
  payment_amount: z.number().min(0, 'סכום תשלום חייב להיות חיובי').optional(),
  budget_allocated: z.number().min(0, 'תקציב מוקצב חייב להיות חיובי').optional(),
  status: z.enum(['draft', 'published', 'ongoing', 'completed', 'cancelled']).default('draft')
})

type EventFormData = z.infer<typeof eventSchema>

interface EventFormProps {
  event?: Partial<Event>
  onSubmit: (data: EventFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  className?: string
}

export function EventForm({
  event,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = ''
}: EventFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      event_type: event?.event_type || 'general',
      priority: event?.priority || 'normal',
      location: event?.location || '',
      start_datetime: event?.start_datetime ? new Date(event.start_datetime).toISOString().slice(0, 16) : '',
      end_datetime: event?.end_datetime ? new Date(event.end_datetime).toISOString().slice(0, 16) : '',
      registration_enabled: event?.registration_enabled || false,
      registration_deadline: event?.registration_deadline ? new Date(event.registration_deadline).toISOString().slice(0, 16) : '',
      max_attendees: event?.max_attendees || undefined,
      requires_payment: event?.requires_payment || false,
      payment_amount: event?.payment_amount || undefined,
      budget_allocated: event?.budget_allocated || undefined,
      status: event?.status || 'draft'
    }
  })

  const watchRegistrationEnabled = watch('registration_enabled')
  const watchRequiresPayment = watch('requires_payment')
  const watchStartDate = watch('start_datetime')
  const watchEventType = watch('event_type')

  useEffect(() => {
    if (watchEventType) {
      const hasAdvancedSettings =
        watchRegistrationEnabled ||
        watchRequiresPayment ||
        !!event?.budget_allocated
      setShowAdvanced(hasAdvancedSettings)
    }
  }, [watchEventType, watchRegistrationEnabled, watchRequiresPayment, event])

  const onFormSubmit = async (data: EventFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('שגיאה בשמירת האירוע:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority as keyof typeof colors] || colors.normal
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      meeting: 'bg-red-100 text-red-800',
      fundraiser: 'bg-green-100 text-green-800',
      trip: 'bg-purple-100 text-purple-800',
      workshop: 'bg-yellow-100 text-yellow-800'
    }
    return colors[type as keyof typeof colors] || colors.general
  }

  return (
    <Card className={`max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {event?.id ? 'עריכת אירוע' : 'אירוע חדש'}
        </CardTitle>
        {event?.id && (
          <div className="flex gap-2">
            <Badge className={getEventTypeColor(event.event_type || 'general')}>
              {EVENT_TYPES[event.event_type as keyof typeof EVENT_TYPES]}
            </Badge>
            {event.priority && event.priority !== 'normal' && (
              <Badge className={getPriorityColor(event.priority)}>
                {PRIORITY_LEVELS[event.priority as keyof typeof PRIORITY_LEVELS]}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title" className="text-right font-medium">
                כותרת האירוע *
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="הזן כותרת לאירוע..."
                className={`text-right ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-right font-medium">
                תיאור האירוע
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="תיאור מפורט של האירוע..."
                className="text-right min-h-[100px]"
                rows={4}
              />
            </div>
          </div>

          {/* Event Type and Priority */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="event_type" className="text-right font-medium">
                סוג האירוע *
              </Label>
              <Select
                value={watch('event_type')}
                onValueChange={(value) => setValue('event_type', value as any)}
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="בחר סוג אירוע" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-right">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.event_type && (
                <p className="text-sm text-red-600 mt-1">{errors.event_type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="priority" className="text-right font-medium">
                עדיפות
              </Label>
              <Select
                value={watch('priority')}
                onValueChange={(value) => setValue('priority', value as any)}
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="בחר עדיפות" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LEVELS).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-right">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="start_datetime" className="text-right font-medium">
                תאריך ושעת התחלה *
              </Label>
              <Input
                id="start_datetime"
                type="datetime-local"
                {...register('start_datetime')}
                className={`text-right ${errors.start_datetime ? 'border-red-500' : ''}`}
              />
              {errors.start_datetime && (
                <p className="text-sm text-red-500 mt-1">{errors.start_datetime.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="end_datetime" className="text-right font-medium">
                תאריך ושעת סיום
              </Label>
              <Input
                id="end_datetime"
                type="datetime-local"
                {...register('end_datetime')}
                className="text-right"
                min={watchStartDate}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-right font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              מיקום האירוע
            </Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="הזן כתובת או שם המקום..."
              className="text-right"
            />
          </div>

          {/* Registration Settings */}
          <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="registration_enabled" className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  אפשר הרשמה לאירוע
                </Label>
                <p className="text-sm text-muted-foreground">
                  האם נדרשת הרשמה מוקדמת לאירוע
                </p>
              </div>
              <Switch
                id="registration_enabled"
                checked={watchRegistrationEnabled}
                onCheckedChange={(checked) => setValue('registration_enabled', checked)}
              />
            </div>

            {watchRegistrationEnabled && (
              <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                <div>
                  <Label htmlFor="registration_deadline" className="text-right font-medium">
                    מועד אחרון להרשמה
                  </Label>
                  <Input
                    id="registration_deadline"
                    type="datetime-local"
                    {...register('registration_deadline')}
                    className="text-right"
                    max={watchStartDate}
                  />
                </div>

                <div>
                  <Label htmlFor="max_attendees" className="text-right font-medium">
                    מספר משתתפים מקסימלי
                  </Label>
                  <Input
                    id="max_attendees"
                    type="number"
                    min="1"
                    {...register('max_attendees', { valueAsNumber: true })}
                    placeholder="ללא הגבלה"
                    className={`text-right ${errors.max_attendees ? 'border-red-500' : ''}`}
                  />
                  {errors.max_attendees && (
                    <p className="text-sm text-red-500 mt-1">{errors.max_attendees.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Payment Settings */}
          <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requires_payment" className="font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  נדרש תשלום
                </Label>
                <p className="text-sm text-muted-foreground">
                  האם נדרש תשלום השתתפות באירוע
                </p>
              </div>
              <Switch
                id="requires_payment"
                checked={watchRequiresPayment}
                onCheckedChange={(checked) => setValue('requires_payment', checked)}
              />
            </div>

            {watchRequiresPayment && (
              <div>
                <Label htmlFor="payment_amount" className="text-right font-medium">
                  סכום תשלום (₪)
                </Label>
                <Input
                  id="payment_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('payment_amount', { valueAsNumber: true })}
                  placeholder="0.00"
                  className={`text-right ${errors.payment_amount ? 'border-red-500' : ''}`}
                />
                {errors.payment_amount && (
                  <p className="text-sm text-red-500 mt-1">{errors.payment_amount.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Advanced Settings Toggle */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
 
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'הסתר' : 'הצג'} הגדרות מתקדמות
            </Button>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-4 bg-muted/30 p-4 rounded-lg border-2 border-dashed">
              <div>
                <Label htmlFor="budget_allocated" className="text-right font-medium">
                  תקציב מוקצב (₪)
                </Label>
                <Input
                  id="budget_allocated"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('budget_allocated', { valueAsNumber: true })}
                  placeholder="0.00"
                  className={`text-right ${errors.budget_allocated ? 'border-red-500' : ''}`}
                />
                {errors.budget_allocated && (
                  <p className="text-sm text-red-500 mt-1">{errors.budget_allocated.message}</p>
                )}
              </div>


              <div>
                <Label htmlFor="status" className="text-right font-medium">
                  סטטוס האירוע
                </Label>
                <Select
                  value={watch('status')}
                  onValueChange={(value) => setValue('status', value as any)}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft" className="text-right">טיוטה</SelectItem>
                    <SelectItem value="published" className="text-right">פורסם</SelectItem>
                    <SelectItem value="ongoing" className="text-right">בתהליך</SelectItem>
                    <SelectItem value="completed" className="text-right">הושלם</SelectItem>
                    <SelectItem value="cancelled" className="text-right">בוטל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t">
            <Button
              type="button"
              variant="outline"
 onClick={onCancel}
              disabled={isSubmitting}
            >
              ביטול
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  שומר...
                </div>
              ) : (
                event?.id ? 'עדכן אירוע' : 'צור אירוע'
              )}
            </Button>
          </div>

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">יש לתקן את השגיאות הבאות:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}