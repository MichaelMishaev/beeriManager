'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Heart, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Locale } from '@/i18n/config'

export function CommitteeCornerCard() {
  const t = useTranslations('committeeCorner')
  const params = useParams()
  const locale = (params.locale || 'he') as Locale

  return (
    <Link href={`/${locale}/committee-corner`} className="block">
      <Card
        className="group relative overflow-hidden
                   animate-float-soft hover:[animation-play-state:paused]
                   shadow-md shadow-blue-100/30 hover:shadow-xl hover:shadow-blue-200/40
                   hover:-translate-y-1
                   transition-all duration-300 ease-out
                   border border-[#0D98BA]/20
                   hover:border-[#0D98BA]/60
                   bg-gradient-to-br from-white via-white to-[#87CEEB]/10"
      >
        {/* Animated shine sweep — a skewed, brand-tinted light bar looping across the card */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/4
                     bg-gradient-to-r from-transparent via-[#87CEEB]/70 to-transparent
                     animate-shine-sweep"
        />
        <CardContent className="relative p-4 md:p-5 flex items-center gap-4">
          <div className="relative overflow-hidden flex-shrink-0 w-12 h-12 rounded-full bg-[#003153] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            {/* Shine sweep across the dark badge — high contrast, reads as a light glint */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3
                         bg-gradient-to-r from-transparent via-white/80 to-transparent
                         animate-shine-sweep"
            />
            <Heart className="relative h-6 w-6 text-[#FFBA00]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#003153] group-hover:text-[#0D98BA] transition-colors duration-200">
              {t('homeCardTitle')}
            </p>
            <p className="text-sm text-gray-600 line-clamp-1">
              {t('homeCardSubtitle')}
            </p>
          </div>
          <ArrowLeft className="h-5 w-5 text-[#0D98BA] flex-shrink-0 ltr:rotate-180 transition-transform duration-200 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
        </CardContent>
      </Card>
    </Link>
  )
}
