'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Users, DollarSign, Save, MapPin } from 'lucide-react'
import { Link, useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminFormSection, AdminPageHeader } from '@/components/features/admin'
import { toast } from 'sonner'

export default function NewPromPage() {
  const t = useTranslations('admin.prom')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    title_ru: '',
    description: '',
    description_ru: '',
    event_date: '',
    event_time: '',
    venue_name: '',
    venue_address: '',
    total_budget: '',
    student_count: '',
    status: 'planning'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error(t('form.toast.titleRequired'))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/prom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(t('form.toast.created'))
        router.push(`/admin/prom/${data.data.id}`)
      } else {
        toast.error(data.error || t('form.toast.createError'))
      }
    } catch (error) {
      console.error('Error creating prom event:', error)
      toast.error(t('form.toast.createError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title={t('form.title')}
        subtitle={t('form.subtitle')}
        backHref="/admin/prom"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <AdminFormSection title={t('form.sections.basic')} description={t('form.sections.basicDescription')}>
          <div className="space-y-2">
            <Label htmlFor="title">{t('form.fields.title')}</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('form.placeholders.title')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title_ru">{t('form.fields.titleRu')}</Label>
            <Input
              id="title_ru"
              name="title_ru"
              value={formData.title_ru}
              onChange={handleChange}
              placeholder={t('form.placeholders.titleRu')}
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('form.fields.description')}</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('form.placeholders.description')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_ru">{t('form.fields.descriptionRu')}</Label>
            <Textarea
              id="description_ru"
              name="description_ru"
              value={formData.description_ru}
              onChange={handleChange}
              placeholder={t('form.placeholders.descriptionRu')}
              rows={3}
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t('form.fields.status')}</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">{t('status.planning')}</SelectItem>
                <SelectItem value="voting">{t('status.voting')}</SelectItem>
                <SelectItem value="confirmed">{t('status.confirmed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </AdminFormSection>

        {/* Date & Location */}
        <AdminFormSection title={t('form.sections.dateLocation')} description={t('form.sections.dateLocationDescription')}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">{t('form.fields.date')}</Label>
              <Input
                id="event_date"
                name="event_date"
                type="date"
                value={formData.event_date}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_time">{t('form.fields.time')}</Label>
              <Input
                id="event_time"
                name="event_time"
                type="time"
                value={formData.event_time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue_name">{t('form.fields.venueName')}</Label>
            <div className="relative">
              <MapPin className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="venue_name"
                name="venue_name"
                value={formData.venue_name}
                onChange={handleChange}
                placeholder={t('form.placeholders.venueName')}
                className="ps-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue_address">{t('form.fields.venueAddress')}</Label>
            <Input
              id="venue_address"
              name="venue_address"
              value={formData.venue_address}
              onChange={handleChange}
              placeholder={t('form.placeholders.venueAddress')}
            />
          </div>
        </AdminFormSection>

        {/* Budget & Students */}
        <AdminFormSection title={t('form.sections.budget')} description={t('form.sections.budgetDescription')}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_budget">{t('form.fields.totalBudget')}</Label>
              <div className="relative">
                <DollarSign className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="total_budget"
                  name="total_budget"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.total_budget}
                  onChange={handleChange}
                  placeholder="15000"
                  className="ps-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student_count">{t('form.fields.studentCount')}</Label>
              <div className="relative">
                <Users className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="student_count"
                  name="student_count"
                  type="number"
                  min="0"
                  value={formData.student_count}
                  onChange={handleChange}
                  placeholder="60"
                  className="ps-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('form.fields.costPerStudent')}</Label>
            <div className="flex h-10 items-center rounded-md bg-muted px-3 text-muted-foreground">
              {formData.total_budget && formData.student_count && parseInt(formData.student_count) > 0
                ? `₪${Math.round(parseInt(formData.total_budget) / parseInt(formData.student_count))}`
                : '—'}
            </div>
          </div>
        </AdminFormSection>

        {/* Submit */}
        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full bg-[#0D98BA] text-white hover:bg-[#0b86a3]"
          >
            {isSubmitting ? (
              <>
                <div className="me-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t('form.saving')}
              </>
            ) : (
              <>
                <Save className="me-2 h-4 w-4" aria-hidden="true" />
                {t('form.submit')}
              </>
            )}
          </Button>
          <Button variant="outline" asChild className="h-12 w-full">
            <Link href="/admin/prom">{t('form.cancel')}</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
