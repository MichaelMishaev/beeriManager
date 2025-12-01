'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, Share2 } from 'lucide-react'
import Link from 'next/link'
import { QuoteCardReadOnly } from '@/components/features/prom/quotes/QuoteCardReadOnly'
import { CategoryFilter } from '@/components/features/prom/quotes/CategoryFilter'

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
  event_name: string
  event_date: string | null
  school_name: string | null
  num_students: number | null
  budget_total: number | null
}

const CATEGORIES: Record<string, { label: string; emoji: string }> = {
  venue: { label: 'אולם', emoji: '🏛️' },
  catering: { label: 'קייטרינג', emoji: '🍽️' },
  dj: { label: 'תקליטן', emoji: '🎵' },
  photographer: { label: 'צלם', emoji: '📸' },
  host: { label: 'מנחה', emoji: '🎤' },
  decoration: { label: 'עיצוב', emoji: '🎨' },
  transportation: { label: 'הסעות', emoji: '🚌' },
  other: { label: 'אחר', emoji: '📋' },
}

const AVAILABILITY_CONFIG = {
  available: { label: 'זמין', color: 'bg-green-100 text-green-800' },
  tentative: { label: 'זמין בתנאי', color: 'bg-yellow-100 text-yellow-800' },
  unavailable: { label: 'לא זמין', color: 'bg-red-100 text-red-800' },
  unknown: { label: 'לא ידוע', color: 'bg-gray-100 text-gray-800' },
}

export default function PublicQuotesPage() {
  const params = useParams()
  const router = useRouter()
  const promId = params.id as string

  const [quotes, setQuotes] = useState<Quote[]>([])
  const [promEvent, setPromEvent] = useState<PromEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch prom event details
      const promRes = await fetch(`/api/prom/${promId}`)
      const promData = await promRes.json()
      if (promData.success) {
        setPromEvent(promData.data)
      }

      // Fetch quotes
      const quotesRes = await fetch(`/api/prom/${promId}/quotes`)
      const quotesData = await quotesRes.json()
      if (quotesData.success) {
        setQuotes(quotesData.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [promId])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Calculate quote counts by category
  const quoteCounts: Record<string, number> = {}
  quotes.forEach(quote => {
    quoteCounts[quote.category] = (quoteCounts[quote.category] || 0) + 1
  })

  // Filter quotes by category
  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory)

  // Calculate smart badges
  const calculateBadges = (quote: Quote) => {
    const categoryQuotes = quotes.filter(q => q.category === quote.category)
    const prices = categoryQuotes.map(q => q.price_total)
    const ratings = categoryQuotes.map(q => q.rating).filter(r => r !== null) as number[]

    const isCheapest = quote.price_total === Math.min(...prices) && prices.length > 1
    const isHighestRated = quote.rating && quote.rating === Math.max(...ratings) && ratings.length > 1
    const isBestValue = quote.rating && quote.rating >= 4 &&
                        quote.price_total <= (prices.reduce((a, b) => a + b, 0) / prices.length)

    return { isCheapest, isHighestRated, isBestValue }
  }

  const getCategoryLabel = (category: string) => {
    return CATEGORIES[category]?.label || category
  }

  const getCategoryEmoji = (category: string) => {
    return CATEGORIES[category]?.emoji || '📋'
  }

  const getAvailabilityConfig = (status: string) => {
    return AVAILABILITY_CONFIG[status as keyof typeof AVAILABILITY_CONFIG] || AVAILABILITY_CONFIG.unknown
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `הצעות מחיר - ${promEvent?.event_name || 'נשף'}`,
          text: 'צפה בהצעות המחיר לנשף',
          url: url
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url)
      alert('הקישור הועתק ללוח')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="bg-white border-b p-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border-2 p-4 h-64"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link
              href="/he"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition-transform touch-manipulation"
              aria-label="חזרה לעמוד הבית"
            >
              <ArrowRight className="h-6 w-6 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {promEvent?.event_name || 'הצעות מחיר'}
              </h1>
              <p className="text-sm text-gray-600">
                {quotes.length} הצעות מחיר
              </p>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-purple-100 text-purple-600 active:scale-95 transition-transform touch-manipulation"
            aria-label="שתף דף זה"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* View-only banner */}
        <div className="bg-blue-50 border-t border-blue-200 px-4 py-2">
          <p className="text-sm text-blue-800 text-center font-medium">
            👁️ מצב צפייה בלבד - ללא אפשרות עריכה
          </p>
        </div>
      </header>

      {/* Category Filter */}
      <CategoryFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        quoteCounts={quoteCounts}
        totalQuotes={quotes.length}
      />

      {/* Main Content */}
      <main className="p-4 space-y-3 pb-8">
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">אין הצעות מחיר בקטגוריה זו</p>
          </div>
        ) : (
          filteredQuotes.map(quote => {
            const badges = calculateBadges(quote)
            const availabilityConfig = getAvailabilityConfig(quote.availability_status)

            return (
              <QuoteCardReadOnly
                key={quote.id}
                quote={quote}
                onTap={() => setSelectedQuoteId(quote.id)}
                isCheapest={badges.isCheapest}
                isHighestRated={badges.isHighestRated}
                isBestValue={badges.isBestValue}
                categoryLabel={getCategoryLabel(quote.category)}
                categoryEmoji={getCategoryEmoji(quote.category)}
                availabilityLabel={availabilityConfig.label}
                availabilityColor={availabilityConfig.color}
              />
            )
          })
        )}
      </main>

      {/* Quote Details Modal */}
      {selectedQuoteId && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end lg:items-center lg:justify-center"
          onClick={() => setSelectedQuoteId(null)}
        >
          <div
            className="bg-white w-full lg:w-[600px] lg:rounded-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl lg:rounded-t-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">פרטי ההצעה</h2>
              <button
                onClick={() => setSelectedQuoteId(null)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100"
                aria-label="סגור"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {(() => {
                const quote = quotes.find(q => q.id === selectedQuoteId)
                if (!quote) return null

                return (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{quote.vendor_name}</h3>
                      <p className="text-gray-600">
                        {getCategoryEmoji(quote.category)} {getCategoryLabel(quote.category)}
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="text-sm text-purple-600 mb-1">מחיר כולל</p>
                      <p className="text-3xl font-bold text-purple-600">
                        ₪{quote.price_total.toLocaleString()}
                      </p>
                      {quote.price_per_student && (
                        <p className="text-sm text-gray-600 mt-1">
                          ₪{quote.price_per_student} לתלמיד
                        </p>
                      )}
                    </div>

                    {quote.vendor_contact_name && (
                      <div>
                        <h4 className="font-bold mb-1">איש קשר</h4>
                        <p className="text-gray-700">{quote.vendor_contact_name}</p>
                      </div>
                    )}

                    {quote.vendor_phone && (
                      <div>
                        <h4 className="font-bold mb-1">טלפון</h4>
                        <a
                          href={`tel:${quote.vendor_phone}`}
                          className="text-blue-600 underline text-lg"
                        >
                          {quote.vendor_phone}
                        </a>
                      </div>
                    )}

                    {quote.vendor_email && (
                      <div>
                        <h4 className="font-bold mb-1">דוא״ל</h4>
                        <a
                          href={`mailto:${quote.vendor_email}`}
                          className="text-blue-600 underline"
                        >
                          {quote.vendor_email}
                        </a>
                      </div>
                    )}

                    {quote.services_included?.length > 0 && (
                      <div>
                        <h4 className="font-bold mb-2">שירותים כלולים</h4>
                        <ul className="space-y-1">
                          {quote.services_included.map((service, i) => (
                            <li key={i} className="text-gray-700">✓ {service}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {quote.pros && (
                      <div>
                        <h4 className="font-bold mb-1 text-green-600">יתרונות</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{quote.pros}</p>
                      </div>
                    )}

                    {quote.cons && (
                      <div>
                        <h4 className="font-bold mb-1 text-red-600">חסרונות</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{quote.cons}</p>
                      </div>
                    )}

                    {quote.price_notes && (
                      <div>
                        <h4 className="font-bold mb-1">הערות מחיר</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{quote.price_notes}</p>
                      </div>
                    )}

                    {quote.availability_notes && (
                      <div>
                        <h4 className="font-bold mb-1">הערות זמינות</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{quote.availability_notes}</p>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
