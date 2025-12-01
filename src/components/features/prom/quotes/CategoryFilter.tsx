'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  categories: Record<string, { label: string; emoji: string }>
  selectedCategory: string
  onSelectCategory: (category: string) => void
  quoteCounts: Record<string, number>
  totalQuotes: number
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  quoteCounts,
  totalQuotes
}: CategoryFilterProps) {
  return (
    <div className="sticky top-0 bg-white z-30 border-b overflow-x-auto lg:relative lg:border-0">
      <div className="flex gap-2 p-3 min-w-max lg:flex-wrap lg:min-w-0">
        {/* All categories chip */}
        <button
          onClick={() => onSelectCategory('all')}
          className={cn(
            "min-h-[44px] px-4 py-2 rounded-full font-bold text-base whitespace-nowrap transition-all touch-manipulation",
            "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500",
            selectedCategory === 'all'
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
          )}
          aria-label="הצג את כל ההצעות"
        >
          הכל ({totalQuotes})
        </button>

        {/* Individual category chips */}
        {Object.entries(categories).map(([key, { label, emoji }]) => {
          const count = quoteCounts[key] || 0
          if (count === 0) return null

          return (
            <button
              key={key}
              onClick={() => onSelectCategory(key)}
              className={cn(
                "min-h-[44px] px-4 py-2 rounded-full font-bold text-base whitespace-nowrap transition-all touch-manipulation",
                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500",
                selectedCategory === key
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
              )}
              aria-label={`הצג ${label}`}
            >
              {emoji} {label} ({count})
            </button>
          )
        })}
      </div>
    </div>
  )
}
