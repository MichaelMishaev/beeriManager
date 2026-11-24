'use client'

import { Calendar, MessageSquare, MoreHorizontal, Sparkles, Ticket } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { AdminGroup, AdminPageHeader, AdminRow } from '@/components/features/admin'
import { useAdminCounts } from '@/hooks/useAdminCounts'

function SubtitleSkeleton() {
  return <span className="inline-block h-3 w-32 animate-pulse rounded bg-gray-200 align-middle" />
}

export default function AdminHubPage() {
  const t = useTranslations('admin.hub')
  const { counts, isLoading } = useAdminCounts()

  // Skeleton while loading; omitted entirely when the request failed (counts === null).
  const subtitle = (text: string | undefined) =>
    isLoading ? <SubtitleSkeleton /> : text

  const eventsText = counts
    ? [
        t('events.upcoming', { count: counts.events.upcoming }),
        counts.events.drafts > 0 ? t('events.drafts', { count: counts.events.drafts }) : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : undefined

  const highlightsText = counts
    ? t('highlights.active', { count: counts.highlights.active })
    : undefined

  const ticketsText = counts ? t('tickets.active', { count: counts.tickets.active }) : undefined

  const inboxText = counts
    ? t('inbox.summary', {
        feedback: counts.inbox.feedback,
        ideas: counts.inbox.ideas,
        survey: counts.inbox.survey,
      })
    : undefined

  return (
    <div className="space-y-5">
      <AdminPageHeader title={t('title')} hideBack />

      <AdminGroup title={t('contentGroup.title')} description={t('contentGroup.description')}>
        <AdminRow
          href="/admin/events"
          testId="hub-row-events"
          icon={Calendar}
          iconClassName="bg-[#87CEEB]/30 text-[#003153]"
          title={t('events.title')}
          subtitle={subtitle(eventsText)}
        />
        <AdminRow
          href="/admin/highlights"
          testId="hub-row-highlights"
          icon={Sparkles}
          iconClassName="bg-[#FFBA00]/20 text-[#003153]"
          title={t('highlights.title')}
          subtitle={subtitle(highlightsText)}
        />
        <AdminRow
          href="/admin/tickets"
          testId="hub-row-tickets"
          icon={Ticket}
          iconClassName="bg-[#FF8200]/15 text-[#003153]"
          title={t('tickets.title')}
          subtitle={subtitle(ticketsText)}
        />
      </AdminGroup>

      <AdminGroup title={t('parentsGroup.title')} description={t('parentsGroup.description')}>
        <AdminRow
          href="/admin/inbox"
          testId="hub-row-inbox"
          icon={MessageSquare}
          iconClassName="bg-[#0D98BA]/15 text-[#0D98BA]"
          title={t('inbox.title')}
          subtitle={subtitle(inboxText)}
          badge={counts ? counts.inbox.feedback + counts.inbox.ideas : undefined}
        />
      </AdminGroup>

      <AdminGroup>
        <AdminRow
          href="/admin/more"
          testId="hub-row-more"
          icon={MoreHorizontal}
          title={t('more.title')}
          subtitle={t('more.subtitle')}
        />
      </AdminGroup>
    </div>
  )
}
