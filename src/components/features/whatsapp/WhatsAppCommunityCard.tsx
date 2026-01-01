'use client'

import { useState } from 'react'
import { MessageCircle, ChevronDown, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShareButton } from '@/components/ui/share-button'
import { formatWhatsAppLinksShareData } from '@/lib/utils/share-formatters'
import { WHATSAPP_COMMUNITY } from './WhatsAppCommunityLinks'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'

export function WhatsAppCommunityCard() {
  const [showGrades, setShowGrades] = useState(false)
  const t = useTranslations('whatsapp')
  const params = useParams()
  const locale = (params.locale || 'he') as Locale

  return (
    <Card className="group shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
              <MessageCircle className="h-7 w-7 text-green-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <CardTitle className="text-3xl text-[#003153] group-hover:text-[#0D98BA] transition-colors duration-300">
              {t('title')}
            </CardTitle>
          </div>
          <ShareButton
            shareData={formatWhatsAppLinksShareData(WHATSAPP_COMMUNITY.grades, locale)}
            variant="ghost"
            size="icon"
            locale={locale}
            className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700"
          />
        </div>
        <CardDescription className="text-sm text-gray-600">
          {t('subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">

        {/* Grades Toggle */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowGrades(!showGrades)}
            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-sm font-medium text-[#003153]"
          >
            <span>{t('groupsByGrade')}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showGrades ? 'rotate-180' : ''}`} />
          </button>

          {showGrades && (
            <div className="p-3 space-y-2 bg-white">
              {WHATSAPP_COMMUNITY.grades.map((grade) => (
                <a
                  key={grade.grade}
                  href={grade.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group"
                >
                  <span className="text-xl">{grade.emoji}</span>
                  <span className="font-medium flex-1 text-gray-900">{t('gradePrefix')} {grade.grade}</span>
                  <ExternalLink className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Russian Group - Only show when Russian locale is selected */}
        {locale === 'ru' && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <a
              href={WHATSAPP_COMMUNITY.russian}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-3 text-sm font-medium text-[#003153]"
              dir="ltr"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex-shrink-0">
                RU
              </div>
              <span className="flex-1 text-left">
                Русская группа
              </span>
              <ExternalLink className="h-4 w-4 text-green-600" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
