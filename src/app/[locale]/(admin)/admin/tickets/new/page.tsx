'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TicketForm } from '@/components/features/tickets/TicketForm'
import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NewTicketPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(data: any) {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('הכרטיס נוצר בהצלחה!')
        router.push('/admin/tickets')
        router.refresh()
      } else {
        toast.error(result.error || 'שגיאה ביצירת הכרטיס')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      toast.error('שגיאה ביצירת הכרטיס')
      setIsSubmitting(false)
    }
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
        <h1 className="text-2xl md:text-3xl font-bold">כרטיס חדש</h1>
        <p className="text-muted-foreground mt-2">
          צור כרטיס חדש למשחקי ספורט, הצגות או אירועים
        </p>
      </div>

      <TicketForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  )
}
