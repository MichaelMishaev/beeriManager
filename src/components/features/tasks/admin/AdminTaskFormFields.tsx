'use client'

import { Bell, Phone, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { z } from 'zod'
import { AdminFormSection } from '@/components/features/admin'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SmartDatePicker } from '@/components/ui/smart-date-picker'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

/** Validation messages, already translated by the calling page. */
export interface TaskSchemaMessages {
  titleMin: string
  ownerRequired: string
  phoneInvalid: string
}

export function buildAdminTaskSchema(messages: TaskSchemaMessages) {
  return z.object({
    title: z.string().min(2, messages.titleMin),
    description: z.string().optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
    owner_name: z.string().min(2, messages.ownerRequired),
    owner_phone: z.union([
      z.string().regex(/^05\d{8}$/, messages.phoneInvalid),
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
}

export type AdminTaskFormData = z.infer<ReturnType<typeof buildAdminTaskSchema>>

export interface LinkOption {
  id: string
  title: string
}

interface AdminTaskFormFieldsProps {
  mode: 'new' | 'edit'
  register: UseFormRegister<AdminTaskFormData>
  setValue: UseFormSetValue<AdminTaskFormData>
  watch: UseFormWatch<AdminTaskFormData>
  errors: FieldErrors<AdminTaskFormData>
  dueDate: string
  reminderDate: string
  onDueDateChange: (date: string) => void
  onReminderDateChange: (date: string) => void
  events: LinkOption[]
  tasks: LinkOption[]
}

/** The four form sections shared by the admin "new task" and "edit task" pages. */
export function AdminTaskFormFields({
  mode,
  register,
  setValue,
  watch,
  errors,
  dueDate,
  reminderDate,
  onDueDateChange,
  onReminderDateChange,
  events,
  tasks
}: AdminTaskFormFieldsProps) {
  const t = useTranslations('admin.tasks.form')
  const watchDueDate = watch('due_date')

  return (
    <>
      <AdminFormSection title={t('sections.basic.title')} description={t('sections.basic.description')}>
        <div>
          <Label htmlFor="title">{t('fields.title')}</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder={t('placeholders.title')}
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <Label htmlFor="description">{t('fields.description')}</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder={t('placeholders.description')}
            rows={4}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="priority">{t('fields.priority')}</Label>
            <Select
              onValueChange={(value) => setValue('priority', value as AdminTaskFormData['priority'])}
              value={watch('priority')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t('priority.low')}</SelectItem>
                <SelectItem value="normal">{t('priority.normal')}</SelectItem>
                <SelectItem value="high">{t('priority.high')}</SelectItem>
                <SelectItem value="urgent">{t('priority.urgent')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">{t('fields.status')}</Label>
            <Select
              onValueChange={(value) => setValue('status', value as AdminTaskFormData['status'])}
              value={watch('status')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{t('status.pending')}</SelectItem>
                <SelectItem value="in_progress">{t('status.in_progress')}</SelectItem>
                <SelectItem value="completed">{t('status.completed')}</SelectItem>
                <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </AdminFormSection>

      <AdminFormSection title={t('sections.assignment.title')} description={t('sections.assignment.description')}>
        <div>
          <Label htmlFor="owner_name">{t('fields.ownerName')}</Label>
          <div className="relative">
            <User className="pointer-events-none absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="owner_name"
              {...register('owner_name')}
              placeholder={t('placeholders.ownerName')}
              className={`ps-10 ${errors.owner_name ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.owner_name && <p className="mt-1 text-sm text-red-500">{errors.owner_name.message}</p>}
        </div>

        <div>
          <Label htmlFor="owner_phone">{t('fields.ownerPhone')}</Label>
          {/* Phone numbers read left-to-right in both languages, so icon and padding sit on the left. */}
          <div className="relative" dir="ltr">
            <Phone className="pointer-events-none absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="owner_phone"
              {...register('owner_phone')}
              placeholder="050-1234567"
              className={`ps-10 ${errors.owner_phone ? 'border-red-500' : ''}`}
              dir="ltr"
            />
          </div>
          {errors.owner_phone && <p className="mt-1 text-sm text-red-500">{errors.owner_phone.message}</p>}
        </div>
      </AdminFormSection>

      <AdminFormSection title={t('sections.dates.title')} description={t('sections.dates.description')}>
        <SmartDatePicker
          label={t('fields.dueDate')}
          value={dueDate}
          onChange={(date) => onDueDateChange(date || '')}
          helperText={t('helpers.dueDate')}
          required={false}
        />

        <SmartDatePicker
          label={t('fields.reminderDate')}
          value={reminderDate}
          onChange={(date) => onReminderDateChange(date || '')}
          helperText={t('helpers.reminderDate')}
          comingSoon={true}
          relativeTo={watchDueDate || undefined}
        />

        <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f1f2f4] p-4">
          <div className="min-w-0">
            <Label htmlFor="auto_remind">{t('fields.autoRemind')}</Label>
            <p className="text-sm text-muted-foreground">{t('helpers.autoRemind')}</p>
          </div>
          <div className="flex flex-none items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
              {t('comingSoon')}
              <Bell className="h-3 w-3" aria-hidden="true" />
            </span>
            {mode === 'new' ? (
              <Switch id="auto_remind" {...register('auto_remind')} defaultChecked disabled />
            ) : (
              <Switch
                id="auto_remind"
                checked={watch('auto_remind')}
                onCheckedChange={(checked) => setValue('auto_remind', checked)}
                disabled
              />
            )}
          </div>
        </div>
      </AdminFormSection>

      <AdminFormSection title={t('sections.links.title')} description={t('sections.links.description')}>
        {events.length > 0 && (
          <div>
            <Label htmlFor="event_id">{t('fields.event')}</Label>
            <Select
              onValueChange={(value) => setValue('event_id', value)}
              value={watch('event_id') || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('placeholders.event')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('none')}</SelectItem>
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
            <Label htmlFor="parent_task_id">{t('fields.parentTask')}</Label>
            <Select
              onValueChange={(value) => setValue('parent_task_id', value)}
              value={watch('parent_task_id') || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('placeholders.parentTask')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('none')}</SelectItem>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </AdminFormSection>
    </>
  )
}
