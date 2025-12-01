'use client'

import React from 'react'
import { Star, Phone } from 'lucide-react'
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

interface QuoteCardReadOnlyProps {
  quote: Quote
  onTap: () => void
  isCheapest?: boolean
  isHighestRated?: boolean
  isBestValue?: boolean
  categoryLabel: string
  categoryEmoji: string
  availabilityLabel: string
  availabilityColor: string
}

export function QuoteCardReadOnly({
  quote,
  onTap,
  isCheapest = false,
  isHighestRated = false,
  isBestValue = false,
  categoryLabel,
  categoryEmoji,
  availabilityLabel,
  availabilityColor
}: QuoteCardReadOnlyProps) {
  return (
    <article
      onClick={onTap}
      className="
        bg-white rounded-2xl border-2 p-4
        active:scale-[0.97] transition-transform
        touch-manipulation
        hover:shadow-md
      "
    >
      {/* Row 1: Vendor + Price (Most Important) */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold leading-tight truncate">
            {quote.vendor_name}
          </h3>
          <p className="text-base text-gray-600 mt-1">
            {categoryEmoji} {categoryLabel}
          </p>
        </div>

        <div className="text-left mr-3 flex-shrink-0">
          <div className="text-2xl font-bold text-purple-600">
            ₪{quote.price_total.toLocaleString()}
          </div>
          {quote.price_per_student && (
            <div className="text-sm text-gray-500">
              ₪{quote.price_per_student} לתלמיד
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Smart Badges (Auto-generated) */}
      {(isCheapest || isHighestRated || isBestValue) && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {isCheapest && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
              🟢 הזול ביותר
            </span>
          )}
          {isHighestRated && (
            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-sm font-bold px-3 py-1 rounded-full">
              ⭐ דירוג גבוה
            </span>
          )}
          {isBestValue && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
              💎 תמורה לכסף
            </span>
          )}
        </div>
      )}

      {/* Row 3: Availability Badge + Rating */}
      <div className="flex items-center gap-2 mb-3">
        <span className={cn(
          "text-sm font-bold px-3 py-1 rounded-full",
          availabilityColor
        )}>
          {availabilityLabel}
        </span>

        {quote.rating && (
          <div className="flex items-center gap-1">
            {Array.from({length: 5}, (_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < (quote.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Row 4: Quick Info (If exists) */}
      {quote.services_included?.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-3 mb-3">
          <p className="text-sm text-gray-700 line-clamp-2">
            {quote.services_included.join(' • ')}
          </p>
        </div>
      )}

      {/* Row 5: Contact Button Only (no edit/delete in read-only mode) */}
      {quote.vendor_phone && (
        <div className="pt-3 border-t">
          <a
            href={`tel:${quote.vendor_phone}`}
            onClick={(e) => e.stopPropagation()}
            className="
              w-full min-h-[44px]
              bg-green-500 text-white font-bold rounded-xl
              flex items-center justify-center gap-2
              active:scale-95 transition-transform
              touch-manipulation
            "
            aria-label={`התקשר ל-${quote.vendor_name}`}
          >
            <Phone className="h-5 w-5" />
            חייג לספק
          </a>
        </div>
      )}

      {/* Tap indicator */}
      <div className="text-center mt-2 text-xs text-gray-400">
        הקש לפרטים מלאים
      </div>
    </article>
  )
}
