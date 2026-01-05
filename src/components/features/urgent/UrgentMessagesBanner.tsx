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
          mt-2 px-4 py-2.5
          ${accentColor}
          text-white text-sm font-bold
          rounded-lg
          shadow-md hover:shadow-lg
          transform hover:scale-[1.02] active:scale-[0.98]
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50
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

        // Modern notification banner design
        const typeConfig = {
          urgent: {
            borderGradient: 'from-red-500 via-red-400 to-red-500',
            bgGradient: 'from-red-50/90 via-orange-50/90 to-red-50/90',
            iconBg: 'bg-gradient-to-br from-red-500 to-orange-500',
            iconRing: 'ring-red-200',
            textColor: 'text-red-950',
            descColor: 'text-red-900',
            accentColor: 'bg-gradient-to-r from-red-600 to-orange-600',
            Icon: AlertCircle,
            shadowColor: 'shadow-red-100',
          },
          warning: {
            borderGradient: 'from-orange-500 via-amber-400 to-orange-500',
            bgGradient: 'from-orange-50/90 via-amber-50/90 to-orange-50/90',
            iconBg: 'bg-gradient-to-br from-orange-500 to-amber-500',
            iconRing: 'ring-orange-200',
            textColor: 'text-orange-950',
            descColor: 'text-orange-900',
            accentColor: 'bg-gradient-to-r from-orange-600 to-amber-600',
            Icon: AlertTriangle,
            shadowColor: 'shadow-orange-100',
          },
          white_shirt: {
            borderGradient: 'from-blue-500 via-sky-400 to-blue-500',
            bgGradient: 'from-blue-50/90 via-sky-50/90 to-blue-50/90',
            iconBg: 'bg-gradient-to-br from-blue-500 to-sky-500',
            iconRing: 'ring-blue-200',
            textColor: 'text-blue-950',
            descColor: 'text-blue-900',
            accentColor: 'bg-gradient-to-r from-blue-600 to-sky-600',
            Icon: Shirt,
            shadowColor: 'shadow-blue-100',
          },
          info: {
            borderGradient: 'from-sky-500 via-blue-400 to-sky-500',
            bgGradient: 'from-sky-50/90 via-blue-50/90 to-sky-50/90',
            iconBg: 'bg-gradient-to-br from-sky-500 to-blue-500',
            iconRing: 'ring-sky-200',
            textColor: 'text-sky-950',
            descColor: 'text-sky-900',
            accentColor: 'bg-gradient-to-r from-sky-600 to-blue-600',
            Icon: Info,
            shadowColor: 'shadow-sky-100',
          }
        }

        const config = typeConfig[message.type as keyof typeof typeConfig] || typeConfig.info
        const IconComponent = config.Icon

        return (
          <div
            key={message.id}
            className="animate-slide-in-down"
          >
            {/* Modern notification banner with gradient border */}
            <div className="relative group">
              {/* Gradient border effect */}
              <div className={`
                absolute inset-0
                bg-gradient-to-r ${config.borderGradient}
                rounded-lg
                opacity-100
                animate-border-flow
              `} />

              {/* Main content container */}
              <div className={`
                relative
                bg-gradient-to-r ${config.bgGradient}
                backdrop-blur-sm
                rounded-lg
                m-[2px]
                ${config.shadowColor} shadow-lg
                overflow-hidden
              `}>
                {/* Animated shimmer overlay */}
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>

                {/* Content */}
                <div className="relative flex items-start gap-3 px-4 py-4">
                  {/* Animated icon with glow */}
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`
                      relative
                      ${config.iconBg}
                      rounded-full
                      p-2.5
                      ring-4 ${config.iconRing}
                      ${config.shadowColor} shadow-lg
                      animate-icon-pulse
                    `}>
                      <IconComponent
                        className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                        strokeWidth={2.5}
                      />

                      {/* Pulsing ring effect */}
                      <div className={`
                        absolute inset-0
                        ${config.iconBg}
                        rounded-full
                        animate-ping-slow
                        opacity-20
                      `} />
                    </div>
                  </div>

                  {/* Content - flexible width */}
                  <div className="flex-1 min-w-0 text-right pt-0.5">
                    {/* Title */}
                    <h4 className={`
                      font-bold text-base sm:text-lg
                      ${config.textColor}
                      leading-tight
                    `}>
                      {title}
                    </h4>

                    {/* Description */}
                    {description && (
                      <div className={`
                        text-sm sm:text-base mt-2
                        ${config.descColor}
                        leading-relaxed
                      `}>
                        {linkifyText(description, config.accentColor)}
                      </div>
                    )}
                  </div>

                  {/* Actions - compact buttons */}
                  <div className="flex items-start gap-1 flex-shrink-0">
                    <ShareButton
                      shareData={formatUrgentMessageShareData(message, currentLocale)}
                      variant="ghost"
                      size="icon"
                      locale={currentLocale}
                      className={`
                        h-8 w-8
                        text-gray-600 hover:text-gray-800
                        hover:bg-white/70
                        rounded-lg
                        transition-all duration-200
                        hover:scale-110 active:scale-95
                      `}
                    />
                    <button
                      onClick={() => dismissMessage(message.id)}
                      className={`
                        h-8 w-8 rounded-lg p-1.5
                        text-gray-600 hover:text-gray-800
                        hover:bg-white/70
                        transition-all duration-200
                        hover:scale-110 active:scale-95
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
          </div>
        )
      })}

      <style jsx global>{`
        @keyframes slide-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes border-flow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes icon-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes ping-slow {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-slide-in-down {
          animation: slide-in-down 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .animate-border-flow {
          background-size: 200% 200%;
          animation: border-flow 3s ease-in-out infinite;
        }

        .animate-icon-pulse {
          animation: icon-pulse 2s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-in-down,
          .animate-shimmer,
          .animate-border-flow,
          .animate-icon-pulse,
          .animate-ping-slow {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
