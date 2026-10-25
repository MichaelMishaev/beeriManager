'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ChevronLeft } from 'lucide-react'
import type { Locale } from '@/i18n/config'

type CardStatus = 'inForce' | 'pending' | 'proposal'

interface LadderCardProps {
  href: string
  title: string
  subtitle: string
  status?: CardStatus
  highlighted?: boolean
}

function StatusChip({ status }: { status: CardStatus }) {
  const t = useTranslations('committeeCorner')
  if (status === 'proposal') {
    return (
      <span className="shrink-0 rounded-full bg-[#FFE7A3] px-2 py-0.5 text-[11px] font-extrabold text-[#6B4700]">
        {t('proposalBadge')}
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-700">
        {t('status.pending')}
      </span>
    )
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#E6F6FB] px-2 py-0.5 text-[11px] font-bold text-[#0B5E75]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#0D98BA]" aria-hidden="true" />
      {t('status.inForce')}
    </span>
  )
}

function LadderCard({ href, title, subtitle, status, highlighted }: LadderCardProps) {
  const isProposal = status === 'proposal'
  return (
    <Link
      href={href}
      className={`flex min-h-[56px] items-center gap-3 rounded-xl px-3 py-2.5 transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA] focus-visible:ring-offset-2
        ${isProposal
          ? 'border-[1.5px] border-dashed border-[#E0A800] bg-[#FFFBF0] hover:bg-[#FFF5D9] active:bg-[#FFEFC2]'
          : `border bg-white hover:bg-[#0D98BA]/5 active:bg-[#0D98BA]/10 ${highlighted ? 'border-[#9FD3E2]' : 'border-[#D9E6EC]'}`}`}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-start">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[15px] font-extrabold leading-tight text-[#003153]">{title}</span>
          {status && <StatusChip status={status} />}
        </span>
        <span className={`text-xs leading-snug ${isProposal ? 'text-[#5E4A1F]' : 'text-[#506B7A]'}`}>
          {subtitle}
        </span>
      </span>
      <ChevronLeft className="h-5 w-5 shrink-0 text-[#4F6B7A] ltr:rotate-180" aria-hidden="true" />
    </Link>
  )
}

interface LevelProps {
  step: number
  label: string
  variant?: 'default' | 'highlighted' | 'proposal'
  children: React.ReactNode
}

function LadderLevel({ step, label, variant = 'default', children }: LevelProps) {
  const nodeClass =
    variant === 'highlighted'
      ? 'bg-[#0D98BA] text-white shadow-[0_0_0_4px_#D3EEF5]'
      : variant === 'proposal'
        ? 'border-2 border-dashed border-[#B37800] bg-white text-[#7A5200]'
        : 'bg-[#003153] text-white'

  return (
    <li className="relative flex gap-3" data-testid="ladder-level">
      <span
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold ${nodeClass}`}
        aria-hidden="true"
      >
        {step}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h2 className="mt-1.5 text-xs font-extrabold text-[#0B6F8A]">{label}</h2>
        {children}
      </div>
    </li>
  )
}

export function CommitteeLadder({ locale, regulationsApproved }: { locale: Locale; regulationsApproved: boolean }) {
  const t = useTranslations('committeeCorner')
  const regulationsState: CardStatus = regulationsApproved ? 'inForce' : 'pending'

  return (
    <ol className="relative flex flex-col gap-4" aria-label={t('ladder.label')}>
      {/* connecting line through the centres of the numbered nodes */}
      <span
        className="pointer-events-none absolute bottom-10 start-[15px] top-4 w-0.5 bg-[#C7DCE5]"
        aria-hidden="true"
      />

      <LadderLevel step={1} label={t('ladder.national')}>
        <LadderCard
          href={`/${locale}/mankal-circular`}
          title={t('mankalCircular.title')}
          subtitle={t('mankalCircular.subtitle')}
          status="inForce"
        />
      </LadderLevel>

      <LadderLevel step={2} label={t('ladder.municipal')}>
        <LadderCard
          href={`/${locale}/municipal-bylaws`}
          title={t('municipalBylaws.title')}
          subtitle={t('municipalBylaws.subtitle')}
          status="inForce"
        />
      </LadderLevel>

      <LadderLevel step={3} label={t('ladder.school')} variant="highlighted">
        <LadderCard
          href={`/${locale}/regulations`}
          title={t('regulations.title')}
          subtitle={t('regulations.subtitle')}
          status={regulationsState}
          highlighted
        />
        <LadderCard
          href={`/${locale}/protocols`}
          title={t('protocols.title')}
          subtitle={t('protocols.subtitle')}
          highlighted
        />
      </LadderLevel>

      <LadderLevel step={4} label={t('ladder.class')}>
        <LadderCard
          href={`/${locale}/class-committee-bylaws`}
          title={t('classBylaws.title')}
          subtitle={t('classBylaws.subtitle')}
          status="inForce"
        />
      </LadderLevel>
    </ol>
  )
}
