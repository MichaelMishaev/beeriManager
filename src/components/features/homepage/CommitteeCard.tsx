'use client'

import { useState } from 'react'
import { Users, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShareButton } from '@/components/ui/share-button'
import { formatCommitteeRepresentativesShareData } from '@/lib/utils/share-formatters'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'

interface CommitteeMember {
  grade: string
  name: string
}

const committeeMembers: CommitteeMember[] = [
  { grade: 'א1', name: 'דבי כראדי' },
  { grade: 'א2', name: 'חופית מטייב' },
  { grade: 'א3', name: 'אלון שמואלוביץ\'' },
  { grade: 'א4', name: 'ורדית צוויג' },

  { grade: 'ב1', name: 'יוסי בן דוד' },
  { grade: 'ב2', name: 'יוליה זברסקי' },
  { grade: 'ב3', name: 'אלון שמואלוביץ\'' },
  { grade: 'ב4', name: 'נועה זנזורי' },

  { grade: 'ג1', name: 'אלינור מנישרוב' },
  { grade: 'ג2', name: 'ליאור בן הרוש' },
  { grade: 'ג3', name: 'אורטל בבלי' },
  { grade: 'ג4', name: 'ניצן חכימי' },

  { grade: 'ד1', name: 'אלמוג ארזי הלל' },
  { grade: 'ד2', name: 'יוסי בן דוד' },
  { grade: 'ד3', name: 'מיכאל מישייב' },

  { grade: 'ה1', name: 'ולנטינה מטייקה' },
  { grade: 'ה2', name: 'מאגי קדר' },
  { grade: 'ה3', name: 'עמית טסלר' },

  { grade: 'ו1', name: 'מיכאל מישייב' },
  { grade: 'ו2', name: 'אדינה כהן' },
  { grade: 'ו3', name: 'ליטל דיין' },
  { grade: 'ו4', name: 'דניאל מויסה' },
]

// Group by grade level
const groupedMembers = committeeMembers.reduce((acc, member) => {
  const gradeLevel = member.grade[0] // א, ב, ג, etc.
  if (!acc[gradeLevel]) {
    acc[gradeLevel] = []
  }
  acc[gradeLevel].push(member)
  return acc
}, {} as Record<string, CommitteeMember[]>)

export function CommitteeCard() {
  const t = useTranslations('homepage')
  const params = useParams()
  const locale = (params.locale || 'he') as Locale
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200" dir="rtl">
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-blue-100/50 transition-colors rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Users className="h-5 w-5 text-blue-600" />
            {t('committeeRepresentatives')}
          </CardTitle>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-blue-700" />
          ) : (
            <ChevronUp className="h-5 w-5 text-blue-700" />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(groupedMembers).map(([gradeLevel, members]) => (
              <div key={gradeLevel} className="space-y-2">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg mb-2">
                    {gradeLevel}׳
                  </div>
                </div>
                <div className="space-y-1.5">
                  {members.map((member) => (
                    <div
                      key={member.grade}
                      className="bg-white/80 backdrop-blur-sm rounded-lg p-2 text-center hover:bg-white transition-colors"
                    >
                      <div className="text-xs font-semibold text-blue-700 mb-0.5">
                        {member.grade}
                      </div>
                      <div className="text-sm text-gray-700 leading-tight">
                        {member.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-blue-200 flex flex-col gap-3">
            <ShareButton
              shareData={formatCommitteeRepresentativesShareData(committeeMembers, locale)}
              variant="outline"
              size="sm"
              locale={locale}
              className="w-full bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100 hover:border-blue-400"
              label={t('shareRepresentativesList')}
            />
            <p className="text-sm text-blue-900 text-center">
              {t('forQuestionsAndSuggestions')}{' '}
              <a
                href={locale === 'ru'
                  ? "https://wa.me/972544345287?text=Здравствуйте,%20у%20меня%20вопрос%20к%20родительскому%20комитету"
                  : "https://wa.me/972544345287?text=שלום,%20יש%20לי%20שאלה%20לועד%20ההורים"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-900 font-semibold hover:underline"
              >
                {t('sendWhatsAppMessage')}
              </a>
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
