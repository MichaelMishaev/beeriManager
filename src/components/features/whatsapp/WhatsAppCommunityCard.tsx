'use client'

import { useState } from 'react'
import { MessageCircle, ChevronDown, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WHATSAPP_COMMUNITY } from './WhatsAppCommunityLinks'
import { useTranslations } from 'next-intl'

export function WhatsAppCommunityCard() {
  const [showGrades, setShowGrades] = useState(false)
  const t = useTranslations('whatsapp')

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="h-5 w-5 text-green-600" />
          </div>
          <CardTitle className="text-xl text-[#003153]">
            {t('title')}
          </CardTitle>
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
      </CardContent>
    </Card>
  )
}
