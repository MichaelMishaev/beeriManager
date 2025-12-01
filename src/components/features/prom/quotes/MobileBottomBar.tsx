'use client'

import React from 'react'
import { Plus, MoreVertical, Download, Package } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MobileBottomBarProps {
  onAddQuote: () => void
  onExportCSV?: () => void
  onTogglePackageBuilder?: () => void
  onToggleSupplierBuilder?: () => void
  onShowHelp?: () => void
}

export function MobileBottomBar({
  onAddQuote,
  onExportCSV,
  onTogglePackageBuilder,
  onToggleSupplierBuilder,
  onShowHelp
}: MobileBottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 lg:hidden safe-area-inset-bottom">
      <div className="flex gap-3 p-4">
        <button
          onClick={onAddQuote}
          className="
            flex-1
            min-h-[56px]
            bg-gradient-to-r from-purple-600 to-pink-600
            text-white text-lg font-bold rounded-xl
            active:scale-95 transition-transform
            touch-manipulation
            flex items-center justify-center gap-2
            focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500
          "
          aria-label="הוסף הצעת מחיר חדשה"
        >
          <Plus className="h-6 w-6" />
          הוסף הצעה
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="
                min-w-[56px] min-h-[56px]
                bg-gray-100 rounded-xl
                active:scale-95 transition-transform
                touch-manipulation
                flex items-center justify-center
                focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500
              "
              aria-label="תפריט פעולות נוספות"
            >
              <MoreVertical className="h-6 w-6" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {onExportCSV && (
              <DropdownMenuItem onClick={onExportCSV} className="min-h-[48px] text-base">
                <Download className="ml-2 h-5 w-5" />
                <span>ייצוא ל-CSV</span>
              </DropdownMenuItem>
            )}
            {onTogglePackageBuilder && (
              <DropdownMenuItem onClick={onTogglePackageBuilder} className="min-h-[48px] text-base">
                <Package className="ml-2 h-5 w-5" />
                <span>בונה חבילה</span>
              </DropdownMenuItem>
            )}
            {onToggleSupplierBuilder && (
              <DropdownMenuItem onClick={onToggleSupplierBuilder} className="min-h-[48px] text-base">
                <Package className="ml-2 h-5 w-5" />
                <span>בונה ספקים</span>
              </DropdownMenuItem>
            )}
            {onShowHelp && (
              <DropdownMenuItem onClick={onShowHelp} className="min-h-[48px] text-base">
                <span className="ml-2">❓</span>
                <span>עזרה</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
