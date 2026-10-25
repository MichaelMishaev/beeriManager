'use client'

import { useTranslations } from 'next-intl'
import { Heart } from 'lucide-react'
import { QuickLinkTile } from './QuickLinkTile'

export function CommitteeCornerCard() {
  const t = useTranslations('committeeCorner')

  return (
    <QuickLinkTile
      href="committee-corner"
      icon={Heart}
      title={t('homeCardTitle')}
      subtitle={t('homeCardSubtitle')}
      badgeClassName="bg-[#003153]"
      iconClassName="text-[#FFBA00]"
    />
  )
}
