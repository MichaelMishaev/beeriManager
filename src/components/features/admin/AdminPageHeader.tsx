'use client'

import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

interface AdminPageHeaderProps {
  title: string
  /** Where the round back button goes. Default '/admin'. */
  backHref?: string
  /** Hide the back button (the hub does this). */
  hideBack?: boolean
  /** Trailing control, e.g. a round "+" link. Keep it at least 44x44. */
  action?: ReactNode
  subtitle?: string
}

export function AdminPageHeader({
  title,
  backHref = '/admin',
  hideBack = false,
  action,
  subtitle,
}: AdminPageHeaderProps) {
  const t = useTranslations('admin.common')

  return (
    <header className="mb-4 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2">
      <div className="flex justify-start">
        {!hideBack && (
          <Link
            href={backHref}
            aria-label={t('back')}
            data-testid="admin-header-back"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#003153] shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA]"
          >
            {/* ArrowLeft points to the reading start in LTR; rotated it does the same in RTL */}
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="min-w-0 text-center">
        <h1 className="truncate text-base font-bold text-[#003153]" data-testid="admin-header-title">
          {title}
        </h1>
        {subtitle && <p className="truncate text-xs text-gray-500">{subtitle}</p>}
      </div>

      <div className="flex justify-end">{action}</div>
    </header>
  )
}
