'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
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
  FileSpreadsheet,
  MoreVertical,
  Share2,
  QrCode,
  Copy,
  Moon,
  Sun
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  const [showCategorySummary, setShowCategorySummary] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [qrCodeUrl, setQRCodeUrl] = useState('')
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

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

  // Native Share API integration
  const handleNativeShare = async (quote?: Quote) => {
    const shareUrl = quote
      ? `${window.location.origin}/${params.locale}/prom/${promId}/quotes#${quote.id}`
      : `${window.location.origin}/${params.locale}/prom/${promId}/quotes`

    const shareTitle = quote
      ? `הצעת מחיר - ${quote.vendor_name}`
      : 'השוואת הצעות מחיר - מסיבת סיום'

    const shareText = quote
      ? `${categoryLabels[quote.category]?.emoji} ${quote.vendor_name}\nמחיר: ₪${quote.price_total.toLocaleString('he-IL')}${quote.rating ? `\nדירוג: ${quote.rating}/5` : ''}`
      : `צפו בכל הצעות המחיר למסיבת הסיום`

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
          // Fallback to clipboard
          handleCopyLink(shareUrl)
        }
      }
    } else {
      // Fallback to clipboard
      handleCopyLink(shareUrl)
    }
  }

  const handleCopyLink = (url?: string) => {
    const shareUrl = url || `${window.location.origin}/${params.locale}/prom/${promId}/quotes`
    navigator.clipboard.writeText(shareUrl)
    toast.success('✅ קישור הועתק ללוח!')
  }

  const handleShowQR = () => {
    const shareUrl = `${window.location.origin}/${params.locale}/prom/${promId}/quotes`
    setQRCodeUrl(shareUrl)
    setShowQRDialog(true)
  }

  // Dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
    document.documentElement.classList.toggle('dark')
  }

  // Dark mode effect
  useEffect(() => {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const filteredQuotes = (selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory))
    .sort((a, b) => {
      // First sort by category
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category, 'he')
      }
      // Then sort by price within category (lowest first)
      return a.price_total - b.price_total
    })

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
      <div className="space-y-8 dark:bg-gray-900 p-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-6 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Stats Cards Skeleton - Bento Grid */}
        <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-3" />
                <div className="h-8 w-32 bg-gray-300 dark:bg-gray-500 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quote Cards Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-4">
                    <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                    <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" />
                      <div className="h-6 w-24 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Helper to get quote counts by category
  const quoteCounts = quotes.reduce((acc, quote) => {
    acc[quote.category] = (acc[quote.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className={cn("pb-28 lg:pb-8 transition-colors duration-300", isDarkMode && "dark:bg-gray-900")}>
      {/* Mobile Header */}
      <div className="lg:hidden">
        <MobileHeader
          promId={promId}
          quotesCount={quotes.length}
          promTitle={promEvent?.title}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onShowQR={handleShowQR}
          onShare={() => handleNativeShare()}
          onShowHelp={() => setIsHelpOpen(true)}
        />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="min-w-[44px] min-h-[44px] transition-all hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <Link href={`/admin/prom/${promId}`}>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent dark:from-pink-400 dark:to-purple-400">
              השוואת הצעות מחיר
            </h1>
            <p className="text-base text-muted-foreground mt-1 dark:text-gray-400">{promEvent?.title}</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Dark Mode Toggle */}
          <Button
            variant="outline"
            size="icon"
            title={isDarkMode ? "מצב בהיר" : "מצב כהה"}
            onClick={toggleDarkMode}
            className="transition-all hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* QR Code */}
          <Button
            variant="outline"
            size="icon"
            title="הצג QR לשיתוף"
            onClick={handleShowQR}
            className="transition-all hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <QrCode className="h-4 w-4" />
          </Button>

          {/* Native Share */}
          <Button
            variant="outline"
            size="icon"
            title="שתף עם הורים"
            onClick={() => handleNativeShare()}
            className="transition-all hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" title="מדריך שימוש">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl md:text-3xl">📚 מדריך מלא - מערכת השוואת הצעות מחיר</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  מדריך מפורט וידידותי לשימוש במערכת תכנון מסיבת הסיום
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 sm:space-y-6 text-right max-w-none px-1">
                {/* Quick Start */}
                <section className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 md:p-6 rounded-xl border-2 border-purple-200">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 text-purple-900 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">🚀</span> התחלה מהירה (2 דקות)
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                    <div className="bg-white p-2 sm:p-3 rounded-lg">
                      <span className="font-bold text-purple-700">שלב 1:</span> הוסיפו את ההצעה הראשונה שלכם
                      <br />
                      <span className="text-xs text-gray-600">לחצו על הכפתור הוורוד "הוסף הצעה" בראש העמוד</span>
                    </div>
                    <div className="bg-white p-2 sm:p-3 rounded-lg">
                      <span className="font-bold text-purple-700">שלב 2:</span> מלאו לפחות שם ספק, קטגוריה ומחיר
                      <br />
                      <span className="text-xs text-gray-600">שאר השדות אופציונליים אבל מומלצים להשוואה טובה</span>
                    </div>
                    <div className="bg-white p-2 sm:p-3 rounded-lg">
                      <span className="font-bold text-purple-700">שלב 3:</span> הוסיפו עוד הצעות ולחצו על השורות כדי להשוות
                      <br />
                      <span className="text-xs text-gray-600">ככל שתוסיפו יותר הצעות, כך ההשוואה תהיה טובה יותר</span>
                    </div>
                  </div>
                </section>

                {/* Adding Quote - Detailed */}
                <section className="border-r-4 border-blue-400 pr-2 sm:pr-4">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-blue-900 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">➕</span> איך מוסיפים הצעת מחיר? (מפורט)
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg space-y-2 text-sm sm:text-base">
                      <p className="font-bold text-blue-900">1️⃣ לחצו על הכפתור "הוסף הצעה"</p>
                      <p className="pr-4 sm:pr-6">הכפתור נמצא בפינה השמאלית העליונה, צבע ורוד-סגול עם סימן פלוס (+)</p>

                      <p className="font-bold text-blue-900 pt-2">2️⃣ מלאו את הפרטים הבסיסיים (שדות חובה):</p>
                      <ul className="pr-6 sm:pr-10 space-y-1 text-xs sm:text-sm">
                        <li>• <strong>שם הספק</strong> - למשל: "אולמי ברושים", "DJ מוטי כהן"</li>
                        <li>• <strong>קטגוריה</strong> - בחרו מהרשימה (אולם, קייטרינג, DJ וכו')</li>
                        <li>• <strong>מחיר כולל</strong> - הסכום הסופי בשקלים (למשל: 15000)</li>
                      </ul>

                      <p className="font-bold text-blue-900 pt-2">3️⃣ הוסיפו פרטים נוספים (מומלץ מאוד):</p>
                      <ul className="pr-6 sm:pr-10 space-y-1 text-xs sm:text-sm">
                        <li>• <strong>איש קשר</strong> - שם האיש שאיתו דיברתם</li>
                        <li>• <strong>טלפון ואימייל</strong> - ליצירת קשר מהירה</li>
                        <li>• <strong>שירותים כלולים</strong> - למשל: "DJ, תאורה, מערכת שמע, מיקרופון אלחוטי"</li>
                        <li>• <strong>זמינות</strong> - האם הספק פנוי בתאריך שלכם?</li>
                        <li>• <strong>דירוג</strong> - תנו ציון מ-1 עד 5 כוכבים לפי הרושם שלכם</li>
                      </ul>

                      <p className="font-bold text-blue-900 pt-2">4️⃣ תיעדו יתרונות וחסרונות:</p>
                      <div className="pr-4 sm:pr-6 space-y-2 text-xs sm:text-sm">
                        <div className="bg-green-50 p-2 rounded border border-green-200">
                          <strong className="text-green-800">יתרונות:</strong> "ניסיון רב, ציוד מקצועי, מחיר תחרותי"
                        </div>
                        <div className="bg-red-50 p-2 rounded border border-red-200">
                          <strong className="text-red-800">חסרונות:</strong> "לא כולל גנרטור חשמל, דורש מקדמה גבוהה"
                        </div>
                      </div>

                      <p className="font-bold text-blue-900 pt-2">5️⃣ לחצו "הוסף" ותראו את ההצעה בטבלה!</p>
                    </div>
                  </div>
                </section>

                {/* Understanding Table */}
                <section className="border-r-4 border-green-400 pr-2 sm:pr-4">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-green-900 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">📊</span> הבנת הטבלה - מה כל הסימנים אומרים?
                  </h3>
                  <div className="space-y-3 text-sm sm:text-base">
                    <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                      <p className="font-bold mb-2 text-green-900">תגיות אוטומטיות חכמות:</p>
                      <div className="space-y-2 pr-2 sm:pr-4">
                        <div className="flex items-start gap-2">
                          <span className="text-lg sm:text-xl flex-shrink-0">🟢</span>
                          <div className="text-xs sm:text-sm">
                            <strong>"הכי זול"</strong> - ההצעה עם המחיר הנמוך ביותר בקטגוריה הזו
                            <br />
                            <span className="text-[10px] sm:text-xs text-green-700">דוגמה: אם יש 3 DJs במחירים 5000₪, 7000₪, 6000₪ - התג יופיע על זה של 5000₪</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-lg sm:text-xl flex-shrink-0">⭐</span>
                          <div className="text-xs sm:text-sm">
                            <strong>"מדורג גבוה"</strong> - הדירוג הגבוה ביותר שנתתם בקטגוריה
                            <br />
                            <span className="text-[10px] sm:text-xs text-green-700">דוגמה: אם דירגתם DJ אחד 5 כוכבים ואחר 3 - התג יופיע על זה עם 5</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-lg sm:text-xl flex-shrink-0">💎</span>
                          <div className="text-xs sm:text-sm">
                            <strong>"תמורה לכסף"</strong> - היחס הטוב ביותר בין איכות (דירוג) למחיר
                            <br />
                            <span className="text-[10px] sm:text-xs text-green-700">דוגמה: DJ ב-6000₪ עם דירוג 5 זה "תמורה לכסף" יותר מאשר DJ ב-5000₪ עם דירוג 3</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-lg sm:text-xl flex-shrink-0">⚠️</span>
                          <div className="text-xs sm:text-sm">
                            <strong>"מעל הממוצע"</strong> - יקר ב-20% או יותר מהמחיר הממוצע בקטגוריה
                            <br />
                            <span className="text-[10px] sm:text-xs text-green-700">דוגמה: אם ממוצע DJs הוא 6000₪, כל DJ מעל 7200₪ יקבל תג זה</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-200">
                      <p className="font-bold mb-2 text-yellow-900 text-sm sm:text-base">💡 טיפ חשוב - לחיצה על שורה:</p>
                      <p className="text-xs sm:text-sm">לחצו על כל שורה בטבלה כדי לראות:</p>
                      <ul className="pr-4 sm:pr-6 space-y-1 mt-2 text-xs sm:text-sm">
                        <li>✓ פרטי התקשרות מלאים (טלפון, אימייל)</li>
                        <li>✓ כל השירותים הכלולים במחיר</li>
                        <li>✓ יתרונות וחסרונות מלאים</li>
                        <li>✓ תנאי תשלום והערות מחיר</li>
                        <li>✓ כפתורים לפעולות: "בחר כזוכה", "הוסף לסופיים"</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Package Builder */}
                <section className="border-r-4 border-purple-400 pr-2 sm:pr-4">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-purple-900 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">📦</span> בונה חבילה - איך מתכננים את כל המסיבה?
                  </h3>
                  <div className="space-y-3 text-sm sm:text-base">
                    <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                      <p className="font-bold mb-3 text-purple-900 text-sm sm:text-base">🎯 מטרה: לבדוק כמה תעלה החבילה המושלמת שלכם</p>

                      <p className="font-bold mt-4 mb-2 text-purple-900 text-sm sm:text-base">איך זה עובד? (צעד אחר צעד)</p>
                      <ol className="space-y-2 sm:space-y-3 pr-4 sm:pr-6 text-xs sm:text-sm">
                        <li>
                          <strong>1. פתחו את בונה החבילה:</strong>
                          <br />
                          <span className="text-xs">לחצו על הכפתור "בונה חבילה" מעל הטבלה (עם אייקון 📦)</span>
                        </li>
                        <li>
                          <strong>2. בחרו ספק אחד מכל קטגוריה:</strong>
                          <br />
                          <span className="text-xs">לחצו על כפתור החבילה (📦) בטבלה ליד כל הצעה שאתם רוצים</span>
                        </li>
                        <li>
                          <strong>3. עקבו אחר הסיכום בזמן אמת:</strong>
                          <br />
                          <div className="bg-white p-2 sm:p-3 rounded mt-2 space-y-1 text-xs">
                            <div>📊 <strong>סה"כ חבילה:</strong> כמה זה יעלה בסך הכל</div>
                            <div>👨‍🎓 <strong>מחיר לתלמיד:</strong> אוטומטי - מחיר כולל ÷ מספר תלמידים</div>
                            <div>💰 <strong>אחוז מתקציב:</strong> כמה אחוזים מהתקציב השתמשתם</div>
                            <div>✅ <strong>נשאר בתקציב:</strong> כמה כסף נשאר לכם (או כמה חרגתם)</div>
                          </div>
                        </li>
                      </ol>

                      <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-purple-300 mt-3 sm:mt-4">
                        <p className="font-bold text-purple-900 mb-2 text-xs sm:text-sm">📝 דוגמה מלאה:</p>
                        <div className="space-y-2 text-xs sm:text-sm">
                          <p className="font-semibold">תקציב: 50,000₪ | תלמידים: 100</p>
                          <div className="pr-2 sm:pr-4 space-y-1 text-[11px] sm:text-xs">
                            <div>🏛️ <strong>אולם:</strong> אולמי ברושים - 15,000₪</div>
                            <div>🍕 <strong>קייטרינג:</strong> פיצה בר - 20,000₪</div>
                            <div>🎵 <strong>DJ:</strong> DJ מוטי - 8,000₪</div>
                            <div>📷 <strong>צילום:</strong> צלם אלי - 5,000₪</div>
                          </div>
                          <div className="border-t pt-2 mt-2 font-bold text-xs sm:text-sm">
                            <div className="text-purple-900">סה"כ: 48,000₪</div>
                            <div className="text-green-700">לתלמיד: 480₪</div>
                            <div className="text-green-700">96% מתקציב - נשארו 2,000₪ ✓</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 p-2 sm:p-3 rounded-lg border border-red-200 mt-3">
                        <p className="font-bold text-red-800 text-xs sm:text-sm">⚠️ אזהרה אוטומטית:</p>
                        <p className="text-xs">אם אתם חורגים מהתקציב, המערכת תציג אזהרה באדום ותראה לכם בכמה חרגתם</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Category Cards */}
                <section className="border-r-4 border-orange-400 pr-2 sm:pr-4">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-orange-900 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">🏷️</span> כרטיסי קטגוריה - סינון והשוואה מהירה
                  </h3>
                  <div className="bg-orange-50 p-3 sm:p-4 rounded-lg space-y-3 text-sm sm:text-base">
                    <p className="text-xs sm:text-sm">בחלק העליון של העמוד יש כרטיסים צבעוניים - אחד לכל קטגוריה שיש לה הצעות.</p>

                    <div className="bg-white p-2 sm:p-3 rounded-lg space-y-2">
                      <p className="font-bold text-orange-900 text-xs sm:text-sm">מה רואים על כל כרטיס?</p>
                      <ul className="pr-4 sm:pr-6 space-y-1 text-xs">
                        <li>🔢 <strong>מספר הצעות:</strong> כמה ספקים יש בקטגוריה הזו</li>
                        <li>📊 <strong>טווח מחירים:</strong> המחיר הכי נמוך עד הכי גבוה</li>
                        <li>💵 <strong>מחיר ממוצע:</strong> ממוצע של כל ההצעות</li>
                        <li>🏆 <strong>תגיות זוכות:</strong> סימונים של "הכי זול" ו"מדורג גבוה"</li>
                      </ul>
                    </div>

                    <div className="bg-white p-2 sm:p-3 rounded-lg">
                      <p className="font-bold text-orange-900 mb-2 text-xs sm:text-sm">איך משתמשים בכרטיסים?</p>
                      <p className="text-xs"><strong>לחצו על כרטיס</strong> כדי לסנן את הטבלה ולראות רק הצעות מהקטגוריה הזו.</p>
                      <p className="text-[10px] sm:text-xs mt-2 text-gray-600">למשל: לחצו על כרטיס "DJ/מוזיקה" כדי להשוות רק את ה-DJs ביניהם</p>
                      <p className="text-[10px] sm:text-xs text-gray-600">לחצו שוב או על "הכל" כדי לבטל את הסינון</p>
                    </div>
                  </div>
                </section>

                {/* Selecting Winner & Finalists */}
                <section className="border-r-4 border-green-400 pr-2 sm:pr-4">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-green-900 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">✅</span> בחירת זוכה והצבעת הורים
                  </h3>
                  <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                    <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                      <p className="font-bold mb-3 text-green-900 text-sm sm:text-base">🎯 שני מצבים שונים:</p>

                      <div className="space-y-3">
                        <div className="bg-white p-2 sm:p-3 rounded-lg border-2 border-purple-300">
                          <p className="font-bold text-purple-900 text-xs sm:text-sm">1️⃣ הוספה לסופיים (להצבעת הורים):</p>
                          <ul className="pr-4 sm:pr-6 mt-2 space-y-1 text-xs">
                            <li>• לחצו על שורה להרחבה</li>
                            <li>• לחצו "הוסף לסופיים"</li>
                            <li>• ההצעה תקבל תג <strong>"סופי"</strong> בצבע סגול</li>
                            <li>• עשו את זה עבור 2-3 אפשרויות טובות בכל קטגוריה</li>
                          </ul>
                          <p className="text-[10px] sm:text-xs mt-2 text-purple-700 font-semibold">
                            💡 טיפ: הסופיים יופיעו בהצבעה להורים - תנו להם לבחור!
                          </p>
                        </div>

                        <div className="bg-white p-2 sm:p-3 rounded-lg border-2 border-green-300">
                          <p className="font-bold text-green-900 text-xs sm:text-sm">2️⃣ בחירת זוכה סופית:</p>
                          <ul className="pr-4 sm:pr-6 mt-2 space-y-1 text-xs">
                            <li>• לחצו על שורה להרחבה</li>
                            <li>• לחצו "בחר כזוכה" (כפתור ירוק)</li>
                            <li>• ההצעה תקבל תג <strong>"נבחר"</strong> בצבע ירוק</li>
                            <li>• <strong>רק הצעה אחת</strong> יכולה להיות "נבחר" בכל רגע</li>
                          </ul>
                          <p className="text-[10px] sm:text-xs mt-2 text-green-700 font-semibold">
                            ⚠️ כשאתם בוחרים זוכה חדש, הזוכה הקודם מבוטל אוטומטית
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Export & Share */}
                <section className="border-r-4 border-indigo-400 pr-2 sm:pr-4">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-indigo-900 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">📤</span> ייצוא ושיתוף
                  </h3>
                  <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg space-y-3 text-sm sm:text-base">
                    <p className="font-bold text-indigo-900 text-xs sm:text-sm">לחצו על "ייצוא CSV" כדי להוריד קובץ Excel</p>
                    <div className="bg-white p-2 sm:p-3 rounded-lg space-y-2">
                      <p className="text-xs sm:text-sm"><strong>מה כלול בקובץ?</strong></p>
                      <ul className="pr-4 sm:pr-6 text-xs">
                        <li>• כל ההצעות עם כל הפרטים</li>
                        <li>• אפשר לפתוח ב-Excel או Google Sheets</li>
                        <li>• מושלם לשיתוף ב-WhatsApp או מייל</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Common Scenarios */}
                <section className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 sm:p-4 md:p-6 rounded-xl border-2 border-yellow-300">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-yellow-900 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">💼</span> תרחישים נפוצים - איך עושים את זה בפועל?
                  </h3>
                  <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                    <div className="bg-white p-3 sm:p-4 rounded-lg">
                      <p className="font-bold text-yellow-900 text-xs sm:text-sm">📞 קיבלתי הצעת מחיר בטלפון מספק DJ:</p>
                      <ol className="pr-4 sm:pr-6 mt-2 space-y-1 text-xs">
                        <li>1. לחצו "+ הוסף הצעה"</li>
                        <li>2. שם ספק: "DJ מוטי כהן"</li>
                        <li>3. קטגוריה: בחרו "DJ/מוזיקה"</li>
                        <li>4. מחיר: 8000</li>
                        <li>5. טלפון: מספר שדיברתם איתו</li>
                        <li>6. שירותים: "מערכת שמע מקצועית, תאורה, 5 שעות נגינה"</li>
                        <li>7. יתרונות: "ניסיון 10 שנים, המלצות מעולות"</li>
                        <li>8. דירוג: 4 (לפי הרושם שלכם)</li>
                      </ol>
                    </div>

                    <div className="bg-white p-3 sm:p-4 rounded-lg">
                      <p className="font-bold text-yellow-900 text-xs sm:text-sm">🤔 רוצה להשוות רק אולמות:</p>
                      <p className="pr-4 sm:pr-6 mt-2 text-xs">לחצו על הכרטיס הקטן של "אולם/מקום" 🏛️ בחלק העליון - הטבלה תציג רק אולמות!</p>
                    </div>

                    <div className="bg-white p-3 sm:p-4 rounded-lg">
                      <p className="font-bold text-yellow-900 text-xs sm:text-sm">💰 רוצה לבדוק אם אני בתקציב:</p>
                      <ol className="pr-4 sm:pr-6 mt-2 space-y-1 text-xs">
                        <li>1. לחצו "בונה חבילה"</li>
                        <li>2. לחצו על 📦 ליד ההצעות שאתם חושבים לקחת</li>
                        <li>3. תראו מיד אם אתם בתקציב (ירוק ✓) או חרגתם (אדום ⚠️)</li>
                      </ol>
                    </div>

                    <div className="bg-white p-3 sm:p-4 rounded-lg">
                      <p className="font-bold text-yellow-900 text-xs sm:text-sm">👨‍👩‍👧‍👦 רוצה להכין הצבעה להורים:</p>
                      <ol className="pr-4 sm:pr-6 mt-2 space-y-1 text-xs">
                        <li>1. בחרו 2-3 אפשרויות טובות בכל קטגוריה</li>
                        <li>2. לחצו על כל שורה ובחרו "הוסף לסופיים"</li>
                        <li>3. ההצעות הסופיות יופיעו בהצבעה להורים</li>
                        <li>4. אחרי ההצבעה - בחרו את הזוכה עם "בחר כזוכה"</li>
                      </ol>
                    </div>
                  </div>
                </section>

                {/* Tips & Tricks */}
                <section className="bg-gradient-to-r from-green-50 to-teal-50 p-3 sm:p-4 md:p-6 rounded-xl border-2 border-green-300">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-green-900 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">💡</span> טיפים מתקדמים וחכמים
                  </h3>
                  <div className="space-y-2 text-sm sm:text-base">
                    <div className="bg-white p-2 sm:p-3 rounded-lg flex items-start gap-2 sm:gap-3">
                      <span className="text-lg sm:text-xl flex-shrink-0">✨</span>
                      <div className="text-xs sm:text-sm">
                        <strong>הוסיפו כמה שיותר הצעות:</strong> ככל שיש יותר אפשרויות, ההשוואה מדויקת יותר והתגיות החכמות עובדות טוב יותר
                      </div>
                    </div>
                    <div className="bg-white p-2 sm:p-3 rounded-lg flex items-start gap-2 sm:gap-3">
                      <span className="text-lg sm:text-xl flex-shrink-0">📝</span>
                      <div className="text-xs sm:text-sm">
                        <strong>תעדו הכל:</strong> אפילו אם זה נראה לא חשוב עכשיו - בעוד שבועיים לא תזכרו מה הספק הזה הציע
                      </div>
                    </div>
                    <div className="bg-white p-2 sm:p-3 rounded-lg flex items-start gap-2 sm:gap-3">
                      <span className="text-lg sm:text-xl flex-shrink-0">⭐</span>
                      <div className="text-xs sm:text-sm">
                        <strong>דרגו מיד:</strong> תנו דירוג ישר אחרי השיחה עם הספק, לפי הרושם הראשוני שלכם
                      </div>
                    </div>
                    <div className="bg-white p-2 sm:p-3 rounded-lg flex items-start gap-2 sm:gap-3">
                      <span className="text-lg sm:text-xl flex-shrink-0">🎯</span>
                      <div className="text-xs sm:text-sm">
                        <strong>השתמשו בבונה חבילה:</strong> נסו שילובים שונים ותראו איך המחיר משתנה - לפעמים חיסכון באולם מאפשר DJ יותר טוב!
                      </div>
                    </div>
                    <div className="bg-white p-2 sm:p-3 rounded-lg flex items-start gap-2 sm:gap-3">
                      <span className="text-lg sm:text-xl flex-shrink-0">💬</span>
                      <div className="text-xs sm:text-sm">
                        <strong>שתפו עם ההורים:</strong> ייצאו ל-CSV ושלחו בקבוצת WhatsApp - כולם יהיו מעודכנים
                      </div>
                    </div>
                    <div className="bg-white p-2 sm:p-3 rounded-lg flex items-start gap-2 sm:gap-3">
                      <span className="text-lg sm:text-xl flex-shrink-0">🔄</span>
                      <div className="text-xs sm:text-sm">
                        <strong>עדכנו במהלך הדרך:</strong> קיבלתם הנחה מספק? עדכנו את המחיר! המערכת תחשב מחדש את כל התגיות
                      </div>
                    </div>
                  </div>
                </section>

                {/* FAQ */}
                <section className="bg-gray-50 p-3 sm:p-4 md:p-6 rounded-xl border border-gray-300">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">❓</span> שאלות נפוצות
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                    <details className="bg-white p-2 sm:p-3 rounded-lg">
                      <summary className="font-bold cursor-pointer text-gray-900 text-xs sm:text-sm">האם אני חייב למלא את כל השדות?</summary>
                      <p className="mt-2 pr-3 sm:pr-4 text-xs">לא. רק שם ספק, קטגוריה ומחיר הם חובה. אבל ככל שתמלאו יותר פרטים, ההשוואה תהיה טובה יותר!</p>
                    </details>
                    <details className="bg-white p-2 sm:p-3 rounded-lg">
                      <summary className="font-bold cursor-pointer text-gray-900 text-xs sm:text-sm">איך אני מוחק הצעה?</summary>
                      <p className="mt-2 pr-3 sm:pr-4 text-xs">לחצו על האייקון של פח האשפה 🗑️ בשורה של ההצעה. תתבקשו לאשר את המחיקה.</p>
                    </details>
                    <details className="bg-white p-2 sm:p-3 rounded-lg">
                      <summary className="font-bold cursor-pointer text-gray-900 text-xs sm:text-sm">אפשר לערוך הצעה קיימת?</summary>
                      <p className="mt-2 pr-3 sm:pr-4 text-xs">כן! לחצו על האייקון של העיפרון ✏️ בשורה, תוכלו לשנות כל פרט.</p>
                    </details>
                    <details className="bg-white p-2 sm:p-3 rounded-lg">
                      <summary className="font-bold cursor-pointer text-gray-900 text-xs sm:text-sm">מה זה "תווית להצבעה"?</summary>
                      <p className="mt-2 pr-3 sm:pr-4 text-xs">זה שם קצר שיופיע בהצבעה להורים. למשל: "אפשרות א'" או "DJ - מוטי". זה עוזר להורים להבין על מה הם מצביעים.</p>
                    </details>
                    <details className="bg-white p-2 sm:p-3 rounded-lg">
                      <summary className="font-bold cursor-pointer text-gray-900 text-xs sm:text-sm">איך מחשבים "תמורה לכסף"?</summary>
                      <p className="mt-2 pr-3 sm:pr-4 text-xs">המערכת מחשבת דירוג ÷ מחיר. ככל שהמספר גבוה יותר - היחס טוב יותר. זה עוזר למצוא ספקים איכותיים במחיר הוגן.</p>
                    </details>
                    <details className="bg-white p-2 sm:p-3 rounded-lg">
                      <summary className="font-bold cursor-pointer text-gray-900 text-xs sm:text-sm">הנתונים נשמרים?</summary>
                      <p className="mt-2 pr-3 sm:pr-4 text-xs">כן! כל מה שאתם מזינים נשמר אוטומטית. אפשר לצאת ולחזור - הכל יישאר.</p>
                    </details>
                  </div>
                </section>

                {/* Help */}
                <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 rounded-xl border-2 border-blue-300">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 text-blue-900 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">🆘</span> זקוקים לעזרה נוספת?
                  </h3>
                  <div className="space-y-3 text-sm sm:text-base">
                    <div className="bg-white p-3 sm:p-4 rounded-lg">
                      <p className="mb-2 text-xs sm:text-sm">אם משהו לא ברור או שיש בעיה טכנית:</p>
                      <ul className="pr-4 sm:pr-6 space-y-1 text-xs">
                        <li>📧 פנו למנהל המערכת</li>
                        <li>📖 בדקו את המדריך המלא בתיעוד</li>
                        <li>💬 שאלו בקבוצת WhatsApp של ההורים</li>
                      </ul>
                    </div>
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                      <p className="font-bold text-blue-900 text-xs sm:text-sm">💪 בהצלחה עם תכנון המסיבה!</p>
                      <p className="text-xs mt-1">המערכת כאן כדי לעזור לכם לארגן את המסיבה המושלמת במחיר הטוב ביותר</p>
                    </div>
                  </div>
                </section>
              </div>

              <DialogFooter className="mt-4 sm:mt-6">
                <Button onClick={() => setIsHelpOpen(false)} className="w-full sm:w-auto text-sm sm:text-base">
                  הבנתי, בואו נתחיל! 🚀
                </Button>
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

      {/* Quick Stats Row - Bento Grid with Glassmorphism */}
      <div className="grid gap-6 grid-cols-2 md:grid-cols-4 auto-rows-[120px]">
        <Card className="backdrop-blur-md bg-gradient-to-br from-pink-50/80 to-purple-50/80 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-800 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl col-span-2 md:col-span-1 row-span-2">
          <CardContent className="pt-8 h-full flex flex-col justify-center">
            <div className="text-base font-semibold text-pink-900 dark:text-pink-100 mb-2">סה"כ הצעות</div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 blur-2xl opacity-20 animate-pulse" />
              <div className="relative text-5xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent dark:from-pink-400 dark:to-purple-400">
                {quotes.length}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-md bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">מחיר ממוצע</div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">₪{avgPrice.toLocaleString('he-IL')}</div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-md bg-gradient-to-br from-purple-50/80 to-indigo-50/80 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">סופיים להצבעה</div>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{quotes.filter(q => q.is_finalist).length}</div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-md bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl col-span-2 md:col-span-1">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">תלמידים</div>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">{promEvent?.student_count || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tools - Mobile: Dropdown, Desktop: Buttons */}
      <div>
        {/* Mobile: Single Dropdown Menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                <MoreVertical className="h-4 w-4 ml-2" />
                כלים מתקדמים
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setShowPackageBuilder(!showPackageBuilder)}>
                <Package className="h-4 w-4 ml-2" />
                בונה חבילה
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSupplierBuilder(!showSupplierBuilder)}>
                <FileSpreadsheet className="h-4 w-4 ml-2" />
                בונה ספקים
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowCategorySummary(!showCategorySummary)}>
                <FileText className="h-4 w-4 ml-2" />
                סיכום קטגוריות
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop: Three Separate Buttons */}
        <div className="hidden md:flex gap-3 flex-wrap">
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
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowCategorySummary(!showCategorySummary)}
          >
            <FileText className="h-4 w-4" />
            סיכום קטגוריות
            <ChevronDown className={cn("h-4 w-4 transition-transform", showCategorySummary && "rotate-180")} />
          </Button>
        </div>
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

      {/* Category Summary Cards - Minimized at Start */}
      {showCategorySummary && categoryStats.length > 0 && (
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
      )}

      {/* Category Filter - Mobile Optimized */}
      <div className="space-y-3">
        {/* Mobile: Dropdown Select */}
        <div className="md:hidden">
          <Label htmlFor="category-select" className="text-sm font-medium mb-2 block">
            סנן לפי קטגוריה
          </Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger id="category-select" className="w-full">
              <SelectValue>
                {selectedCategory === 'all'
                  ? 'הכל'
                  : `${categoryLabels[selectedCategory]?.emoji} ${categoryLabels[selectedCategory]?.label}`
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל ({quotes.length} הצעות)</SelectItem>
              {Object.entries(categoryLabels)
                .sort(([, a], [, b]) => a.label.localeCompare(b.label, 'he'))
                .map(([key, { label, emoji }]) => {
                  const count = quotes.filter(q => q.category === key).length
                  return count > 0 ? (
                    <SelectItem key={key} value={key}>
                      {emoji} {label} ({count})
                    </SelectItem>
                  ) : null
                })}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Pills */}
        <div className="hidden md:flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            הכל
          </Button>
          {Object.entries(categoryLabels)
            .sort(([, a], [, b]) => a.label.localeCompare(b.label, 'he'))
            .map(([key, { label, emoji }]) => {
              const count = quotes.filter(q => q.category === key).length
              return count > 0 ? (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                >
                  {emoji} {label}
                </Button>
              ) : null
            })}
        </div>
      </div>

      {/* Quotes Display */}
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
        <>
          {/* Mobile: Detailed Cards Section */}
          <div className="md:hidden space-y-4">
            {filteredQuotes.map((quote, index) => {
              const isFirstInCategory = index === 0 || filteredQuotes[index - 1].category !== quote.category
              const isExpanded = expandedRows.has(quote.id)

              return (
                <React.Fragment key={quote.id}>
                  {/* Category Header */}
                  {isFirstInCategory && (
                    <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 rounded-xl font-bold text-base flex items-center gap-3 shadow-sm border border-gray-200 mt-2">
                      <span className="text-3xl">{categoryLabels[quote.category]?.emoji}</span>
                      <span className="flex-1">{categoryLabels[quote.category]?.label}</span>
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        {filteredQuotes.filter(q => q.category === quote.category).length}
                      </Badge>
                    </div>
                  )}

                  {/* Quote Card */}
                  <Card
                    ref={(el) => { cardRefs.current[quote.id] = el }}
                    className={cn(
                      "transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02] dark:bg-gray-800 dark:border-gray-700",
                      quote.is_selected && "ring-2 ring-green-500 bg-green-50/50 dark:bg-green-900/20",
                      quote.is_finalist && !quote.is_selected && "ring-2 ring-purple-500 bg-purple-50/50 dark:bg-purple-900/20"
                    )}
                  >
                    <CardContent className="p-6 md:p-8">
                      {/* Card Header - Always Visible */}
                      <div className="space-y-6">
                        {/* Vendor Name + Emoji */}
                        <div className="flex items-start gap-4">
                          <span className="text-5xl md:text-6xl shrink-0">{categoryLabels[quote.category]?.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-2xl md:text-3xl leading-tight mb-3 break-words dark:text-white">{quote.vendor_name}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              {quote.is_selected && (
                                <Badge className="bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20 rounded-full px-4 py-1.5 text-sm font-semibold">
                                  <CheckCircle2 className="h-4 w-4 ml-1 inline" />
                                  נבחר
                                </Badge>
                              )}
                              {quote.is_finalist && !quote.is_selected && (
                                <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 rounded-full px-4 py-1.5 text-sm font-semibold">
                                  <Star className="h-4 w-4 ml-1 inline" />
                                  סופי
                                </Badge>
                              )}
                              <Badge className={cn(availabilityLabels[quote.availability_status]?.color, "text-xs")}>
                                {availabilityLabels[quote.availability_status]?.label}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Price Section - Prominent with Glassmorphism */}
                        <div className="backdrop-blur-sm bg-gradient-to-br from-pink-50/90 via-purple-50/90 to-blue-50/90 dark:from-pink-900/30 dark:to-blue-900/30 rounded-2xl p-6 border-2 border-pink-200 dark:border-pink-700 shadow-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-base font-semibold text-gray-700 dark:text-gray-200">מחיר כולל</span>
                            <div className="text-right">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 blur-2xl opacity-20 animate-pulse" />
                                <div className="relative text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent dark:from-pink-400 dark:to-purple-400">
                                  ₪{quote.price_total.toLocaleString('he-IL')}
                                </div>
                              </div>
                              {quote.price_per_student && (
                                <div className="text-base text-gray-600 dark:text-gray-400 mt-2 font-medium">
                                  ₪{quote.price_per_student.toLocaleString('he-IL')} לתלמיד
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Share Section - NEW */}
                        <div className="backdrop-blur-sm bg-gradient-to-r from-blue-50/90 to-purple-50/90 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">שתף עם הורים</div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleNativeShare(quote)
                                }}
                                className="transition-all active:scale-95 hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2"
                              >
                                <Share2 className="h-3 w-3 ml-1" />
                                שתף
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyLink(`${window.location.origin}/${params.locale}/prom/${promId}/quotes#${quote.id}`)
                                }}
                                className="transition-all active:scale-95 hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2"
                              >
                                <Copy className="h-3 w-3 ml-1" />
                                העתק
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Rating + Smart Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {quote.rating && (
                            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold">{quote.rating}/5</span>
                            </div>
                          )}
                          {/* Smart Badges */}
                          {getQuoteBadges(quote).map((badge) => (
                            <Badge key={badge.type} variant="outline" className={cn(badge.color, "text-xs")}>
                              {badge.label}
                            </Badge>
                          ))}
                        </div>

                        {/* Expand/Collapse Button */}
                        <Button
                          variant={isExpanded ? "secondary" : "outline"}
                          size="lg"
                          className="w-full h-12 text-base font-medium"
                          onClick={() => toggleRowExpand(quote.id)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-5 w-5 ml-2" />
                              הסתר פרטים
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-5 w-5 ml-2" />
                              הצג פרטים מלאים
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-5 pt-5 border-t-2 space-y-4">
                          {/* Contact Info */}
                          {(quote.vendor_contact_name || quote.vendor_phone || quote.vendor_email) && (
                            <div className="bg-blue-50 rounded-lg p-3 space-y-2 border border-blue-200">
                              <div className="text-sm font-semibold text-blue-900 mb-2">פרטי התקשרות</div>
                              {quote.vendor_contact_name && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span>👤</span>
                                  <span>{quote.vendor_contact_name}</span>
                                </div>
                              )}
                              {quote.vendor_phone && (
                                <a href={`tel:${quote.vendor_phone}`} className="flex items-center gap-2 text-blue-600 font-medium text-base">
                                  <Phone className="h-4 w-4" />
                                  {quote.vendor_phone}
                                </a>
                              )}
                              {quote.vendor_email && (
                                <a href={`mailto:${quote.vendor_email}`} className="flex items-center gap-2 text-blue-600 text-sm break-all">
                                  <Mail className="h-4 w-4 shrink-0" />
                                  {quote.vendor_email}
                                </a>
                              )}
                            </div>
                          )}

                          {/* Services */}
                          {quote.services_included?.length > 0 && (
                            <div>
                              <div className="text-sm font-semibold mb-2">✨ שירותים כלולים</div>
                              <div className="flex flex-wrap gap-2">
                                {quote.services_included.map((service, i) => (
                                  <Badge key={i} variant="secondary" className="text-sm px-3 py-1">{service}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Pros & Cons */}
                          {(quote.pros || quote.cons) && (
                            <div className="space-y-3">
                              {quote.pros && (
                                <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                                  <div className="text-sm font-semibold text-green-900 mb-2">✓ יתרונות</div>
                                  <div className="text-sm text-green-800 whitespace-pre-wrap">{quote.pros}</div>
                                </div>
                              )}
                              {quote.cons && (
                                <div className="p-3 bg-red-50 rounded-lg border-2 border-red-200">
                                  <div className="text-sm font-semibold text-red-900 mb-2">✗ חסרונות</div>
                                  <div className="text-sm text-red-800 whitespace-pre-wrap">{quote.cons}</div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="space-y-2 pt-3">
                            <Button
                              variant={selectedForPackage[quote.category] === quote.id ? "default" : "outline"}
                              size="lg"
                              className="w-full h-12 text-base font-medium"
                              onClick={(e) => {
                                e.stopPropagation()
                                togglePackageSelection(quote)
                              }}
                            >
                              <Package className="h-4 w-4 ml-2" />
                              {selectedForPackage[quote.category] === quote.id ? 'הסר מחבילה' : 'הוסף לחבילה'}
                            </Button>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="lg"
                                className="h-11"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingQuote(quote)
                                }}
                              >
                                <Edit2 className="h-4 w-4 ml-2" />
                                ערוך
                              </Button>
                              <Button
                                variant="outline"
                                size="lg"
                                className="h-11 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(quote.id)
                                }}
                              >
                                <Trash2 className="h-4 w-4 ml-2" />
                                מחק
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </React.Fragment>
              )
            })}
          </div>

          {/* Comparison Table Section */}
          <Card>
            <CardHeader>
              <CardTitle>טבלת השוואה</CardTitle>
              <CardDescription>
                השוואה מהירה בין כל ההצעות • {filteredQuotes.length} הצעות
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mobile: Comparison Cards */}
              <div className="md:hidden space-y-4">
                {filteredQuotes.map((quote, index) => {
                  const isFirstInCategory = index === 0 || filteredQuotes[index - 1].category !== quote.category
                  const { label: categoryLabel, emoji } = categoryLabels[quote.category] || { label: quote.category, emoji: '📋' }
                  const availabilityInfo = availabilityLabels[quote.availability_status] || availabilityLabels.pending

                  return (
                    <React.Fragment key={quote.id}>
                      {/* Category Header */}
                      {isFirstInCategory && (
                        <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 rounded-xl font-bold text-base flex items-center gap-3 shadow-sm border border-gray-200 mt-2">
                          <span className="text-3xl">{emoji}</span>
                          <span className="flex-1">{categoryLabel}</span>
                          <Badge variant="secondary" className="text-sm px-3 py-1">
                            {filteredQuotes.filter(q => q.category === quote.category).length}
                          </Badge>
                        </div>
                      )}

                      {/* Comparison Card */}
                      <div
                        className={cn(
                          "border-2 rounded-lg p-4 space-y-3",
                          quote.is_selected && "border-green-400 bg-green-50/30",
                          quote.is_finalist && !quote.is_selected && "border-purple-300 bg-purple-50/30",
                          !quote.is_selected && !quote.is_finalist && "border-gray-200"
                        )}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-2xl shrink-0">{emoji}</span>
                            <div className="min-w-0">
                              <h4 className="font-bold text-lg break-words">{quote.vendor_name}</h4>
                              <p className="text-sm text-muted-foreground">{categoryLabel}</p>
                            </div>
                          </div>
                          {quote.is_selected ? (
                            <Badge className="bg-green-500 text-white text-xs shrink-0">נבחר</Badge>
                          ) : quote.is_finalist ? (
                            <Badge className="bg-purple-500 text-white text-xs shrink-0">פיינליסט</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs shrink-0">בבדיקה</Badge>
                          )}
                        </div>

                        {/* Price */}
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 border border-pink-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">מחיר כולל</span>
                            <span className="text-2xl font-bold text-pink-600">
                              ₪{quote.price_total.toLocaleString('he-IL')}
                            </span>
                          </div>
                          {quote.price_per_student && (
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-pink-200">
                              <span className="text-sm text-muted-foreground">מחיר לתלמיד</span>
                              <span className="text-lg font-semibold text-purple-600">
                                ₪{quote.price_per_student.toLocaleString('he-IL')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-muted-foreground block mb-1">זמינות</span>
                            <Badge className={cn(availabilityInfo.color, "text-xs")}>
                              {availabilityInfo.label}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block mb-1">דירוג</span>
                            {quote.rating ? (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{quote.rating}/5</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">לא דורג</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  )
                })}
              </div>

              {/* Desktop: Table View */}
              <div className="hidden md:block overflow-x-auto">
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
                {filteredQuotes.map((quote, index) => {
                  // Check if this is the first quote in a new category
                  const isFirstInCategory = index === 0 || filteredQuotes[index - 1].category !== quote.category
                  const categoryIndex = filteredQuotes.slice(0, index).filter((q, i) =>
                    i === 0 || filteredQuotes[i - 1].category !== q.category
                  ).length

                  // Alternating colors for different categories
                  const categoryColors = [
                    'bg-blue-50/30',
                    'bg-amber-50/30',
                    'bg-green-50/30',
                    'bg-purple-50/30',
                    'bg-pink-50/30',
                    'bg-cyan-50/30',
                    'bg-orange-50/30',
                    'bg-teal-50/30',
                  ]
                  const baseCategoryBg = categoryColors[categoryIndex % categoryColors.length]

                  return (
                    <React.Fragment key={quote.id}>
                      {/* Category Header Row */}
                      {isFirstInCategory && (
                        <TableRow className="bg-gray-100 border-t-2 border-gray-300">
                          <TableCell colSpan={9} className="font-bold text-sm py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{categoryLabels[quote.category]?.emoji}</span>
                              <span>{categoryLabels[quote.category]?.label}</span>
                              <Badge variant="secondary" className="text-xs mr-2">
                                {filteredQuotes.filter(q => q.category === quote.category).length} הצעות
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Quote Row */}
                      <TableRow
                        className={cn(
                          "cursor-pointer transition-colors",
                          baseCategoryBg,
                          quote.is_selected && "bg-green-100 hover:bg-green-200",
                          quote.is_finalist && !quote.is_selected && "bg-purple-100 hover:bg-purple-200",
                          selectedForPackage[quote.category] === quote.id && !quote.is_selected && !quote.is_finalist && "bg-indigo-100 hover:bg-indigo-200",
                          !quote.is_selected && !quote.is_finalist && selectedForPackage[quote.category] !== quote.id && `hover:${baseCategoryBg.replace('/30', '/50')}`
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
                  </React.Fragment>
                  )
                })}
              </TableBody>
            </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl dark:text-white">שתף QR Code</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              סרוק את הקוד כדי לפתוח את דף הצעות המחיר
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-6 bg-white dark:bg-gray-900 rounded-lg">
            {qrCodeUrl && <QRCode value={qrCodeUrl} size={256} />}
          </div>
          <div className="text-center text-sm text-muted-foreground break-all dark:text-gray-400 px-4">
            {qrCodeUrl}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleCopyLink(qrCodeUrl)}
              className="w-full transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <Copy className="h-4 w-4 ml-2" />
              העתק קישור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sticky FAB - Mobile Only */}
      <Button
        onClick={() => setIsAddDialogOpen(true)}
        className="md:hidden fixed bottom-8 left-8 h-16 w-16 rounded-full shadow-2xl
                   bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700
                   z-50 transition-all duration-300 hover:scale-110 active:scale-95
                   dark:from-pink-600 dark:to-purple-700 focus-visible:ring-4 focus-visible:ring-pink-300"
        size="icon"
        title="הוסף הצעת מחיר"
      >
        <Plus className="h-8 w-8 text-white" />
      </Button>
    </div>
  )
}
