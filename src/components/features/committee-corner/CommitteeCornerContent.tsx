'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { FileText, ClipboardList, Users, ScrollText, ChevronLeft, ChevronDown, ChevronUp, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getMembersByGradeLevel } from '@/lib/data/committee-members'
import type { Locale } from '@/i18n/config'

const groupedMembers = getMembersByGradeLevel()

function CornerRow({
  icon: Icon,
  title,
  subtitle,
  onClick,
  href,
  expanded,
}: {
  icon: React.ElementType
  title: string
  subtitle: string
  onClick?: () => void
  href?: string
  expanded?: boolean
}) {
  const content = (
    <div
      className="flex items-center gap-4 px-4 py-4 min-h-[64px] transition-colors
                 hover:bg-[#0D98BA]/5 active:bg-[#0D98BA]/10 cursor-pointer"
    >
      <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#0D98BA]/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-[#0D98BA]" />
      </div>
      <div className="flex-1 min-w-0 text-start">
        <p className="font-bold text-[#003153] leading-tight">{title}</p>
        <p className="text-sm text-gray-500 leading-snug mt-0.5">{subtitle}</p>
      </div>
      {expanded === undefined ? (
        <ChevronLeft className="h-5 w-5 text-gray-400 flex-shrink-0 ltr:rotate-180" />
      ) : expanded ? (
        <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
      ) : (
        <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block" aria-label={title}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className="block w-full text-start" aria-expanded={expanded}>
      {content}
    </button>
  )
}

export function CommitteeCornerContent() {
  const t = useTranslations('committeeCorner')
  const params = useParams()
  const locale = (params.locale || 'he') as Locale
  const [membersOpen, setMembersOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#003153] via-[#003153] to-[#0D98BA] text-white">
        <div className="relative z-10 container mx-auto px-4 pt-10 md:pt-14 pb-28 md:pb-36 max-w-3xl text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
            <Heart className="h-7 w-7 text-[#FFBA00]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">{t('subtitle')}</p>
        </div>

        {/* Decorative figures — represents the parents/committee community */}
        <Image
          src="/images/committee-corner-hero.png"
          alt=""
          aria-hidden="true"
          width={1600}
          height={600}
          className="pointer-events-none select-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] max-w-xl h-auto opacity-95"
          priority
        />
      </div>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <Card className="overflow-hidden shadow-md border border-[#0D98BA]/15">
          <CardContent className="p-0 divide-y divide-gray-100">
            <CornerRow
              icon={FileText}
              title={t('regulations.title')}
              subtitle={t('regulations.subtitle')}
              href={`/${locale}/regulations`}
            />
            <CornerRow
              icon={ClipboardList}
              title={t('protocols.title')}
              subtitle={t('protocols.subtitle')}
              href={`/${locale}/protocols`}
            />
            <CornerRow
              icon={ScrollText}
              title={t('classBylaws.title')}
              subtitle={t('classBylaws.subtitle')}
              href={`/${locale}/class-committee-bylaws`}
            />
            <CornerRow
              icon={Users}
              title={t('members.title')}
              subtitle={t('members.subtitle')}
              expanded={membersOpen}
              onClick={() => setMembersOpen(!membersOpen)}
            />
            {membersOpen && (
              <div className="px-4 pb-5 pt-1 bg-gray-50/60">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(groupedMembers).map(([gradeLevel, members]) => (
                    <div key={gradeLevel} className="bg-white rounded-lg border border-gray-100 p-3">
                      <div className="text-xs font-bold text-[#0D98BA] mb-1.5">{gradeLevel}׳</div>
                      <div className="space-y-1">
                        {members.map((member) => (
                          <div key={member.grade} className="text-xs text-gray-700">
                            <span className="font-medium">{member.grade}</span> — {member.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
