'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Save, Trash2, Phone, Loader2 } from 'lucide-react'
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
import { SmartDatePicker } from '@/components/ui/smart-date-picker'

const taskSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  description: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  owner_name: z.string().min(2, 'שם האחראי נדרש'),
  owner_phone: z.union([
    z.string().regex(/^05\d{8}$/, 'מספר טלפון לא תקין'),
    z.literal(''),
    z.null(),
    z.undefined()
  ]).optional(),
  due_date: z.union([z.string().min(1), z.literal(''), z.null(), z.undefined()]).optional(),
  reminder_date: z.union([z.string(), z.literal(''), z.null(), z.undefined()]).optional(),
  event_id: z.union([z.string(), z.literal(''), z.null(), z.undefined()]).optional(),
  parent_task_id: z.union([z.string(), z.literal(''), z.null(), z.undefined()]).optional(),
  auto_remind: z.boolean()
})

type TaskFormData = z.infer<typeof taskSchema>

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [dueDate, setDueDate] = useState<string>('')
  const [reminderDate, setReminderDate] = useState<string>('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema)
  })

  const watchDueDate = watch('due_date')

  useEffect(() => {
    fetchTask()
    fetchEvents()
    fetchTasks()
  }, [params.id])

  async function fetchTask() {
    try {
      const response = await fetch(`/api/tasks/${params.id}`)
      const data = await response.json()

      if (data.success) {
        const task = data.data
        const dueDateValue = task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : ''
        const reminderDateValue = task.reminder_date ? format(new Date(task.reminder_date), 'yyyy-MM-dd') : ''

        setDueDate(dueDateValue)
        setReminderDate(reminderDateValue)

        reset({
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          status: task.status,
          owner_name: task.owner_name,
          owner_phone: task.owner_phone || '',
          due_date: dueDateValue,
          reminder_date: reminderDateValue,
          event_id: task.event_id || '',
          parent_task_id: task.parent_task_id || '',
          auto_remind: task.auto_remind ?? true
        })
      } else {
        toast.error('שגיאה בטעינת המשימה')
        router.push('/tasks')
      }
    } catch (error) {
      console.error('Error fetching task:', error)
      toast.error('שגיאה בטעינת המשימה')
      router.push('/tasks')
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchEvents() {
    try {
      const response = await fetch('/api/events?upcoming=true&limit=20')
      const data = await response.json()
      if (data.success) {
        setEvents(data.data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  async function fetchTasks() {
    try {
      const response = await fetch('/api/tasks?status=pending,in_progress&limit=20')
      const data = await response.json()
      if (data.success) {
        // Filter out the current task from parent options
        setTasks(data.data.filter((t: any) => t.id !== params.id))
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  async function onSubmit(data: TaskFormData) {
    setIsSubmitting(true)

    try {
      const taskData = {
        ...data,
        due_date: data.due_date || null,
        owner_phone: data.owner_phone || null,
        event_id: data.event_id || null,
        parent_task_id: data.parent_task_id || null,
        reminder_date: data.reminder_date || null
      }

      const response = await fetch(`/api/tasks/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('המשימה עודכנה בהצלחה!')
        router.push('/tasks')
        router.refresh() // Force refresh to show updated task
      } else {
        toast.error(result.error || 'שגיאה בעדכון המשימה')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('שגיאה בעדכון המשימה')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המשימה? פעולה זו לא ניתנת לביטול.')) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/tasks/${params.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.success('המשימה נמחקה בהצלחה')
        router.push('/tasks')
        router.refresh()
      } else {
        toast.error(result.error || 'שגיאה במחיקת המשימה')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('שגיאה במחיקת המשימה')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">טוען משימה...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">עריכת משימה</h1>
        <p className="text-muted-foreground mt-2">
          עדכן את פרטי המשימה
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי המשימה</CardTitle>
            <CardDescription>מידע בסיסי על המשימה</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">כותרת המשימה *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="לדוגמה: הזמנת כיבוד לישיבה"
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
                placeholder="תיאור מפורט של המשימה..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                    <SelectItem value="pending">ממתין</SelectItem>
                    <SelectItem value="in_progress">בביצוע</SelectItem>
                    <SelectItem value="completed">הושלם</SelectItem>
                    <SelectItem value="cancelled">בוטל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>הקצאת משימה</CardTitle>
            <CardDescription>מי אחראי על ביצוע המשימה</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="owner_name">שם האחראי *</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="owner_name"
                  {...register('owner_name')}
                  placeholder="שם מלא"
                  className={`pr-10 ${errors.owner_name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.owner_name && (
                <p className="text-sm text-red-500 mt-1">{errors.owner_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="owner_phone">טלפון האחראי</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="owner_phone"
                  {...register('owner_phone')}
                  placeholder="050-1234567"
                  className={`pr-10 ${errors.owner_phone ? 'border-red-500' : ''}`}
                  dir="ltr"
                />
              </div>
              {errors.owner_phone && (
                <p className="text-sm text-red-500 mt-1">{errors.owner_phone.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle>תאריכי יעד</CardTitle>
            <CardDescription>מתי המשימה צריכה להסתיים</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SmartDatePicker
              label="תאריך יעד"
              value={dueDate}
              onChange={(date) => {
                setDueDate(date || '')
                setValue('due_date', date || '')
              }}
              helperText="בחר מתי המשימה צריכה להסתיים (אופציונלי)"
              required={false}
            />

            <SmartDatePicker
              label="תאריך תזכורת"
              value={reminderDate}
              onChange={(date) => {
                setReminderDate(date || '')
                setValue('reminder_date', date || '')
              }}
              helperText="תישלח תזכורת לאחראי בתאריך זה"
              comingSoon={true}
              relativeTo={watchDueDate || undefined}
            />

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label htmlFor="auto_remind">תזכורות אוטומטיות</Label>
                <p className="text-sm text-muted-foreground">
                  שלח תזכורות אוטומטיות כשהמשימה מתקרבת לתאריך היעד
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  בקרוב 🔔
                </span>
                <Switch
                  id="auto_remind"
                  checked={watch('auto_remind')}
                  onCheckedChange={(checked) => setValue('auto_remind', checked)}
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Relationships */}
        <Card>
          <CardHeader>
            <CardTitle>קישורים (אופציונלי)</CardTitle>
            <CardDescription>קשר את המשימה לאירוע או למשימת אב</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.length > 0 && (
              <div>
                <Label htmlFor="event_id">אירוע קשור</Label>
                <Select
                  onValueChange={(value) => setValue('event_id', value)}
                  value={watch('event_id') || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר אירוע..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ללא</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {tasks.length > 0 && (
              <div>
                <Label htmlFor="parent_task_id">משימת אב</Label>
                <Select
                  onValueChange={(value) => setValue('parent_task_id', value)}
                  value={watch('parent_task_id') || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר משימת אב..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ללא</SelectItem>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
                מחק משימה
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