'use client'

import { useEffect, useState } from 'react'
import { X, Shirt } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'

/**
 * White Shirt Reminder Banner
 * Shows from Thursday 9:00 AM to Friday 9:00 AM
 * Reminds parents that students must wear white shirts on Fridays
 */
export function WhiteShirtBanner() {
  const t = useTranslations('whiteShirtBanner')
  const params = useParams()
  const locale = (params.locale || 'he') as Locale
  const [isVisible, setIsVisible] = useState(false)
  const [isFriday, setIsFriday] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [showShareSuccess, setShowShareSuccess] = useState(false)

  useEffect(() => {
    checkVisibility()
    // Check every minute for visibility changes
    const interval = setInterval(checkVisibility, 60000)
    return () => clearInterval(interval)
  }, [])

  const checkVisibility = () => {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday, 4 = Thursday, 5 = Friday
    const hour = now.getHours()

    // Check if dismissed in localStorage
    const dismissedUntil = localStorage.getItem('whiteShirtBannerDismissed')
    if (dismissedUntil) {
      const dismissedDate = new Date(dismissedUntil)
      if (now < dismissedDate) {
        setIsVisible(false)
        return
      }
    }

    // Show from Thursday 9:00 AM to Friday 9:00 AM (Israel timezone)
    const shouldShow =
      (dayOfWeek === 4 && hour >= 9) || // Thursday from 9:00 AM
      (dayOfWeek === 5 && hour < 9)     // Friday until 9:00 AM

    setIsVisible(shouldShow && !isDismissed)
    setIsFriday(dayOfWeek === 5)
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)

    // Store dismissal until next occurrence (next Thursday 9:00 AM)
    const now = new Date()
    const nextThursday = new Date(now)
    const daysUntilThursday = (4 - now.getDay() + 7) % 7 || 7
    nextThursday.setDate(now.getDate() + daysUntilThursday)
    nextThursday.setHours(9, 0, 0, 0)

    localStorage.setItem('whiteShirtBannerDismissed', nextThursday.toISOString())
  }

  const handleShare = async () => {
    const shareUrl = `https://beeri.online/${locale}`
    const shareTitle = t('shareTitle')
    const shareTextOnly = t('shareText')
    const shareTextWithUrl = `${shareTextOnly}\n\n${shareUrl}`

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareTextOnly,
          url: shareUrl
        })
        return
      } catch (err) {
        // User cancelled or share failed, fall through to clipboard
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err)
        }
      }
    }

    // Fallback: Copy to clipboard (include URL in text)
    try {
      await navigator.clipboard.writeText(shareTextWithUrl)
      setShowShareSuccess(true)
      setTimeout(() => setShowShareSuccess(false), 3000)
    } catch (err) {
      console.error('Copy to clipboard failed:', err)
      // Final fallback: Create text area and copy
      const textArea = document.createElement('textarea')
      textArea.value = shareTextWithUrl
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setShowShareSuccess(true)
        setTimeout(() => setShowShareSuccess(false), 3000)
      } catch (err2) {
        console.error('execCommand copy failed:', err2)
      }
      document.body.removeChild(textArea)
    }
  }

  if (!isVisible) return null

  return (
    <div className="animate-slide-down">
      <div className="bg-gradient-to-r from-sky-100 via-white to-sky-100 border-2 border-yellow-400 rounded-lg p-4 shadow-md mb-6 relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-900" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-yellow-400" />
        </div>

        <div className="relative">
          <div className="flex items-start gap-3">
            {/* Shirt Icon - Clickable for Share */}
            <button
              onClick={handleShare}
              className="flex-shrink-0 mt-1 group cursor-pointer"
              aria-label={t('share')}
              title={t('share')}
            >
              <div className="bg-white rounded-full p-2 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-200">
                <Shirt className="h-6 w-6 text-blue-900 group-hover:text-blue-700" />
              </div>
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-blue-900 mb-1">
                {isFriday ? t('todayTitle') : t('tomorrowTitle')}
              </h3>
              <p className="text-blue-800 text-sm">
                {t('description')}
              </p>

              {/* Success Toast */}
              {showShareSuccess && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-up flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">{t('shareSuccess')}</span>
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              aria-label={t('dismiss')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
