'use client'

import { ShareButton } from '@/components/ui/share-button'
import { formatCommitteeShareData } from '@/lib/utils/share-formatters'
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

  return (
    <ShareButton
      shareData={formatCommitteeShareData(committee, locale)}
      size="sm"
      variant="outline"
      locale={locale}
      style={{ borderColor: committee.color, color: committee.color }}
      label={locale === 'ru' ? 'Поделиться' : 'שתף'}
    />
  )
}
