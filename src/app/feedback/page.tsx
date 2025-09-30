'use client'

import { useState, useEffect } from 'react'
import { Send, CheckCircle, Star } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

const feedbackSchema = z.object({
  category: z.enum(['general', 'event', 'task', 'suggestion', 'complaint', 'other']),
  subject: z.string().min(2, 'נושא חייב להכיל לפחות 2 תווים').max(100),
  message: z.string().min(10, 'הודעה חייבת להכיל לפחות 10 תווים').max(1000),
  rating: z.number().optional(),
  parent_name: z.string().optional(),
  contact_email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  is_anonymous: z.boolean()
})

type FeedbackFormData = z.infer<typeof feedbackSchema>

const categoryOptions = [
  { value: 'general', label: 'כללי' },
  { value: 'event', label: 'אירוע' },
  { value: 'task', label: 'משימה' },
  { value: 'suggestion', label: 'הצעה' },
  { value: 'complaint', label: 'תלונה' },
  { value: 'other', label: 'אחר' }
]

export default function FeedbackPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)

  useEffect(() => {
    logger.mount('FeedbackPage')
    return () => logger.unmount('FeedbackPage')
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: 'general',
      is_anonymous: true
    }
  })

  const isAnonymous = watch('is_anonymous')
  const selectedRating = watch('rating')

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      logger.formValidation('Feedback', errors)
    }
  }, [errors])

  async function onSubmit(data: FeedbackFormData) {
    logger.formSubmit('Feedback', { ...data, contact_email: data.contact_email ? '***' : undefined })
    setIsSubmitting(true)

    try {
      const feedbackData = {
        ...data,
        parent_name: isAnonymous ? undefined : data.parent_name,
        contact_email: isAnonymous ? undefined : data.contact_email
      }

      logger.apiCall('POST', '/api/feedback', {
        category: feedbackData.category,
        isAnonymous: isAnonymous
      })

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      })

      const result = await response.json()
      logger.apiResponse('/api/feedback', response.status, { success: result.success })

      if (result.success) {
        logger.success('Feedback submitted successfully')
        setIsSubmitted(true)
        toast.success('המשוב נשלח בהצלחה!')
        // Reset form after 3 seconds
        setTimeout(() => {
          reset()
          setIsSubmitted(false)
        }, 3000)
      } else {
        logger.error('Feedback submission failed', { error: result.error })
        toast.error(result.error || 'שגיאה בשליחת המשוב')
      }
    } catch (error) {
      logger.error('Feedback submission error', { error })
      toast.error('שגיאה בשליחת המשוב')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">תודה על המשוב!</h2>
            <p className="text-muted-foreground">
              המשוב שלך התקבל בהצלחה ויטופל בהקדם האפשרי
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">משוב והצעות</h1>
        <p className="text-muted-foreground">
          שתפו אותנו במחשבות, הצעות או תלונות. המשוב שלכם חשוב לנו!
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>טופס משוב</CardTitle>
            <CardDescription>
              ניתן לשלוח משוב באופן אנונימי או עם פרטי קשר
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <Label htmlFor="is_anonymous">משוב אנונימי</Label>
                <p className="text-sm text-muted-foreground">
                  שליחת המשוב ללא חשיפת פרטים אישיים
                </p>
              </div>
              <Switch
                id="is_anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => {
                  logger.userAction('Toggle anonymous mode', { anonymous: checked })
                  setValue('is_anonymous', checked)
                }}
              />
            </div>

            {/* Contact Details (if not anonymous) */}
            {!isAnonymous && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div>
                  <Label htmlFor="parent_name">שם (אופציונלי)</Label>
                  <Input
                    id="parent_name"
                    {...register('parent_name')}
                    placeholder="שם מלא"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">אימייל לחזרה (אופציונלי)</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    {...register('contact_email')}
                    placeholder="your@email.com"
                    dir="ltr"
                    className={errors.contact_email ? 'border-red-500' : ''}
                  />
                  {errors.contact_email && (
                    <p className="text-sm text-red-500 mt-1">{errors.contact_email.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Category */}
            <div>
              <Label htmlFor="category">קטגוריה *</Label>
              <Select
                onValueChange={(value) => setValue('category', value as any)}
                defaultValue="general"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="subject">נושא *</Label>
              <Input
                id="subject"
                {...register('subject')}
                placeholder="על מה תרצו לדבר?"
                className={errors.subject ? 'border-red-500' : ''}
              />
              {errors.subject && (
                <p className="text-sm text-red-500 mt-1">{errors.subject.message}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message">הודעה *</Label>
              <Textarea
                id="message"
                {...register('message')}
                placeholder="שתפו את המשוב שלכם..."
                rows={6}
                className={errors.message ? 'border-red-500' : ''}
              />
              {errors.message && (
                <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {watch('message')?.length || 0} / 1000 תווים
              </p>
            </div>

            {/* Rating */}
            <div>
              <Label>דירוג כללי (אופציונלי)</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => {
                      logger.userAction('Set rating', { rating })
                      setValue('rating', rating)
                    }}
                    onMouseEnter={() => setHoveredRating(rating)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        'h-8 w-8 transition-colors',
                        (selectedRating && selectedRating >= rating) ||
                        (hoveredRating >= rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="sm"
            >
              {isSubmitting ? (
                <>טוען...</>
              ) : (
                <>
                  <Send className="h-3 w-3 ml-2" />
                  שלח משוב
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}