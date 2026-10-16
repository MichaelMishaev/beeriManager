'use client'

import { Ticket as TicketIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TicketPlaceholderImageProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TicketPlaceholderImage({ size = 'md', className = '' }: TicketPlaceholderImageProps) {
  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-48 h-48',
    lg: 'w-full h-64'
  }

  const iconSizes = {
    sm: 'h-7 w-7',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  }

  const t = useTranslations('tickets')

  // Solid orange tile on a darker 3D edge (Duolingo icon style); navy icon keeps contrast
  return (
    <div
      className={`${sizeClasses[size]} ${className} rounded-2xl bg-[#FF8200] shadow-[0_4px_0_#c25e00] flex items-center justify-center`}
    >
      <div className="flex flex-col items-center">
        <TicketIcon className={`${iconSizes[size]} text-[#003153]`} strokeWidth={2.5} />
        {size !== 'sm' && (
          <div className="text-[#003153] text-sm font-extrabold mt-2">
            {t('placeholder')}
          </div>
        )}
      </div>
    </div>
  )
}
