'use client'

import { GraduationCap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShareButton } from '@/components/ui/share-button'
import { formatSkillsSurveyShareData } from '@/lib/utils/share-formatters'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import { duoCard, DuoButton, DuoIconTile } from '@/components/ui/duo'
import { cn } from '@/lib/utils'

export function SkillsSurveyCard() {
  const t = useTranslations('skillsSurvey')
  const params = useParams()
  const locale = (params.locale || 'he') as Locale

  return (
    <Card className={cn(duoCard, 'group relative overflow-hidden')}>
      <CardHeader className="pb-4 pt-6">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <DuoIconTile icon={GraduationCap} tone="purple" size="lg" />
            <CardTitle className="text-xl md:text-2xl text-[#003153] font-extrabold">
              {t('title')}
            </CardTitle>
          </div>

          {/* ShareButton - neutralized */}
          <ShareButton
            shareData={formatSkillsSurveyShareData(locale)}
            variant="ghost"
            size="icon"
            locale={locale}
            className="p-2 rounded-xl border-2 border-[#e5e5e5] shadow-[0_3px_0_#e5e5e5] bg-white text-gray-700 active:translate-y-[3px] active:shadow-none"
          />
        </div>

        <CardDescription className="text-sm md:text-base text-gray-700 leading-relaxed">
          {t('subtitle')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description text */}
        <p className="text-sm text-gray-600 leading-relaxed">
          {t('description')}
        </p>

        {/* Key benefits list with emojis */}
        <div className="space-y-2.5 rounded-2xl p-4 border-2 border-[#e5e5e5]">
          <div className="flex items-start gap-2 text-sm">
            <span className="text-lg flex-shrink-0">🌱</span>
            <span className="text-gray-700">{t('benefit1')}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="text-lg flex-shrink-0">🎯</span>
            <span className="text-gray-700">{t('benefit2')}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="text-lg flex-shrink-0">⏱️</span>
            <span className="text-gray-700">{t('benefit3')}</span>
          </div>
        </div>

        {/* Primary CTA Button - brand gradient */}
        <DuoButton variant="navy" asChild className="w-full">
          <Link href={`/${locale}/surveys/skills`}>
            {t('ctaButton')}
            <GraduationCap className="h-5 w-5" />
          </Link>
        </DuoButton>

        {/* Time estimate badge */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 px-3 py-1.5 rounded-lg border-2 border-[#e5e5e5]">
            <span>⏱️</span>
            <span>{t('timeEstimate')}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
