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
function linkifyText(text: string, buttonGradient: string): JSX.Element[] {
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
          group
          mt-3 mb-2
          flex items-center justify-center gap-2
          px-5 py-3.5 sm:px-6 sm:py-4
          ${buttonGradient}
          text-white font-bold
          rounded-xl
          shadow-lg hover:shadow-xl
          transition-all duration-300 ease-out
          hover:scale-[1.02] active:scale-[0.98]
          focus:outline-none focus:ring-4 focus:ring-white/50
          border-2 border-white/20
          backdrop-blur-sm
          relative overflow-hidden
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Icon */}
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 relative z-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>

        {/* Text */}
        <span className="text-sm sm:text-base font-bold truncate relative z-10">
          לחץ לפתיחת הקישור
        </span>

        {/* External link arrow */}
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 group-hover:translate-x-[-2px] group-hover:translate-y-[2px] transition-transform relative z-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
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
    <div className="space-y-4 mb-6">
      {visibleMessages.map((message) => {
        const title = currentLocale === 'ru' ? message.title_ru : message.title_he
        const description = currentLocale === 'ru' ? message.description_ru : message.description_he

        // Design configurations based on message type
        const typeConfig = {
          urgent: {
            bgGradient: 'from-red-50 via-orange-50 to-red-50',
            borderColor: 'border-red-400',
            iconBg: 'bg-gradient-to-br from-red-500 to-orange-500',
            iconColor: 'text-white',
            textColor: 'text-red-950',
            descColor: 'text-red-900',
            Icon: AlertCircle,
            pulseColor: 'rgba(239, 68, 68, 0.4)', // red-500
            glowColor: 'shadow-red-200',
          },
          warning: {
            bgGradient: 'from-orange-50 via-amber-50 to-orange-50',
            borderColor: 'border-orange-400',
            iconBg: 'bg-gradient-to-br from-orange-500 to-amber-500',
            iconColor: 'text-white',
            textColor: 'text-orange-950',
            descColor: 'text-orange-900',
            Icon: AlertTriangle,
            pulseColor: 'rgba(249, 115, 22, 0.4)', // orange-500
            glowColor: 'shadow-orange-200',
          },
          white_shirt: {
            bgGradient: 'from-blue-50 via-sky-50 to-blue-50',
            borderColor: 'border-blue-400',
            iconBg: 'bg-gradient-to-br from-blue-500 to-sky-500',
            iconColor: 'text-white',
            textColor: 'text-blue-950',
            descColor: 'text-blue-900',
            Icon: Shirt,
            pulseColor: 'rgba(59, 130, 246, 0.4)', // blue-500
            glowColor: 'shadow-blue-200',
          },
          info: {
            bgGradient: 'from-sky-50 via-blue-50 to-sky-50',
            borderColor: 'border-sky-400',
            iconBg: 'bg-gradient-to-br from-sky-500 to-blue-500',
            iconColor: 'text-white',
            textColor: 'text-sky-950',
            descColor: 'text-sky-900',
            Icon: Info,
            pulseColor: 'rgba(14, 165, 233, 0.4)', // sky-500
            glowColor: 'shadow-sky-200',
          }
        }

        const config = typeConfig[message.type as keyof typeof typeConfig] || typeConfig.info
        const IconComponent = config.Icon

        return (
          <div
            key={message.id}
            className="animate-in slide-in-from-top-4 duration-500"
          >
            {/* Outer container with pulsing border */}
            <div
              className={`
                relative rounded-xl p-[3px] ${config.glowColor} shadow-lg
                animate-pulse-border
              `}
              style={{
                background: `linear-gradient(135deg, ${config.pulseColor}, transparent, ${config.pulseColor})`,
                backgroundSize: '200% 200%',
              }}
            >
              {/* Inner content card */}
              <div className={`
                relative bg-gradient-to-r ${config.bgGradient}
                rounded-lg overflow-hidden
              `}>
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                  <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl bg-current animate-blob" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl bg-current animate-blob animation-delay-2000" />
                  <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl bg-current animate-blob animation-delay-4000" />
                </div>

                {/* Main content */}
                <div className="relative">
                  {/* Mobile-first: Header with buttons (RTL-aware positioning) */}
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5">
                    <ShareButton
                      shareData={formatUrgentMessageShareData(message, currentLocale)}
                      variant="ghost"
                      size="icon"
                      locale={currentLocale}
                      className={`
                        h-9 w-9
                        text-gray-600 hover:text-gray-800
                        hover:bg-white/60 active:scale-95
                        transition-all duration-200
                        rounded-lg
                      `}
                    />
                    <button
                      onClick={() => dismissMessage(message.id)}
                      className={`
                        h-9 w-9 rounded-lg p-2
                        text-gray-600 hover:text-gray-800
                        hover:bg-white/60
                        transition-all duration-200
                        active:scale-95
                        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400
                      `}
                      aria-label={currentLocale === 'ru' ? 'Закрыть' : 'סגור'}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Content container */}
                  <div className="px-4 pt-12 pb-4 sm:px-5 sm:pt-14 sm:pb-5">
                    {/* Title section with icon - Mobile optimized */}
                    <div className="flex items-start gap-3 mb-3">
                      {/* Compact icon for mobile, larger for desktop */}
                      <div className="flex-shrink-0">
                        <div className={`
                          ${config.iconBg} ${config.iconColor}
                          rounded-full shadow-lg
                          animate-bounce-subtle
                          p-2 sm:p-2.5
                        `}>
                          <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                        </div>
                      </div>

                      {/* Title - RTL aligned for Hebrew */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className={`
                          text-lg sm:text-xl font-bold ${config.textColor}
                          leading-tight text-right
                        `}>
                          {title}
                        </h3>
                      </div>
                    </div>

                    {/* Description - RTL aligned for Hebrew */}
                    {description && (
                      <div className={`
                        text-sm sm:text-base ${config.descColor}
                        leading-relaxed whitespace-pre-line
                        text-right
                        pr-0 sm:pr-2
                      `}>
                        {linkifyText(description, config.iconBg)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      <style jsx global>{`
        @keyframes pulse-border {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .animate-pulse-border {
          animation: pulse-border 3s ease-in-out infinite;
        }

        .animate-blob {
          animation: blob 7s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-border,
          .animate-blob,
          .animate-bounce-subtle {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
