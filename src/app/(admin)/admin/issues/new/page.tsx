'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, User, Phone, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FileUpload from '@/components/upload/FileUpload'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const issueSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  description: z.string().min(10, 'תיאור חייב להכיל לפחות 10 תווים'),
  category: z.enum(['safety', 'maintenance', 'academic', 'social', 'financial', 'other']),
  priority: z.enum(['low', 'normal', 'high', 'critical']),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  reporter_name: z.string().min(2, 'שם המדווח נדרש'),
  reporter_contact: z.string().optional(),
  assigned_to: z.string().optional(),
  attachment_urls: z.array(z.string()).optional()
})

type IssueFormData = z.infer<typeof issueSchema>

const categoryOptions = [
  { value: 'safety', label: 'בטיחות' },
  { value: 'maintenance', label: 'תחזוקה' },
  { value: 'academic', label: 'לימודי' },
  { value: 'social', label: 'חברתי' },
  { value: 'financial', label: 'כספי' },
  { value: 'other', label: 'אחר' }
]

const priorityOptions = [
  { value: 'low', label: 'נמוכה', color: 'text-gray-600' },
  { value: 'normal', label: 'רגילה', color: 'text-blue-600' },
  { value: 'high', label: 'גבוהה', color: 'text-orange-600' },
  { value: 'critical', label: 'קריטי', color: 'text-red-600' }
]

const statusOptions = [
  { value: 'open', label: 'פתוח' },
  { value: 'in_progress', label: 'בטיפול' },
  { value: 'resolved', label: 'נפתר' },
  { value: 'closed', label: 'סגור' }
]

export default function NewIssuePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      category: 'other',
      priority: 'normal',
      status: 'open',
      attachment_urls: []
    }
  })

  const selectedPriority = watch('priority')

  async function onSubmit(data: IssueFormData) {
    setIsSubmitting(true)

    try {
      const issueData = {
        ...data,
        attachment_urls: attachmentUrls,
        reporter_contact: data.reporter_contact || null,
        assigned_to: data.assigned_to || null
      }

      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(issueData)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('הבעיה דווחה בהצלחה!')
        router.push('/issues')
      } else {
        toast.error(result.error || 'שגיאה בדיווח הבעיה')
      }
    } catch (error) {
      console.error('Error creating issue:', error)
      toast.error('שגיאה בדיווח הבעיה')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">דיווח על בעיה חדשה</h1>
        <p className="text-muted-foreground mt-2">
          דווח על בעיה שדורשת טיפול של ועד ההורים
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי הבעיה</CardTitle>
            <CardDescription>מידע בסיסי על הבעיה</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">כותרת הבעיה *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="תיאור קצר של הבעיה"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">תיאור מפורט *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="תאר את הבעיה בפירוט..."
                rows={6}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="category">קטגוריה</Label>
                <Select
                  onValueChange={(value) => setValue('category', value as any)}
                  defaultValue="other"
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

              <div>
                <Label htmlFor="priority">עדיפות</Label>
                <Select
                  onValueChange={(value) => setValue('priority', value as any)}
                  defaultValue="normal"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={option.color}>{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">סטטוס</Label>
                <Select
                  onValueChange={(value) => setValue('status', value as any)}
                  defaultValue="open"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedPriority === 'critical' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-medium">בעיה קריטית</p>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  בעיות קריטיות יטופלו בעדיפות עליונה ויקבלו התייחסות מיידית
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reporter Information */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי המדווח</CardTitle>
            <CardDescription>מי מדווח על הבעיה</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reporter_name">שם המדווח *</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reporter_name"
                  {...register('reporter_name')}
                  placeholder="שם מלא"
                  className={`pr-10 ${errors.reporter_name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.reporter_name && (
                <p className="text-sm text-red-500 mt-1">{errors.reporter_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="reporter_contact">פרטי קשר (אופציונלי)</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reporter_contact"
                  {...register('reporter_contact')}
                  placeholder="טלפון או אימייל"
                  className="pr-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="assigned_to">מוקצה ל (אופציונלי)</Label>
              <Input
                id="assigned_to"
                {...register('assigned_to')}
                placeholder="שם האחראי לטיפול"
              />
            </div>
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader>
            <CardTitle>קבצים מצורפים</CardTitle>
            <CardDescription>צרף תמונות או מסמכים רלוונטיים</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              value={attachmentUrls}
              onChange={(urls) => setAttachmentUrls(urls as string[])}
              multiple={true}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              maxSize={10}
              bucket="issues"
            />
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
                דווח על הבעיה
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm" onClick={() => router.back()}
          >
            ביטול
          </Button>
        </div>
      </form>
    </div>
  )
}