'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Save, Trash2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'

const eventSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  description: z.string().optional(),
  event_type: z.enum(['general', 'meeting', 'fundraiser', 'trip', 'workshop']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  status: z.enum(['draft', 'published', 'cancelled']),
  location: z.string().optional(),
  start_date: z.string().min(1, 'תאריך התחלה נדרש'),
  start_time: z.string().min(1, 'שעת התחלה נדרשת'),
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

type EventFormData = z.infer<typeof eventSchema>

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
          description: event.description || '',
          event_type: event.event_type,
          priority: event.priority,
          status: event.status,
          location: event.location || '',
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
        toast.error('שגיאה בטעינת האירוע')
        router.push('/admin/events')
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('שגיאה בטעינת האירוע')
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
        toast.success('האירוע עודכן בהצלחה!')
        router.push(`/events/${params.id}`)
      } else {
        toast.error(result.error || 'שגיאה בעדכון האירוע')
      }
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('שגיאה בעדכון האירוע')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!confirm('האם אתה בטוח שברצונך למחוק את האירוע? פעולה זו לא ניתנת לביטול.')) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/events/${params.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.success('האירוע נמחק בהצלחה')
        router.push('/admin/events')
      } else {
        toast.error(result.error || 'שגיאה במחיקת האירוע')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('שגיאה במחיקת האירוע')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">טוען אירוע...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">עריכת אירוע</h1>
        <p className="text-muted-foreground mt-2">
          עדכן את פרטי האירוע
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי האירוע</CardTitle>
            <CardDescription>מידע בסיסי על האירוע</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">כותרת האירוע *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="לדוגמה: ישיבת ועד חודשית"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="תיאור מפורט של האירוע..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="event_type">סוג אירוע</Label>
                <Select
                  onValueChange={(value) => setValue('event_type', value as any)}
                  value={watch('event_type')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">כללי</SelectItem>
                    <SelectItem value="meeting">ישיבה</SelectItem>
                    <SelectItem value="fundraiser">גיוס כספים</SelectItem>
                    <SelectItem value="trip">טיול</SelectItem>
                    <SelectItem value="workshop">סדנה/הרצאה</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">עדיפות</Label>
                <Select
                  onValueChange={(value) => setValue('priority', value as any)}
                  value={watch('priority')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">נמוכה</SelectItem>
                    <SelectItem value="normal">רגילה</SelectItem>
                    <SelectItem value="high">גבוהה</SelectItem>
                    <SelectItem value="urgent">דחוף</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">סטטוס</Label>
                <Select
                  onValueChange={(value) => setValue('status', value as any)}
                  value={watch('status')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">טיוטה</SelectItem>
                    <SelectItem value="published">פורסם</SelectItem>
                    <SelectItem value="cancelled">בוטל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date, Time & Location */}
        <Card>
          <CardHeader>
            <CardTitle>זמן ומיקום</CardTitle>
            <CardDescription>מתי ואיפה האירוע מתקיים</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="location">מיקום</Label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="כתובת או שם המקום"
                  className="pr-10"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="start_date">תאריך התחלה *</Label>
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
                <Label htmlFor="start_time">שעת התחלה *</Label>
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
                <Label htmlFor="end_date">תאריך סיום</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register('end_date')}
                />
              </div>

              <div>
                <Label htmlFor="end_time">שעת סיום</Label>
                <Input
                  id="end_time"
                  type="time"
                  {...register('end_time')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Settings */}
        <Card>
          <CardHeader>
            <CardTitle>הגדרות הרשמה</CardTitle>
            <CardDescription>האם נדרשת הרשמה מראש לאירוע</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="registration_enabled">אפשר הרשמה</Label>
                <p className="text-sm text-muted-foreground">
                  משתתפים יוכלו להירשם לאירוע מראש
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
                    <Label htmlFor="max_attendees">מספר מקומות מקסימלי</Label>
                    <Input
                      id="max_attendees"
                      type="number"
                      {...register('max_attendees')}
                      placeholder="השאר ריק לללא הגבלה"
                    />
                  </div>

                  <div className="grid gap-2 grid-cols-2">
                    <div>
                      <Label htmlFor="registration_deadline_date">תאריך סיום הרשמה</Label>
                      <Input
                        id="registration_deadline_date"
                        type="date"
                        {...register('registration_deadline_date')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="registration_deadline_time">שעה</Label>
                      <Input
                        id="registration_deadline_time"
                        type="time"
                        {...register('registration_deadline_time')}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requires_payment">דורש תשלום</Label>
                    <p className="text-sm text-muted-foreground">
                      האירוע כרוך בתשלום
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
                    <Label htmlFor="payment_amount">סכום לתשלום (₪)</Label>
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
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader>
            <CardTitle>תקציב</CardTitle>
            <CardDescription>תקציב מוקצב לאירוע</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="budget_allocated">תקציב מוקצב (₪)</Label>
              <Input
                id="budget_allocated"
                type="number"
                step="0.01"
                {...register('budget_allocated')}
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>טוען...</>
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                שמור שינויים
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="destructive"
 onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>מוחק...</>
            ) : (
              <>
                <Trash2 className="h-4 w-4 ml-2" />
                מחק אירוע
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
 onClick={() => router.back()}
          >
            ביטול
          </Button>
        </div>
      </form>
    </div>
  )
}