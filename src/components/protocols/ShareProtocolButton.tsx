'use client'

import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatHebrewDate } from '@/lib/utils/date'

interface ShareProtocolButtonProps {
  protocol: {
    id: string
    title: string
    protocol_date: string
  }
}

export function ShareProtocolButton({ protocol }: ShareProtocolButtonProps) {
  const handleShare = async () => {
    const url = `${window.location.origin}/he/protocols/${protocol.id}`
    const text = `📋 *${protocol.title}*\n\n📅 ${formatHebrewDate(new Date(protocol.protocol_date))}\n\n🔗 לצפייה בפרוטוקול המלא:\n${url}\n\nלמידע נוסף: https://beeri.online`

    if (navigator.share) {
      try {
        await navigator.share({
          title: protocol.title,
          text,
          url
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(`${text}`)
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
    <Button variant="outline" size="sm" className="w-full" onClick={handleShare}>
      <Share2 className="h-4 w-4 ml-2" />
      שתף
    </Button>
  )
}
