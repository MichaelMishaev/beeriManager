'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Moon, Sun, QrCode, Share2, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileHeaderProps {
  promId: string
  quotesCount: number
  promTitle?: string
  isDarkMode?: boolean
  onToggleDarkMode?: () => void
  onShowQR?: () => void
  onShare?: () => void
  onShowHelp?: () => void
}

export function MobileHeader({
  promId,
  quotesCount,
  promTitle,
  isDarkMode = false,
  onToggleDarkMode,
  onShowQR,
  onShare,
  onShowHelp
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 bg-white z-40 border-b">
      <div className="p-4">
        {/* Top row: Back button + Title + Actions */}
        <div className="flex items-center gap-3 mb-3 lg:mb-4">
          <Link
            href={`/he/admin/prom/${promId}`}
            className="
              min-w-[44px] min-h-[44px]
              flex items-center justify-center
              touch-manipulation
              active:scale-95 transition-transform
              focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500
            "
            aria-label="חזור לעמוד הפרום"
          >
            <ArrowRight className="h-6 w-6" />
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl lg:text-3xl font-bold truncate">
              השוואת הצעות מחיר
            </h1>
            <p className="text-base text-gray-600 truncate">
              {quotesCount} הצעות{promTitle && ` • ${promTitle}`}
            </p>
          </div>

          {/* Desktop actions */}
          <div className="hidden lg:flex gap-2">
            {onToggleDarkMode && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleDarkMode}
                className="min-w-[44px] min-h-[44px] transition-all hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label={isDarkMode ? "מצב בהיר" : "מצב כהה"}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}
            {onShowQR && (
              <Button
                variant="outline"
                onClick={onShowQR}
                className="min-h-[44px] transition-all hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <QrCode className="h-4 w-4 ml-2" />
                QR
              </Button>
            )}
            {onShare && (
              <Button
                variant="outline"
                onClick={onShare}
                className="min-h-[44px] transition-all hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <Share2 className="h-4 w-4 ml-2" />
                שתף
              </Button>
            )}
            {onShowHelp && (
              <Button
                variant="outline"
                onClick={onShowHelp}
                className="min-h-[44px] transition-all hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <HelpCircle className="h-4 w-4 ml-2" />
                עזרה
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
