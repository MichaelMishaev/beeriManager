'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallButtonProps {
  variant?: 'compact' | 'full'
}

export function InstallButton({ variant = 'compact' }: InstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const t = useTranslations('common')

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
      logger.info('PWA install prompt available')
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false)
      logger.info('PWA already installed')
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      logger.warn('Install prompt not available')
      return
    }

    // Show the install prompt
    await deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    logger.userAction('PWA install prompt', { outcome })

    if (outcome === 'accepted') {
      setIsInstallable(false)
    }

    // Clear the deferred prompt
    setDeferredPrompt(null)
  }

  if (!isInstallable) {
    return null
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleInstallClick}
        className={cn(
          'flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
          'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
        )}
        title={t('installApp') || 'התקן אפליקציה'}
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">התקן</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleInstallClick}
      className={cn(
        'flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 w-full',
        'bg-sky-500 text-white hover:bg-sky-600 shadow-md hover:shadow-lg'
      )}
      title={t('installApp') || 'התקן אפליקציה'}
    >
      <Download className="h-5 w-5" />
      <span>{t('installApp') || 'התקן אפליקציה'}</span>
    </button>
  )
}
