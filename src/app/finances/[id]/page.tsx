import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Calendar, ArrowRight, FileText, Receipt, Edit, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

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

async function getExpense(id: string) {
  const supabase = createClient()

  const { data: expense, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !expense) {
    return null
  }

  return expense
}

async function getRelatedEvent(eventId: string) {
  const supabase = createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, title, start_datetime')
    .eq('id', eventId)
    .single()

  return event
}

async function getRelatedExpenses(category: string, currentId: string) {
  const supabase = createClient()

  const { data: expenses } = await supabase
    .from('expenses')
    .select('id, title, amount, expense_type, expense_date')
    .eq('category', category)
    .eq('approved', true)
    .neq('id', currentId)
    .order('expense_date', { ascending: false })
    .limit(5)

  return expenses || []
}

function ExpenseDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
    </div>
  )
}

async function ExpenseContent({ id }: { id: string }) {
  const expense = await getExpense(id)

  if (!expense) {
    notFound()
  }

  const relatedEvent = expense.related_event_id ? await getRelatedEvent(expense.related_event_id) : null
  const relatedExpenses = await getRelatedExpenses(expense.category, expense.id)

  const isIncome = expense.expense_type === 'income'
  const Icon = isIncome ? TrendingUp : TrendingDown

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="outline" size="sm" asChild>
        <Link href="/finances">
          <ArrowRight className="h-4 w-4 ml-2" />
          חזרה לדוח כספי
        </Link>
      </Button>

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-3 rounded-lg flex-shrink-0",
              isIncome ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            )}>
              <Icon className="h-8 w-8" />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={isIncome ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {isIncome ? 'הכנסה' : 'הוצאה'}
                  </Badge>
                  <Badge variant="outline">
                    {categoryIcons[expense.category] || '📝'} {categoryLabels[expense.category] || expense.category}
                  </Badge>
                  {expense.approved ? (
                    <Badge className="bg-green-100 text-green-800">מאושר</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">ממתין לאישור</Badge>
                  )}
                </div>
                <CardTitle className="text-2xl md:text-3xl mb-2">{expense.title}</CardTitle>
                <div className={cn(
                  "text-3xl md:text-4xl font-bold",
                  isIncome ? "text-green-600" : "text-red-600"
                )}>
                  {isIncome ? '+' : '-'}₪{expense.amount.toLocaleString('he-IL')}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(expense.expense_date), 'dd MMMM yyyy', { locale: he })}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {expense.description && (
            <Card>
              <CardHeader>
                <CardTitle>תיאור</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {expense.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Related Event */}
          {relatedEvent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  קשור לאירוע
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/events/${relatedEvent.id}`}
                  className="block p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <p className="font-medium">{relatedEvent.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(relatedEvent.start_datetime), 'dd MMMM yyyy', { locale: he })}
                  </p>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Receipt */}
          {expense.receipt_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  קבלה / אסמכתא
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="default" asChild>
                  <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 ml-2" />
                    צפה בקבלה
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                היסטוריית תנועה
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">נוצר בתאריך:</span>
                  <span className="text-sm font-medium">
                    {format(new Date(expense.created_at), 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
                {expense.updated_at && expense.updated_at !== expense.created_at && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">עודכן לאחרונה:</span>
                    <span className="text-sm font-medium">
                      {format(new Date(expense.updated_at), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                )}
                {expense.approved_at && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">אושר בתאריך:</span>
                    <span className="text-sm font-medium">
                      {format(new Date(expense.approved_at), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                )}
                {expense.approved_by && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">אושר על ידי:</span>
                    <span className="text-sm font-medium">{expense.approved_by}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">פעולות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                <Edit className="h-4 w-4 ml-2" />
                ערוך פרטים
              </Button>
              {expense.receipt_url && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer">
                    <Receipt className="h-4 w-4 ml-2" />
                    צפה בקבלה
                  </a>
                </Button>
              )}
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 ml-2" />
                הורד דוח
              </Button>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">פרטים נוספים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">מספר תנועה:</span>
                  <span className="font-mono text-xs">{expense.id.slice(0, 8)}</span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-muted-foreground">סוג:</span>
                  <span className={isIncome ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {isIncome ? 'הכנסה' : 'הוצאה'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">קטגוריה:</span>
                  <span>{categoryLabels[expense.category] || expense.category}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">תאריך:</span>
                  <span>{format(new Date(expense.expense_date), 'dd/MM/yyyy')}</span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-muted-foreground">סטטוס:</span>
                  {expense.approved ? (
                    <Badge className="bg-green-100 text-green-800">מאושר</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">ממתין</Badge>
                  )}
                </div>

                {expense.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">אמצעי תשלום:</span>
                    <span>{expense.payment_method}</span>
                  </div>
                )}

                {expense.reference_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">מספר אסמכתא:</span>
                    <span className="font-mono text-xs">{expense.reference_number}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related Expenses */}
          {relatedExpenses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">תנועות דומות</CardTitle>
                <CardDescription>
                  תנועות נוספות בקטגוריה {categoryLabels[expense.category]}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {relatedExpenses.map((related) => (
                  <Link
                    key={related.id}
                    href={`/finances/${related.id}`}
                    className="block p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium line-clamp-1 flex-1">
                        {related.title}
                      </p>
                      <span className={cn(
                        "text-sm font-semibold flex-shrink-0",
                        related.expense_type === 'income' ? "text-green-600" : "text-red-600"
                      )}>
                        {related.expense_type === 'income' ? '+' : '-'}
                        ₪{related.amount.toLocaleString('he-IL')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(related.expense_date), 'dd/MM/yyyy')}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ExpenseDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense fallback={<ExpenseDetailSkeleton />}>
        <ExpenseContent id={params.id} />
      </Suspense>
    </div>
  )
}