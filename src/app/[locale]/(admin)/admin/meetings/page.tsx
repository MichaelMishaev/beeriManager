'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, Users, ExternalLink, UsersRound } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { he, ru } from 'date-fns/locale'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import {
  AdminEmptyState,
  AdminGroup,
  AdminPageHeader,
  AdminRow,
  StatusPill,
} from '@/components/features/admin'
import type { Meeting } from '@/types'

export default function AdminMeetingsPage() {
  const t = useTranslations('admin.records.meetings')
  const locale = useLocale()
  const dateLocale = locale === 'ru' ? ru : he
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMeetings()
  }, [])

  async function fetchMeetings() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/meetings?_t=' + Date.now(), {
        cache: 'no-store'
      })
      const data = await response.json()

      if (data.success) {
        setMeetings(data.data)
      } else {
        toast.error(t('loadError'))
      }
    } catch (error) {
      console.error('Error fetching meetings:', error)
      toast.error(t('loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleMeetingStatus(id: string, currentIsOpen: boolean) {
    try {
      const response = await fetch(`/api/meetings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_open: !currentIsOpen,
          status: !currentIsOpen ? 'open' : 'closed'
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(currentIsOpen ? t('toastClosed') : t('toastOpened'))
        fetchMeetings()
      } else {
        toast.error(t('updateError'))
      }
    } catch (error) {
      console.error('Error toggling meeting:', error)
      toast.error(t('updateError'))
    }
  }

  const stats = {
    total: meetings.length,
    open: meetings.filter(m => m.is_open).length,
    closed: meetings.filter(m => !m.is_open).length,
    totalIdeas: meetings.reduce((sum, m) => sum + m.ideas_count, 0)
  }

  const statTiles: { key: string; label: string; value: number; className?: string }[] = [
    { key: 'total', label: t('statsTotal'), value: stats.total },
    { key: 'open', label: t('statsOpen'), value: stats.open, className: 'text-green-600' },
    { key: 'closed', label: t('statsClosed'), value: stats.closed, className: 'text-gray-600' },
    { key: 'ideas', label: t('statsIdeas'), value: stats.totalIdeas },
  ]

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        backHref="/admin/more"
        action={
          <Link
            href="/admin/meetings/new"
            aria-label={t('newMeeting')}
            data-testid="admin-meetings-new"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003153] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#003153]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA]"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-2">
        {statTiles.map((tile) => (
          <div
            key={tile.key}
            className="rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
          >
            <p className="truncate text-xs text-gray-500">{tile.label}</p>
            <p className={`mt-1 text-2xl font-bold text-[#003153] ${tile.className ?? ''}`}>
              {tile.value}
            </p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-white py-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#0D98BA] border-t-transparent" />
          <p className="text-sm text-gray-500">{t('loading')}</p>
        </div>
      ) : meetings.length === 0 ? (
        <AdminEmptyState
          icon={UsersRound}
          title={t('empty')}
          action={
            <Button asChild className="h-11 bg-[#003153] text-white hover:bg-[#003153]/90">
              <Link href="/admin/meetings/new">{t('newMeeting')}</Link>
            </Button>
          }
        />
      ) : (
        meetings.map((meeting) => (
          <AdminGroup key={meeting.id}>
            <AdminRow
              href={`/admin/meetings/${meeting.id}`}
              title={meeting.title}
              subtitle={
                <span className="flex items-center gap-3">
                  <span className="flex min-w-0 items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
                    <span className="truncate">
                      {format(new Date(meeting.meeting_date), 'PPP', { locale: dateLocale })}
                    </span>
                  </span>
                  <span className="flex flex-none items-center gap-1">
                    <Users className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('ideasCount', { count: meeting.ideas_count })}
                  </span>
                </span>
              }
              trailing={
                <StatusPill tone={meeting.is_open ? 'success' : 'neutral'}>
                  {meeting.is_open ? t('open') : t('closed')}
                </StatusPill>
              }
            />
            <div className="space-y-2 px-3 py-2">
              {meeting.description && (
                <p className="line-clamp-2 text-xs text-gray-500">{meeting.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="min-h-[44px]">
                  <Link href={`/meetings/${meeting.id}`} target="_blank">
                    <ExternalLink className="me-2 h-4 w-4" aria-hidden="true" />
                    {t('viewPage')}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[44px]"
                  onClick={() => toggleMeetingStatus(meeting.id, meeting.is_open)}
                >
                  {meeting.is_open ? t('close') : t('openAction')}
                </Button>
              </div>
            </div>
          </AdminGroup>
        ))
      )}
    </div>
  )
}
