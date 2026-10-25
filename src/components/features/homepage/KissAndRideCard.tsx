'use client'

import { useTranslations } from 'next-intl'
import { Car } from 'lucide-react'
import { QuickLinkTile } from './QuickLinkTile'

export function KissAndRideCard() {
  const t = useTranslations('kissRide')

  return (
    <QuickLinkTile
      href="kiss-and-ride"
      icon={Car}
      title={t('homeCardTitle')}
      subtitle={t('homeCardSubtitle')}
      badgeClassName="bg-[#FFBA00]"
      iconClassName="text-[#003153]"
    />
  )
}
