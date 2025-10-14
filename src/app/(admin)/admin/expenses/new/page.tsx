'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, Calendar, Save, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { cn } from '@/lib/utils'

const expenseSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  description: z.string().optional(),
  amount: z.string().min(1, 'סכום נדרש').regex(/^\d+(\.\d{1,2})?$/, 'סכום לא תקין'),
  expense_type: z.enum(['income', 'expense']),
  category: z.enum([
    'events', 'maintenance', 'equipment', 'refreshments',
    'transportation', 'donations', 'fundraising', 'other'
  ]),
  payment_method: z.enum(['cash', 'check', 'transfer', 'credit_card', 'other']),
  expense_date: z.string().min(1, 'תאריך נדרש'),
  vendor_name: z.string().optional(),
  receipt_url: z.string().optional(),
  event_id: z.string().optional(),
  approved: z.boolean(),
  notes: z.string().optional()
})

type ExpenseFormData = z.infer<typeof expenseSchema>

const categoryOptions = [
  { value: 'events', label: 'אירועים', icon: '🎉' },
  { value: 'maintenance', label: 'תחזוקה', icon: '🔧' },
  { value: 'equipment', label: 'ציוד', icon: '📦' },
  { value: 'refreshments', label: 'כיבוד', icon: '☕' },
  { value: 'transportation', label: 'הסעות', icon: '🚌' },
  { value: 'donations', label: 'תרומות', icon: '💝' },
  { value: 'fundraising', label: 'גיוס כספים', icon: '💰' },
  { value: 'other', label: 'אחר', icon: '📝' }
]

const paymentMethodOptions = [
  { value: 'cash', label: 'מזומן', icon: '💵' },
  { value: 'check', label: 'צק', icon: '📄' },
  { value: 'transfer', label: 'העברה בנקאית', icon: '🏦' },
  { value: 'credit_card', label: 'כרטיס אשראי', icon: '💳' },
  { value: 'other', label: 'אחר', icon: '🔄' }
]

export default function NewExpensePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [receiptUrl, setReceiptUrl] = useState<string>('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expense_type: 'expense',
      category: 'other',
      payment_method: 'cash',
      approved: false
    }
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
        event_id: data.event_id || null,
        vendor_name: data.vendor_name || null,
        notes: data.notes || null
      }

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`ה${expenseType === 'income' ? 'הכנסה' : 'הוצאה'} נוצרה בהצלחה!`)
        router.push('/admin/expenses')
      } else {
        toast.error(result.error || 'שגיאה ביצירת הרשומה')
      }
    } catch (error) {
      console.error('Error creating expense:', error)
      toast.error('שגיאה ביצירת הרשומה')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">רישום הכנסה/הוצאה</h1>
        <p className="text-muted-foreground mt-2">
          תיעוד הכנסות והוצאות של ועד ההורים
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>סוג הרשומה</CardTitle>
            <CardDescription>בחר האם זו הכנסה או הוצאה</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={expenseType}
              onValueChange={(value) => setValue('expense_type', value as any)}
            >
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={cn(
                    "flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors",
                    expenseType === 'income'
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <RadioGroupItem value="income" className="sr-only" />
                  <TrendingUp className={cn(
                    "h-5 w-5",
                    expenseType === 'income' ? "text-green-600" : "text-gray-500"
                  )} />
                  <span className={cn(
                    "font-medium",
                    expenseType === 'income' ? "text-green-600" : "text-gray-700"
                  )}>
                    הכנסה
                  </span>
                </label>

                <label
                  className={cn(
                    "flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors",
                    expenseType === 'expense'
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <RadioGroupItem value="expense" className="sr-only" />
                  <TrendingDown className={cn(
                    "h-5 w-5",
                    expenseType === 'expense' ? "text-red-600" : "text-gray-500"
                  )} />
                  <span className={cn(
                    "font-medium",
                    expenseType === 'expense' ? "text-red-600" : "text-gray-700"
                  )}>
                    הוצאה
                  </span>
                </label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי הרשומה</CardTitle>
            <CardDescription>מידע בסיסי על ה{expenseType === 'income' ? 'הכנסה' : 'הוצאה'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">כותרת *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder={expenseType === 'income' ? 'לדוגמה: תרומה מהורים' : 'לדוגמה: רכישת ציוד'}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="תיאור מפורט..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="amount">סכום (₪) *</Label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="text"
                    {...register('amount')}
                    placeholder="0.00"
                    className={`pr-10 ${errors.amount ? 'border-red-500' : ''}`}
                    dir="ltr"
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="expense_date">תאריך *</Label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="expense_date"
                    type="date"
                    {...register('expense_date')}
                    className={`pr-10 ${errors.expense_date ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.expense_date && (
                  <p className="text-sm text-red-500 mt-1">{errors.expense_date.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="category">קטגוריה</Label>
                <Select
                  onValueChange={(value) => setValue('category', value as any)}
                  defaultValue="other"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="payment_method">אמצעי תשלום</Label>
                <Select
                  onValueChange={(value) => setValue('payment_method', value as any)}
                  defaultValue="cash"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethodOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {expenseType === 'expense' && (
              <div>
                <Label htmlFor="vendor_name">שם הספק/נותן השירות</Label>
                <Input
                  id="vendor_name"
                  {...register('vendor_name')}
                  placeholder="שם העסק או האדם"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>פרטים נוספים</CardTitle>
            <CardDescription>קישור לאירוע והערות</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.length > 0 && (
              <div>
                <Label htmlFor="event_id">אירוע קשור (אופציונלי)</Label>
                <Select onValueChange={(value) => setValue('event_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר אירוע..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ללא</SelectItem>
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
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="הערות נוספות..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="approved">אישור</Label>
                <p className="text-sm text-muted-foreground">
                  האם הרשומה מאושרת
                </p>
              </div>
              <Switch
                id="approved"
                checked={approved}
                onCheckedChange={(checked) => setValue('approved', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Receipt Upload */}
        <Card>
          <CardHeader>
            <CardTitle>קבלה/חשבונית</CardTitle>
            <CardDescription>העלה קבלה או חשבונית</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              value={receiptUrl}
              onChange={(url) => setReceiptUrl(url as string)}
              multiple={false}
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={10}
              bucket="receipts"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>טוען...</>
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                שמור רשומה
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            ביטול
          </Button>
        </div>
      </form>
    </div>
  )
}