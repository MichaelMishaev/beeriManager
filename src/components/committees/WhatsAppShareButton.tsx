'use client'

import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'

interface Committee {
  id: string
  name: string
  description?: string
  members?: string[]
  responsibilities?: string[]
  color?: string
}

interface WhatsAppShareButtonProps {
  committee: Committee
}

export function WhatsAppShareButton({ committee }: WhatsAppShareButtonProps) {
  const params = useParams()
  const locale = (params.locale || 'he') as Locale

  const handleShare = async () => {
    const url = `${window.location.origin}/${locale}/committees`
    let text = `🏛️ *${committee.name}*\n`

    if (committee.description) {
      text += `\n${committee.description}\n`
    }

    if (committee.members && committee.members.length > 0) {
      const membersLabel = locale === 'ru' ? '\n👥 חברי ועדה' : '\n👥 חברי ועדה'
      text += `${membersLabel}: ${committee.members.join(', ')}`
    }

    if (committee.responsibilities && committee.responsibilities.length > 0) {
      const respLabel = locale === 'ru' ? '\n📋 תחומי אחריות' : '\n📋 תחומי אחריות'
      text += `${respLabel}: ${committee.responsibilities.join(', ')}`
    }

    const linkText = locale === 'ru' ? '\n\n🔗 לצפייה מלאה:' : '\n\n🔗 לצפייה מלאה:'
    text += `${linkText}\n${url}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: committee.name,
          text,
          url
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(text)
          const message = locale === 'ru'
            ? 'הקישור הועתק! ניתן להדבקה בווטסאפ'
            : 'הקישור הועתק! ניתן להדבקה בווטסאפ'
          alert(message)
        }
      }
    } else {
      // Fallback to WhatsApp Web
      const encodedText = encodeURIComponent(text)
      window.open(`https://wa.me/?text=${encodedText}`, '_blank')
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleShare}
      style={{ borderColor: committee.color, color: committee.color }}
    >
      <Share2 className="h-3 w-3 ml-1" />
      שתף
    </Button>
  )
}