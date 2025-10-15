'use client'

import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import type { Event } from '@/types'
import type { Locale } from '@/i18n/config'

interface ShareEventButtonProps {
  event: Event
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

const eventTypeLabels: Record<Locale, Record<string, string>> = {
  he: {
    'meeting': 'ישיבה',
    'fundraiser': 'גיוס כספים',
    'general': 'כללי',
    'social': 'חברתי',
    'educational': 'חינוכי',
    'trip': 'טיול',
    'workshop': 'סדנה'
  },
  ru: {
    'meeting': 'Встреча',
    'fundraiser': 'Сбор средств',
    'general': 'Общее',
    'social': 'Социальное',
    'educational': 'Образовательное',
    'trip': 'Поездка',
    'workshop': 'Мастер-класс'
  }
}

const translations = {
  he: {
    type: 'סוג',
    location: 'מיקום',
    viewFull: 'לצפייה מלאה',
    shareEvent: 'שתף אירוע',
    copied: 'הקישור הועתק! ניתן להדבקה בווטסאפ'
  },
  ru: {
    type: 'Тип',
    location: 'Место',
    viewFull: 'Полная информация',
    shareEvent: 'Поделиться',
    copied: 'Ссылка скопирована! Можно вставить в WhatsApp'
  }
}

export function ShareEventButton({ event, variant = 'outline', size = 'sm' }: ShareEventButtonProps) {
  const params = useParams()
  const locale = (params.locale || 'he') as Locale

  const handleShare = async () => {
    const url = `${window.location.origin}/${locale}/events/${event.id}`
    const startDate = new Date(event.start_datetime)
    const t = translations[locale]
    const eventType = eventTypeLabels[locale][event.event_type] || event.event_type

    // Get locale code for date formatting
    const localeCode = locale === 'ru' ? 'ru-RU' : 'he-IL'

    // Format date and time
    const dateStr = startDate.toLocaleDateString(localeCode, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const timeStr = startDate.toLocaleTimeString(localeCode, {
      hour: '2-digit',
      minute: '2-digit'
    })

    // Add end time if available
    let timeDisplay = `⏰ ${timeStr}`
    if (event.end_datetime) {
      const endDate = new Date(event.end_datetime)
      const endTimeStr = endDate.toLocaleTimeString(localeCode, {
        hour: '2-digit',
        minute: '2-digit'
      })
      timeDisplay += ` - ${endTimeStr}`
    }

    // Build location text
    const locationText = event.location
      ? `\n📍 ${t.location}: ${event.location}`
      : ''

    // Build description text
    const descriptionText = event.description
      ? `\n\n${event.description.slice(0, 150)}${event.description.length > 150 ? '...' : ''}`
      : ''

    const text = `📅 *${event.title}*\n\n🏷️ ${t.type}: ${eventType}\n📆 ${dateStr}\n${timeDisplay}${locationText}${descriptionText}\n\n🔗 ${t.viewFull}:\n${url}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text,
          url
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(text)
          alert(t.copied)
        }
      }
    } else {
      // Fallback to WhatsApp Web
      const encodedText = encodeURIComponent(text)
      window.open(`https://wa.me/?text=${encodedText}`, '_blank')
    }
  }

  const t = translations[locale]

  return (
    <Button variant={variant} size={size} onClick={handleShare} className="flex-1">
      <Share2 className="h-4 w-4 ml-2" />
      {t.shareEvent}
    </Button>
  )
}
