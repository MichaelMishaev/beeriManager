'use client'

import { useState, useEffect } from 'react'
import { X, Share, Plus, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'

const translations = {
  he: {
    title: 'התקן את האפליקציה',
    description: 'קבל גישה מהירה מהמסך הראשי',
    step1: 'לחץ על כפתור השיתוף בתחתית המסך',
    step2: 'חפש ובחר "הוסף למסך הבית"',
    step3: 'לחץ על "הוסף" בפינה הימנית העליונה',
    step1Detail: 'לחץ על',
    step2Detail: 'בחר',
    step3Detail: 'השלם את ההתקנה',
    close: 'סגור',
    dontShowAgain: 'אל תציג שוב',
    safariOnly: 'שים לב: יש לפתוח ב-Safari בלבד'
  },
  ru: {
    title: 'Установить приложение',
    description: 'Быстрый доступ с главного экрана',
    step1: 'Нажмите кнопку "Поделиться" внизу экрана',
    step2: 'Найдите и выберите "На экран «Домой»"',
    step3: 'Нажмите "Добавить" в правом верхнем углу',
    step1Detail: 'Нажмите',
    step2Detail: 'Выберите',
    step3Detail: 'Завершите установку',
    close: 'Закрыть',
    dontShowAgain: 'Не показывать снова',
    safariOnly: 'Внимание: откройте только в Safari'
  }
}

export function IOSInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const params = useParams()
  const locale = (params.locale || 'he') as Locale
  const t = translations[locale]

  useEffect(() => {
    // Check if running on iOS
    const isIOSDevice = /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream

    // Check if already installed (standalone mode)
    const isInstalledApp = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true

    // Check if user dismissed the prompt before
    const dismissed = localStorage.getItem('ios-install-prompt-dismissed') === 'true'

    setIsIOS(isIOSDevice)
    setIsStandalone(isInstalledApp)
    setIsDismissed(dismissed)

    // Show prompt after 5 seconds if conditions are met
    if (isIOSDevice && !isInstalledApp && !dismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 5000)
      return () => clearTimeout(timer)
    }

    // Return undefined for other cases (TypeScript requirement)
    return undefined
  }, [])

  const handleClose = () => {
    setShowPrompt(false)
  }

  const handleDismissForever = () => {
    localStorage.setItem('ios-install-prompt-dismissed', 'true')
    setShowPrompt(false)
    setIsDismissed(true)
  }

  // Don't render if not iOS, already installed, or dismissed
  if (!isIOS || isStandalone || isDismissed || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <Card className="shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{t.title}</CardTitle>
                <CardDescription className="text-sm mt-1">
                  {t.description}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Safari Warning */}
          <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-yellow-600 text-xs font-medium">
              {t.safariOnly}
            </div>
          </div>

          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">{t.step1}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{t.step1Detail}</span>
                <div className="flex items-center gap-1 px-2 py-1 bg-white rounded border">
                  <Share className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">{t.step2}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{t.step2Detail}</span>
                <div className="flex items-center gap-1 px-2 py-1 bg-white rounded border">
                  <Plus className="h-3 w-3" />
                  <span className="text-xs">{locale === 'he' ? 'הוסף למסך הבית' : 'На экран «Домой»'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{t.step3}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.step3Detail}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissForever}
              className="flex-1 text-xs"
            >
              {t.dontShowAgain}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="flex-1 text-xs"
            >
              {t.close}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
