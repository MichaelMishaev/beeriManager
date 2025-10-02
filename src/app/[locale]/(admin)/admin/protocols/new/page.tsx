'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Plus, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import FileUpload from '@/components/upload/FileUpload'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const protocolSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  meeting_date: z.string().min(1, 'תאריך ישיבה נדרש'),
  protocol_type: z.enum(['regular', 'special', 'annual', 'emergency']),
  attendees: z.array(z.string()).min(1, 'חייב להיות לפחות משתתף אחד'),
  agenda: z.string().optional(),
  decisions: z.string().optional(),
  action_items: z.string().optional(),
  document_url: z.string().optional(),
  attachment_urls: z.array(z.string()).optional(),
  is_public: z.boolean(),
  approved: z.boolean()
})

type ProtocolFormData = z.infer<typeof protocolSchema>

const protocolTypeOptions = [
  { value: 'regular', label: 'ישיבה רגילה' },
  { value: 'special', label: 'ישיבה מיוחדת' },
  { value: 'annual', label: 'אסיפה שנתית' },
  { value: 'emergency', label: 'ישיבת חירום' }
]

export default function NewProtocolPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attendeeInput, setAttendeeInput] = useState('')
  const [attendees, setAttendees] = useState<string[]>([])

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
      toast.error('יש להוסיף לפחות משתתף אחד')
      return
    }

    setIsSubmitting(true)

    try {
      const protocolData = {
        ...data,
        attendees
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
        toast.success('הפרוטוקול נוצר בהצלחה!')
        router.push('/protocols')
      } else {
        toast.error(result.error || 'שגיאה ביצירת הפרוטוקול')
      }
    } catch (error) {
      console.error('Error creating protocol:', error)
      toast.error('שגיאה ביצירת הפרוטוקול')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">יצירת פרוטוקול חדש</h1>
        <p className="text-muted-foreground mt-2">
          תיעוד ישיבות והחלטות ועד ההורים
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי הפרוטוקול</CardTitle>
            <CardDescription>מידע בסיסי על הישיבה</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">כותרת הפרוטוקול *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="לדוגמה: פרוטוקול ישיבת ועד חודש נובמבר"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="meeting_date">תאריך הישיבה *</Label>
                <Input
                  id="meeting_date"
                  type="date"
                  {...register('meeting_date')}
                  className={errors.meeting_date ? 'border-red-500' : ''}
                />
                {errors.meeting_date && (
                  <p className="text-sm text-red-500 mt-1">{errors.meeting_date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="protocol_type">סוג הישיבה</Label>
                <Select
                  onValueChange={(value) => setValue('protocol_type', value as any)}
                  defaultValue="regular"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {protocolTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="is_public">פרוטוקול ציבורי</Label>
                  <p className="text-sm text-muted-foreground">
                    יוצג לכל ההורים
                  </p>
                </div>
                <Switch
                  id="is_public"
                  checked={isPublic}
                  onCheckedChange={(checked) => setValue('is_public', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="approved">מאושר</Label>
                  <p className="text-sm text-muted-foreground">
                    האם הפרוטוקול אושר
                  </p>
                </div>
                <Switch
                  id="approved"
                  checked={approved}
                  onCheckedChange={(checked) => setValue('approved', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendees */}
        <Card>
          <CardHeader>
            <CardTitle>משתתפים *</CardTitle>
            <CardDescription>רשימת המשתתפים בישיבה</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="שם המשתתף"
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addAttendee()
                  }
                }}
              />
              <Button
                type="button"
 onClick={addAttendee}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                הוסף
              </Button>
            </div>

            {attendees.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attendees.map((attendee, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-lg"
                  >
                    <span className="text-sm">{attendee}</span>
                    <button
                      type="button"
                      onClick={() => removeAttendee(index)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.attendees && (
              <p className="text-sm text-red-500">{errors.attendees.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Meeting Content */}
        <Card>
          <CardHeader>
            <CardTitle>תוכן הישיבה</CardTitle>
            <CardDescription>סדר יום, החלטות ומשימות</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="agenda">סדר יום</Label>
              <Textarea
                id="agenda"
                {...register('agenda')}
                placeholder="נושאים שנדונו בישיבה..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="decisions">החלטות</Label>
              <Textarea
                id="decisions"
                {...register('decisions')}
                placeholder="החלטות שהתקבלו בישיבה..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="action_items">משימות לביצוע</Label>
              <Textarea
                id="action_items"
                {...register('action_items')}
                placeholder="משימות שנקבעו בישיבה..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>מסמכים</CardTitle>
            <CardDescription>גרור ושחרר קבצים - יישמרו אוטומטית ב-Google Drive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>קובץ פרוטוקול ראשי</Label>
              <FileUpload
                value={watch('document_url') || ''}
                onChange={(url) => setValue('document_url', url as string)}
                multiple={false}
                accept=".pdf,.doc,.docx"
                maxSize={10}
                bucket="protocols"
                path="main"
              />
            </div>

            <div>
              <Label>מסמכים נוספים</Label>
              <FileUpload
                value={watch('attachment_urls') || []}
                onChange={(urls) => setValue('attachment_urls', urls as string[])}
                multiple={true}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                maxSize={10}
                bucket="protocols"
                path="attachments"
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
                שמור פרוטוקול
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