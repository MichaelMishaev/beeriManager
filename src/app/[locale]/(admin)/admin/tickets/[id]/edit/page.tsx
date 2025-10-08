'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TicketForm } from '@/components/features/tickets/TicketForm'
import { toast } from 'sonner'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Ticket } from '@/types'

export default function EditTicketPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadTicket()
  }, [params.id])

  async function loadTicket() {
    try {
      const response = await fetch(`/api/tickets/${params.id}`)
      const data = await response.json()
      if (data.success) {
        setTicket(data.data)
      } else {
        toast.error('הכרטיס לא נמצא')
        router.push('/admin/tickets')
      }
    } catch (error) {
      console.error('Error loading ticket:', error)
      toast.error('שגיאה בטעינת הכרטיס')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(data: any) {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/tickets/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('הכרטיס עודכן בהצלחה!')
        router.push('/admin/tickets')
        router.refresh()
      } else {
        toast.error(result.error || 'שגיאה בעדכון הכרטיס')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
      toast.error('שגיאה בעדכון הכרטיס')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!ticket) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild size="sm" className="mb-4">
          <Link href="/admin/tickets">
            <ArrowRight className="h-4 w-4 ml-2" />
            חזרה לרשימת כרטיסים
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">ערוך כרטיס</h1>
        <p className="text-muted-foreground mt-2">{ticket.title}</p>
      </div>

      <TicketForm ticket={ticket} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  )
}
