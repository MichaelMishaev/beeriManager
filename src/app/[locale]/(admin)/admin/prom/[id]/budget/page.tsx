'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
  DollarSign,
  Users,
  TrendingDown,
  Save,
  AlertTriangle,
  CheckCircle2,
  PieChart
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminGroup, AdminPageHeader, StatusPill } from '@/components/features/admin'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface BudgetItem {
  id: string
  category: string
  category_label: string
  allocated_amount: number
  spent_amount: number
  notes: string | null
}

interface BudgetSummary {
  total_budget: number
  total_allocated: number
  total_spent: number
  remaining: number
  student_count: number
  per_student: number
  usage_percentage: number
}

interface PromEvent {
  id: string
  title: string
  student_count: number
  total_budget: number
}

// Category glyph and bar colour. Labels come from translations (admin.prom.categories.<key>).
const categoryConfig: Record<string, { emoji: string; color: string }> = {
  venue: { emoji: '🏛️', color: 'bg-blue-500' },
  catering: { emoji: '🍕', color: 'bg-orange-500' },
  dj: { emoji: '🎵', color: 'bg-purple-500' },
  photography: { emoji: '📷', color: 'bg-pink-500' },
  decorations: { emoji: '🎈', color: 'bg-yellow-500' },
  transportation: { emoji: '🚌', color: 'bg-green-500' },
  entertainment: { emoji: '🎭', color: 'bg-indigo-500' },
  shirts: { emoji: '👕', color: 'bg-cyan-500' },
  sound_lighting: { emoji: '💡', color: 'bg-amber-500' },
  yearbook: { emoji: '📚', color: 'bg-rose-500' },
  recording: { emoji: '🎬', color: 'bg-red-500' },
  scenery: { emoji: '🎪', color: 'bg-fuchsia-500' },
  flowers: { emoji: '💐', color: 'bg-lime-500' },
  security: { emoji: '🛡️', color: 'bg-slate-500' },
  electrician: { emoji: '⚡', color: 'bg-sky-500' },
  moving: { emoji: '🚚', color: 'bg-stone-500' },
  video_editing: { emoji: '🎥', color: 'bg-violet-500' },
  drums: { emoji: '🥁', color: 'bg-amber-600' },
  choreography: { emoji: '💃', color: 'bg-pink-600' },
  other: { emoji: '📦', color: 'bg-gray-500' }
}

const allCategories = Object.keys(categoryConfig)

export default function BudgetTrackerPage() {
  const t = useTranslations('admin.prom')
  const locale = useLocale()
  const numLocale = locale === 'ru' ? 'ru-RU' : 'he-IL'
  const params = useParams()
  const promId = params.id as string
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [promEvent, setPromEvent] = useState<PromEvent | null>(null)
  const [, setBudgetItems] = useState<BudgetItem[]>([])
  const [, setSummary] = useState<BudgetSummary | null>(null)
  const [editedItems, setEditedItems] = useState<Record<string, { allocated: string; spent: string }>>({})

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promId])

  async function fetchData() {
    setIsLoading(true)
    try {
      const [promResponse, budgetResponse] = await Promise.all([
        fetch(`/api/prom/${promId}?_t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/prom/${promId}/budget?_t=${Date.now()}`, { cache: 'no-store' })
      ])

      const promData = await promResponse.json()
      const budgetData = await budgetResponse.json()

      if (promData.success) {
        setPromEvent(promData.data)
      }

      if (budgetData.success) {
        setBudgetItems(budgetData.data.items)
        setSummary(budgetData.data.summary)

        // Initialize edit state for all categories
        const initial: Record<string, { allocated: string; spent: string }> = {}
        allCategories.forEach(cat => {
          const item = budgetData.data.items.find((i: BudgetItem) => i.category === cat)
          initial[cat] = {
            allocated: item?.allocated_amount?.toString() || '0',
            spent: item?.spent_amount?.toString() || '0'
          }
        })
        setEditedItems(initial)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error(t('budget.toast.loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleItemChange = (category: string, field: 'allocated' | 'spent', value: string) => {
    setEditedItems(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const items = allCategories.map(category => ({
        category,
        allocated_amount: parseFloat(editedItems[category]?.allocated) || 0,
        spent_amount: parseFloat(editedItems[category]?.spent) || 0
      }))

      const response = await fetch(`/api/prom/${promId}/budget`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(t('budget.toast.saved'))
        fetchData()
      } else {
        toast.error(data.error || t('budget.toast.saveError'))
      }
    } catch (error) {
      console.error('Error saving budget:', error)
      toast.error(t('budget.toast.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate totals from edited values
  const calcAllocated = Object.values(editedItems).reduce(
    (sum, item) => sum + (parseFloat(item.allocated) || 0), 0
  )
  const calcSpent = Object.values(editedItems).reduce(
    (sum, item) => sum + (parseFloat(item.spent) || 0), 0
  )
  const calcRemaining = (promEvent?.total_budget || 0) - calcSpent

  const money = (n: number) => `₪${n.toLocaleString(numLocale)}`
  const totalBudget = promEvent?.total_budget || 0
  const studentCount = promEvent?.student_count || 0
  const overall = calcRemaining >= 0

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-2xl bg-white" />
        <div className="h-40 animate-pulse rounded-2xl bg-white" />
        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </div>
    )
  }

  const saveLabel = t('budget.save')

  return (
    <div>
      <AdminPageHeader
        title={t('budget.title')}
        subtitle={promEvent?.title}
        backHref={`/admin/prom/${promId}`}
        action={
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            aria-label={saveLabel}
            className="h-11 w-11 rounded-full bg-[#0D98BA] p-0 text-white hover:bg-[#0b86a3]"
          >
            <Save className="h-5 w-5" aria-hidden="true" />
          </Button>
        }
      />

      <div className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-[#eef0f2] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className={cn('p-3', overall ? 'bg-[#ecfdf5]' : 'bg-[#fef2f2]')}>
            <div
              className={cn(
                'flex items-center gap-1.5 text-xs font-semibold',
                overall ? 'text-green-800' : 'text-red-800'
              )}
            >
              {overall ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              {t('budget.summary.remaining')}
            </div>
            <div className={cn('mt-1 truncate text-2xl font-bold', overall ? 'text-green-900' : 'text-red-900')}>
              {money(Math.abs(calcRemaining))}
            </div>
            <p className={cn('text-xs', overall ? 'text-green-700' : 'text-red-700')}>
              {overall ? t('budget.summary.leftOfBudget') : t('budget.summary.overBudget')}
            </p>
          </div>

          <div className="bg-white p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5b6570]">
              <DollarSign className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t('budget.summary.totalBudget')}
            </div>
            <div className="mt-1 truncate text-2xl font-bold text-[#003153]">{money(totalBudget)}</div>
            <p className="truncate text-xs text-gray-500">
              {t('budget.summary.allocated', { amount: money(calcAllocated) })}
            </p>
          </div>

          <div className="bg-white p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5b6570]">
              <TrendingDown className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t('budget.summary.expenses')}
            </div>
            <div className="mt-1 truncate text-2xl font-bold text-[#003153]">{money(calcSpent)}</div>
            <p className="truncate text-xs text-gray-500">
              {totalBudget > 0
                ? t('budget.summary.percentOfBudget', { percent: Math.round((calcSpent / totalBudget) * 100) })
                : '—'}
            </p>
          </div>

          <div className="bg-white p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5b6570]">
              <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t('budget.summary.perStudent')}
            </div>
            <div className="mt-1 truncate text-2xl font-bold text-[#003153]">
              {studentCount > 0 ? `₪${Math.round(calcSpent / studentCount)}` : '—'}
            </div>
            <p className="truncate text-xs text-gray-500">
              {t('budget.summary.studentsCount', { count: studentCount })}
            </p>
          </div>
        </div>

        {/* Budget Progress */}
        <section className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-[#003153]">
            <PieChart className="h-4 w-4 text-[#0D98BA]" aria-hidden="true" />
            {t('budget.usage.title')}
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('budget.usage.spentVsBudget')}</span>
              <span className="font-medium">
                {totalBudget > 0 ? `${Math.round((calcSpent / totalBudget) * 100)}%` : '—'}
              </span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-gray-100">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  totalBudget > 0 && calcSpent > totalBudget
                    ? 'bg-red-500'
                    : totalBudget > 0 && (calcSpent / totalBudget) > 0.9
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                )}
                style={{
                  width: `${Math.min(100, totalBudget > 0 ? (calcSpent / totalBudget) * 100 : 0)}%`
                }}
              />
            </div>
          </div>
        </section>

        {/* Category Breakdown */}
        <AdminGroup title={t('budget.categories.title')} description={t('budget.categories.description')}>
          {allCategories.map((category) => {
            const config = categoryConfig[category]
            const allocated = parseFloat(editedItems[category]?.allocated) || 0
            const spent = parseFloat(editedItems[category]?.spent) || 0
            const percentage = allocated > 0 ? Math.round((spent / allocated) * 100) : 0
            const isOverBudget = spent > allocated && allocated > 0

            return (
              <div key={category} className="space-y-3 px-3 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 flex-none items-center justify-center rounded-lg text-xl',
                      config.color.replace('bg-', 'bg-opacity-20 ')
                    )}
                  >
                    {config.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-[#003153]">
                        {t(`categories.${category}`)}
                      </span>
                      {isOverBudget && (
                        <StatusPill tone="danger">
                          <AlertTriangle className="me-1 h-3 w-3" aria-hidden="true" />
                          {t('budget.categories.over')}
                        </StatusPill>
                      )}
                    </div>
                    {allocated > 0 && (
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={cn('h-full rounded-full', isOverBudget ? 'bg-red-500' : config.color)}
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          />
                        </div>
                        <span className="w-12 text-end text-xs text-muted-foreground">
                          {percentage}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t('budget.categories.allocated')}</Label>
                    <div className="relative">
                      <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₪</span>
                      <Input
                        type="number"
                        min="0"
                        value={editedItems[category]?.allocated || '0'}
                        onChange={(e) => handleItemChange(category, 'allocated', e.target.value)}
                        className="ps-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t('budget.categories.actual')}</Label>
                    <div className="relative">
                      <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₪</span>
                      <Input
                        type="number"
                        min="0"
                        value={editedItems[category]?.spent || '0'}
                        onChange={(e) => handleItemChange(category, 'spent', e.target.value)}
                        className={cn('ps-8', isOverBudget && 'border-red-300 bg-red-50')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </AdminGroup>

        {/* Totals Summary */}
        <section className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t('budget.totals.allocated')}</p>
              <p className="truncate text-lg font-bold text-[#003153]">{money(calcAllocated)}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t('budget.totals.expenses')}</p>
              <p className="truncate text-lg font-bold text-orange-600">{money(calcSpent)}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t('budget.totals.remaining')}</p>
              <p className={cn('truncate text-lg font-bold', overall ? 'text-green-600' : 'text-red-600')}>
                {money(Math.abs(calcRemaining))}
                {calcRemaining < 0 && ` ${t('budget.totals.overSuffix')}`}
              </p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-12 w-full bg-[#0D98BA] text-white hover:bg-[#0b86a3]"
          >
            {isSaving ? (
              <>
                <div className="me-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t('form.saving')}
              </>
            ) : (
              <>
                <Save className="me-2 h-4 w-4" aria-hidden="true" />
                {saveLabel}
              </>
            )}
          </Button>
          <Button variant="outline" asChild className="h-12 w-full">
            <Link href={`/admin/prom/${promId}/quotes`}>{t('budget.backToQuotes')}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
