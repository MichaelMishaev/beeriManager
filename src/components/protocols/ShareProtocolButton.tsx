'use client'

import { ShareButton } from '@/components/ui/share-button'
import { formatProtocolShareData } from '@/lib/utils/share-formatters'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'

interface ShareProtocolButtonProps {
  protocol: {
    id: string
    title: string
    protocol_date: string
  }
}

export function ShareProtocolButton({ protocol }: ShareProtocolButtonProps) {
  const params = useParams()
  const locale = (params.locale || 'he') as Locale

  return (
    <ShareButton
      shareData={formatProtocolShareData(protocol, locale)}
      variant="outline"
      size="sm"
      locale={locale}
      className="w-full"
      label={locale === 'ru' ? 'Поделиться' : 'שתף'}
    />
  )
}
