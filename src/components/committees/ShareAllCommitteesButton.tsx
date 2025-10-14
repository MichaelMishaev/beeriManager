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

interface ShareAllCommitteesButtonProps {
  committees: Committee[]
}

export function ShareAllCommitteesButton({ committees }: ShareAllCommitteesButtonProps) {
  const params = useParams()
  const locale = (params.locale || 'he') as Locale

  const handleShare = async () => {
    const url = `${window.location.origin}/${locale}/committees`
    const title = locale === 'ru'
      ? '📋 *כל הוועדות של ועד ההורים*'
      : '📋 *כל הוועדות של ועד ההורים*'

    let text = `${title}\n━━━━━━━━━━━━━━━━━━━━\n\n`

    committees.forEach((committee, index) => {
      text += `${index + 1}. 🏛️ *${committee.name}*\n`

      if (committee.description) {
        text += `   ${committee.description}\n`
      }

      if (committee.members && committee.members.length > 0) {
        text += `   👥 חברים: ${committee.members.slice(0, 3).join(', ')}`
        if (committee.members.length > 3) {
          text += ` +${committee.members.length - 3}`
        }
        text += '\n'
      }

      if (committee.responsibilities && committee.responsibilities.length > 0) {
        text += `   📋 תחומי אחריות: ${committee.responsibilities.slice(0, 2).join(', ')}`
        if (committee.responsibilities.length > 2) {
          text += ` +${committee.responsibilities.length - 2}`
        }
        text += '\n'
      }

      text += '\n'
    })

    const totalMembers = committees.reduce((sum, c) => sum + (c.members?.length || 0), 0)
    const totalResp = committees.reduce((sum, c) => sum + (c.responsibilities?.length || 0), 0)

    text += `📊 *סטטיסטיקה:*\n`
    text += `• ${committees.length} וועדות\n`
    text += `• ${totalMembers} חברי ועדה\n`
    text += `• ${totalResp} תחומי אחריות\n\n`
    text += `🔗 לצפייה מלאה:\n${url}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: locale === 'ru' ? 'כל הוועדות' : 'כל הוועדות',
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

  const shareLabel = locale === 'ru' ? 'שתף את כולן' : 'שתף את כולן'

  return (
    <Button
      variant="outline"
      onClick={handleShare}
    >
      <Share2 className="h-4 w-4 ml-2" />
      {shareLabel}
    </Button>
  )
}
