'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, User, Phone, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { AdminFormSection, AdminPageHeader } from '@/components/features/admin'
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

function createIssueSchema(messages: {
  titleMin: string
  descriptionMin: string
  reporterRequired: string
}) {
  return z.object({
    title: z.string().min(2, messages.titleMin),
    description: z.string().min(10, messages.descriptionMin),
    category: z.enum(['safety', 'maintenance', 'academic', 'social', 'financial', 'other']),
    priority: z.enum(['low', 'normal', 'high', 'critical']),
    status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
    reporter_name: z.string().min(2, messages.reporterRequired),
    reporter_contact: z.string().optional(),
    assigned_to: z.string().optional(),
    attachment_urls: z.array(z.string()).optional()
  })
}

type IssueFormData = z.infer<ReturnType<typeof createIssueSchema>>

const categoryValues = ['safety', 'maintenance', 'academic', 'social', 'financial', 'other'] as const
const priorityOptions = [
  { value: 'low', color: 'text-gray-600' },
  { value: 'normal', color: 'text-blue-600' },
  { value: 'high', color: 'text-orange-600' },
  { value: 'critical', color: 'text-red-600' }
] as const
const statusValues = ['open', 'in_progress', 'resolved', 'closed'] as const

export default function NewIssuePage() {
  const t = useTranslations('admin.records.issues.new')
  const tc = useTranslations('admin.common')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([])

  const issueSchema = useMemo(
    () =>
      createIssueSchema({
        titleMin: t('validation.titleMin'),
        descriptionMin: t('validation.descriptionMin'),
        reporterRequired: t('validation.reporterRequired'),
      }),
    [t]
  )

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
        toast.success(t('toastCreated'))
        router.push('/issues')
      } else {
        toast.error(result.error || t('toastCreateError'))
      }
    } catch (error) {
      console.error('Error creating issue:', error)
      toast.error(t('toastCreateError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader title={t('title')} subtitle={t('subtitle')} backHref="/admin/more" />

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
            <Label htmlFor="description">{t('descriptionLabel')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('descriptionPlaceholder')}
              rows={6}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="category">{t('categoryLabel')}</Label>
              <Select
                onValueChange={(value) => setValue('category', value as IssueFormData['category'])}
                defaultValue="other"
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryValues.map(value => (
                    <SelectItem key={value} value={value}>
                      {t(`category.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">{t('priorityLabel')}</Label>
              <Select
                onValueChange={(value) => setValue('priority', value as IssueFormData['priority'])}
                defaultValue="normal"
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className={option.color}>{t(`priority.${option.value}`)}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">{t('statusLabel')}</Label>
              <Select
                onValueChange={(value) => setValue('status', value as IssueFormData['status'])}
                defaultValue="open"
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusValues.map(value => (
                    <SelectItem key={value} value={value}>
                      {t(`status.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedPriority === 'critical' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                <p className="font-medium">{t('criticalTitle')}</p>
              </div>
              <p className="mt-1 text-sm text-red-700">{t('criticalText')}</p>
            </div>
          )}
        </AdminFormSection>

        <AdminFormSection title={t('reporterTitle')} description={t('reporterDescription')}>
          <div>
            <Label htmlFor="reporter_name">{t('reporterNameLabel')}</Label>
            <div className="relative">
              <User className="absolute start-3 top-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="reporter_name"
                {...register('reporter_name')}
                placeholder={t('reporterNamePlaceholder')}
                className={`h-11 ps-10 ${errors.reporter_name ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.reporter_name && (
              <p className="mt-1 text-sm text-red-500">{errors.reporter_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="reporter_contact">{t('reporterContactLabel')}</Label>
            <div className="relative">
              <Phone className="absolute start-3 top-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="reporter_contact"
                {...register('reporter_contact')}
                placeholder={t('reporterContactPlaceholder')}
                className="h-11 ps-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="assigned_to">{t('assignedToLabel')}</Label>
            <Input
              id="assigned_to"
              {...register('assigned_to')}
              placeholder={t('assignedToPlaceholder')}
              className="h-11"
            />
          </div>
        </AdminFormSection>

        <AdminFormSection title={t('attachmentsTitle')} description={t('attachmentsDescription')}>
          <FileUpload
            value={attachmentUrls}
            onChange={(urls) => setAttachmentUrls(urls as string[])}
            multiple={true}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            maxSize={10}
            bucket="issues"
          />
        </AdminFormSection>

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full bg-[#003153] text-white hover:bg-[#003153]/90"
          >
            {isSubmitting ? (
              <>{tc('loading')}</>
            ) : (
              <>
                <Save className="me-2 h-4 w-4" aria-hidden="true" />
                {t('submit')}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="h-11 w-full"
          >
            {tc('cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}
