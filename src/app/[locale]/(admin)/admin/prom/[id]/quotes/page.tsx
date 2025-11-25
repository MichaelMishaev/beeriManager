'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Plus,
  Star,
  Check,
  Edit2,
  Trash2,
  Phone,
  Mail,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  Package,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Quote {
  id: string
  vendor_name: string
  vendor_contact_name: string | null
  vendor_phone: string | null
  vendor_email: string | null
  category: string
  price_total: number
  price_per_student: number | null
  price_notes: string | null
  services_included: string[]
  availability_status: string
  availability_notes: string | null
  pros: string | null
  cons: string | null
  rating: number | null
  admin_notes: string | null
  is_selected: boolean
  is_finalist: boolean
  display_order: number
  display_label: string | null
  created_at: string
}

interface PromEvent {
  id: string
  title: string
  student_count: number
  total_budget: number
}

const categoryLabels: Record<string, { label: string; emoji: string }> = {
  venue: { label: 'אולם/מקום', emoji: '🏛️' },
  catering: { label: 'קייטרינג', emoji: '🍕' },
  dj: { label: 'DJ/מוזיקה', emoji: '🎵' },
  photography: { label: 'צילום', emoji: '📷' },
  decorations: { label: 'קישוטים', emoji: '🎈' },
  transportation: { label: 'הסעות', emoji: '🚌' },
  entertainment: { label: 'בידור', emoji: '🎭' },
  shirts: { label: 'חולצות', emoji: '👕' },
  sound_lighting: { label: 'הגברה ותאורה', emoji: '💡' },
  yearbook: { label: 'ספר מחזור', emoji: '📚' },
  recording: { label: 'אולפן הקלטות', emoji: '🎬' },
  scenery: { label: 'תפאורה', emoji: '🎪' },
  flowers: { label: 'פרחים/זרים', emoji: '💐' },
  security: { label: 'אבטחה', emoji: '🛡️' },
  electrician: { label: 'חשמלאי', emoji: '⚡' },
  moving: { label: 'הובלה', emoji: '🚚' },
  video_editing: { label: 'עריכת סרטונים', emoji: '🎥' },
  drums: { label: 'מתופפים', emoji: '🥁' },
  choreography: { label: 'כוריאוגרפיה', emoji: '💃' },
  other: { label: 'אחר', emoji: '📦' }
}

const availabilityLabels: Record<string, { label: string; color: string }> = {
  available: { label: 'פנוי', color: 'bg-green-100 text-green-800' },
  unavailable: { label: 'תפוס', color: 'bg-red-100 text-red-800' },
  pending: { label: 'ממתין', color: 'bg-yellow-100 text-yellow-800' },
  unknown: { label: 'לא ידוע', color: 'bg-gray-100 text-gray-800' }
}

const emptyQuote = {
  vendor_name: '',
  vendor_contact_name: '',
  vendor_phone: '',
  vendor_email: '',
  category: 'venue',
  price_total: '',
  price_notes: '',
  services_included: '',
  availability_status: 'unknown',
  availability_notes: '',
  pros: '',
  cons: '',
  rating: '',
  admin_notes: '',
  is_finalist: false,
  display_label: ''
}

// Category stats interface
interface CategoryStats {
  category: string
  count: number
  minPrice: number
  maxPrice: number
  avgPrice: number
  cheapestId: string | null
  highestRatedId: string | null
  bestValueId: string | null
}

export default function QuotesComparisonPage() {
  const params = useParams()
  const promId = params.id as string
  const [isLoading, setIsLoading] = useState(true)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [promEvent, setPromEvent] = useState<PromEvent | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [formData, setFormData] = useState(emptyQuote)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [selectedForPackage, setSelectedForPackage] = useState<Record<string, string>>({}) // category -> quoteId
  const [showPackageBuilder, setShowPackageBuilder] = useState(false)
  const [showSupplierBuilder, setShowSupplierBuilder] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [promId])

  async function fetchData() {
    setIsLoading(true)
    try {
      const [promResponse, quotesResponse] = await Promise.all([
        fetch(`/api/prom/${promId}?_t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/prom/${promId}/quotes?_t=${Date.now()}`, { cache: 'no-store' })
      ])

      const promData = await promResponse.json()
      const quotesData = await quotesResponse.json()

      if (promData.success) {
        setPromEvent(promData.data)
      }

      if (quotesData.success) {
        setQuotes(quotesData.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('שגיאה בטעינת הנתונים')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const openEditDialog = (quote: Quote) => {
    setEditingQuote(quote)
    setFormData({
      vendor_name: quote.vendor_name,
      vendor_contact_name: quote.vendor_contact_name || '',
      vendor_phone: quote.vendor_phone || '',
      vendor_email: quote.vendor_email || '',
      category: quote.category,
      price_total: quote.price_total.toString(),
      price_notes: quote.price_notes || '',
      services_included: quote.services_included?.join(', ') || '',
      availability_status: quote.availability_status,
      availability_notes: quote.availability_notes || '',
      pros: quote.pros || '',
      cons: quote.cons || '',
      rating: quote.rating?.toString() || '',
      admin_notes: quote.admin_notes || '',
      is_finalist: quote.is_finalist,
      display_label: quote.display_label || ''
    })
    setIsAddDialogOpen(true)
  }

  const resetForm = () => {
    setFormData(emptyQuote)
    setEditingQuote(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.vendor_name.trim()) {
      toast.error('נא להזין שם ספק')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        price_total: parseFloat(formData.price_total) || 0,
        rating: formData.rating ? parseInt(formData.rating) : null,
        services_included: formData.services_included
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      }

      const url = editingQuote 
        ? `/api/prom/${promId}/quotes/${editingQuote.id}`
        : `/api/prom/${promId}/quotes`

      const response = await fetch(url, {
        method: editingQuote ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(editingQuote ? 'הצעת המחיר עודכנה' : 'הצעת המחיר נוספה')
        setIsAddDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        toast.error(data.error || 'שגיאה בשמירת הצעת המחיר')
      }
    } catch (error) {
      console.error('Error saving quote:', error)
      toast.error('שגיאה בשמירת הצעת המחיר')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (quoteId: string) => {
    if (!confirm('האם למחוק הצעת מחיר זו?')) return

    try {
      const response = await fetch(`/api/prom/${promId}/quotes/${quoteId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        toast.success('הצעת המחיר נמחקה')
        fetchData()
      } else {
        toast.error(data.error || 'שגיאה במחיקה')
      }
    } catch (error) {
      console.error('Error deleting quote:', error)
      toast.error('שגיאה במחיקה')
    }
  }

  const handleToggleFinalist = async (quote: Quote) => {
    try {
      const response = await fetch(`/api/prom/${promId}/quotes/${quote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_finalist: !quote.is_finalist })
      })
      const data = await response.json()

      if (data.success) {
        toast.success(quote.is_finalist ? 'הוסר מהסופיים' : 'נוסף לסופיים')
        fetchData()
      }
    } catch (error) {
      console.error('Error updating quote:', error)
    }
  }

  const handleSelectWinner = async (quote: Quote) => {
    try {
      // First, unselect all quotes
      await Promise.all(
        quotes.filter(q => q.is_selected).map(q =>
          fetch(`/api/prom/${promId}/quotes/${q.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_selected: false })
          })
        )
      )

      // Select the winner
      const response = await fetch(`/api/prom/${promId}/quotes/${quote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_selected: true })
      })
      const data = await response.json()

      if (data.success) {
        toast.success('נבחר כזוכה!')
        fetchData()
      }
    } catch (error) {
      console.error('Error selecting winner:', error)
    }
  }

  const toggleRowExpand = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const exportToCSV = () => {
    const headers = ['שם ספק', 'קטגוריה', 'מחיר כולל', 'מחיר לתלמיד', 'זמינות', 'דירוג', 'יתרונות', 'חסרונות']
    const rows = quotes.map(q => [
      q.vendor_name,
      categoryLabels[q.category]?.label || q.category,
      q.price_total.toString(),
      q.price_per_student?.toString() || '',
      availabilityLabels[q.availability_status]?.label || q.availability_status,
      q.rating?.toString() || '',
      q.pros || '',
      q.cons || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `quotes_comparison_${new Date().toISOString().split('T')[0]}.csv`
    link.click()

    toast.success('הקובץ הורד')
  }

  const filteredQuotes = selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory)

  // Group by category for display
  const totalPrice = filteredQuotes.reduce((sum, q) => sum + q.price_total, 0)
  const avgPrice = filteredQuotes.length > 0 ? Math.round(totalPrice / filteredQuotes.length) : 0

  // Calculate category stats
  const categoryStats: CategoryStats[] = Object.keys(categoryLabels).map(category => {
    const categoryQuotes = quotes.filter(q => q.category === category)
    if (categoryQuotes.length === 0) {
      return {
        category,
        count: 0,
        minPrice: 0,
        maxPrice: 0,
        avgPrice: 0,
        cheapestId: null,
        highestRatedId: null,
        bestValueId: null
      }
    }

    const prices = categoryQuotes.map(q => q.price_total)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const avgCatPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)

    // Find cheapest
    const cheapest = categoryQuotes.reduce((min, q) => 
      q.price_total < min.price_total ? q : min, categoryQuotes[0])

    // Find highest rated
    const rated = categoryQuotes.filter(q => q.rating !== null)
    const highestRated = rated.length > 0 
      ? rated.reduce((max, q) => (q.rating || 0) > (max.rating || 0) ? q : max, rated[0])
      : null

    // Find best value (rating / price ratio - higher is better)
    const withRating = categoryQuotes.filter(q => q.rating !== null && q.price_total > 0)
    const bestValue = withRating.length > 0
      ? withRating.reduce((best, q) => {
          const currentRatio = (q.rating || 0) / q.price_total
          const bestRatio = (best.rating || 0) / best.price_total
          return currentRatio > bestRatio ? q : best
        }, withRating[0])
      : null

    return {
      category,
      count: categoryQuotes.length,
      minPrice,
      maxPrice,
      avgPrice: avgCatPrice,
      cheapestId: cheapest?.id || null,
      highestRatedId: highestRated?.id || null,
      bestValueId: bestValue?.id || null
    }
  }).filter(s => s.count > 0)

  // Get badges for a quote
  const getQuoteBadges = (quote: Quote): { type: string; label: string; color: string }[] => {
    const badges: { type: string; label: string; color: string }[] = []
    const stats = categoryStats.find(s => s.category === quote.category)
    
    if (stats) {
      if (stats.cheapestId === quote.id) {
        badges.push({ type: 'cheapest', label: 'הכי זול', color: 'bg-green-100 text-green-800 border-green-300' })
      }
      if (stats.highestRatedId === quote.id && quote.rating) {
        badges.push({ type: 'rated', label: 'מדורג גבוה', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' })
      }
      if (stats.bestValueId === quote.id && stats.cheapestId !== quote.id) {
        badges.push({ type: 'value', label: 'תמורה לכסף', color: 'bg-purple-100 text-purple-800 border-purple-300' })
      }
      // Check if above average
      if (quote.price_total > stats.avgPrice * 1.2 && stats.count > 1) {
        badges.push({ type: 'expensive', label: 'מעל הממוצע', color: 'bg-orange-100 text-orange-800 border-orange-300' })
      }
    }
    
    return badges
  }

  // Package builder calculations
  const packageTotal = Object.entries(selectedForPackage).reduce((sum, [, quoteId]) => {
    const quote = quotes.find(q => q.id === quoteId)
    return sum + (quote?.price_total || 0)
  }, 0)

  const packagePerStudent = promEvent?.student_count && promEvent.student_count > 0
    ? Math.round(packageTotal / promEvent.student_count)
    : 0

  const budgetRemaining = (promEvent?.total_budget || 0) - packageTotal
  const budgetUsagePercent = promEvent?.total_budget 
    ? Math.round((packageTotal / promEvent.total_budget) * 100)
    : 0

  const togglePackageSelection = (quote: Quote) => {
    setSelectedForPackage(prev => {
      const newSelection = { ...prev }
      if (newSelection[quote.category] === quote.id) {
        delete newSelection[quote.category]
      } else {
        newSelection[quote.category] = quote.id
      }
      return newSelection
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
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
            <h1 className="text-2xl font-bold">השוואת הצעות מחיר</h1>
            <p className="text-muted-foreground">{promEvent?.title}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" title="מדריך שימוש">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">מדריך שימוש - תכנון מסיבת סיום</DialogTitle>
                <DialogDescription>
                  מדריך פשוט לשימוש במערכת השוואת הצעות המחיר
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 text-right prose prose-sm max-w-none">
                <section>
                  <h3 className="text-lg font-bold mb-3">🎯 איך מוסיפים הצעה?</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>לחצו על <strong>"+ הוסף הצעה"</strong> (כפתור ורוד-סגול)</li>
                    <li>מלאו את הפרטים: שם ספק, קטגוריה, מחיר</li>
                    <li>הוסיפו שירותים כלולים, יתרונות וחסרונות</li>
                    <li>דרגו את ההצעה (1-5 כוכבים)</li>
                    <li>לחצו <strong>"הוסף"</strong></li>
                  </ol>
                </section>

                <section>
                  <h3 className="text-lg font-bold mb-3">📊 מה רואים בטבלה?</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li><strong>תגיות חכמות:</strong> 🟢 "הכי זול" - המחיר הנמוך ביותר בקטגוריה</li>
                    <li><strong>⭐ "מדורג גבוה"</strong> - הדירוג הגבוה ביותר</li>
                    <li><strong>💎 "תמורה לכסף"</strong> - הכי טוב ביחס מחיר/איכות</li>
                    <li><strong>⚠️ "מעל הממוצע"</strong> - יקר יותר מהממוצע</li>
                    <li><strong>לחצו על שורה</strong> כדי לראות פרטים נוספים</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-bold mb-3">📦 בונה חבילה - איך משתמשים?</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>לחצו על הכרטיס <strong>"בונה חבילה"</strong> (בשורת הסטטיסטיקה)</li>
                    <li>לחצו על כפתור החבילה (📦) ליד כל הצעה כדי להוסיף אותה</li>
                    <li>תראו מיד: סה"כ חבילה, מחיר לתלמיד, אחוז מתקציב</li>
                    <li>אם אתם עוברים את התקציב - תראו אזהרה באדום ⚠️</li>
                  </ol>
                </section>

                <section>
                  <h3 className="text-lg font-bold mb-3">🏷️ כרטיסי קטגוריה</h3>
                  <p className="text-sm mb-2">בחלק העליון יש כרטיסים קטנים לכל קטגוריה:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>מספר הצעות בקטגוריה</li>
                    <li>טווח מחירים (מינימום - מקסימום)</li>
                    <li>מחיר ממוצע</li>
                    <li>לחצו על כרטיס כדי לסנן את הטבלה לפי הקטגוריה</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-bold mb-3">✅ בחירת זוכה</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>לחצו על שורה כדי לראות פרטים</li>
                    <li>לחצו על <strong>"בחר כזוכה"</strong> (כפתור ירוק)</li>
                    <li>ההצעה תסומן ב<strong>"נבחר"</strong> (תג ירוק)</li>
                    <li>להצבעת הורים: סמנו הצעות כ<strong>"סופיים"</strong> לפני פתיחת הצבעה</li>
                  </ol>
                </section>

                <section>
                  <h3 className="text-lg font-bold mb-3">💡 טיפים שימושיים</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li><strong>הוסיפו כמה הצעות</strong> לכל קטגוריה כדי להשוות</li>
                    <li><strong>השתמשו בבונה חבילה</strong> כדי לבדוק עלות כוללת</li>
                    <li><strong>ייצאו ל-CSV</strong> כדי לשתף את הטבלה ב-WhatsApp</li>
                    <li><strong>עקבו אחר התקציב</strong> - לחצו על כרטיס "הוצאו" לראות תקציב</li>
                  </ul>
                </section>

                <section className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-bold mb-2 text-blue-900">❓ שאלות?</h3>
                  <p className="text-sm text-blue-800">
                    אם אתם צריכים עזרה נוספת, פנו למנהל המערכת או בדקו את המדריך המלא בתיעוד.
                  </p>
                </section>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsHelpOpen(false)}>סגור</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 ml-2" />
            ייצוא CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600">
                <Plus className="h-4 w-4 ml-2" />
                הוסף הצעה
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingQuote ? 'עריכת הצעת מחיר' : 'הצעת מחיר חדשה'}
                </DialogTitle>
                <DialogDescription>
                  הזן את פרטי הצעת המחיר מהספק
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vendor_name">שם הספק *</Label>
                    <Input
                      id="vendor_name"
                      name="vendor_name"
                      value={formData.vendor_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">קטגוריה</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => handleSelectChange('category', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([key, { label, emoji }]) => (
                          <SelectItem key={key} value={key}>
                            {emoji} {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor_contact_name">איש קשר</Label>
                    <Input
                      id="vendor_contact_name"
                      name="vendor_contact_name"
                      value={formData.vendor_contact_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor_phone">טלפון</Label>
                    <Input
                      id="vendor_phone"
                      name="vendor_phone"
                      value={formData.vendor_phone}
                      onChange={handleChange}
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_total">מחיר כולל (₪) *</Label>
                    <Input
                      id="price_total"
                      name="price_total"
                      type="number"
                      min="0"
                      value={formData.price_total}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability_status">זמינות</Label>
                    <Select
                      value={formData.availability_status}
                      onValueChange={(v) => handleSelectChange('availability_status', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(availabilityLabels).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="services_included">שירותים כלולים (מופרדים בפסיקים)</Label>
                  <Input
                    id="services_included"
                    name="services_included"
                    value={formData.services_included}
                    onChange={handleChange}
                    placeholder="DJ, תאורה, מערכת שמע..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_notes">הערות מחיר / תנאי תשלום</Label>
                  <Textarea
                    id="price_notes"
                    name="price_notes"
                    value={formData.price_notes}
                    onChange={handleChange}
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pros">יתרונות</Label>
                    <Textarea
                      id="pros"
                      name="pros"
                      value={formData.pros}
                      onChange={handleChange}
                      rows={2}
                      className="text-green-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cons">חסרונות</Label>
                    <Textarea
                      id="cons"
                      name="cons"
                      value={formData.cons}
                      onChange={handleChange}
                      rows={2}
                      className="text-red-700"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rating">דירוג (1-5)</Label>
                    <Input
                      id="rating"
                      name="rating"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_label">תווית להצבעה</Label>
                    <Input
                      id="display_label"
                      name="display_label"
                      value={formData.display_label}
                      onChange={handleChange}
                      placeholder="אפשרות א'"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_notes">הערות פנימיות (למנהלים בלבד)</Label>
                  <Textarea
                    id="admin_notes"
                    name="admin_notes"
                    value={formData.admin_notes}
                    onChange={handleChange}
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    checked={formData.is_finalist}
                    onCheckedChange={(checked) => handleSwitchChange('is_finalist', checked)}
                  />
                  <Label>הוסף לאפשרויות הסופיות (להצבעה)</Label>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsAddDialogOpen(false)
                    resetForm()
                  }}>
                    ביטול
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'שומר...' : editingQuote ? 'עדכן' : 'הוסף'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">סה"כ הצעות</div>
            <div className="text-2xl font-bold">{quotes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">מחיר ממוצע</div>
            <div className="text-2xl font-bold">₪{avgPrice.toLocaleString('he-IL')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">סופיים להצבעה</div>
            <div className="text-2xl font-bold">{quotes.filter(q => q.is_finalist).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">תלמידים</div>
            <div className="text-2xl font-bold">{promEvent?.student_count || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Builder Buttons - Minimized at Start */}
      <div className="flex gap-3 flex-wrap">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setShowPackageBuilder(!showPackageBuilder)}
        >
          <Package className="h-4 w-4" />
          בונה חבילה
          <ChevronDown className={cn("h-4 w-4 transition-transform", showPackageBuilder && "rotate-180")} />
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setShowSupplierBuilder(!showSupplierBuilder)}
        >
          <FileSpreadsheet className="h-4 w-4" />
          בונה ספקים
          <ChevronDown className={cn("h-4 w-4 transition-transform", showSupplierBuilder && "rotate-180")} />
        </Button>
      </div>

      {/* Package Builder Panel */}
      {showPackageBuilder && (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-indigo-600" />
              בונה חבילה
            </CardTitle>
            <CardDescription>
              בחר ספק אחד מכל קטגוריה לחישוב עלות כוללת
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {categoryStats.map(stat => {
                const selectedQuote = selectedForPackage[stat.category]
                  ? quotes.find(q => q.id === selectedForPackage[stat.category])
                  : null
                
                return (
                  <div 
                    key={stat.category}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all",
                      selectedQuote 
                        ? "bg-white border-indigo-400 shadow-sm" 
                        : "bg-white/50 border-dashed border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{categoryLabels[stat.category]?.emoji}</span>
                      <span className="font-medium text-sm">{categoryLabels[stat.category]?.label}</span>
                    </div>
                    {selectedQuote ? (
                      <div className="space-y-1">
                        <div className="font-semibold text-indigo-900">{selectedQuote.vendor_name}</div>
                        <div className="text-lg font-bold">₪{selectedQuote.price_total.toLocaleString('he-IL')}</div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => togglePackageSelection(selectedQuote)}
                        >
                          הסר מהחבילה
                        </Button>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {stat.count} הצעות זמינות
                        <div className="text-xs mt-1">
                          ₪{stat.minPrice.toLocaleString('he-IL')} - ₪{stat.maxPrice.toLocaleString('he-IL')}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Package Summary */}
            {Object.keys(selectedForPackage).length > 0 && (
              <div className="mt-4 p-4 bg-white rounded-lg border-2 border-indigo-300">
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <div className="text-sm text-muted-foreground">סה"כ חבילה</div>
                    <div className="text-2xl font-bold text-indigo-900">
                      ₪{packageTotal.toLocaleString('he-IL')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">לתלמיד</div>
                    <div className="text-2xl font-bold">
                      {packagePerStudent > 0 ? `₪${packagePerStudent.toLocaleString('he-IL')}` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">מתקציב</div>
                    <div className={cn(
                      "text-2xl font-bold",
                      budgetUsagePercent > 100 ? "text-red-600" : budgetUsagePercent > 80 ? "text-orange-600" : "text-green-600"
                    )}>
                      {budgetUsagePercent}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {budgetRemaining >= 0 ? 'נשאר בתקציב' : 'חריגה מתקציב'}
                    </div>
                    <div className={cn(
                      "text-2xl font-bold",
                      budgetRemaining >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      ₪{Math.abs(budgetRemaining).toLocaleString('he-IL')}
                      {budgetRemaining < 0 && <AlertCircle className="inline h-5 w-5 mr-1" />}
                    </div>
                  </div>
                </div>

                {/* Budget Progress Bar */}
                {promEvent?.total_budget && promEvent.total_budget > 0 && (
                  <div className="mt-4">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          budgetUsagePercent > 100 ? "bg-red-500" 
                            : budgetUsagePercent > 80 ? "bg-orange-500" 
                            : "bg-green-500"
                        )}
                        style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Supplier Builder - Category Summary Cards */}
      {showSupplierBuilder && categoryStats.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              בונה ספקים - סקירת קטגוריות
            </CardTitle>
            <CardDescription>
              לחצו על קטגוריה כדי לסנן את הטבלה ולהשוות הצעות
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
              {categoryStats.map(stat => (
            <Card 
              key={stat.category}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedCategory === stat.category && "ring-2 ring-pink-500"
              )}
              onClick={() => setSelectedCategory(selectedCategory === stat.category ? 'all' : stat.category)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{categoryLabels[stat.category]?.emoji}</span>
                  <Badge variant="secondary" className="text-xs">
                    {stat.count} הצעות
                  </Badge>
                </div>
                <div className="font-medium text-sm mb-1">
                  {categoryLabels[stat.category]?.label}
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div className="flex justify-between">
                    <span>טווח:</span>
                    <span className="font-medium">
                      ₪{stat.minPrice.toLocaleString('he-IL')} - ₪{stat.maxPrice.toLocaleString('he-IL')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ממוצע:</span>
                    <span className="font-medium">₪{stat.avgPrice.toLocaleString('he-IL')}</span>
                  </div>
                </div>
                {/* Mini badges */}
                <div className="flex gap-1 mt-2 flex-wrap">
                  {stat.cheapestId && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                      <TrendingDown className="inline h-2.5 w-2.5" /> זול
                    </span>
                  )}
                  {stat.highestRatedId && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">
                      <Star className="inline h-2.5 w-2.5" /> מדורג
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          הכל
        </Button>
        {Object.entries(categoryLabels).map(([key, { label, emoji }]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(key)}
          >
            {emoji} {label}
          </Button>
        ))}
      </div>

      {/* Quotes Table */}
      {quotes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">אין הצעות מחיר</h3>
            <p className="text-muted-foreground mb-6">
              הוסיפו הצעות מחיר מספקים שונים להשוואה
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              הוסף הצעה ראשונה
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>טבלת השוואה</CardTitle>
            <CardDescription>
              לחץ על שורה להרחבת פרטים • {filteredQuotes.length} הצעות
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>ספק</TableHead>
                  <TableHead>קטגוריה</TableHead>
                  <TableHead className="text-left">מחיר</TableHead>
                  <TableHead className="text-left">לתלמיד</TableHead>
                  <TableHead>זמינות</TableHead>
                  <TableHead>דירוג</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead className="w-24">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <>
                    <TableRow 
                      key={quote.id}
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        quote.is_selected && "bg-green-50 hover:bg-green-100",
                        quote.is_finalist && !quote.is_selected && "bg-purple-50 hover:bg-purple-100",
                        selectedForPackage[quote.category] === quote.id && !quote.is_selected && !quote.is_finalist && "bg-indigo-50 hover:bg-indigo-100"
                      )}
                      onClick={() => toggleRowExpand(quote.id)}
                    >
                      <TableCell>
                        {expandedRows.has(quote.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {quote.is_selected && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                          {selectedForPackage[quote.category] === quote.id && (
                            <Package className="h-4 w-4 text-indigo-600" />
                          )}
                          {quote.vendor_name}
                        </div>
                        {/* Smart Badges */}
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {getQuoteBadges(quote).map((badge) => (
                            <span 
                              key={badge.type}
                              className={cn("text-[10px] px-1.5 py-0.5 rounded border", badge.color)}
                            >
                              {badge.type === 'cheapest' && <TrendingDown className="inline h-2.5 w-2.5 mr-0.5" />}
                              {badge.type === 'rated' && <Star className="inline h-2.5 w-2.5 mr-0.5" />}
                              {badge.type === 'value' && <Sparkles className="inline h-2.5 w-2.5 mr-0.5" />}
                              {badge.type === 'expensive' && <AlertCircle className="inline h-2.5 w-2.5 mr-0.5" />}
                              {badge.label}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          {categoryLabels[quote.category]?.emoji}
                          <span className="hidden sm:inline">{categoryLabels[quote.category]?.label}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-left font-semibold">
                        ₪{quote.price_total.toLocaleString('he-IL')}
                      </TableCell>
                      <TableCell className="text-left text-muted-foreground">
                        {quote.price_per_student 
                          ? `₪${quote.price_per_student.toLocaleString('he-IL')}`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={availabilityLabels[quote.availability_status]?.color}>
                          {availabilityLabels[quote.availability_status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {quote.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {quote.rating}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {quote.is_selected ? (
                          <Badge className="bg-green-600">נבחר</Badge>
                        ) : quote.is_finalist ? (
                          <Badge variant="outline" className="border-purple-400 text-purple-700">סופי</Badge>
                        ) : null}
                      </TableCell>
                      <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={selectedForPackage[quote.category] === quote.id ? "הסר מחבילה" : "הוסף לחבילה"}
                            className={cn(
                              selectedForPackage[quote.category] === quote.id && "text-indigo-600 bg-indigo-50"
                            )}
                            onClick={() => togglePackageSelection(quote)}
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(quote)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600"
                            onClick={() => handleDelete(quote.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Row */}
                    {expandedRows.has(quote.id) && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={9}>
                          <div className="p-4 space-y-4">
                            {/* Contact Info */}
                            <div className="flex flex-wrap gap-4 text-sm">
                              {quote.vendor_contact_name && (
                                <span>👤 {quote.vendor_contact_name}</span>
                              )}
                              {quote.vendor_phone && (
                                <a href={`tel:${quote.vendor_phone}`} className="flex items-center gap-1 text-blue-600">
                                  <Phone className="h-3 w-3" />
                                  {quote.vendor_phone}
                                </a>
                              )}
                              {quote.vendor_email && (
                                <a href={`mailto:${quote.vendor_email}`} className="flex items-center gap-1 text-blue-600">
                                  <Mail className="h-3 w-3" />
                                  {quote.vendor_email}
                                </a>
                              )}
                            </div>

                            {/* Services */}
                            {quote.services_included?.length > 0 && (
                              <div>
                                <span className="text-sm font-medium">שירותים כלולים:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {quote.services_included.map((service, i) => (
                                    <Badge key={i} variant="secondary">{service}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Pros & Cons */}
                            <div className="grid gap-4 md:grid-cols-2">
                              {quote.pros && (
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                  <span className="text-sm font-medium text-green-800">✓ יתרונות</span>
                                  <p className="text-sm text-green-700 mt-1">{quote.pros}</p>
                                </div>
                              )}
                              {quote.cons && (
                                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                  <span className="text-sm font-medium text-red-800">✗ חסרונות</span>
                                  <p className="text-sm text-red-700 mt-1">{quote.cons}</p>
                                </div>
                              )}
                            </div>

                            {/* Price Notes */}
                            {quote.price_notes && (
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-sm font-medium text-blue-800">💰 תנאי תשלום</span>
                                <p className="text-sm text-blue-700 mt-1">{quote.price_notes}</p>
                              </div>
                            )}

                            {/* Admin Notes */}
                            {quote.admin_notes && (
                              <div className="p-3 bg-gray-100 rounded-lg border">
                                <span className="text-sm font-medium">📝 הערות פנימיות</span>
                                <p className="text-sm text-muted-foreground mt-1">{quote.admin_notes}</p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant={quote.is_finalist ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => handleToggleFinalist(quote)}
                              >
                                {quote.is_finalist ? 'הסר מהסופיים' : 'הוסף לסופיים'}
                              </Button>
                              {!quote.is_selected && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleSelectWinner(quote)}
                                >
                                  <Check className="h-4 w-4 ml-1" />
                                  בחר כזוכה
                                </Button>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

