'use client'

import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareVendorButtonProps {
  vendor: {
    id: string
    name: string
    category: string
    phone?: string | null
    email?: string | null
    description?: string | null
  }
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}

const categoryLabels: Record<string, string> = {
  catering: '🍕 קייטרינג',
  equipment: '📦 ציוד',
  entertainment: '🎭 בידור',
  transportation: '🚌 הסעות',
  venue: '🏛️ אולמות',
  photography: '📷 צילום',
  printing: '🖨️ הדפסה',
  other: '🏪 אחר'
}

export function ShareVendorButton({ vendor, size = 'sm', variant = 'outline', className }: ShareVendorButtonProps) {
  const handleShare = async () => {
    const url = `${window.location.origin}/he/vendors/${vendor.id}`

    let text = `🏪 *${vendor.name}*\n\n`
    text += `📂 ${categoryLabels[vendor.category] || vendor.category}\n\n`

    if (vendor.description) {
      text += `📝 ${vendor.description}\n\n`
    }

    if (vendor.phone) {
      text += `📞 ${vendor.phone}\n`
    }

    if (vendor.email) {
      text += `📧 ${vendor.email}\n`
    }

    text += `\n🔗 לפרטים נוספים:\n${url}\n\nלמידע נוסף: https://beeri.online`

    if (navigator.share) {
      try {
        await navigator.share({
          title: vendor.name,
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
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleShare}
    >
      <Share2 className="h-4 w-4 ml-2" />
      שתף
    </Button>
  )
}
