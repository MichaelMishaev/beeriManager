'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { he, ru } from 'date-fns/locale'
import {
  GraduationCap,
  Plus,
  Calendar,
  Users,
  DollarSign,
  Vote,
  FileSpreadsheet,
  BarChart3,
  Trash2,
  Edit,
  HelpCircle,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AdminEmptyState,
  AdminGroup,
  AdminPageHeader,
  AdminRow,
  StatusPill,
} from '@/components/features/admin'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PromEvent {
  id: string
  title: string
  event_date: string | null
  total_budget: number
  student_count: number
  status: 'planning' | 'voting' | 'confirmed' | 'completed' | 'cancelled'
  voting_enabled: boolean
  quotes_count?: number
  votes_count?: number
  total_spent?: number
  created_at: string
}

type PillTone = 'success' | 'neutral' | 'warning' | 'danger' | 'info'

const statusTones: Record<PromEvent['status'], PillTone> = {
  planning: 'info',
  voting: 'warning',
  confirmed: 'success',
  completed: 'neutral',
  cancelled: 'danger',
}

export default function PromDashboardPage() {
  const t = useTranslations('admin.prom')
  const locale = useLocale()
  const numLocale = locale === 'ru' ? 'ru-RU' : 'he-IL'
  const dateLocale = locale === 'ru' ? ru : he

  const [promEvents, setPromEvents] = useState<PromEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  useEffect(() => {
    fetchPromEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchPromEvents() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/prom?_t=${Date.now()}`, {
        cache: 'no-store',
      })
      const data = await response.json()

      if (data.success) {
        // Fetch additional stats for each event
        const eventsWithStats = await Promise.all(
          data.data.map(async (event: PromEvent) => {
            const detailResponse = await fetch(`/api/prom/${event.id}?_t=${Date.now()}`, {
              cache: 'no-store',
            })
            const detailData = await detailResponse.json()
            return detailData.success ? detailData.data : event
          })
        )
        setPromEvents(eventsWithStats)
      } else {
        toast.error(t('list.toast.loadError'))
      }
    } catch (error) {
      console.error('Error fetching prom events:', error)
      toast.error(t('list.toast.loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('list.confirmDelete'))) {
      return
    }

    try {
      const response = await fetch(`/api/prom/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        toast.success(t('list.toast.deleted'))
        fetchPromEvents()
      } else {
        toast.error(data.error || t('list.toast.deleteError'))
      }
    } catch (error) {
      console.error('Error deleting prom event:', error)
      toast.error(t('list.toast.deleteError'))
    }
  }

  // Calculate totals
  const totalBudget = promEvents.reduce((sum, e) => sum + (e.total_budget || 0), 0)
  const totalSpent = promEvents.reduce((sum, e) => sum + (e.total_spent || 0), 0)
  const totalStudents = promEvents.reduce((sum, e) => sum + (e.student_count || 0), 0)
  const totalVotes = promEvents.reduce((sum, e) => sum + (e.votes_count || 0), 0)
  const activeEvents = promEvents.filter(e => !['completed', 'cancelled'].includes(e.status)).length

  const money = (n: number) => `₪${n.toLocaleString(numLocale)}`

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={t('list.title')}
        subtitle={t('list.subtitle')}
        backHref="/admin/more"
        action={
          <Link
            href="/admin/prom/new"
            aria-label={t('list.newEvent')}
            data-testid="admin-prom-new"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0D98BA] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#0b86a3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003153]"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </Link>
        }
      />

      {/* Stats overview */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-[#eef0f2] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="bg-white p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5b6570]">
            <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t('list.stats.activeEvents')}
          </div>
          <div className="mt-1 text-2xl font-bold text-[#003153]">{activeEvents}</div>
          <p className="truncate text-xs text-gray-500">
            {t('list.stats.ofTotal', { count: promEvents.length })}
          </p>
        </div>

        <div className="bg-white p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5b6570]">
            <DollarSign className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t('list.stats.totalBudget')}
          </div>
          <div className="mt-1 truncate text-2xl font-bold text-[#003153]">{money(totalBudget)}</div>
          <p className="truncate text-xs text-gray-500">
            {t('list.stats.spent', { amount: money(totalSpent) })}
          </p>
        </div>

        <div className="bg-white p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5b6570]">
            <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t('list.stats.students')}
          </div>
          <div className="mt-1 text-2xl font-bold text-[#003153]">{totalStudents}</div>
          <p className="truncate text-xs text-gray-500">
            {totalStudents > 0 && totalBudget > 0
              ? t('list.stats.perStudent', { amount: `₪${Math.round(totalBudget / totalStudents)}` })
              : t('list.stats.noData')}
          </p>
        </div>

        <div className="bg-white p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5b6570]">
            <Vote className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t('list.stats.votes')}
          </div>
          <div className="mt-1 text-2xl font-bold text-[#003153]">{totalVotes}</div>
          <p className="truncate text-xs text-gray-500">
            {t('list.stats.activeVotes', { count: promEvents.filter(e => e.voting_enabled).length })}
          </p>
        </div>
      </div>

      {/* Events list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : promEvents.length === 0 ? (
        <AdminEmptyState
          icon={GraduationCap}
          title={t('list.empty.title')}
          description={t('list.empty.description')}
          action={
            <Button asChild className="h-11 bg-[#0D98BA] text-white hover:bg-[#0b86a3]">
              <Link href="/admin/prom/new">
                <Plus className="me-2 h-4 w-4" aria-hidden="true" />
                {t('list.empty.create')}
              </Link>
            </Button>
          }
        />
      ) : (
        <AdminGroup title={t('list.groupTitle')} description={t('list.groupDescription')}>
          {promEvents.map((event) => {
            const spentRatio =
              event.total_budget > 0 ? (event.total_spent || 0) / event.total_budget : 0
            const votesCount = event.votes_count ?? 0

            return (
              <div key={event.id} className="px-3 py-3" data-testid="admin-prom-row">
                <Link
                  href={`/admin/prom/${event.id}/quotes`}
                  className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA]"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="min-w-0 flex-1 truncate text-[14.5px] font-semibold text-[#003153]">
                      {event.title}
                    </h3>
                    <StatusPill tone={statusTones[event.status] ?? 'neutral'}>
                      {t(`status.${event.status}`)}
                    </StatusPill>
                  </div>

                  {event.voting_enabled && (
                    <div className="mt-1.5">
                      <StatusPill tone="info">
                        <Vote className="me-1 h-3 w-3" aria-hidden="true" />
                        {t('list.votingActive')}
                      </StatusPill>
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {event.event_date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {format(new Date(event.event_date), t('list.dateFormat'), { locale: dateLocale })}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {t('list.studentsCount', { count: event.student_count || 0 })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {money(event.total_budget || 0)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {t('list.quotesCount', { count: event.quotes_count || 0 })}
                    </span>
                    {votesCount > 0 && (
                      <span className="flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {t('list.votesCount', { count: votesCount })}
                      </span>
                    )}
                  </div>

                  {/* Budget progress */}
                  {event.total_budget > 0 && (
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-gray-500">
                        <span>{t('list.budget')}</span>
                        <span>
                          {money(event.total_spent || 0)} / {money(event.total_budget)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            spentRatio > 0.9
                              ? 'bg-red-500'
                              : spentRatio > 0.7
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          )}
                          style={{ width: `${Math.min(100, spentRatio * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Link>

                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" asChild className="h-11 min-w-0 flex-1 px-2">
                    <Link href={`/admin/prom/${event.id}/quotes`}>
                      <FileSpreadsheet className="me-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{t('list.actions.compare')}</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="h-11 min-w-0 flex-1 px-2">
                    <Link href={`/admin/prom/${event.id}/budget`}>
                      <DollarSign className="me-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{t('list.actions.budget')}</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="h-11 min-w-0 flex-1 px-2">
                    <Link href={`/admin/prom/${event.id}`}>
                      <Edit className="me-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{t('list.actions.edit')}</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={t('list.actions.delete')}
                    className="h-11 w-11 flex-none border-red-200 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )
          })}
        </AdminGroup>
      )}

      {/* Quick actions */}
      <AdminGroup title={t('list.quickActions.title')}>
        <AdminRow
          href="/admin/prom/new"
          icon={Plus}
          iconClassName="bg-[#87CEEB]/30 text-[#003153]"
          title={t('list.quickActions.newParty')}
        />
        <AdminRow
          href="/admin/vendors"
          icon={Users}
          iconClassName="bg-[#87CEEB]/30 text-[#003153]"
          title={t('list.quickActions.vendors')}
        />
        <AdminRow
          href="/admin/expenses"
          icon={DollarSign}
          iconClassName="bg-[#FFBA00]/25 text-[#003153]"
          title={t('list.quickActions.expenses')}
        />
        <AdminRow
          href="/admin/events/new"
          icon={Calendar}
          iconClassName="bg-[#FF8200]/20 text-[#003153]"
          title={t('list.quickActions.newEvent')}
        />
      </AdminGroup>

      {/* Help */}
      <AdminGroup>
        <AdminRow
          onClick={() => setIsHelpOpen(true)}
          icon={HelpCircle}
          iconClassName="bg-[#eef0f2] text-[#003153]"
          title={t('list.help.button')}
        />
      </AdminGroup>

      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t('list.help.title')}</DialogTitle>
            <DialogDescription>{t('list.help.description')}</DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-w-none space-y-6 text-start">
            <section>
              <h3 className="mb-3 text-lg font-bold">{t('list.help.startTitle')}</h3>
              <ol className="list-inside list-decimal space-y-2 text-sm">
                <li>{t.rich('list.help.start1', { b: (chunks) => <strong>{chunks}</strong> })}</li>
                <li>{t('list.help.start2')}</li>
                <li>{t.rich('list.help.start3', { b: (chunks) => <strong>{chunks}</strong> })}</li>
                <li>{t('list.help.start4')}</li>
              </ol>
            </section>

            <section>
              <h3 className="mb-3 text-lg font-bold">{t('list.help.mainTitle')}</h3>
              <ul className="list-inside list-disc space-y-2 text-sm">
                <li>{t.rich('list.help.main1', { b: (chunks) => <strong>{chunks}</strong> })}</li>
                <li>{t.rich('list.help.main2', { b: (chunks) => <strong>{chunks}</strong> })}</li>
                <li>{t.rich('list.help.main3', { b: (chunks) => <strong>{chunks}</strong> })}</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-3 text-lg font-bold">{t('list.help.tipsTitle')}</h3>
              <ul className="list-inside list-disc space-y-2 text-sm">
                <li>{t.rich('list.help.tip1', { b: (chunks) => <strong>{chunks}</strong> })}</li>
                <li>{t.rich('list.help.tip2', { b: (chunks) => <strong>{chunks}</strong> })}</li>
                <li>{t.rich('list.help.tip3', { b: (chunks) => <strong>{chunks}</strong> })}</li>
                <li>{t.rich('list.help.tip4', { b: (chunks) => <strong>{chunks}</strong> })}</li>
              </ul>
            </section>

            <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 text-lg font-bold text-blue-900">{t('list.help.moreTitle')}</h3>
              <p className="mb-2 text-sm text-blue-800">{t('list.help.moreIntro')}</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
                <li>{t('list.help.more1')}</li>
                <li>{t('list.help.more2')}</li>
                <li>{t('list.help.more3')}</li>
                <li>{t('list.help.more4')}</li>
              </ul>
            </section>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsHelpOpen(false)}>{t('list.help.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
