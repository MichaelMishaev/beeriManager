'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Banknote,
  Bus,
  Calendar,
  Coffee,
  Coins,
  CreditCard,
  DollarSign,
  FileText,
  Heart,
  Landmark,
  Package,
  PartyPopper,
  RefreshCw,
  Save,
  TrendingDown,
  TrendingUp,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import FileUpload from '@/components/upload/FileUpload'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils/cn'
import { AdminFormSection, AdminPageHeader } from '@/components/features/admin'

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

const paymentMethodKeys = ['cash', 'check', 'transfer', 'credit_card', 'other'] as const

type ExpenseType = 'income' | 'expense'
type ExpenseCategory = (typeof categoryKeys)[number]
type PaymentMethod = (typeof paymentMethodKeys)[number]

const categoryIcons: Record<ExpenseCategory, LucideIcon> = {
  events: PartyPopper,
  maintenance: Wrench,
  equipment: Package,
  refreshments: Coffee,
  transportation: Bus,
  donations: Heart,
  fundraising: Coins,
  other: FileText,
}

const paymentMethodIcons: Record<PaymentMethod, LucideIcon> = {
  cash: Banknote,
  check: FileText,
  transfer: Landmark,
  credit_card: CreditCard,
  other: RefreshCw,
}

interface EventOption {
  id: string
  title: string
}

export default function NewExpensePage() {
  const t = useTranslations('admin.org.expenses')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [events, setEvents] = useState<EventOption[]>([])
  const [receiptUrl, setReceiptUrl] = useState<string>('')

  const expenseSchema = useMemo(
    () =>
      z.object({
        title: z.string().min(2, t('form.validation.titleMin')),
        description: z.string().optional(),
        amount: z
          .string()
          .min(1, t('form.validation.amountRequired'))
          .regex(/^\d+(\.\d{1,2})?$/, t('form.validation.amountInvalid')),
        expense_type: z.enum(['income', 'expense']),
        category: z.enum(categoryKeys),
        payment_method: z.enum(paymentMethodKeys),
        expense_date: z.string().min(1, t('form.validation.dateRequired')),
        vendor_name: z.string().optional(),
        receipt_url: z.string().optional(),
        event_id: z.string().optional(),
        approved: z.boolean(),
        notes: z.string().optional(),
      }),
    [t]
  )
  type ExpenseFormData = z.infer<typeof expenseSchema>

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expense_type: 'expense',
      category: 'other',
      payment_method: 'cash',
      approved: false,
    },
  })

  const expenseType = watch('expense_type')
  const approved = watch('approved')

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      const response = await fetch('/api/events?upcoming=true')
      const data = await response.json()
      if (data.success) {
        setEvents(data.data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  async function onSubmit(data: ExpenseFormData) {
    setIsSubmitting(true)

    try {
      const expenseData = {
        ...data,
        amount: parseFloat(data.amount),
        receipt_url: receiptUrl || null,
        event_id: data.event_id && data.event_id !== 'none' ? data.event_id : null,
        vendor_name: data.vendor_name || null,
        notes: data.notes || null,
      }

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(
          expenseType === 'income' ? t('form.toast.createdIncome') : t('form.toast.createdExpense')
        )
        router.push('/admin/expenses')
      } else {
        toast.error(result.error || t('form.toast.createError'))
      }
    } catch (error) {
      console.error('Error creating expense:', error)
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
        backHref="/admin/expenses"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Type Selection */}
        <AdminFormSection title={t('form.typeTitle')} description={t('form.typeDescription')}>
          <RadioGroup
            value={expenseType}
            onValueChange={(value) => setValue('expense_type', value as ExpenseType)}
          >
            <div className="grid grid-cols-2 gap-3">
              <label
                className={cn(
                  'flex min-h-[56px] cursor-pointer items-center justify-center gap-2 rounded-xl border-2 p-3 transition-colors',
                  expenseType === 'income'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <RadioGroupItem value="income" className="sr-only" />
                <TrendingUp
                  className={cn(
                    'h-5 w-5',
                    expenseType === 'income' ? 'text-green-600' : 'text-gray-500'
                  )}
                />
                <span
                  className={cn(
                    'font-medium',
                    expenseType === 'income' ? 'text-green-600' : 'text-gray-700'
                  )}
                >
                  {t('form.income')}
                </span>
              </label>

              <label
                className={cn(
                  'flex min-h-[56px] cursor-pointer items-center justify-center gap-2 rounded-xl border-2 p-3 transition-colors',
                  expenseType === 'expense'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <RadioGroupItem value="expense" className="sr-only" />
                <TrendingDown
                  className={cn(
                    'h-5 w-5',
                    expenseType === 'expense' ? 'text-red-600' : 'text-gray-500'
                  )}
                />
                <span
                  className={cn(
                    'font-medium',
                    expenseType === 'expense' ? 'text-red-600' : 'text-gray-700'
                  )}
                >
                  {t('form.expense')}
                </span>
              </label>
            </div>
          </RadioGroup>
        </AdminFormSection>

        {/* Basic Information */}
        <AdminFormSection
          title={t('form.detailsTitle')}
          description={
            expenseType === 'income'
              ? t('form.detailsDescriptionIncome')
              : t('form.detailsDescriptionExpense')
          }
        >
          <div>
            <Label htmlFor="title">{t('form.titleLabel')}</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder={
                expenseType === 'income'
                  ? t('form.titlePlaceholderIncome')
                  : t('form.titlePlaceholderExpense')
              }
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">{t('form.descriptionLabel')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('form.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="amount">{t('form.amountLabel')}</Label>
              <div className="relative" dir="ltr">
                <DollarSign
                  className="absolute start-3 top-3.5 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="amount"
                  type="text"
                  {...register('amount')}
                  placeholder="0.00"
                  className={`ps-10 ${errors.amount ? 'border-red-500' : ''}`}
                  dir="ltr"
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="expense_date">{t('form.dateLabel')}</Label>
              <div className="relative">
                <Calendar
                  className="absolute start-3 top-3.5 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="expense_date"
                  type="date"
                  {...register('expense_date')}
                  className={`ps-10 ${errors.expense_date ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.expense_date && (
                <p className="text-sm text-red-500 mt-1">{errors.expense_date.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="category">{t('form.categoryLabel')}</Label>
              <Select
                onValueChange={(value) => setValue('category', value as ExpenseCategory)}
                defaultValue="other"
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryKeys.map((value) => {
                    const Icon = categoryIcons[value]
                    return (
                      <SelectItem key={value} value={value}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          <span>{t(`categories.${value}`)}</span>
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_method">{t('form.paymentMethodLabel')}</Label>
              <Select
                onValueChange={(value) => setValue('payment_method', value as PaymentMethod)}
                defaultValue="cash"
              >
                <SelectTrigger id="payment_method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethodKeys.map((value) => {
                    const Icon = paymentMethodIcons[value]
                    return (
                      <SelectItem key={value} value={value}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          <span>{t(`paymentMethods.${value}`)}</span>
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {expenseType === 'expense' && (
            <div>
              <Label htmlFor="vendor_name">{t('form.vendorLabel')}</Label>
              <Input
                id="vendor_name"
                {...register('vendor_name')}
                placeholder={t('form.vendorPlaceholder')}
              />
            </div>
          )}
        </AdminFormSection>

        {/* Additional Details */}
        <AdminFormSection title={t('form.extraTitle')} description={t('form.extraDescription')}>
          {events.length > 0 && (
            <div>
              <Label htmlFor="event_id">{t('form.eventLabel')}</Label>
              <Select onValueChange={(value) => setValue('event_id', value)}>
                <SelectTrigger id="event_id">
                  <SelectValue placeholder={t('form.eventPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('form.eventNone')}</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="notes">{t('form.notesLabel')}</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder={t('form.notesPlaceholder')}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border p-4">
            <div>
              <Label htmlFor="approved">{t('form.approvedLabel')}</Label>
              <p className="text-sm text-muted-foreground">{t('form.approvedHint')}</p>
            </div>
            <Switch
              id="approved"
              checked={approved}
              onCheckedChange={(checked) => setValue('approved', checked)}
            />
          </div>
        </AdminFormSection>

        {/* Receipt Upload */}
        <AdminFormSection title={t('form.receiptTitle')} description={t('form.receiptDescription')}>
          <FileUpload
            value={receiptUrl}
            onChange={(url) => setReceiptUrl(url as string)}
            multiple={false}
            accept=".pdf,.jpg,.jpeg,.png"
            maxSize={10}
            bucket="receipts"
          />
        </AdminFormSection>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button type="submit" disabled={isSubmitting} className="min-h-[44px] w-full">
            {isSubmitting ? (
              <>{t('form.saving')}</>
            ) : (
              <>
                <Save className="h-4 w-4 me-2" />
                {t('form.submit')}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="min-h-[44px] w-full"
          >
            {t('form.cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}
