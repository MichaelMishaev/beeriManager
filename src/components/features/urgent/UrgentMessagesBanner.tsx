'use client'

import { useState, useEffect } from 'react'
import { X, Shirt, AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react'
import { ShareButton } from '@/components/ui/share-button'
import { formatUrgentMessageShareData } from '@/lib/utils/share-formatters'
import { useParams } from 'next/navigation'
import type { UrgentMessage } from '@/types'
import type { Locale } from '@/i18n/config'
import { logger } from '@/lib/logger'

/**
 * Convert URLs in text to clickable links
 * Detects URLs starting with http://, https://, or www.
 */
function linkifyText(text: string): JSX.Element[] {
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

    // Add the clickable URL
    const url = match[0]
    const href = url.startsWith('www.') ? `https://${url}` : url
    parts.push(
      <a
        key={`link-${match.index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline font-semibold transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {url}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
                <div className="relative p-5">
                  <div className="flex items-start gap-4">
                    {/* Animated Icon */}
                    <div className="flex-shrink-0">
                      <div className={`
                        ${config.iconBg} ${config.iconColor}
                        rounded-full p-3 shadow-lg
                        animate-bounce-subtle
                      `}>
                        <IconComponent className="h-7 w-7" strokeWidth={2.5} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      {/* Title with icon */}
                      <div className="flex items-center gap-2 mb-2">
                        <Bell className={`h-5 w-5 ${config.textColor} animate-ring`} />
                        <h3 className={`text-xl font-bold ${config.textColor} leading-tight`}>
                          {title}
                        </h3>
                      </div>

                      {/* Description */}
                      {description && (
                        <div className={`
                          text-base ${config.descColor}
                          leading-relaxed whitespace-pre-line
                          [&_a]:inline-flex [&_a]:items-center [&_a]:gap-1
                          [&_a]:px-2 [&_a]:py-1 [&_a]:-mx-1
                          [&_a]:bg-white/60 [&_a]:rounded
                          [&_a]:transition-all [&_a]:duration-200
                          [&_a:hover]:bg-white [&_a:hover]:shadow-sm
                        `}>
                          {linkifyText(description)}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-start gap-1 flex-shrink-0">
                      <ShareButton
                        shareData={formatUrgentMessageShareData(message, currentLocale)}
                        variant="ghost"
                        size="icon"
                        locale={currentLocale}
                        className={`
                          h-9 w-9 ${config.textColor}
                          hover:bg-white/50 active:scale-95
                          transition-all duration-200
                        `}
                      />
                      <button
                        onClick={() => dismissMessage(message.id)}
                        className={`
                          h-9 w-9 rounded-lg p-2
                          text-gray-400 hover:text-gray-600
                          hover:bg-white/50
                          transition-all duration-200
                          active:scale-95
                          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
                        `}
                        aria-label={currentLocale === 'ru' ? 'Закрыть' : 'סגור'}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
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

        @keyframes ring {
          0%, 100% {
            transform: rotate(0deg);
          }
          10%, 30% {
            transform: rotate(-10deg);
          }
          20%, 40% {
            transform: rotate(10deg);
          }
          50% {
            transform: rotate(0deg);
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

        .animate-ring {
          animation: ring 2s ease-in-out infinite;
        }

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-border,
          .animate-blob,
          .animate-bounce-subtle,
          .animate-ring {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
