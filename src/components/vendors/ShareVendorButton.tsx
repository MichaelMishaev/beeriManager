'use client'

import { ShareButton } from '@/components/ui/share-button'
import { formatVendorShareData } from '@/lib/utils/share-formatters'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'

interface ShareVendorButtonProps {
  vendor: {
    id: string
    name: string
    category: string
    phone?: string | null
    email?: string | null
    description?: string | null
  }
  size?: 'sm' | 'default' | 'lg' | 'icon'
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}

export function ShareVendorButton({ vendor, size = 'sm', variant = 'outline', className }: ShareVendorButtonProps) {
  const params = useParams()
  const locale = (params.locale || 'he') as Locale

  return (
    <ShareButton
      shareData={formatVendorShareData(vendor, locale)}
      variant={variant}
      size={size}
      locale={locale}
      className={className}
      label={locale === 'ru' ? 'Поделиться' : 'שתף'}
    />
  )
}
