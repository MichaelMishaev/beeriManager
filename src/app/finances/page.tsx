import { DollarSign, TrendingUp, TrendingDown, Calendar, PieChart, BarChart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'דוח כספי | ועד הורים',
  description: 'דוח כספי שקוף של ועד ההורים'
}

async function getFinancialData() {
  const supabase = createClient()

  // Get current month expenses
  const currentMonth = new Date()
  const startDate = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), 'yyyy-MM-dd')
  const endDate = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0), 'yyyy-MM-dd')

  const { data: currentMonthData } = await supabase
    .from('expenses')
    .select('*')
    .eq('approved', true)
    .gte('expense_date', startDate)
    .lte('expense_date', endDate)

  // Get all approved expenses for total calculations
  const { data: allExpenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('approved', true)
    .order('expense_date', { ascending: false })

  // Calculate totals
  const totals = {
    income: allExpenses?.filter(e => e.expense_type === 'income')
      .reduce((sum, e) => sum + e.amount, 0) || 0,
    expenses: allExpenses?.filter(e => e.expense_type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0) || 0,
    balance: 0,
    monthlyIncome: currentMonthData?.filter(e => e.expense_type === 'income')
      .reduce((sum, e) => sum + e.amount, 0) || 0,
    monthlyExpenses: currentMonthData?.filter(e => e.expense_type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0) || 0
  }
  totals.balance = totals.income - totals.expenses

  // Calculate category breakdown
  const categoryBreakdown = allExpenses?.reduce((acc, expense) => {
    const category = expense.category
    if (!acc[category]) {
      acc[category] = { income: 0, expenses: 0, count: 0 }
    }
    if (expense.expense_type === 'income') {
      acc[category].income += expense.amount
    } else {
      acc[category].expenses += expense.amount
    }
    acc[category].count++
    return acc
  }, {} as Record<string, { income: number; expenses: number; count: number }>) || {}

  // Get recent transactions (last 10)
  const recentTransactions = allExpenses?.slice(0, 10) || []

  // Get upcoming events with budget
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .not('budget_allocated', 'is', null)
    .gte('start_datetime', new Date().toISOString())
    .order('start_datetime', { ascending: true })
    .limit(5)

  return {
    totals,
    categoryBreakdown,
    recentTransactions,
    upcomingEvents: upcomingEvents || [],
    currentMonth: currentMonthData || []
  }
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

const categoryIcons: Record<string, string> = {
  events: '🎉',
  maintenance: '🔧',
  equipment: '📦',
  refreshments: '☕',
  transportation: '🚌',
  donations: '💝',
  fundraising: '💰',
  other: '📝'
}

export default async function FinancesPage() {
  const { totals, categoryBreakdown, recentTransactions, upcomingEvents, currentMonth } = await getFinancialData()

  const maxCategoryExpense = Math.max(...(Object.values(categoryBreakdown) as Array<{ income: number; expenses: number; count: number }>).map(c => c.expenses))

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">דוח כספי שקוף</h1>
        <p className="text-muted-foreground">
          מידע כספי מעודכן של ועד ההורים - {format(new Date(), 'MMMM yyyy', { locale: he })}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">יתרה נוכחית</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              totals.balance >= 0 ? "text-green-600" : "text-red-600"
            )}>
              ₪{totals.balance.toLocaleString('he-IL')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totals.balance >= 0 ? 'עודף תקציבי' : 'גירעון תקציבי'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">הכנסות החודש</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₪{totals.monthlyIncome.toLocaleString('he-IL')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMonth.filter(e => e.expense_type === 'income').length} תנועות
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">הוצאות החודש</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₪{totals.monthlyExpenses.toLocaleString('he-IL')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMonth.filter(e => e.expense_type === 'expense').length} תנועות
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">סה&quot;כ הכנסות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₪{totals.income.toLocaleString('he-IL')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              מתחילת השנה
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            התפלגות הוצאות לפי קטגוריה
          </CardTitle>
          <CardDescription>
            איך מתחלקות ההוצאות של ועד ההורים
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.entries(categoryBreakdown) as Array<[string, { income: number; expenses: number; count: number }]>)
            .filter(([_, data]) => data.expenses > 0)
            .sort((a, b) => b[1].expenses - a[1].expenses)
            .map(([category, data]) => {
              const percentage = (data.expenses / totals.expenses) * 100
              const width = (data.expenses / maxCategoryExpense) * 100

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{categoryIcons[category] || '📊'}</span>
                      <span className="font-medium">{categoryLabels[category] || category}</span>
                      <Badge variant="secondary" className="text-xs">
                        {data.count} פעולות
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">
                        ₪{data.expenses.toLocaleString('he-IL')}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              )
            })}

          {Object.keys(categoryBreakdown).length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              אין נתונים להצגה
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              תנועות אחרונות
            </CardTitle>
            <CardDescription>
              10 התנועות האחרונות שאושרו
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-1.5 rounded",
                      transaction.expense_type === 'income' ? "bg-green-100" : "bg-red-100"
                    )}>
                      {transaction.expense_type === 'income' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{transaction.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.expense_date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm font-semibold",
                    transaction.expense_type === 'income' ? "text-green-600" : "text-red-600"
                  )}>
                    {transaction.expense_type === 'income' ? '+' : '-'}
                    ₪{transaction.amount.toLocaleString('he-IL')}
                  </span>
                </div>
              ))}

              {recentTransactions.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  אין תנועות להצגה
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              תקציב אירועים קרובים
            </CardTitle>
            <CardDescription>
              אירועים עם תקציב מוקצב
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.start_datetime), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      ₪{event.budget_allocated?.toLocaleString('he-IL') || 0}
                    </span>
                  </div>
                  <Progress value={0} className="h-1" />
                </div>
              ))}

              {upcomingEvents.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  אין אירועים עם תקציב מוקצב
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Note */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">שקיפות מלאה</p>
              <p className="text-sm text-muted-foreground">
                כל הנתונים הכספיים המוצגים כאן מאושרים ומעודכנים.
                לשאלות או הבהרות ניתן לפנות לועד ההורים.
              </p>
              <p className="text-xs text-muted-foreground">
                עדכון אחרון: {format(new Date(), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}