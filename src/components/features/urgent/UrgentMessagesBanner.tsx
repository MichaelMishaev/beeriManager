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
 * Convert URLs in text to prominent inline CTA buttons
 */
function linkifyText(text: string, buttonBg: string): JSX.Element[] {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g
  const parts: JSX.Element[] = []
  let lastIndex = 0
  let match

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex, match.index)}
        </span>
      )
    }

    const url = match[0]
    const href = url.startsWith('www.') ? `https://${url}` : url

    parts.push(
      <a
        key={`link-${match.index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`
          inline-flex items-center gap-1.5
          mt-3 px-4 py-2
          ${buttonBg}
          text-white font-bold text-sm
          rounded-lg
          shadow-md hover:shadow-xl
          transform hover:scale-105 active:scale-95
          transition-all duration-200
          focus:outline-none focus:ring-4 focus:ring-white/30
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        <span>לחץ לפתיחת הקישור</span>
      </a>
    )

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>
        {text.substring(lastIndex)}
      </span>
    )
  }

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
      const response = await fetch(`/api/urgent-messages?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
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

  const visibleMessages = messages.filter(m => !dismissedIds.includes(m.id))

  if (visibleMessages.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 mb-6">
      {visibleMessages.map((message) => {
        const title = currentLocale === 'ru' ? message.title_ru : message.title_he
        const description = currentLocale === 'ru' ? message.description_ru : message.description_he

        // Professional elevated card design with strong urgency indicators
        const typeConfig = {
          urgent: {
            borderColor: 'border-l-red-600',
            bg: 'bg-white',
            badgeBg: 'bg-red-600',
            badgeText: 'text-white',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            textColor: 'text-gray-900',
            descColor: 'text-gray-700',
            buttonBg: 'bg-red-600 hover:bg-red-700',
            shadowColor: 'shadow-red-500/20',
            stripeBg: 'bg-gradient-to-b from-red-600 to-red-700',
            Icon: AlertCircle,
            badge: 'דחוף',
            badgeRu: 'СРОЧНО',
          },
          warning: {
            borderColor: 'border-l-orange-600',
            bg: 'bg-white',
            badgeBg: 'bg-orange-600',
            badgeText: 'text-white',
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            textColor: 'text-gray-900',
            descColor: 'text-gray-700',
            buttonBg: 'bg-orange-600 hover:bg-orange-700',
            shadowColor: 'shadow-orange-500/20',
            stripeBg: 'bg-gradient-to-b from-orange-600 to-orange-700',
            Icon: AlertTriangle,
            badge: 'אזהרה',
            badgeRu: 'ВНИМАНИЕ',
          },
          white_shirt: {
            borderColor: 'border-l-blue-600',
            bg: 'bg-white',
            badgeBg: 'bg-blue-600',
            badgeText: 'text-white',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            textColor: 'text-gray-900',
            descColor: 'text-gray-700',
            buttonBg: 'bg-blue-600 hover:bg-blue-700',
            shadowColor: 'shadow-blue-500/20',
            stripeBg: 'bg-gradient-to-b from-blue-600 to-blue-700',
            Icon: Shirt,
            badge: 'חשוב',
            badgeRu: 'ВАЖНО',
          },
          info: {
            borderColor: 'border-l-sky-600',
            bg: 'bg-white',
            badgeBg: 'bg-sky-600',
            badgeText: 'text-white',
            iconBg: 'bg-sky-100',
            iconColor: 'text-sky-600',
            textColor: 'text-gray-900',
            descColor: 'text-gray-700',
            buttonBg: 'bg-sky-600 hover:bg-sky-700',
            shadowColor: 'shadow-sky-500/20',
            stripeBg: 'bg-gradient-to-b from-sky-600 to-sky-700',
            Icon: Info,
            badge: 'הודעה',
            badgeRu: 'СООБЩЕНИЕ',
          }
        }

        const config = typeConfig[message.type as keyof typeof typeConfig] || typeConfig.info
        const IconComponent = config.Icon
        const badgeLabel = currentLocale === 'ru' ? config.badgeRu : config.badge

        return (
          <div
            key={message.id}
            className="animate-attention-bounce"
          >
            {/* Elevated professional card with strong left border */}
            <div className={`
              relative
              ${config.bg}
              border-l-[6px] ${config.borderColor}
              rounded-xl
              shadow-2xl ${config.shadowColor}
              overflow-hidden
              transform hover:scale-[1.01]
              transition-all duration-300 ease-out
            `}>
              {/* Diagonal stripe pattern on left edge */}
              <div className="absolute left-0 top-0 bottom-0 w-[6px] overflow-hidden">
                <div className={`
                  absolute inset-0 ${config.stripeBg}
                  opacity-20
                `}>
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
                  }} />
                </div>
              </div>

              {/* Status badge - top corner */}
              <div className="absolute top-4 left-4 z-10">
                <div className={`
                  flex items-center gap-1.5
                  ${config.badgeBg} ${config.badgeText}
                  px-3 py-1
                  rounded-full
                  shadow-lg
                  text-xs font-bold uppercase tracking-wide
                  animate-subtle-pulse
                `}>
                  <Bell className="w-3 h-3" strokeWidth={2.5} />
                  <span>{badgeLabel}</span>
                </div>
              </div>

              {/* Action buttons - top right */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
                <ShareButton
                  shareData={formatUrgentMessageShareData(message, currentLocale)}
                  variant="ghost"
                  size="icon"
                  locale={currentLocale}
                  className="
                    h-9 w-9
                    bg-white/80 backdrop-blur-sm
                    text-gray-700 hover:text-gray-900
                    hover:bg-white
                    rounded-lg
                    shadow-md hover:shadow-lg
                    transition-all duration-200
                    hover:scale-110 active:scale-95
                  "
                />
                <button
                  onClick={() => dismissMessage(message.id)}
                  className="
                    h-9 w-9 rounded-lg p-2
                    bg-white/80 backdrop-blur-sm
                    text-gray-700 hover:text-gray-900
                    hover:bg-white
                    shadow-md hover:shadow-lg
                    transition-all duration-200
                    hover:scale-110 active:scale-95
                    focus:outline-none focus:ring-2 focus:ring-gray-400
                  "
                  aria-label={currentLocale === 'ru' ? 'Закрыть' : 'סגור'}
                >
                  <X className="w-full h-full" strokeWidth={2} />
                </button>
              </div>

              {/* Main content */}
              <div className="flex items-start gap-4 px-6 pt-16 pb-6">
                {/* Large prominent icon */}
                <div className="flex-shrink-0 mt-1">
                  <div className={`
                    ${config.iconBg}
                    rounded-2xl
                    p-4
                    shadow-lg
                    transform hover:rotate-6
                    transition-transform duration-300
                  `}>
                    <IconComponent
                      className={`w-8 h-8 ${config.iconColor}`}
                      strokeWidth={2}
                    />
                  </div>
                </div>

                {/* Content area */}
                <div className="flex-1 min-w-0 text-right">
                  {/* Title */}
                  <h3 className={`
                    font-extrabold text-xl sm:text-2xl
                    ${config.textColor}
                    leading-tight
                    mb-2
                  `}>
                    {title}
                  </h3>

                  {/* Description */}
                  {description && (
                    <div className={`
                      text-sm sm:text-base
                      ${config.descColor}
                      leading-relaxed
                    `}>
                      {linkifyText(description, config.buttonBg)}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom glow effect */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            </div>
          </div>
        )
      })}

      <style jsx global>{`
        @keyframes attention-bounce {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          50% {
            transform: translateY(-5px) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes subtle-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.02);
          }
        }

        .animate-attention-bounce {
          animation: attention-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-subtle-pulse {
          animation: subtle-pulse 2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-attention-bounce,
          .animate-subtle-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
