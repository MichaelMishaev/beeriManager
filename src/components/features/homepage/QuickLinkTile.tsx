'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, type LucideIcon } from 'lucide-react'
import type { Locale } from '@/i18n/config'

interface QuickLinkTileProps {
  /** Route segment after the locale, e.g. `committee-corner` */
  href: string
  icon: LucideIcon
  title: string
  subtitle: string
  /** Tailwind classes for the icon badge background */
  badgeClassName: string
  /** Tailwind classes for the icon colour */
  iconClassName: string
}

export function QuickLinkTile({
  href,
  icon: Icon,
  title,
  subtitle,
  badgeClassName,
  iconClassName,
}: QuickLinkTileProps) {
  const params = useParams()
  const locale = (params.locale || 'he') as Locale

  return (
    <Link
      href={`/${locale}/${href}`}
      className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl
                 border-2 border-[#e5e5e5] bg-white p-3.5 md:p-4 shadow-[0_4px_0_#e5e5e5]
                 transition-all duration-150 hover:border-[#0D98BA]/60
                 active:translate-y-[2px] active:shadow-[0_2px_0_#e5e5e5]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA] focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between">
        <div
          className={`relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl
                      transition-transform duration-200 group-hover:scale-105 ${badgeClassName}`}
        >
          {/* Light glint across the badge — decorative, disabled for reduced-motion users */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3
                       bg-gradient-to-r from-transparent via-white/60 to-transparent
                       animate-shine-sweep motion-reduce:hidden"
          />
          <Icon className={`relative h-6 w-6 ${iconClassName}`} />
        </div>
        <ArrowLeft
          aria-hidden="true"
          className="h-5 w-5 flex-shrink-0 text-[#0D98BA] transition-transform duration-200
                     ltr:rotate-180 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1"
        />
      </div>
      <div className="min-w-0">
        <p className="font-bold leading-snug text-[#003153] transition-colors duration-200 group-hover:text-[#0D98BA]">
          {title}
        </p>
        <p className="mt-0.5 text-xs md:text-sm leading-snug text-gray-600 line-clamp-2">
          {subtitle}
        </p>
      </div>
    </Link>
  )
}
