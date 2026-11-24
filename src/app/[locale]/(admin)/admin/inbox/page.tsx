'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AdminPageHeader, AdminSegmentedTabs } from '@/components/features/admin'
import { FeedbackPanel } from '@/components/features/admin/inbox/FeedbackPanel'
import { IdeasPanel } from '@/components/features/admin/inbox/IdeasPanel'
import { SkillsAdminDashboard } from '@/components/features/surveys/admin/SkillsAdminDashboard'
import { useAdminCounts } from '@/hooks/useAdminCounts'

type InboxTab = 'feedback' | 'ideas' | 'survey'

const TABS: InboxTab[] = ['feedback', 'ideas', 'survey']

function parseTab(value: string | null): InboxTab {
  return TABS.find((tab) => tab === value) ?? 'feedback'
}

function InboxContent() {
  const t = useTranslations('admin.inbox')
  const searchParams = useSearchParams()
  const urlTab = parseTab(searchParams.get('tab'))
  const { counts } = useAdminCounts()

  const [tab, setTab] = useState<InboxTab>(urlTab)
  // A panel is mounted the first time its tab is shown and then kept (hidden) so filters and
  // scroll context survive switching tabs.
  const [visited, setVisited] = useState<InboxTab[]>([urlTab])

  // Follow the URL (browser back/forward, deep links)
  useEffect(() => {
    setTab(urlTab)
    setVisited((prev) => (prev.includes(urlTab) ? prev : [...prev, urlTab]))
  }, [urlTab])

  const handleChange = useCallback((next: InboxTab) => {
    setTab(next)
    setVisited((prev) => (prev.includes(next) ? prev : [...prev, next]))
    // Update the URL without a reload; Next.js syncs useSearchParams with pushState
    const params = new URLSearchParams(window.location.search)
    params.set('tab', next)
    window.history.pushState(null, '', `${window.location.pathname}?${params.toString()}`)
  }, [])

  const tabs = [
    { value: 'feedback' as const, label: t('tabs.feedback'), count: counts?.inbox.feedback },
    { value: 'ideas' as const, label: t('tabs.ideas'), count: counts?.inbox.ideas },
    { value: 'survey' as const, label: t('tabs.survey'), count: counts?.inbox.survey },
  ]

  return (
    <>
      <AdminPageHeader title={t('title')} />
      <AdminSegmentedTabs tabs={tabs} value={tab} onChange={handleChange} />

      {visited.includes('feedback') && (
        <div hidden={tab !== 'feedback'} role="tabpanel" data-testid="inbox-panel-feedback">
          <FeedbackPanel />
        </div>
      )}
      {visited.includes('ideas') && (
        <div hidden={tab !== 'ideas'} role="tabpanel" data-testid="inbox-panel-ideas">
          <IdeasPanel />
        </div>
      )}
      {visited.includes('survey') && (
        <div hidden={tab !== 'survey'} role="tabpanel" data-testid="inbox-panel-survey">
          <SkillsAdminDashboard />
        </div>
      )}
    </>
  )
}

export default function AdminInboxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0D98BA] border-t-transparent" />
        </div>
      }
    >
      <InboxContent />
    </Suspense>
  )
}
