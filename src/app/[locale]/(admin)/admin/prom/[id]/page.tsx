'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
  Users,
  DollarSign,
  Save,
  MapPin,
  Vote,
  FileSpreadsheet,
  Trash2
} from 'lucide-react'
import { Link, useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  AdminFormSection,
  AdminGroup,
  AdminPageHeader,
  AdminRow,
  StatusPill,
} from '@/components/features/admin'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PromEventDetail {
  id: string
  title: string
  title_ru: string | null
  description: string | null
  description_ru: string | null
  event_date: string | null
  event_time: string | null
  venue_name: string | null
  venue_address: string | null
  total_budget: number
  student_count: number
  status: string
  voting_enabled: boolean
  voting_start_date: string | null
  voting_end_date: string | null
  selected_quote_id: string | null
  quotes_count: number
  votes_count: number
  total_spent: number
  created_at: string
}

export default function PromDetailPage() {
  const t = useTranslations('admin.prom')
  const locale = useLocale()
  const numLocale = locale === 'ru' ? 'ru-RU' : 'he-IL'
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [promEvent, setPromEvent] = useState<PromEventDetail | null>(null)
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
    status: 'planning',
    voting_enabled: false,
    voting_start_date: '',
    voting_end_date: ''
  })

  useEffect(() => {
    fetchPromEvent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function fetchPromEvent() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/prom/${id}?_t=${Date.now()}`, {
        cache: 'no-store'
      })
      const data = await response.json()

      if (data.success) {
        setPromEvent(data.data)
        setFormData({
          title: data.data.title || '',
          title_ru: data.data.title_ru || '',
          description: data.data.description || '',
          description_ru: data.data.description_ru || '',
          event_date: data.data.event_date || '',
          event_time: data.data.event_time || '',
          venue_name: data.data.venue_name || '',
          venue_address: data.data.venue_address || '',
          total_budget: data.data.total_budget?.toString() || '',
          student_count: data.data.student_count?.toString() || '',
          status: data.data.status || 'planning',
          voting_enabled: data.data.voting_enabled || false,
          voting_start_date: data.data.voting_start_date?.split('T')[0] || '',
          voting_end_date: data.data.voting_end_date?.split('T')[0] || ''
        })
      } else {
        toast.error(t('detail.toast.loadError'))
        router.push('/admin/prom')
      }
    } catch (error) {
      console.error('Error fetching prom event:', error)
      toast.error(t('detail.toast.loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error(t('form.toast.titleRequired'))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/prom/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(t('detail.toast.updated'))
        fetchPromEvent()
      } else {
        toast.error(data.error || t('detail.toast.updateError'))
      }
    } catch (error) {
      console.error('Error updating prom event:', error)
      toast.error(t('detail.toast.updateError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(t('detail.confirmDelete'))) {
      return
    }

    try {
      const response = await fetch(`/api/prom/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        toast.success(t('detail.toast.deleted'))
        router.push('/admin/prom')
      } else {
        toast.error(data.error || t('detail.toast.deleteError'))
      }
    } catch (error) {
      console.error('Error deleting prom event:', error)
      toast.error(t('detail.toast.deleteError'))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-2xl bg-white" />
        <div className="h-48 animate-pulse rounded-2xl bg-white" />
        <div className="h-64 animate-pulse rounded-2xl bg-white" />
      </div>
    )
  }

  if (!promEvent) {
    return null
  }

  const money = (n: number) => `₪${n.toLocaleString(numLocale)}`

  return (
    <div>
      <AdminPageHeader
        title={promEvent.title}
        subtitle={t('detail.subtitle')}
        backHref="/admin/prom"
      />

      <div className="space-y-4">
        {/* Shortcuts and numbers */}
        <AdminGroup>
          <AdminRow
            href={`/admin/prom/${id}/quotes`}
            icon={FileSpreadsheet}
            iconClassName="bg-[#87CEEB]/30 text-[#003153]"
            title={t('detail.compareQuotes')}
            subtitle={t('detail.quotesCount', { count: promEvent.quotes_count })}
          />
          <AdminRow
            href={`/admin/prom/${id}/budget`}
            icon={DollarSign}
            iconClassName="bg-[#FFBA00]/25 text-[#003153]"
            title={t('detail.budget')}
            subtitle={t('detail.spent', { amount: money(promEvent.total_spent) })}
          />
          <AdminRow
            onClick={() => {
              if (formData.voting_enabled) {
                const voteUrl = `${window.location.origin}/prom/${id}/vote`
                navigator.clipboard.writeText(voteUrl)
                toast.success(t('detail.toast.voteLinkCopied'))
              } else {
                toast.info(t('detail.toast.enableVoting'))
              }
            }}
            icon={Vote}
            iconClassName="bg-[#FF8200]/20 text-[#003153]"
            title={t('detail.votes')}
            subtitle={t('detail.votesCount', { count: promEvent.votes_count })}
            trailing={
              formData.voting_enabled ? (
                <StatusPill tone="info">{t('detail.copyLink')}</StatusPill>
              ) : (
                <StatusPill tone="neutral">{t('detail.inactive')}</StatusPill>
              )
            }
          />
          <AdminRow
            onClick={() => {
              if (promEvent.student_count > 0 && promEvent.total_budget > 0) {
                const perStudent = Math.round(promEvent.total_budget / promEvent.student_count)
                const spent = Math.round(promEvent.total_spent / promEvent.student_count)
                toast.info(t('detail.toast.perStudent', { budget: `₪${perStudent}`, spent: `₪${spent}` }))
              } else {
                toast.info(t('detail.toast.needStudentsBudget'))
              }
            }}
            icon={Users}
            iconClassName="bg-[#eef0f2] text-[#003153]"
            title={t('detail.perStudent')}
            subtitle={
              promEvent.student_count > 0
                ? `₪${Math.round(promEvent.total_budget / promEvent.student_count)}`
                : '—'
            }
            trailing={<StatusPill tone="neutral">{t('detail.details')}</StatusPill>}
          />
        </AdminGroup>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <AdminFormSection title={t('form.sections.basic')}>
            <div className="space-y-2">
              <Label htmlFor="title">{t('form.fields.title')}</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
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
                rows={3}
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
                  <SelectItem value="completed">{t('status.completed')}</SelectItem>
                  <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AdminFormSection>

          {/* Date & Location */}
          <AdminFormSection title={t('form.sections.dateLocation')}>
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
              />
            </div>
          </AdminFormSection>

          {/* Budget & Students */}
          <AdminFormSection title={t('form.sections.budget')}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_budget">{t('form.fields.totalBudget')}</Label>
                <Input
                  id="total_budget"
                  name="total_budget"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.total_budget}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_count">{t('form.fields.studentCount')}</Label>
                <Input
                  id="student_count"
                  name="student_count"
                  type="number"
                  min="0"
                  value={formData.student_count}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Budget Progress */}
            {promEvent.total_budget > 0 && (
              <div>
                <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                  <span>{t('detail.budgetUsage')}</span>
                  <span>
                    {Math.round((promEvent.total_spent / promEvent.total_budget) * 100)}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      (promEvent.total_spent / promEvent.total_budget) > 0.9
                        ? 'bg-red-500'
                        : (promEvent.total_spent / promEvent.total_budget) > 0.7
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    )}
                    style={{ width: `${Math.min(100, (promEvent.total_spent / promEvent.total_budget) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </AdminFormSection>

          {/* Voting Settings */}
          <AdminFormSection
            title={t('detail.voting.title')}
            description={t('detail.voting.description')}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Label>{t('detail.voting.enable')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('detail.voting.enableHint')}
                </p>
              </div>
              <Switch
                checked={formData.voting_enabled}
                onCheckedChange={(checked) => handleSwitchChange('voting_enabled', checked)}
              />
            </div>

            {formData.voting_enabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="voting_start_date">{t('detail.voting.startDate')}</Label>
                  <Input
                    id="voting_start_date"
                    name="voting_start_date"
                    type="date"
                    value={formData.voting_start_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voting_end_date">{t('detail.voting.endDate')}</Label>
                  <Input
                    id="voting_end_date"
                    name="voting_end_date"
                    type="date"
                    value={formData.voting_end_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="rounded-lg border border-[#87CEEB] bg-[#87CEEB]/15 p-3">
                  <p className="text-sm text-[#003153]">
                    {t('detail.voting.link')}
                    <br />
                    <code
                      dir="ltr"
                      className="mt-1 block overflow-auto rounded bg-white px-2 py-1 text-start text-xs"
                    >
                      {typeof window !== 'undefined' ? `${window.location.origin}/prom/${id}/vote` : ''}
                    </code>
                  </p>
                </div>
              </>
            )}
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
                  {t('detail.save')}
                </>
              )}
            </Button>
            <Button variant="outline" asChild className="h-12 w-full">
              <Link href="/admin/prom">{t('form.cancel')}</Link>
            </Button>
          </div>
        </form>

        {/* Delete */}
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleDelete}
        >
          <Trash2 className="me-2 h-4 w-4" aria-hidden="true" />
          {t('detail.delete')}
        </Button>
      </div>
    </div>
  )
}
