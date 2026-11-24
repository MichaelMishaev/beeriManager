'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, TrendingUp, BarChart3 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import {
  AdminEmptyState,
  AdminFormSection,
  AdminGroup,
  AdminPageHeader,
  AdminRow,
} from '@/components/features/admin'

interface IssueStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  critical: number
  high: number
  medium: number
  low: number
  avgResolutionTime: number
  resolvedThisMonth: number
  openedThisMonth: number
}

export default function IssueStatsPage() {
  const t = useTranslations('admin.records.issues.stats')
  const [stats, setStats] = useState<IssueStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()

      // Get current month range
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

      // Fetch all issues
      const { data: issues } = await supabase
        .from('issues')
        .select('*')

      if (!issues) {
        setIsLoading(false)
        return
      }

      // Calculate statistics
      const total = issues.length
      const open = issues.filter(i => i.status === 'open').length
      const inProgress = issues.filter(i => i.status === 'in_progress').length
      const resolved = issues.filter(i => i.status === 'resolved').length
      const closed = issues.filter(i => i.status === 'closed').length

      const critical = issues.filter(i => i.priority === 'critical').length
      const high = issues.filter(i => i.priority === 'high').length
      const medium = issues.filter(i => i.priority === 'medium').length
      const low = issues.filter(i => i.priority === 'low').length

      // Calculate average resolution time for resolved/closed issues
      const resolvedIssues = issues.filter(i =>
        (i.status === 'resolved' || i.status === 'closed') && i.resolved_at
      )

      let avgResolutionTime = 0
      if (resolvedIssues.length > 0) {
        const totalTime = resolvedIssues.reduce((sum, issue) => {
          const created = new Date(issue.created_at).getTime()
          const resolved = new Date(issue.resolved_at!).getTime()
          return sum + (resolved - created)
        }, 0)
        avgResolutionTime = Math.round((totalTime / resolvedIssues.length) / (1000 * 60 * 60 * 24)) // Convert to days
      }

      // Issues this month
      const resolvedThisMonth = issues.filter(i =>
        i.resolved_at && new Date(i.resolved_at) >= firstDay
      ).length

      const openedThisMonth = issues.filter(i =>
        new Date(i.created_at) >= firstDay
      ).length

      setStats({
        total,
        open,
        inProgress,
        resolved,
        closed,
        critical,
        high,
        medium,
        low,
        avgResolutionTime,
        resolvedThisMonth,
        openedThisMonth,
      })
      setIsLoading(false)
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title={t('title')} backHref="/admin/more" />
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-2xl bg-gray-200" />
        <div className="h-48 animate-pulse rounded-2xl bg-gray-200" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title={t('title')} backHref="/admin/more" />
        <AdminEmptyState
          icon={AlertTriangle}
          title={t('errorTitle')}
          description={t('errorText')}
        />
      </div>
    )
  }

  const activeIssues = stats.open + stats.inProgress
  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved + stats.closed) / stats.total * 100) : 0
  const percentOfTotal = (count: number) =>
    stats.total > 0 ? Math.round(count / stats.total * 100) : 0

  const metrics: {
    key: string
    icon: LucideIcon
    label: string
    value: string | number
    valueClassName?: string
    note: string
  }[] = [
    {
      key: 'total',
      icon: BarChart3,
      label: t('metrics.total'),
      value: stats.total,
      note: t('metrics.activeNow', { count: activeIssues }),
    },
    {
      key: 'avgTime',
      icon: Clock,
      label: t('metrics.avgTime'),
      value: stats.avgResolutionTime,
      note: t('metrics.days'),
    },
    {
      key: 'rate',
      icon: CheckCircle,
      label: t('metrics.rate'),
      value: `${resolutionRate}%`,
      valueClassName: 'text-green-600',
      note: t('metrics.resolvedCount', { count: stats.resolved + stats.closed }),
    },
    {
      key: 'month',
      icon: TrendingUp,
      label: t('metrics.month'),
      value: stats.openedThisMonth,
      note: t('metrics.resolvedCount', { count: stats.resolvedThisMonth }),
    },
  ]

  const statusRows = [
    { key: 'open', dot: 'bg-orange-500', count: stats.open },
    { key: 'inProgress', dot: 'bg-blue-500', count: stats.inProgress },
    { key: 'resolved', dot: 'bg-green-500', count: stats.resolved },
    { key: 'closed', dot: 'bg-gray-500', count: stats.closed },
  ] as const

  const priorityRows = [
    { key: 'critical', dot: 'bg-red-500', count: stats.critical },
    { key: 'high', dot: 'bg-orange-500', count: stats.high },
    { key: 'medium', dot: 'bg-yellow-500', count: stats.medium },
    { key: 'low', dot: 'bg-green-500', count: stats.low },
  ] as const

  return (
    <div className="space-y-4">
      <AdminPageHeader title={t('title')} subtitle={t('subtitle')} backHref="/admin/more" />

      <AdminGroup>
        <AdminRow href="/issues" icon={AlertTriangle} title={t('backToIssues')} />
      </AdminGroup>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.key}
              className="rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            >
              <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <Icon className="h-4 w-4 flex-none" aria-hidden="true" />
                <span className="truncate">{metric.label}</span>
              </p>
              <p className={`mt-1 text-3xl font-bold text-[#003153] ${metric.valueClassName ?? ''}`}>
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-gray-500">{metric.note}</p>
            </div>
          )
        })}
      </div>

      {/* Status Breakdown */}
      <AdminFormSection title={t('statusTitle')} description={t('statusDescription')}>
        {statusRows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${row.dot}`} />
              <span className="text-sm">{t(`status.${row.key}`)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#003153]">{row.count}</span>
              <span className="text-sm text-gray-500">({percentOfTotal(row.count)}%)</span>
            </div>
          </div>
        ))}
      </AdminFormSection>

      {/* Priority Breakdown */}
      <AdminFormSection title={t('priorityTitle')} description={t('priorityDescription')}>
        {priorityRows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${row.dot}`} />
              <span className="text-sm">{t(`priority.${row.key}`)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#003153]">{row.count}</span>
              <span className="text-sm text-gray-500">({percentOfTotal(row.count)}%)</span>
            </div>
          </div>
        ))}
      </AdminFormSection>

      {/* Performance Insights */}
      <AdminFormSection title={t('insightsTitle')} description={t('insightsDescription')}>
        {stats.critical > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-red-600" aria-hidden="true" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900">{t('insights.criticalTitle')}</h4>
              <p className="mt-1 text-sm text-red-700">
                {t('insights.criticalText', { count: stats.critical })}
              </p>
            </div>
          </div>
        )}

        {stats.avgResolutionTime > 7 && (
          <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <Clock className="mt-0.5 h-5 w-5 flex-none text-yellow-600" aria-hidden="true" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900">{t('insights.slowTitle')}</h4>
              <p className="mt-1 text-sm text-yellow-700">
                {t('insights.slowText', { days: stats.avgResolutionTime })}
              </p>
            </div>
          </div>
        )}

        {resolutionRate >= 80 && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-none text-green-600" aria-hidden="true" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-900">{t('insights.excellentTitle')}</h4>
              <p className="mt-1 text-sm text-green-700">
                {t('insights.excellentText', { rate: resolutionRate })}
              </p>
            </div>
          </div>
        )}

        {stats.openedThisMonth > stats.resolvedThisMonth * 1.5 && (
          <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <TrendingUp className="mt-0.5 h-5 w-5 flex-none text-orange-600" aria-hidden="true" />
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900">{t('insights.risingTitle')}</h4>
              <p className="mt-1 text-sm text-orange-700">
                {t('insights.risingText', {
                  opened: stats.openedThisMonth,
                  resolved: stats.resolvedThisMonth,
                })}
              </p>
            </div>
          </div>
        )}
      </AdminFormSection>
    </div>
  )
}
