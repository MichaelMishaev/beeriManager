'use client'

import { ShareButton } from '@/components/ui/share-button'
import { formatFeedbackShareData } from '@/lib/utils/share-formatters'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'

interface Feedback {
  id: string
  category: string
  subject?: string
  message: string
  created_at: string
}

interface WhatsAppShareButtonProps {
  feedback: Feedback
}

export function WhatsAppShareButton({ feedback }: WhatsAppShareButtonProps) {
  const params = useParams()
  const locale = (params.locale || 'he') as Locale

  return (
    <ShareButton
      shareData={formatFeedbackShareData(feedback, locale)}
      size="sm"
      variant="outline"
      locale={locale}
      className="gap-1"
      label={locale === 'ru' ? 'Поделиться' : 'שתף'}
    />
  )
}
