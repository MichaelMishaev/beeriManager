'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { TicketForm } from '@/components/features/tickets/TicketForm'
import type { TicketFormData } from '@/components/features/tickets/TicketForm'
import { AdminPageHeader } from '@/components/features/admin'
import { toast } from 'sonner'

export default function NewTicketPage() {
  const t = useTranslations('admin.tickets')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(data: TicketFormData) {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        toast.success(t('new.success'))
        router.push('/admin/tickets')
        router.refresh()
      } else {
        toast.error(result.error || t('new.error'))
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      toast.error(t('new.error'))
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title={t('new.title')}
        subtitle={t('new.subtitle')}
        backHref="/admin/tickets"
      />
      <TicketForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  )
}
