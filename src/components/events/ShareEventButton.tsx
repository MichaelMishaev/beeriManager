'use client'

import { ShareButton } from '@/components/ui/share-button'
import { formatEventShareData } from '@/lib/utils/share-formatters'
import { useParams } from 'next/navigation'
import type { Event } from '@/types'
import type { Locale } from '@/i18n/config'

interface ShareEventButtonProps {
  event: Event
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ShareEventButton({ event, variant = 'outline', size = 'sm' }: ShareEventButtonProps) {
  const params = useParams()
  const locale = (params.locale || 'he') as Locale

  return (
    <ShareButton
      shareData={formatEventShareData(event, locale)}
      variant={variant}
      size={size}
      locale={locale}
      className="flex-1"
      label={locale === 'ru' ? 'Поделиться' : 'שתף אירוע'}
    />
  )
}
