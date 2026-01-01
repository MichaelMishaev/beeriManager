'use client'

import { GraduationCap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShareButton } from '@/components/ui/share-button'
import { Button } from '@/components/ui/button'
import { formatSkillsSurveyShareData } from '@/lib/utils/share-formatters'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Locale } from '@/i18n/config'

export function SkillsSurveyCard() {
  const t = useTranslations('skillsSurvey')
  const params = useParams()
  const locale = (params.locale || 'he') as Locale

  return (
    <Card className="group shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative overflow-hidden">
      {/* Decorative accent bar - using brand colors */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0D98BA] via-[#00509d] to-[#003153]" />

      <CardHeader className="pb-4 pt-6">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            {/* Icon with neutral background */}
            <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm transition-colors duration-300">
              <GraduationCap className="h-6 w-6 text-[#0D98BA] group-hover:scale-110 transition-transform duration-300" />
            </div>
            <CardTitle className="text-xl md:text-2xl text-[#003153] group-hover:text-[#0D98BA] font-bold transition-colors duration-300">
              {t('title')}
            </CardTitle>
          </div>

          {/* ShareButton - neutralized */}
          <ShareButton
            shareData={formatSkillsSurveyShareData(locale)}
            variant="ghost"
            size="icon"
            locale={locale}
            className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700"
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
        <div className="space-y-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
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
        <Link href={`/${locale}/surveys/skills`} className="block">
          <Button
            className="w-full bg-gradient-to-r from-[#0D98BA] to-[#00509d] hover:from-[#00509d] hover:to-[#003153] text-white shadow-md hover:shadow-lg transition-all duration-300 font-semibold text-sm md:text-base"
            size="lg"
          >
            {t('ctaButton')}
            <GraduationCap className="h-5 w-5 mr-2" />
          </Button>
        </Link>

        {/* Time estimate badge */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <span>⏱️</span>
            <span>{t('timeEstimate')}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
