'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'

const meetingSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים').max(200),
  meeting_date: z.string().min(1, 'נדרש תאריך פגישה'),
  description: z.string().optional()
})

type MeetingFormData = z.infer<typeof meetingSchema>

export default function NewMeetingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema)
  })

  async function onSubmit(data: MeetingFormData) {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          status: 'open',
          is_open: true
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('הפגישה נוצרה בהצלחה!')
        router.push('/admin/meetings')
      } else {
        toast.error(result.error || 'שגיאה ביצירת הפגישה')
      }
    } catch (error) {
      console.error('Error creating meeting:', error)
      toast.error('שגיאה ביצירת הפגישה')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/meetings">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowRight className="h-4 w-4 ml-2" />
            חזור לפגישות
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">פגישה חדשה</h1>
        <p className="text-muted-foreground mt-2">
          צור פגישה חדשה לקבלת רעיונות מהורים
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>פרטי הפגישה</CardTitle>
            <CardDescription>
              מלאו את פרטי הפגישה. הקישור לשליחת רעיונות יהיה זמין מיד לאחר היצירה.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">כותרת הפגישה *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="לדוגמה: פגישת ועד הורים - ינואר 2026"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="meeting_date">תאריך הפגישה *</Label>
              <Input
                id="meeting_date"
                type="datetime-local"
                {...register('meeting_date')}
                className={errors.meeting_date ? 'border-red-500' : ''}
              />
              {errors.meeting_date && (
                <p className="text-sm text-red-500 mt-1">{errors.meeting_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">תיאור (אופציונלי)</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="פרטים נוספים על הפגישה..."
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'יוצר...' : 'צור פגישה'}
              </Button>
              <Link href="/admin/meetings">
                <Button variant="outline" type="button">
                  ביטול
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
