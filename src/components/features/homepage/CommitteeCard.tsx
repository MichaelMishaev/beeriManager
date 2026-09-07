'use client'

import { useState } from 'react'
import { Users, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShareButton } from '@/components/ui/share-button'
import { formatCommitteeRepresentativesShareData } from '@/lib/utils/share-formatters'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'
import { committeeMembers, getMembersByGradeLevel } from '@/lib/data/committee-members'

const groupedMembers = getMembersByGradeLevel()

export function CommitteeCard() {
  const t = useTranslations('homepage')
  const params = useParams()
  const locale = (params.locale || 'he') as Locale
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAllMembers, setShowAllMembers] = useState(false)

  return (
    <Card
      className="group shadow-md shadow-blue-100/30 hover:shadow-xl hover:shadow-blue-200/40 hover:-translate-y-1
                 transition-all duration-300 ease-out border border-[#0D98BA]/20 hover:border-[#0D98BA]/60
                 bg-gradient-to-br from-white via-white to-[#87CEEB]/10"
      dir="rtl"
    >
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-[#0D98BA]/5 transition-colors rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[#003153] group-hover:text-[#0D98BA] transition-colors duration-200">
            <Users className="h-5 w-5 text-[#0D98BA]" />
            {t('committeeRepresentatives')}
          </CardTitle>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-[#0D98BA]" />
          ) : (
            <ChevronUp className="h-5 w-5 text-[#0D98BA]" />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(groupedMembers).map(([gradeLevel, members]) => (
              <div key={gradeLevel} className="space-y-2">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#003153] text-white font-bold text-lg mb-2">
                    {gradeLevel}׳
                  </div>
                </div>
                <div className="space-y-1.5">
                  {(showAllMembers ? members : members.slice(0, 1)).map((member) => (
                    <div
                      key={member.grade}
                      className="bg-white/80 backdrop-blur-sm rounded-lg p-2 text-center hover:bg-white transition-colors"
                    >
                      <div className="text-xs font-semibold text-[#0D98BA] mb-0.5">
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

          {/* Show More / Show Less Button */}
          {committeeMembers.length > 6 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllMembers(!showAllMembers)}
                className="text-sm font-medium text-[#0D98BA] hover:text-[#003153] hover:underline transition-colors"
              >
                {showAllMembers
                  ? t('showLess')
                  : `${t('showAll')} (${committeeMembers.length} ${t('representatives')})`}
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-[#0D98BA]/20 flex flex-col gap-3">
            <ShareButton
              shareData={formatCommitteeRepresentativesShareData(committeeMembers, locale)}
              variant="outline"
              size="sm"
              locale={locale}
              className="w-full bg-[#0D98BA]/5 border-[#0D98BA]/30 text-[#003153] hover:bg-[#0D98BA]/10 hover:border-[#0D98BA]"
              label={t('shareRepresentativesList')}
            />
            <p className="text-sm text-[#003153] text-center">
              {t('forQuestionsAndSuggestions')}{' '}
              <a
                href={locale === 'ru'
                  ? "https://wa.me/972544345287?text=Здравствуйте,%20у%20меня%20вопрос%20к%20родительскому%20комитету"
                  : "https://wa.me/972544345287?text=שלום,%20יש%20לי%20שאלה%20לועד%20ההורים"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0D98BA] hover:text-[#003153] font-semibold hover:underline"
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
