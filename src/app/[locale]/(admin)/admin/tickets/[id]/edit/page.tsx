'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { TicketForm } from '@/components/features/tickets/TicketForm'
import type { TicketFormData } from '@/components/features/tickets/TicketForm'
import { AdminPageHeader } from '@/components/features/admin'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { Ticket } from '@/types'

export default function EditTicketPage({ params }: { params: { id: string } }) {
  const t = useTranslations('admin.tickets')
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadTicket()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  async function loadTicket() {
    try {
      const response = await fetch(`/api/tickets/${params.id}`)
      const data = await response.json()
      if (data.success) {
        setTicket(data.data)
      } else {
        toast.error(t('edit.notFound'))
        router.push('/admin/tickets')
      }
    } catch (error) {
      console.error('Error loading ticket:', error)
      toast.error(t('edit.loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(data: TicketFormData) {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/tickets/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        toast.success(t('edit.success'))
        router.push('/admin/tickets')
        router.refresh()
      } else {
        toast.error(result.error || t('edit.error'))
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
      toast.error(t('edit.error'))
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0D98BA]" aria-hidden="true" />
      </div>
    )
  }

  if (!ticket) {
    return null
  }

  return (
    <div>
      <AdminPageHeader
        title={t('edit.title')}
        subtitle={ticket.title}
        backHref="/admin/tickets"
      />
      <TicketForm ticket={ticket} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  )
}
