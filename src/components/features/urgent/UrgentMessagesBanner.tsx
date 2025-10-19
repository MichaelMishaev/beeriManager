'use client'

import { useState, useEffect } from 'react'
import { X, Share2, Shirt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import type { UrgentMessage } from '@/types'
import type { Locale } from '@/i18n/config'
import { logger } from '@/lib/logger'

export function UrgentMessagesBanner() {
  const [messages, setMessages] = useState<UrgentMessage[]>([])
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const params = useParams()
  const currentLocale = (params.locale as Locale) || 'he'

  useEffect(() => {
    loadMessages()
    loadDismissedIds()
  }, [])

  async function loadMessages() {
    try {
      const response = await fetch('/api/urgent-messages')
      const data = await response.json()
      if (data.success) {
        setMessages(data.data || [])
      }
    } catch (error) {
      logger.error('Failed to load urgent messages', { error })
    }
  }

  function loadDismissedIds() {
    const stored = localStorage.getItem('dismissed-urgent-messages')
    if (stored) {
      try {
        setDismissedIds(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse dismissed IDs', e)
      }
    }
  }

  function dismissMessage(id: string) {
    const newDismissed = [...dismissedIds, id]
    setDismissedIds(newDismissed)
    localStorage.setItem('dismissed-urgent-messages', JSON.stringify(newDismissed))
    logger.userAction('Dismiss urgent message', { messageId: id })
  }

  async function shareMessage(message: UrgentMessage) {
    const title = currentLocale === 'ru' ? message.title_ru : message.title_he
    const description = currentLocale === 'ru' ? message.description_ru : message.description_he

    // Format dates for sharing
    const startDate = new Date(message.start_date).toLocaleDateString(currentLocale === 'ru' ? 'ru-RU' : 'he-IL')
    const endDate = new Date(message.end_date).toLocaleDateString(currentLocale === 'ru' ? 'ru-RU' : 'he-IL')
    const dateRange = currentLocale === 'ru'
      ? `📅 ${startDate} - ${endDate}`
      : `📅 ${startDate} - ${endDate}`

    // Build share text
    let text = message.share_text_he || message.share_text_ru || ''
    if (!text) {
      text = `${message.icon || ''} ${title}\n${description || ''}`
    }

    // Add date range
    text = text + '\n\n' + dateRange

    const url = `${window.location.origin}/${currentLocale}`

    const shareData = {
      title: title,
      text: text + '\n\n🌐 ' + url
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        logger.userAction('Share urgent message via Web Share API', { messageId: message.id, locale: currentLocale })
      } else {
        await navigator.clipboard.writeText(shareData.text)
        toast.success(currentLocale === 'ru' ? 'Скопировано!' : 'הועתק ללוח!')
        logger.userAction('Copy urgent message to clipboard', { messageId: message.id, locale: currentLocale })
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        logger.error('Share urgent message failed', { error })
      }
    }
  }

  // Filter out dismissed messages
  const visibleMessages = messages.filter(m => !dismissedIds.includes(m.id))

  if (visibleMessages.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 mb-6">
      {visibleMessages.map((message) => {
        const title = currentLocale === 'ru' ? message.title_ru : message.title_he
        const description = currentLocale === 'ru' ? message.description_ru : message.description_he

        // Special design for white shirt messages (like WhiteShirtBanner)
        if (message.type === 'white_shirt') {
          return (
            <div key={message.id} className="animate-slide-down">
              <div className="bg-gradient-to-r from-sky-100 via-white to-sky-100 border-2 border-yellow-400 rounded-lg p-4 shadow-md relative overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-900" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-yellow-400" />
                </div>

                <div className="relative">
                  <div className="flex items-start gap-3">
                    {/* Shirt Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="bg-white rounded-full p-2 shadow-sm">
                        <Shirt className="h-6 w-6 text-blue-900" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-blue-900 mb-1">
                        👕 {title}
                      </h3>
                      {description && (
                        <p className="text-blue-800 text-sm">
                          {description}
                        </p>
                      )}
                    </div>

                    {/* Share & Dismiss Buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => shareMessage(message)}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-white/50 rounded-full"
                        aria-label="שתף"
                        title="שתף תזכורת"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => dismissMessage(message.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                        aria-label="סגור"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        // Regular message design for other types
        const bgColor = message.type === 'urgent' ? 'bg-red-50 border-red-200' :
                        message.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                        'bg-blue-50 border-blue-200'

        return (
          <div
            key={message.id}
            className={`${bgColor} border-2 rounded-lg p-4 shadow-sm`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {message.icon && <span>{message.icon}</span>}
                  {title}
                </h3>
                {description && (
                  <p className="text-sm mt-1 text-gray-700">{description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => shareMessage(message)}
                  className="h-8 w-8 p-0"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissMessage(message.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
