'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowRight,
  DollarSign,
  Users,
  TrendingDown,
  Save,
  AlertTriangle,
  CheckCircle2,
  PieChart
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

const categoryConfig: Record<string, { label: string; emoji: string; color: string }> = {
  venue: { label: 'אולם/מקום', emoji: '🏛️', color: 'bg-blue-500' },
  catering: { label: 'קייטרינג', emoji: '🍕', color: 'bg-orange-500' },
  dj: { label: 'DJ/מוזיקה', emoji: '🎵', color: 'bg-purple-500' },
  photography: { label: 'צילום', emoji: '📷', color: 'bg-pink-500' },
  decorations: { label: 'קישוטים', emoji: '🎈', color: 'bg-yellow-500' },
  transportation: { label: 'הסעות', emoji: '🚌', color: 'bg-green-500' },
  entertainment: { label: 'בידור', emoji: '🎭', color: 'bg-indigo-500' },
  shirts: { label: 'חולצות', emoji: '👕', color: 'bg-cyan-500' },
  sound_lighting: { label: 'הגברה ותאורה', emoji: '💡', color: 'bg-amber-500' },
  yearbook: { label: 'ספר מחזור', emoji: '📚', color: 'bg-rose-500' },
  recording: { label: 'אולפן הקלטות', emoji: '🎬', color: 'bg-red-500' },
  scenery: { label: 'תפאורה', emoji: '🎪', color: 'bg-fuchsia-500' },
  flowers: { label: 'פרחים/זרים', emoji: '💐', color: 'bg-lime-500' },
  security: { label: 'אבטחה', emoji: '🛡️', color: 'bg-slate-500' },
  electrician: { label: 'חשמלאי', emoji: '⚡', color: 'bg-sky-500' },
  moving: { label: 'הובלה', emoji: '🚚', color: 'bg-stone-500' },
  video_editing: { label: 'עריכת סרטונים', emoji: '🎥', color: 'bg-violet-500' },
  drums: { label: 'מתופפים', emoji: '🥁', color: 'bg-amber-600' },
  choreography: { label: 'כוריאוגרפיה', emoji: '💃', color: 'bg-pink-600' },
  other: { label: 'אחר', emoji: '📦', color: 'bg-gray-500' }
}

const allCategories = Object.keys(categoryConfig)

export default function BudgetTrackerPage() {
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
      toast.error('שגיאה בטעינת הנתונים')
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
        toast.success('התקציב נשמר בהצלחה')
        fetchData()
      } else {
        toast.error(data.error || 'שגיאה בשמירה')
      }
    } catch (error) {
      console.error('Error saving budget:', error)
      toast.error('שגיאה בשמירה')
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/prom/${promId}`}>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              ניהול תקציב
            </h1>
            <p className="text-muted-foreground">{promEvent?.title}</p>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
              שומר...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 ml-2" />
              שמור שינויים
            </>
          )}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className={cn(
          "border-2",
          calcRemaining >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className={cn(
              "text-sm font-medium flex items-center gap-2",
              calcRemaining >= 0 ? "text-green-800" : "text-red-800"
            )}>
              {calcRemaining >= 0 ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              יתרה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-3xl font-bold",
              calcRemaining >= 0 ? "text-green-900" : "text-red-900"
            )}>
              ₪{Math.abs(calcRemaining).toLocaleString('he-IL')}
            </div>
            <p className={cn(
              "text-xs",
              calcRemaining >= 0 ? "text-green-700" : "text-red-700"
            )}>
              {calcRemaining >= 0 ? 'נותר מתקציב' : 'חריגה מתקציב!'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              תקציב כולל
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              ₪{(promEvent?.total_budget || 0).toLocaleString('he-IL')}
            </div>
            <p className="text-xs text-blue-700">
              הוקצה: ₪{calcAllocated.toLocaleString('he-IL')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              הוצאות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              ₪{calcSpent.toLocaleString('he-IL')}
            </div>
            <p className="text-xs text-orange-700">
              {promEvent?.total_budget && promEvent.total_budget > 0
                ? `${Math.round((calcSpent / promEvent.total_budget) * 100)}% מהתקציב`
                : '—'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
              <Users className="h-4 w-4" />
              עלות לתלמיד
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {promEvent?.student_count && promEvent.student_count > 0
                ? `₪${Math.round(calcSpent / promEvent.student_count)}`
                : '—'}
            </div>
            <p className="text-xs text-purple-700">
              {promEvent?.student_count || 0} תלמידים
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-600" />
            ניצול תקציב
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>הוצאות מול תקציב</span>
              <span className="font-medium">
                {promEvent?.total_budget && promEvent.total_budget > 0
                  ? `${Math.round((calcSpent / promEvent.total_budget) * 100)}%`
                  : '—'}
              </span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  promEvent?.total_budget && calcSpent > promEvent.total_budget
                    ? "bg-red-500"
                    : promEvent?.total_budget && (calcSpent / promEvent.total_budget) > 0.9
                      ? "bg-yellow-500"
                      : "bg-green-500"
                )}
                style={{ 
                  width: `${Math.min(100, promEvent?.total_budget 
                    ? (calcSpent / promEvent.total_budget) * 100 
                    : 0)}%` 
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>פירוט לפי קטגוריה</CardTitle>
          <CardDescription>
            הגדירו תקציב והזינו הוצאות בפועל לכל קטגוריה
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {allCategories.map((category) => {
              const config = categoryConfig[category]
              const allocated = parseFloat(editedItems[category]?.allocated) || 0
              const spent = parseFloat(editedItems[category]?.spent) || 0
              const percentage = allocated > 0 ? Math.round((spent / allocated) * 100) : 0
              const isOverBudget = spent > allocated && allocated > 0

              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-xl",
                      config.color.replace('bg-', 'bg-opacity-20 '),
                    )}>
                      {config.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{config.label}</span>
                        {isOverBudget && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 ml-1" />
                            חריגה
                          </Badge>
                        )}
                      </div>
                      {allocated > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                isOverBudget ? "bg-red-500" : config.color
                              )}
                              style={{ width: `${Math.min(100, percentage)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-12 text-left">
                            {percentage}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mr-13">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">תקציב מוקצה</Label>
                      <div className="relative">
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₪</span>
                        <Input
                          type="number"
                          min="0"
                          value={editedItems[category]?.allocated || '0'}
                          onChange={(e) => handleItemChange(category, 'allocated', e.target.value)}
                          className="pr-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">הוצאות בפועל</Label>
                      <div className="relative">
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₪</span>
                        <Input
                          type="number"
                          min="0"
                          value={editedItems[category]?.spent || '0'}
                          onChange={(e) => handleItemChange(category, 'spent', e.target.value)}
                          className={cn(
                            "pr-8",
                            isOverBudget && "border-red-300 bg-red-50"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Totals Summary */}
          <div className="mt-8 pt-6 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">סה"כ מוקצה</p>
                <p className="text-xl font-bold">₪{calcAllocated.toLocaleString('he-IL')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">סה"כ הוצאות</p>
                <p className="text-xl font-bold text-orange-600">₪{calcSpent.toLocaleString('he-IL')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">יתרה</p>
                <p className={cn(
                  "text-xl font-bold",
                  calcRemaining >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  ₪{Math.abs(calcRemaining).toLocaleString('he-IL')}
                  {calcRemaining < 0 && ' (חריגה)'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex justify-center gap-3">
        <Button variant="outline" asChild>
          <Link href={`/admin/prom/${promId}/quotes`}>
            חזור להשוואת הצעות
          </Link>
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="h-4 w-4 ml-2" />
          שמור שינויים
        </Button>
      </div>
    </div>
  )
}

// Badge component if not available
function Badge({ children, variant = 'default', className = '' }: { 
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline'
  className?: string 
}) {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    destructive: 'bg-red-500 text-white',
    outline: 'border border-input bg-background'
  }

  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  )
}

