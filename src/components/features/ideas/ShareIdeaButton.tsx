'use client'

import { ShareButton } from '@/components/ui/share-button'
import { formatIdeasShareData } from '@/lib/utils/share-formatters'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'

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
  const params = useParams()
  const locale = (params.locale || 'he') as Locale

  return (
    <ShareButton
      shareData={formatIdeasShareData(locale)}
      variant={variant}
      size={size}
      locale={locale}
      className={className}
      label={showLabel ? (locale === 'ru' ? 'Поделиться' : 'שתף') : undefined}
    />
  )
}
