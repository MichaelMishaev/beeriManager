'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckSquare, User, Clock, AlertTriangle, Phone, FileText, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatHebrewDate } from '@/lib/utils/date'
import { TASK_STATUSES, PRIORITY_LEVELS } from '@/lib/utils/constants'
import type { Task } from '@/types'

const taskSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  description: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  owner_name: z.string().min(2, 'שם האחראי חייב להכיל לפחות 2 תווים'),
  owner_phone: z.string().optional(),
  owner_email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  due_date: z.string().min(1, 'יש להזין תאריך יעד'),
  category: z.string().optional(),
  estimated_hours: z.number().min(0.5, 'זמן משוער חייב להיות לפחות 0.5 שעות').optional(),
  notes: z.string().optional(),
  related_event_id: z.string().optional(),
  dependency_task_ids: z.array(z.string()).optional(),
  attachment_urls: z.array(z.string()).optional()
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  task?: Partial<Task>
  onSubmit: (data: TaskFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  availableUsers?: { id: string; name: string; phone?: string; email?: string }[]
  relatedEvents?: { id: string; title: string; start_datetime: string }[]
  availableTasks?: { id: string; title: string; status: string }[]
  className?: string
}

const TASK_CATEGORIES = {
  logistics: 'לוגיסטיקה',
  communication: 'תקשורת',
  fundraising: 'גיוס כספים',
  planning: 'תכנון',
  coordination: 'תיאום',
  documentation: 'תיעוד',
  maintenance: 'תחזוקה',
  other: 'אחר'
}

export function TaskForm({
  task,
  onSubmit,
  onCancel,
  isSubmitting = false,
  availableUsers = [],
  relatedEvents = [],
  availableTasks = [],
  className = ''
}: TaskFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'normal',
      status: task?.status || 'pending',
      owner_name: task?.owner_name || '',
      owner_phone: task?.owner_phone || '',
      owner_email: task?.owner_email || '',
      due_date: task?.due_date ? new Date(task.due_date).toISOString().slice(0, 10) : '',
      category: task?.category || '',
      estimated_hours: task?.estimated_hours || undefined,
      notes: task?.notes || '',
      related_event_id: task?.related_event_id || '',
      dependency_task_ids: task?.dependency_task_ids || [],
      attachment_urls: task?.attachment_urls || []
    }
  })

  const watchPriority = watch('priority')
  const watchStatus = watch('status')
  const watchOwnerName = watch('owner_name')

  const onFormSubmit = async (data: TaskFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('שגיאה בשמירת המשימה:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800 animate-pulse'
    }
    return colors[priority as keyof typeof colors] || colors.normal
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const handleUserSelect = (userName: string) => {
    const user = availableUsers.find(u => u.name === userName)
    if (user) {
      setValue('owner_name', user.name)
      if (user.phone) setValue('owner_phone', user.phone)
      if (user.email) setValue('owner_email', user.email)
    }
  }

  return (
    <Card className={`max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          {task?.id ? 'עריכת משימה' : 'משימה חדשה'}
        </CardTitle>
        {task?.id && (
          <div className="flex gap-2">
            <Badge className={getStatusColor(task.status || 'pending')}>
              {TASK_STATUSES[task.status as keyof typeof TASK_STATUSES]}
            </Badge>
            {task.priority && task.priority !== 'normal' && (
              <Badge className={getPriorityColor(task.priority)}>
                {PRIORITY_LEVELS[task.priority as keyof typeof PRIORITY_LEVELS]}
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
                כותרת המשימה *
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="הזן כותרת למשימה..."
                className="text-right"
                error={errors.title?.message}
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-right font-medium">
                תיאור המשימה
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="תיאור מפורט של המשימה..."
                className="text-right min-h-[100px]"
                rows={4}
              />
            </div>
          </div>

          {/* Priority and Status */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="priority" className="text-right font-medium">
                עדיפות *
              </Label>
              <Select
                value={watchPriority}
                onValueChange={(value) => setValue('priority', value as any)}
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="בחר עדיפות" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LEVELS).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-right">
                      <div className="flex items-center gap-2">
                        {key === 'urgent' && <AlertTriangle className="h-3 w-3" />}
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status" className="text-right font-medium">
                סטטוס
              </Label>
              <Select
                value={watchStatus}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_STATUSES).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-right">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignment */}
          <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              הקצאת המשימה
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="owner_name" className="text-right font-medium">
                  שם האחראי *
                </Label>
                {availableUsers.length > 0 ? (
                  <Select
                    value={watchOwnerName}
                    onValueChange={handleUserSelect}
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="בחר אחראי מהרשימה או הזן ידנית" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.name} className="text-right">
                          <div className="flex flex-col items-end">
                            <span>{user.name}</span>
                            {user.phone && (
                              <span className="text-xs text-muted-foreground">{user.phone}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="owner_name"
                    {...register('owner_name')}
                    placeholder="הזן שם האחראי..."
                    className="text-right"
                    error={errors.owner_name?.message}
                  />
                )}
              </div>

              <div>
                <Label htmlFor="due_date" className="text-right font-medium">
                  תאריך יעד *
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  {...register('due_date')}
                  className="text-right"
                  error={errors.due_date?.message}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="owner_phone" className="text-right font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  טלפון
                </Label>
                <Input
                  id="owner_phone"
                  type="tel"
                  {...register('owner_phone')}
                  placeholder="050-1234567"
                  className="text-right"
                />
              </div>

              <div>
                <Label htmlFor="owner_email" className="text-right font-medium">
                  אימייל
                </Label>
                <Input
                  id="owner_email"
                  type="email"
                  {...register('owner_email')}
                  placeholder="example@email.com"
                  className="text-right"
                  error={errors.owner_email?.message}
                />
              </div>
            </div>
          </div>

          {/* Category and Estimation */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="category" className="text-right font-medium">
                קטגוריה
              </Label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-right">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="estimated_hours" className="text-right font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                זמן משוער (שעות)
              </Label>
              <Input
                id="estimated_hours"
                type="number"
                min="0.5"
                step="0.5"
                {...register('estimated_hours', { valueAsNumber: true })}
                placeholder="1.0"
                className="text-right"
                error={errors.estimated_hours?.message}
              />
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'הסתר' : 'הצג'} הגדרות מתקדמות
            </Button>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-4 bg-muted/30 p-4 rounded-lg border-2 border-dashed">
              {/* Related Event */}
              {relatedEvents.length > 0 && (
                <div>
                  <Label htmlFor="related_event_id" className="text-right font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    אירוע קשור
                  </Label>
                  <Select
                    value={watch('related_event_id')}
                    onValueChange={(value) => setValue('related_event_id', value)}
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="בחר אירוע קשור (אופציונלי)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" className="text-right">ללא אירוע קשור</SelectItem>
                      {relatedEvents.map((event) => (
                        <SelectItem key={event.id} value={event.id} className="text-right">
                          <div className="flex flex-col items-end">
                            <span>{event.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatHebrewDate(event.start_datetime)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Task Dependencies */}
              {availableTasks.length > 0 && (
                <div>
                  <Label className="text-right font-medium flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    משימות קודמות (תלויות)
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    משימות שצריכות להיות מושלמות לפני משימה זו
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                    {availableTasks
                      .filter(t => t.id !== task?.id) // Don't show current task
                      .map((taskOption) => (
                        <div key={taskOption.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`dep-${taskOption.id}`}
                            value={taskOption.id}
                            onChange={(e) => {
                              const currentDeps = watch('dependency_task_ids') || []
                              if (e.target.checked) {
                                setValue('dependency_task_ids', [...currentDeps, taskOption.id])
                              } else {
                                setValue('dependency_task_ids', currentDeps.filter(id => id !== taskOption.id))
                              }
                            }}
                            checked={(watch('dependency_task_ids') || []).includes(taskOption.id)}
                          />
                          <Label htmlFor={`dep-${taskOption.id}`} className="text-sm flex-1 text-right">
                            {taskOption.title}
                            <Badge variant="outline" className="mr-2 text-xs">
                              {TASK_STATUSES[taskOption.status as keyof typeof TASK_STATUSES]}
                            </Badge>
                          </Label>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-right font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  הערות פנימיות
                </Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="הערות למנהלי המערכת..."
                  className="text-right"
                  rows={3}
                />
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
                task?.id ? 'עדכן משימה' : 'צור משימה'
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