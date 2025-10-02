'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Calendar, FileText, Plus, Download, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import Link from 'next/link'

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

const categoryLabels: Record<string, string> = {
  events: 'אירועים',
  maintenance: 'תחזוקה',
  equipment: 'ציוד',
  refreshments: 'כיבוד',
  transportation: 'הסעות',
  donations: 'תרומות',
  fundraising: 'גיוס כספים',
  other: 'אחר'
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'מזומן',
  check: 'צק',
  transfer: 'העברה בנקאית',
  credit_card: 'כרטיס אשראי',
  other: 'אחר'
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [totals, setTotals] = useState<Totals>({ income: 0, expenses: 0, balance: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedApproved, setSelectedApproved] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))

  useEffect(() => {
    fetchExpenses()
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
        toast.error('שגיאה בטעינת הנתונים')
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
      toast.error('שגיאה בטעינת הנתונים')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleApprove(id: string) {
    try {
      const response = await fetch(`/api/expenses/${id}/approve`, {
        method: 'PUT'
      })

      if (response.ok) {
        toast.success('הרשומה אושרה')
        fetchExpenses()
      }
    } catch (error) {
      console.error('Error approving expense:', error)
      toast.error('שגיאה באישור הרשומה')
    }
  }

  async function exportToCSV() {
    try {
      // Create CSV content
      const headers = ['תאריך', 'סוג', 'כותרת', 'קטגוריה', 'סכום', 'אמצעי תשלום', 'מאושר']
      const rows = expenses.map(e => [
        format(new Date(e.expense_date), 'dd/MM/yyyy'),
        e.expense_type === 'income' ? 'הכנסה' : 'הוצאה',
        e.title,
        categoryLabels[e.category] || e.category,
        e.amount.toString(),
        paymentMethodLabels[e.payment_method] || e.payment_method,
        e.approved ? 'כן' : 'לא'
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `expenses_${selectedMonth}.csv`
      link.click()

      toast.success('הקובץ הורד בהצלחה')
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('שגיאה בייצוא הנתונים')
    }
  }

  const categoryStats = expenses.reduce((acc, expense) => {
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
  }, {} as Record<string, { income: number; expenses: number }>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ניהול כספים</h1>
          <p className="text-muted-foreground mt-2">
            מעקב אחר הכנסות והוצאות של ועד ההורים
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 ml-2" />
            ייצא לאקסל
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/expenses/new">
              <Plus className="h-4 w-4 ml-2" />
              רשומה חדשה
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              הכנסות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₪{totals.income.toLocaleString('he-IL')}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.filter(e => e.expense_type === 'income').length} רשומות
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              הוצאות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₪{totals.expenses.toLocaleString('he-IL')}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.filter(e => e.expense_type === 'expense').length} רשומות
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              יתרה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              totals.balance >= 0 ? "text-green-600" : "text-red-600"
            )}>
              ₪{totals.balance.toLocaleString('he-IL')}
            </div>
            <p className="text-xs text-muted-foreground">
              {totals.balance >= 0 ? 'עודף' : 'גירעון'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              ממתין לאישור
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expenses.filter(e => !e.approved).length}
            </div>
            <p className="text-xs text-muted-foreground">
              רשומות לא מאושרות
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>פילוח לפי קטגוריות</CardTitle>
          <CardDescription>סיכום הכנסות והוצאות לפי קטגוריה</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div key={category} className="space-y-2">
                <p className="text-sm font-medium">{categoryLabels[category] || category}</p>
                <div className="space-y-1">
                  {stats.income > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-green-600">הכנסות:</span>
                      <span className="font-medium">₪{stats.income.toLocaleString('he-IL')}</span>
                    </div>
                  )}
                  {stats.expenses > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-red-600">הוצאות:</span>
                      <span className="font-medium">₪{stats.expenses.toLocaleString('he-IL')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>סינון</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-[200px]"
            />

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="בחר סוג" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסוגים</SelectItem>
                <SelectItem value="income">הכנסות בלבד</SelectItem>
                <SelectItem value="expense">הוצאות בלבד</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הקטגוריות</SelectItem>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedApproved} onValueChange={setSelectedApproved}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="סטטוס אישור" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="true">מאושרים</SelectItem>
                <SelectItem value="false">לא מאושרים</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">רשומות</h2>
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full" />
              <p className="text-muted-foreground">טוען נתונים...</p>
            </CardContent>
          </Card>
        ) : expenses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">אין רשומות להצגה</p>
            </CardContent>
          </Card>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id} className="hover:bg-accent transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        expense.expense_type === 'income' ? "bg-green-100" : "bg-red-100"
                      )}>
                        {expense.expense_type === 'income' ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{expense.title}</h3>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {expense.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(expense.expense_date), 'dd/MM/yyyy')}
                          </span>
                          <Badge variant="secondary">
                            {categoryLabels[expense.category] || expense.category}
                          </Badge>
                          <Badge variant="outline">
                            {paymentMethodLabels[expense.payment_method] || expense.payment_method}
                          </Badge>
                          {expense.vendor_name && (
                            <span>ספק: {expense.vendor_name}</span>
                          )}
                          {expense.receipt_url && (
                            <a
                              href={expense.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <FileText className="h-3 w-3" />
                              קבלה
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={cn(
                      "text-xl font-bold",
                      expense.expense_type === 'income' ? "text-green-600" : "text-red-600"
                    )}>
                      {expense.expense_type === 'income' ? '+' : '-'}
                      ₪{expense.amount.toLocaleString('he-IL')}
                    </div>
                    {expense.approved ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 ml-1" />
                        מאושר
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(expense.id)}
                      >
                        אשר
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}