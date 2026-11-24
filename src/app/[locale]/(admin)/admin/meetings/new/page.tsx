'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from '@/i18n/navigation'
import { AdminFormSection, AdminPageHeader } from '@/components/features/admin'

function createMeetingSchema(messages: { titleMin: string; dateRequired: string }) {
  return z.object({
    title: z.string().min(2, messages.titleMin).max(200),
    meeting_date: z.string().min(1, messages.dateRequired),
    description: z.string().optional()
  })
}

type MeetingFormData = z.infer<ReturnType<typeof createMeetingSchema>>

export default function NewMeetingPage() {
  const t = useTranslations('admin.records.meetings.new')
  const tc = useTranslations('admin.common')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const meetingSchema = useMemo(
    () =>
      createMeetingSchema({
        titleMin: t('validation.titleMin'),
        dateRequired: t('validation.dateRequired'),
      }),
    [t]
  )

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
        toast.success(t('toastCreated'))
        router.push('/admin/meetings')
      } else {
        toast.error(result.error || t('toastCreateError'))
      }
    } catch (error) {
      console.error('Error creating meeting:', error)
      toast.error(t('toastCreateError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader title={t('title')} subtitle={t('subtitle')} backHref="/admin/meetings" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AdminFormSection title={t('detailsTitle')} description={t('detailsDescription')}>
          <div>
            <Label htmlFor="title">{t('titleLabel')}</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder={t('titlePlaceholder')}
              className={`h-11 ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="meeting_date">{t('dateLabel')}</Label>
            <Input
              id="meeting_date"
              type="datetime-local"
              {...register('meeting_date')}
              className={`h-11 ${errors.meeting_date ? 'border-red-500' : ''}`}
            />
            {errors.meeting_date && (
              <p className="mt-1 text-sm text-red-500">{errors.meeting_date.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">{t('descriptionLabel')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('descriptionPlaceholder')}
              rows={4}
            />
          </div>
        </AdminFormSection>

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full bg-[#003153] text-white hover:bg-[#003153]/90"
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </Button>
          <Button asChild variant="outline" className="h-11 w-full">
            <Link href="/admin/meetings">{tc('cancel')}</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
