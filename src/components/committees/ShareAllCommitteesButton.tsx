'use client'

import { ShareButton } from '@/components/ui/share-button'
import { formatAllCommitteesShareData } from '@/lib/utils/share-formatters'
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
  const shareLabel = locale === 'ru' ? 'Поделиться всеми' : 'שתף את כולן'

  return (
    <ShareButton
      shareData={formatAllCommitteesShareData(committees, locale)}
      variant="outline"
      locale={locale}
      label={shareLabel}
    />
  )
}
