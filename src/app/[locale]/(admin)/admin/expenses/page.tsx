'use client'

import { useState, useEffect } from 'react'
import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'
import { Link } from '@/i18n/navigation'
import {
  AdminEmptyState,
  AdminFormSection,
  AdminGroup,
  AdminPageHeader,
  AdminRow,
  StatusPill,
} from '@/components/features/admin'

interface Expense {
  id: string
  title: string
  description?: string
  amount: number
  expense_type: 'income' | 'expense'
  category: string
  payment_method: string
  expense_date: string
  vendor_name?: string
  receipt_url?: string
  event_id?: string
  approved: boolean
  approved_by?: string
  notes?: string
  created_at: string
  created_by: string
}

interface Totals {
  income: number
  expenses: number
  balance: number
}

const categoryKeys = [
  'events',
  'maintenance',
  'equipment',
  'refreshments',
  'transportation',
  'donations',
  'fundraising',
  'other',
] as const

export default function ExpensesPage() {
  const t = useTranslations('admin.org.expenses')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [totals, setTotals] = useState<Totals>({ income: 0, expenses: 0, balance: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedApproved, setSelectedApproved] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))

  const categoryLabel = (key: string) =>
    t.has(`categories.${key}`) ? t(`categories.${key}`) : key
  const paymentMethodLabel = (key: string) =>
    t.has(`paymentMethods.${key}`) ? t(`paymentMethods.${key}`) : key

  useEffect(() => {
    fetchExpenses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, selectedCategory, selectedApproved, selectedMonth])

  async function fetchExpenses() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedType !== 'all') params.append('type', selectedType)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedApproved !== 'all') params.append('approved', selectedApproved)

      // Add month filter
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-')
        const startDate = `${year}-${month}-01`
        const endDate = `${year}-${month}-31`
        params.append('start_date', startDate)
        params.append('end_date', endDate)
      }

      const response = await fetch(`/api/expenses?${params}`)
      const data = await response.json()

      if (data.success) {
        setExpenses(data.data)
        setTotals(data.totals)
      } else {
        toast.error(t('toast.loadError'))
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
      toast.error(t('toast.loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleApprove(id: string) {
    try {
      const response = await fetch(`/api/expenses/${id}/approve`, {
        method: 'PUT',
      })

      if (response.ok) {
        toast.success(t('toast.approved'))
        fetchExpenses()
      }
    } catch (error) {
      console.error('Error approving expense:', error)
      toast.error(t('toast.approveError'))
    }
  }

  async function exportToCSV() {
    try {
      // Create CSV content
      const headers = [
        t('csv.date'),
        t('csv.type'),
        t('csv.title'),
        t('csv.category'),
        t('csv.amount'),
        t('csv.paymentMethod'),
        t('csv.approved'),
      ]
      const rows = expenses.map((e) => [
        format(new Date(e.expense_date), 'dd/MM/yyyy'),
        e.expense_type === 'income' ? t('csv.income') : t('csv.expense'),
        e.title,
        categoryLabel(e.category),
        e.amount.toString(),
        paymentMethodLabel(e.payment_method),
        e.approved ? t('csv.yes') : t('csv.no'),
      ])

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

      // Create and download file
      const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `expenses_${selectedMonth}.csv`
      link.click()

      toast.success(t('toast.exported'))
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error(t('toast.exportError'))
    }
  }

  const categoryStats = expenses.reduce(
    (acc, expense) => {
      const category = expense.category
      if (!acc[category]) {
        acc[category] = { income: 0, expenses: 0 }
      }
      if (expense.expense_type === 'income') {
        acc[category].income += expense.amount
      } else {
        acc[category].expenses += expense.amount
      }
      return acc
    },
    {} as Record<string, { income: number; expenses: number }>
  )

  const incomeCount = expenses.filter((e) => e.expense_type === 'income').length
  const expenseCount = expenses.filter((e) => e.expense_type === 'expense').length
  const pendingCount = expenses.filter((e) => !e.approved).length

  const newAction = (
    <Link
      href="/admin/expenses/new"
      aria-label={t('newRecord')}
      data-testid="admin-expenses-new"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003153] text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#003153]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA]"
    >
      <Plus className="h-5 w-5" aria-hidden="true" />
    </Link>
  )

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        backHref="/admin/more"
        action={newAction}
      />

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={exportToCSV} className="min-h-[44px]">
          <Download className="h-4 w-4 me-2" aria-hidden="true" />
          {t('exportCsv')}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#003153]">
            <TrendingUp className="h-4 w-4 text-green-600" aria-hidden="true" />
            {t('summary.income')}
          </div>
          <div className="mt-1 text-xl font-bold text-green-600">
            ₪{totals.income.toLocaleString('he-IL')}
          </div>
          <p className="text-xs text-gray-500">{t('summary.recordsCount', { count: incomeCount })}</p>
        </div>

        <div className="rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#003153]">
            <TrendingDown className="h-4 w-4 text-red-600" aria-hidden="true" />
            {t('summary.expenses')}
          </div>
          <div className="mt-1 text-xl font-bold text-red-600">
            ₪{totals.expenses.toLocaleString('he-IL')}
          </div>
          <p className="text-xs text-gray-500">
            {t('summary.recordsCount', { count: expenseCount })}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#003153]">
            <Wallet className="h-4 w-4" aria-hidden="true" />
            {t('summary.balance')}
          </div>
          <div
            className={cn(
              'mt-1 text-xl font-bold',
              totals.balance >= 0 ? 'text-green-600' : 'text-red-600'
            )}
          >
            ₪{totals.balance.toLocaleString('he-IL')}
          </div>
          <p className="text-xs text-gray-500">
            {totals.balance >= 0 ? t('summary.surplus') : t('summary.deficit')}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#003153]">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {t('summary.pending')}
          </div>
          <div className="mt-1 text-xl font-bold text-[#003153]">{pendingCount}</div>
          <p className="text-xs text-gray-500">{t('summary.pendingHint')}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryStats).length > 0 && (
        <AdminGroup title={t('breakdown.title')} description={t('breakdown.description')}>
          {Object.entries(categoryStats).map(([category, stats]) => (
            <AdminRow
              key={category}
              title={categoryLabel(category)}
              subtitle={[
                stats.income > 0
                  ? `${t('breakdown.income')} ₪${stats.income.toLocaleString('he-IL')}`
                  : null,
                stats.expenses > 0
                  ? `${t('breakdown.expenses')} ₪${stats.expenses.toLocaleString('he-IL')}`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            />
          ))}
        </AdminGroup>
      )}

      {/* Filters */}
      <AdminFormSection title={t('filters.title')}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="expenses-month">{t('filters.month')}</Label>
            <Input
              id="expenses-month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <Label>{t('filters.type')}</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('filters.typePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                <SelectItem value="income">{t('filters.incomeOnly')}</SelectItem>
                <SelectItem value="expense">{t('filters.expensesOnly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('filters.category')}</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('filters.categoryPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allCategories')}</SelectItem>
                {categoryKeys.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`categories.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('filters.approval')}</Label>
            <Select value={selectedApproved} onValueChange={setSelectedApproved}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('filters.approvalPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.all')}</SelectItem>
                <SelectItem value="true">{t('filters.approvedOnly')}</SelectItem>
                <SelectItem value="false">{t('filters.unapprovedOnly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </AdminFormSection>

      {/* Transactions List */}
      {isLoading ? (
        <div className="rounded-2xl bg-white py-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#0D98BA] border-t-transparent" />
          <p className="text-sm text-gray-500">{t('loading')}</p>
        </div>
      ) : expenses.length === 0 ? (
        <AdminEmptyState icon={Wallet} title={t('empty')} />
      ) : (
        <AdminGroup title={t('records')}>
          {expenses.map((expense) => (
            <article key={expense.id} className="space-y-2 p-3" data-testid="admin-expense-row">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'flex h-9 w-9 flex-none items-center justify-center rounded-[10px]',
                    expense.expense_type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  )}
                >
                  {expense.expense_type === 'income' ? (
                    <TrendingUp className="h-[18px] w-[18px] text-green-600" aria-hidden="true" />
                  ) : (
                    <TrendingDown className="h-[18px] w-[18px] text-red-600" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-[14.5px] font-semibold text-[#003153]">
                    {expense.title}
                  </h3>
                  {expense.description && (
                    <p className="mt-0.5 text-xs text-gray-500">{expense.description}</p>
                  )}
                </div>
                <div
                  className={cn(
                    'flex-none text-base font-bold',
                    expense.expense_type === 'income' ? 'text-green-600' : 'text-red-600'
                  )}
                  dir="ltr"
                >
                  {expense.expense_type === 'income' ? '+' : '-'}₪
                  {expense.amount.toLocaleString('he-IL')}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  {format(new Date(expense.expense_date), 'dd/MM/yyyy')}
                </span>
                <Badge variant="secondary">{categoryLabel(expense.category)}</Badge>
                <Badge variant="outline">{paymentMethodLabel(expense.payment_method)}</Badge>
                {expense.vendor_name && (
                  <span>{t('vendorLabel', { name: expense.vendor_name })}</span>
                )}
                {expense.receipt_url && (
                  <a
                    href={expense.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#0D98BA] hover:underline"
                  >
                    <FileText className="h-3 w-3" aria-hidden="true" />
                    {t('receipt')}
                  </a>
                )}
              </div>

              <div className="flex justify-end">
                {expense.approved ? (
                  <StatusPill tone="success">
                    <CheckCircle className="me-1 h-3 w-3" aria-hidden="true" />
                    {t('approved')}
                  </StatusPill>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-[44px]"
                    onClick={() => handleApprove(expense.id)}
                  >
                    {t('approve')}
                  </Button>
                )}
              </div>
            </article>
          ))}
        </AdminGroup>
      )}
    </div>
  )
}
