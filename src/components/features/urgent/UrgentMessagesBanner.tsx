'use client'

import { useState, useEffect } from 'react'
import { X, Shirt, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { ShareButton } from '@/components/ui/share-button'
import { formatUrgentMessageShareData } from '@/lib/utils/share-formatters'
import { useParams } from 'next/navigation'
import type { UrgentMessage } from '@/types'
import type { Locale } from '@/i18n/config'
import { logger } from '@/lib/logger'

/**
 * Convert URLs in text to prominent CTA buttons
 * Detects URLs starting with http://, https://, or www.
 */
function linkifyText(text: string, accentColor: string): JSX.Element[] {
  // Regex to detect URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g
  const parts: JSX.Element[] = []
  let lastIndex = 0
  let match

  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before the URL
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex, match.index)}
        </span>
      )
    }

    // Add the clickable URL as a prominent CTA button
    const url = match[0]
    const href = url.startsWith('www.') ? `https://${url}` : url

    parts.push(
      <a
        key={`link-${match.index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`
          group inline-flex items-center gap-2
          mt-2 px-4 py-2
          ${accentColor}
          text-white text-sm font-semibold
          rounded-md
          hover:opacity-90
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
        <span>לחץ לפתיחת הקישור</span>
      </a>
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text after last URL
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>
        {text.substring(lastIndex)}
      </span>
    )
  }

  // If no URLs found, return original text
  return parts.length > 0 ? parts : [<span key="text-0">{text}</span>]
}

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
      // Add cache-busting timestamp to ensure fresh data
      const response = await fetch(`/api/urgent-messages?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
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

        // Banner-style design configurations based on message type
        const typeConfig = {
          urgent: {
            borderColor: 'border-red-500',
            bgColor: 'bg-red-50',
            iconColor: 'text-red-600',
            textColor: 'text-red-900',
            descColor: 'text-red-800',
            accentColor: 'bg-red-600',
            Icon: AlertCircle,
          },
          warning: {
            borderColor: 'border-orange-500',
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600',
            textColor: 'text-orange-900',
            descColor: 'text-orange-800',
            accentColor: 'bg-orange-600',
            Icon: AlertTriangle,
          },
          white_shirt: {
            borderColor: 'border-blue-500',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-900',
            descColor: 'text-blue-800',
            accentColor: 'bg-blue-600',
            Icon: Shirt,
          },
          info: {
            borderColor: 'border-sky-500',
            bgColor: 'bg-sky-50',
            iconColor: 'text-sky-600',
            textColor: 'text-sky-900',
            descColor: 'text-sky-800',
            accentColor: 'bg-sky-600',
            Icon: Info,
          }
        }

        const config = typeConfig[message.type as keyof typeof typeConfig] || typeConfig.info
        const IconComponent = config.Icon

        return (
          <div
            key={message.id}
            className="animate-slide-down"
          >
            {/* Banner strip with strong left border */}
            <div
              className={`
                relative overflow-hidden
                border-l-4 ${config.borderColor}
                ${config.bgColor}
                shadow-md
                rounded-sm
              `}
            >
              {/* Banner content - compact horizontal layout */}
              <div className="flex items-start gap-3 px-4 py-3">
                {/* Icon - inline, not in bubble */}
                <IconComponent
                  className={`
                    w-5 h-5 sm:w-6 sm:h-6
                    flex-shrink-0 mt-0.5
                    ${config.iconColor}
                  `}
                  strokeWidth={2}
                />

                {/* Content - flexible width */}
                <div className="flex-1 min-w-0 text-right">
                  {/* Title */}
                  <h4 className={`
                    font-bold text-sm sm:text-base
                    ${config.textColor}
                    leading-tight
                  `}>
                    {title}
                  </h4>

                  {/* Description */}
                  {description && (
                    <div className={`
                      text-sm mt-1.5
                      ${config.descColor}
                      leading-relaxed
                    `}>
                      {linkifyText(description, config.accentColor)}
                    </div>
                  )}
                </div>

                {/* Actions - compact right-aligned */}
                <div className="flex items-start gap-1 flex-shrink-0">
                  <ShareButton
                    shareData={formatUrgentMessageShareData(message, currentLocale)}
                    variant="ghost"
                    size="icon"
                    locale={currentLocale}
                    className={`
                      h-8 w-8
                      text-gray-500 hover:text-gray-700
                      hover:bg-white/60
                      transition-colors
                    `}
                  />
                  <button
                    onClick={() => dismissMessage(message.id)}
                    className={`
                      h-8 w-8 rounded p-1.5
                      text-gray-500 hover:text-gray-700
                      hover:bg-white/60
                      transition-colors
                      focus:outline-none focus:ring-2 focus:ring-gray-400
                    `}
                    aria-label={currentLocale === 'ru' ? 'Закрыть' : 'סגור'}
                  >
                    <X className="w-full h-full" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      <style jsx global>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-down {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
