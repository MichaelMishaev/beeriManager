'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  FileSpreadsheet,
  Star,
  CheckCircle2,
  Package
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  is_selected: boolean
  is_finalist: boolean
  display_label: string | null
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
  available: { label: 'זמין', color: 'bg-green-100 text-green-800' },
  limited: { label: 'זמינות מוגבלת', color: 'bg-yellow-100 text-yellow-800' },
  unavailable: { label: 'לא זמין', color: 'bg-red-100 text-red-800' },
  pending: { label: 'ממתין לאישור', color: 'bg-blue-100 text-blue-800' }
}

export default function PublicPromQuotesPage() {
  const params = useParams()
  const promId = params.id as string

  const [promEvent, setPromEvent] = useState<PromEvent | null>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [promId])

  async function fetchData() {
    setIsLoading(true)
    try {
      // Fetch prom event details
      const promResponse = await fetch(`/api/prom/${promId}?_t=${Date.now()}`, {
        cache: 'no-store'
      })
      const promData = await promResponse.json()

      if (promData.success) {
        setPromEvent(promData.data)
      }

      // Fetch quotes
      const quotesResponse = await fetch(`/api/prom/${promId}/quotes?_t=${Date.now()}`, {
        cache: 'no-store'
      })
      const quotesData = await quotesResponse.json()

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

  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory)

  const categories = Array.from(new Set(quotes.map(q => q.category)))
  const totalQuotes = quotes.length
  const selectedQuotes = quotes.filter(q => q.is_selected).length
  const finalists = quotes.filter(q => q.is_finalist).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-32 bg-white/50 rounded-xl animate-pulse" />
          <div className="h-96 bg-white/50 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!promEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>אירוע לא נמצא</CardTitle>
            <CardDescription>לא נמצא אירוע עם המזהה המבוקש</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 border-pink-200 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <FileSpreadsheet className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl md:text-3xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {promEvent.title}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  השוואת הצעות מחיר - {totalQuotes} הצעות
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-800 text-sm font-medium mb-1">
                  <FileSpreadsheet className="h-4 w-4" />
                  סה"כ הצעות
                </div>
                <div className="text-3xl font-bold text-blue-900">{totalQuotes}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 text-purple-800 text-sm font-medium mb-1">
                  <Star className="h-4 w-4" />
                  פיינליסטים
                </div>
                <div className="text-3xl font-bold text-purple-900">{finalists}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 text-green-800 text-sm font-medium mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  נבחרו
                </div>
                <div className="text-3xl font-bold text-green-900">{selectedQuotes}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-2 text-orange-800 text-sm font-medium mb-1">
                  <Package className="h-4 w-4" />
                  תקציב
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  ₪{promEvent.total_budget.toLocaleString('he-IL')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all",
                selectedCategory === 'all'
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              )}
            >
              הכל ({totalQuotes})
            </button>
            {categories.map(category => {
              const count = quotes.filter(q => q.category === category).length
              const { label, emoji } = categoryLabels[category] || { label: category, emoji: '📋' }
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2",
                    selectedCategory === category
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <span>{emoji}</span>
                  <span>{label} ({count})</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Comparison Table */}
        {filteredQuotes.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>טבלת השוואה</CardTitle>
              <CardDescription>השוואה מהירה בין כל ההצעות</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mobile View: Cards */}
              <div className="md:hidden space-y-4">
                {filteredQuotes.map((quote) => {
                  const { label: categoryLabel, emoji } = categoryLabels[quote.category] || { label: quote.category, emoji: '📋' }
                  const availabilityInfo = availabilityLabels[quote.availability_status] || availabilityLabels.pending

                  return (
                    <div
                      key={quote.id}
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
                  )
                })}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">ספק</TableHead>
                      <TableHead className="text-right">קטגוריה</TableHead>
                      <TableHead className="text-right">מחיר כולל</TableHead>
                      <TableHead className="text-right">מחיר לתלמיד</TableHead>
                      <TableHead className="text-right">זמינות</TableHead>
                      <TableHead className="text-right">דירוג</TableHead>
                      <TableHead className="text-right">סטטוס</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.map((quote) => {
                      const { label: categoryLabel } = categoryLabels[quote.category] || { label: quote.category }
                      const availabilityInfo = availabilityLabels[quote.availability_status] || availabilityLabels.pending

                      return (
                        <TableRow key={quote.id}>
                          <TableCell className="font-medium">{quote.vendor_name}</TableCell>
                          <TableCell>{categoryLabel}</TableCell>
                          <TableCell className="font-semibold">
                            ₪{quote.price_total.toLocaleString('he-IL')}
                          </TableCell>
                          <TableCell>
                            {quote.price_per_student
                              ? `₪${quote.price_per_student.toLocaleString('he-IL')}`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(availabilityInfo.color, "text-xs")}>
                              {availabilityInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {quote.rating ? (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{quote.rating}/5</span>
                              </div>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                          <TableCell>
                            {quote.is_selected ? (
                              <Badge className="bg-green-500 text-white text-xs">נבחר</Badge>
                            ) : quote.is_finalist ? (
                              <Badge className="bg-purple-500 text-white text-xs">פיינליסט</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">בבדיקה</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileSpreadsheet className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">אין הצעות מחיר</h3>
              <p className="text-muted-foreground">טרם הוספו הצעות מחיר</p>
            </CardContent>
          </Card>
        )}

        {/* Footer Notice */}
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
          <CardContent className="py-4">
            <p className="text-center text-sm text-muted-foreground">
              זהו תצוגה ציבורית לקריאה בלבד • לעריכה יש להתחבר למערכת הניהול
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
