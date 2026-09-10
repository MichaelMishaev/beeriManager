'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { FileText, ClipboardList, Users, ScrollText, ChevronLeft, ChevronDown, ChevronUp, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ShareButton } from '@/components/ui/share-button'
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

  const shareUrl = typeof window !== 'undefined'
    ? window.location.origin + `/${locale}/committee-corner`
    : `https://beeri.online/${locale}/committee-corner`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden text-white min-h-[360px] md:min-h-[440px] flex items-center">
        <Image
          src="/images/committee-corner-hero-bg.png"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        {/* Contrast overlay so text stays readable over the illustration */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#003153]/70 via-[#003153]/25 to-[#003153]/60" />

        <ShareButton
          shareData={{ title: t('title'), text: t('subtitle'), url: shareUrl }}
          showMenu={false}
          variant="ghost"
          size="icon"
          locale={locale === 'ru' ? 'ru' : 'he'}
          className="absolute z-10 top-4 end-4 h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white"
          aria-label={t('share')}
        />

        <div className="relative z-10 container mx-auto px-4 py-10 max-w-3xl text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Heart className="h-7 w-7 text-[#FFBA00]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-sm">{t('title')}</h1>
          <p className="text-white/90 text-sm md:text-base leading-relaxed drop-shadow-sm">{t('subtitle')}</p>
        </div>
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
