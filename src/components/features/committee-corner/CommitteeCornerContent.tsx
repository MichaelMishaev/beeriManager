'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ShareButton } from '@/components/ui/share-button'
import type { Locale } from '@/i18n/config'
import { CommitteeLadder } from './CommitteeLadder'
import { ClassRepsSheet } from './ClassRepsSheet'

export function CommitteeCornerContent({ regulationsApproved }: { regulationsApproved: boolean }) {
  const t = useTranslations('committeeCorner')
  const params = useParams()
  const locale = (params.locale || 'he') as Locale

  const shareUrl = typeof window !== 'undefined'
    ? window.location.origin + `/${locale}/committee-corner`
    : `https://beeri.online/${locale}/committee-corner`

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-[#003153]">
      <header className="bg-[#003153] text-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-1.5 px-4 pt-6 pb-5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-[22px] font-bold leading-tight">{t('title')}</h1>
            <ShareButton
              shareData={{ title: t('title'), text: t('subtitle'), url: shareUrl }}
              showMenu={false}
              variant="ghost"
              size="icon"
              locale={locale === 'ru' ? 'ru' : 'he'}
              className="h-11 w-11 shrink-0 rounded-full border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              aria-label={t('share')}
            />
          </div>
          <p className="text-sm leading-relaxed text-[#D6E6EE]">{t('purpose')}</p>
          <ul className="mt-1.5 flex flex-wrap gap-2" aria-label={t('legend.label')}>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-[#87CEEB]" aria-hidden="true" />
              {t('legend.inForce')}
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-[#FFBA00]" aria-hidden="true" />
              {t('legend.proposal')}
            </li>
          </ul>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-4 pb-6">
        <CommitteeLadder locale={locale} regulationsApproved={regulationsApproved} />
      </main>

      <ClassRepsSheet dir={locale === 'ru' ? 'ltr' : 'rtl'} />
    </div>
  )
}
