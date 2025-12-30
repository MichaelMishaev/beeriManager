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
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Decorative accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500" />

      <CardHeader className="pb-4 pt-6">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            {/* Icon with gradient background */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-xl md:text-2xl text-[#003153] font-bold">
              {t('title')}
            </CardTitle>
          </div>

          {/* ShareButton - same pattern as WhatsApp Community card */}
          <ShareButton
            shareData={formatSkillsSurveyShareData(locale)}
            variant="ghost"
            size="icon"
            locale={locale}
            className="p-2 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600"
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
        <div className="space-y-2 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-purple-100">
          <div className="flex items-start gap-2 text-sm">
            <span className="text-lg flex-shrink-0">⚡</span>
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

        {/* Primary CTA Button - gradient, prominent */}
        <Link href={`/${locale}/surveys/skills`} className="block">
          <Button
            className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 font-semibold text-sm md:text-base"
            size="lg"
          >
            {t('ctaButton')}
            <GraduationCap className="h-5 w-5 mr-2" />
          </Button>
        </Link>

        {/* Time estimate badge */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
            <span>⏱️</span>
            <span>{t('timeEstimate')}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
