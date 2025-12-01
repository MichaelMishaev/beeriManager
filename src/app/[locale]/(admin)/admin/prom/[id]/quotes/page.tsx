'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { QuoteCard } from '@/components/features/prom/quotes/QuoteCard'
import { MobileBottomBar } from '@/components/features/prom/quotes/MobileBottomBar'
import { CategoryFilter } from '@/components/features/prom/quotes/CategoryFilter'
import { MobileHeader } from '@/components/features/prom/quotes/MobileHeader'

// Dynamic imports for client-only components
const QRCode = dynamic(() => import('qrcode.react').then(mod => ({ default: mod.QRCodeSVG })), {
  ssr: false,
  loading: () => <div className="h-64 w-64 bg-gray-100 animate-pulse rounded" />
})

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

export default function QuotesComparisonPageMobileFirst() {
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
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [qrCodeUrl, setQRCodeUrl] = useState('')

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleNativeShare = async () => {
    const shareUrl = `${window.location.origin}/he/prom/${promId}/quotes`
    const shareTitle = 'השוואת הצעות מחיר - מסיבת סיום'
    const shareText = `צפו בכל הצעות המחיר למסיבת הסיום`

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        })
        toast.success('שותף בהצלחה!')
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error)
          navigator.clipboard.writeText(shareUrl)
          toast.success('✅ קישור הועתק ללוח!')
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
      toast.success('✅ קישור הועתק ללוח!')
    }
  }

  const handleShowQR = () => {
    const shareUrl = `${window.location.origin}/he/prom/${promId}/quotes`
    setQRCodeUrl(shareUrl)
    setShowQRDialog(true)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
    document.documentElement.classList.toggle('dark')
  }

  const filteredQuotes = (selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory))
    .sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category, 'he')
      }
      return a.price_total - b.price_total
    })

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
    const cheapest = categoryQuotes.reduce((min, q) =>
      q.price_total < min.price_total ? q : min, categoryQuotes[0])

    const rated = categoryQuotes.filter(q => q.rating !== null)
    const highestRated = rated.length > 0
      ? rated.reduce((max, q) => (q.rating || 0) > (max.rating || 0) ? q : max, rated[0])
      : null

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
      maxPrice: Math.max(...prices),
      avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      cheapestId: cheapest?.id || null,
      highestRatedId: highestRated?.id || null,
      bestValueId: bestValue?.id || null
    }
  }).filter(s => s.count > 0)

  const quoteCounts = quotes.reduce((acc, quote) => {
    acc[quote.category] = (acc[quote.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const isCheapest = (quote: Quote) => {
    const stats = categoryStats.find(s => s.category === quote.category)
    return stats?.cheapestId === quote.id
  }

  const isHighestRated = (quote: Quote) => {
    const stats = categoryStats.find(s => s.category === quote.category)
    return stats?.highestRatedId === quote.id && quote.rating !== null
  }

  const isBestValue = (quote: Quote) => {
    const stats = categoryStats.find(s => s.category === quote.category)
    return stats?.bestValueId === quote.id && stats?.cheapestId !== quote.id
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {/* Loading skeleton */}
        <div className="h-16 bg-gray-200 animate-pulse rounded" />
        <div className="h-12 bg-gray-100 animate-pulse rounded" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen", isDarkMode && "dark bg-gray-900")}>
      {/* Mobile Header */}
      <MobileHeader
        promId={promId}
        quotesCount={quotes.length}
        promTitle={promEvent?.title}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onShowQR={handleShowQR}
        onShare={handleNativeShare}
      />

      {/* Category Filter */}
      <CategoryFilter
        categories={categoryLabels}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        quoteCounts={quoteCounts}
        totalQuotes={quotes.length}
      />

      {/* Main Content */}
      <main className="p-4 space-y-3 pb-32">
        {filteredQuotes.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">אין הצעות מחיר להצגה</p>
            <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
              הוסף הצעה ראשונה
            </Button>
          </Card>
        ) : (
          filteredQuotes.map(quote => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onTap={() => {}} // TODO: implement details view
              onEdit={() => openEditDialog(quote)}
              onDelete={() => handleDelete(quote.id)}
              isCheapest={isCheapest(quote)}
              isHighestRated={isHighestRated(quote)}
              isBestValue={isBestValue(quote)}
              categoryLabel={categoryLabels[quote.category]?.label || quote.category}
              categoryEmoji={categoryLabels[quote.category]?.emoji || '📋'}
              availabilityLabel={availabilityLabels[quote.availability_status]?.label || 'לא ידוע'}
              availabilityColor={availabilityLabels[quote.availability_status]?.color || 'bg-gray-100 text-gray-800'}
            />
          ))
        )}
      </main>

      {/* Mobile Bottom Bar */}
      <MobileBottomBar
        onAddQuote={() => setIsAddDialogOpen(true)}
        onExportCSV={exportToCSV}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="fixed inset-0 w-full h-full max-w-full m-0 p-0 rounded-none sm:max-w-2xl sm:h-auto sm:rounded-lg sm:relative sm:inset-auto">
          <div className="sticky top-0 bg-white z-50 border-b sm:relative sm:border-0">
            <div className="flex items-center justify-between p-4 sm:p-0">
              <button
                onClick={() => setIsAddDialogOpen(false)}
                className="text-gray-500 text-lg sm:hidden"
              >
                ביטול
              </button>
              <DialogHeader className="sm:block hidden">
                <DialogTitle>
                  {editingQuote ? 'עריכת הצעת מחיר' : 'הצעת מחיר חדשה'}
                </DialogTitle>
                <DialogDescription>
                  הזן את פרטי הצעת המחיר מהספק
                </DialogDescription>
              </DialogHeader>
              <h2 className="text-xl font-bold sm:hidden">הצעה חדשה</h2>
              <div className="w-12 sm:hidden" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="h-full flex flex-col sm:block">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vendor_name" className="text-base font-bold">שם הספק *</Label>
                <Input
                  id="vendor_name"
                  name="vendor_name"
                  value={formData.vendor_name}
                  onChange={handleChange}
                  required
                  className="h-14 text-lg"
                  placeholder="לדוגמה: DJ מוטי כהן"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-bold">קטגוריה *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => handleSelectChange('category', v)}
                >
                  <SelectTrigger className="h-14 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, { label, emoji }]) => (
                      <SelectItem key={key} value={key} className="text-base">
                        {emoji} {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_total" className="text-base font-bold">מחיר כולל (₪) *</Label>
                <Input
                  id="price_total"
                  name="price_total"
                  type="number"
                  min="0"
                  value={formData.price_total}
                  onChange={handleChange}
                  required
                  className="h-14 text-lg"
                  placeholder="8000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor_phone" className="text-base font-bold">טלפון</Label>
                <Input
                  id="vendor_phone"
                  name="vendor_phone"
                  type="tel"
                  value={formData.vendor_phone}
                  onChange={handleChange}
                  className="h-14 text-lg"
                  placeholder="050-1234567"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="services_included" className="text-base font-bold">שירותים כלולים</Label>
                <Textarea
                  id="services_included"
                  name="services_included"
                  value={formData.services_included}
                  onChange={handleChange}
                  className="min-h-[80px] text-base"
                  placeholder="מערכת הגברה, תאורה, 5 שעות ניגון (הפרד בפסיקים)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating" className="text-base font-bold">דירוג (1-5)</Label>
                <Select
                  value={formData.rating}
                  onValueChange={(v) => handleSelectChange('rating', v)}
                >
                  <SelectTrigger className="h-14 text-lg">
                    <SelectValue placeholder="בחר דירוג" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={n.toString()} className="text-base">
                        {Array(n).fill('⭐').join('')} ({n})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-4 sm:relative sm:border-0 sm:p-0 sm:mt-6">
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 sm:w-auto sm:h-auto sm:text-base"
                >
                  {isSubmitting ? 'שומר...' : editingQuote ? 'עדכן' : 'הוסף הצעה'}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>שתף עם קוד QR</DialogTitle>
            <DialogDescription>
              סרוק את הקוד כדי לפתוח את דף ההשוואה
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-6">
            <QRCode value={qrCodeUrl} size={256} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
