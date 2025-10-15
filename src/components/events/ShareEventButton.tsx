'use client'

import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Event } from '@/types'

interface ShareEventButtonProps {
  event: Event
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

const eventTypeLabels: Record<string, string> = {
  'meeting': 'ישיבה',
  'fundraiser': 'גיוס כספים',
  'general': 'כללי',
  'social': 'חברתי',
  'educational': 'חינוכי',
  'trip': 'טיול',
  'workshop': 'סדנה'
}

export function ShareEventButton({ event, variant = 'outline', size = 'sm' }: ShareEventButtonProps) {
  const handleShare = async () => {
    const url = `${window.location.origin}/he/events/${event.id}`
    const startDate = new Date(event.start_datetime)
    const eventType = eventTypeLabels[event.event_type] || event.event_type

    // Format date and time
    const dateStr = startDate.toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const timeStr = startDate.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    })

    // Add end time if available
    let timeDisplay = `⏰ ${timeStr}`
    if (event.end_datetime) {
      const endDate = new Date(event.end_datetime)
      const endTimeStr = endDate.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit'
      })
      timeDisplay += ` - ${endTimeStr}`
    }

    // Build location text
    const locationText = event.location
      ? `\n📍 מיקום: ${event.location}`
      : ''

    // Build description text
    const descriptionText = event.description
      ? `\n\n${event.description.slice(0, 150)}${event.description.length > 150 ? '...' : ''}`
      : ''

    const text = `📅 *${event.title}*\n\n🏷️ סוג: ${eventType}\n📆 ${dateStr}\n${timeDisplay}${locationText}${descriptionText}\n\n🔗 לצפייה מלאה:\n${url}`

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
          alert('הקישור הועתק! ניתן להדבקה בווטסאפ')
        }
      }
    } else {
      // Fallback to WhatsApp Web
      const encodedText = encodeURIComponent(text)
      window.open(`https://wa.me/?text=${encodedText}`, '_blank')
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleShare} className="flex-1">
      <Share2 className="h-4 w-4 ml-2" />
      שתף אירוע
    </Button>
  )
}
