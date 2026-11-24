'use client'

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils/cn'

interface AdminGroupProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

/** A white rounded card holding rows, with an optional title and grey explanation above it. */
export function AdminGroup({ title, description, children, className }: AdminGroupProps) {
  return (
    <section className={cn('space-y-2', className)}>
      {(title || description) && (
        <div className="px-1">
          {title && <h2 className="text-[13px] font-bold text-[#003153]">{title}</h2>}
          {description && <p className="mt-0.5 text-[11.5px] text-gray-500">{description}</p>}
        </div>
      )}
      <div className="divide-y divide-[#eef0f2] overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        {children}
      </div>
    </section>
  )
}

interface AdminRowProps {
  /** Renders a Link row with a trailing chevron. */
  href?: string
  /** Renders a button row with a trailing chevron. */
  onClick?: () => void
  icon?: LucideIcon
  /** Tint of the icon tile, e.g. 'bg-[#87CEEB]/30 text-[#003153]'. */
  iconClassName?: string
  /** Replaces the icon tile (e.g. a date tile). */
  leading?: ReactNode
  title: string
  subtitle?: ReactNode
  /** Orange count, hidden when 0 or undefined. */
  badge?: number
  /** Pills or buttons shown before the chevron. */
  trailing?: ReactNode
  testId?: string
}

const rowBase =
  'flex min-h-[44px] w-full items-center gap-3 px-3 py-3 text-start transition-colors'
const rowInteractive =
  'hover:bg-[#f7f8f9] active:bg-[#f1f2f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0D98BA]'

export function AdminRow({
  href,
  onClick,
  icon: Icon,
  iconClassName,
  leading,
  title,
  subtitle,
  badge,
  trailing,
  testId,
}: AdminRowProps) {
  const interactive = Boolean(href || onClick)

  const content = (
    <>
      {leading ??
        (Icon && (
          <span
            className={cn(
              'flex h-9 w-9 flex-none items-center justify-center rounded-[10px]',
              iconClassName ?? 'bg-[#eef0f2] text-[#003153]'
            )}
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
        ))}

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14.5px] font-semibold text-[#003153]">{title}</span>
        {subtitle && (
          <span className="mt-px block truncate text-xs text-gray-500">{subtitle}</span>
        )}
      </span>

      {badge !== undefined && badge > 0 && (
        <span
          className="flex-none rounded-full bg-[#FF8200] px-2 py-px text-[11.5px] font-bold text-white"
          data-testid={testId ? `${testId}-badge` : undefined}
        >
          {badge}
        </span>
      )}

      {trailing && <span className="flex flex-none items-center gap-2">{trailing}</span>}

      {interactive && (
        <ChevronRight
          className="h-[18px] w-[18px] flex-none text-[#b6bcc4] rtl:rotate-180"
          aria-hidden="true"
        />
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cn(rowBase, rowInteractive)} data-testid={testId}>
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(rowBase, rowInteractive)} data-testid={testId}>
        {content}
      </button>
    )
  }

  return (
    <div className={rowBase} data-testid={testId}>
      {content}
    </div>
  )
}
