'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Ticket as TicketIcon, Plus, Loader2, Trash2, CheckCircle, Info, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Link } from '@/i18n/navigation'
import {
  AdminPageHeader,
  AdminGroup,
  AdminRow,
  AdminEmptyState,
  StatusPill,
} from '@/components/features/admin'
import type { Ticket } from '@/types'
import { toast } from 'sonner'

type PillTone = 'success' | 'neutral' | 'warning' | 'danger' | 'info'

const STATUS_TONE: Record<Ticket['status'], PillTone> = {
  active: 'success',
  sold_out: 'danger',
  expired: 'neutral',
  draft: 'warning',
  finished: 'info',
}

interface ApiResult {
  success: boolean
  error?: string
  details?: string[]
}

export default function TicketsAdminPage() {
  const t = useTranslations('admin.tickets')
  const tc = useTranslations('admin.common')
  const locale = useLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'he-IL'

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [finishDialogOpen, setFinishDialogOpen] = useState(false)
  const [ticketToFinish, setTicketToFinish] = useState<Ticket | null>(null)

  useEffect(() => {
    loadTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadTickets() {
    try {
      const response = await fetch('/api/tickets?status=all')
      const data = await response.json()
      if (data.success) {
        setTickets(data.data || [])
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
      toast.error(t('list.loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('list.deleteConfirm'))) {
      return
    }

    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE'
      })

      const result: ApiResult = await response.json()

      if (result.success) {
        toast.success(t('list.deleteSuccess'))
        loadTickets()
      } else {
        toast.error(result.error || t('list.deleteError'))
      }
    } catch (error) {
      console.error('Error deleting ticket:', error)
      toast.error(t('list.deleteError'))
    }
  }

  function openFinishDialog(ticket: Ticket) {
    setTicketToFinish(ticket)
    setFinishDialogOpen(true)
  }

  async function confirmFinish() {
    if (!ticketToFinish) return

    try {
      // Only send fields that are in the API schema, exclude metadata fields
      const ticketData: Record<string, unknown> = { ...ticketToFinish }
      delete ticketData.id
      delete ticketData.created_at
      delete ticketData.updated_at
      delete ticketData.created_by

      const response = await fetch(`/api/tickets/${ticketToFinish.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ticketData,
          status: 'finished'
        })
      })

      const result: ApiResult = await response.json()

      if (result.success) {
        toast.success(t('list.finishSuccess'))
        setFinishDialogOpen(false)
        setTicketToFinish(null)
        loadTickets()
      } else {
        console.error('Ticket update failed:', result)
        console.error('Validation details:', result.details)
        console.error('Sent data:', { ...ticketData, status: 'finished' })

        // Check if error is due to 'finished' status not being supported yet
        const isFinishedStatusError = result.details?.some((msg: string) =>
          msg.includes('status') || msg.includes('Invalid enum value')
        )

        if (isFinishedStatusError) {
          toast.error(t('list.finishNotDeployed'))
          console.error('Waiting for Vercel deployment to complete...')
        } else {
          toast.error(result.error || t('list.updateError'))
        }

        if (result.details) {
          console.error('Detailed errors:', result.details)
        }
      }
    } catch (error) {
      console.error('Error finishing ticket:', error)
      toast.error(t('list.updateError'))
    }
  }

  const newTicketAction = (
    <Link
      href="/admin/tickets/new"
      aria-label={t('list.newTicket')}
      data-testid="admin-tickets-new"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003153] text-white shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#003153]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA]"
    >
      <Plus className="h-5 w-5" aria-hidden="true" />
    </Link>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label={tc('loading')}>
        <Loader2 className="h-8 w-8 animate-spin text-[#0D98BA]" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div>
      <AdminPageHeader
        title={t('list.title')}
        subtitle={t('list.subtitle')}
        action={newTicketAction}
      />

      {tickets.length === 0 ? (
        <AdminEmptyState
          icon={TicketIcon}
          title={t('list.emptyTitle')}
          action={
            <Button asChild className="min-h-[44px]">
              <Link href="/admin/tickets/new">
                <Plus className="h-4 w-4 me-2" aria-hidden="true" />
                {t('list.createFirst')}
              </Link>
            </Button>
          }
        />
      ) : (
        <AdminGroup>
          {tickets.map((ticket) => {
            const teams =
              ticket.team_home && ticket.team_away
                ? t('list.teams', { home: ticket.team_home, away: ticket.team_away })
                : null
            const dateText = ticket.event_date
              ? new Date(ticket.event_date).toLocaleDateString(dateLocale)
              : null
            const subtitle = [dateText, teams].filter(Boolean).join(' · ')
            const quantityText =
              ticket.quantity_available === null || ticket.quantity_available === undefined
                ? t('list.unlimited')
                : t('list.quantityOf', {
                    left: ticket.quantity_available - ticket.quantity_sold,
                    total: ticket.quantity_available,
                  })

            return (
              <div key={ticket.id} data-testid="admin-ticket-item">
                <AdminRow
                  href={`/admin/tickets/${ticket.id}/edit`}
                  icon={TicketIcon}
                  iconClassName="bg-[#FFBA00]/25 text-[#003153]"
                  title={ticket.title}
                  subtitle={subtitle || undefined}
                  trailing={
                    <>
                      {ticket.featured && <StatusPill tone="info">{t('list.featured')}</StatusPill>}
                      <StatusPill tone={STATUS_TONE[ticket.status]}>
                        {t(`status.${ticket.status}`)}
                      </StatusPill>
                    </>
                  }
                />

                <div className="space-y-1 px-3 pb-2 text-xs text-gray-500">
                  {ticket.description && (
                    <p className="line-clamp-2">{ticket.description}</p>
                  )}
                  <p>
                    {t('list.quantityAvailable')}{' '}
                    <span className="font-medium text-[#003153]">{quantityText}</span>
                    {ticket.price_per_ticket !== null && ticket.price_per_ticket !== undefined && (
                      <>
                        {' · '}
                        {t('list.price')}{' '}
                        <span className="font-medium text-[#003153]">₪{ticket.price_per_ticket}</span>
                      </>
                    )}
                  </p>
                  {ticket.venue && (
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
                      <span className="truncate">{ticket.venue}</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-2 px-3 pb-3">
                  {ticket.status !== 'finished' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-[44px] flex-1 border-[#0D98BA]/40 text-[#003153]"
                      onClick={() => openFinishDialog(ticket)}
                    >
                      <CheckCircle className="h-4 w-4 me-2" aria-hidden="true" />
                      {t('list.finishEvent')}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-[44px] flex-1 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(ticket.id)}
                  >
                    <Trash2 className="h-4 w-4 me-2" aria-hidden="true" />
                    {tc('delete')}
                  </Button>
                </div>
              </div>
            )
          })}
        </AdminGroup>
      )}

      {/* Finish Event Confirmation Dialog */}
      <AlertDialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-[#87CEEB]/30 rounded-full">
                <Info className="h-6 w-6 text-[#003153]" aria-hidden="true" />
              </div>
              <AlertDialogTitle className="text-xl text-[#003153]">
                {t('finishDialog.title')}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-gray-700 leading-relaxed">
              {ticketToFinish && (
                <div className="space-y-3 mt-4">
                  <p className="font-semibold text-[#003153]">
                    {ticketToFinish.title}
                  </p>
                  <p>
                    {t('finishDialog.question')}
                  </p>
                  <div className="bg-[#87CEEB]/20 rounded-lg p-3 border border-[#87CEEB]/50">
                    <p className="text-sm text-[#003153]">
                      {t('finishDialog.info')}
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFinishDialogOpen(false)}>
              {tc('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmFinish}
              variant="default"
            >
              <CheckCircle className="h-4 w-4 me-2" aria-hidden="true" />
              {t('list.finishEvent')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
