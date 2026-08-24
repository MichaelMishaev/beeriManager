'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

// Show from now until end-of-day Sept 2, 2026 (start of school year)
const VISIBLE_UNTIL = new Date('2026-09-02T23:59:59')
const DISMISS_KEY = 'welcomeBackBannerDismissed2026'

export function WelcomeBackBanner() {
  const t = useTranslations('welcomeBackBanner')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const now = new Date()
    const dismissed = localStorage.getItem(DISMISS_KEY) === 'true'
    setIsVisible(now <= VISIBLE_UNTIL && !dismissed)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem(DISMISS_KEY, 'true')
  }

  if (!isVisible) return null

  return (
    <div className="animate-slide-down mb-3">
      <div className="relative rounded-lg overflow-hidden shadow-md">
        <button
          onClick={handleDismiss}
          aria-label={t('dismiss')}
          className="absolute top-2 left-2 z-10 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors p-1.5 rounded-full shadow-sm"
        >
          <X className="h-4 w-4" />
        </button>
        <Image
          src="/images/welcome-grade-a-2026.jpg"
          alt={t('alt')}
          width={1200}
          height={1200}
          className="w-full h-auto"
          priority
        />
      </div>
    </div>
  )
}
