'use client'

import { ShareButton } from '@/components/ui/share-button'
import { formatIssueShareData } from '@/lib/utils/share-formatters'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'

interface ShareIssueButtonProps {
  issue: {
    id: string
    title: string
    category: string
    priority: string
    status: string
    description?: string | null
  }
}

export function ShareIssueButton({ issue }: ShareIssueButtonProps) {
  const params = useParams()
  const locale = (params.locale || 'he') as Locale

  return (
    <ShareButton
      shareData={formatIssueShareData(issue, locale)}
      variant="outline"
      size="sm"
      locale={locale}
      className="w-full"
      label={locale === 'ru' ? 'Поделиться' : 'שתף'}
    />
  )
}
