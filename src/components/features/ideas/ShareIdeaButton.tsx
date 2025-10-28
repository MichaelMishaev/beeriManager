'use client'

import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareIdeaButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showLabel?: boolean
}

export function ShareIdeaButton({
  variant = 'ghost',
  size = 'sm',
  className = '',
  showLabel = false
}: ShareIdeaButtonProps) {
  const message = `💡 *יש לכם רעיון?*

שתפו אותנו ברעיונות לשיפור ותכונות חדשות!

הרעיונות שלכם עוזרים לנו לשפר ולהתאים את המערכת לצרכים שלכם. כל רעיון נבדק ונשקל!

🔗 *שליחת רעיון:*
https://beeri.online/ideas

לעוד מידע כנסו ל https://beeri.online`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'יש לכם רעיון?',
          text: message
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // Fallback to clipboard
          await navigator.clipboard.writeText(message)
          alert('הועתק!')
        }
      }
    } else {
      // Fallback to WhatsApp
      const encodedText = encodeURIComponent(message)
      window.open(`https://wa.me/?text=${encodedText}`, '_blank')
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleShare}
      title="שיתוף"
    >
      <Share2 className={showLabel ? 'h-4 w-4 ml-2' : 'h-4 w-4'} />
      {showLabel && 'שתף'}
    </Button>
  )
}
