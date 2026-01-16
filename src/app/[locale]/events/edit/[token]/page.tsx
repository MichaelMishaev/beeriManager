'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ChevronLeft, Loader2, AlertCircle, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EventForm } from '@/components/features/events/EventForm'
import { EditLinkShare } from '@/components/features/events/EditLinkShare'
import type { Event } from '@/types'

interface PageProps {
  params: Promise<{ token: string }>
}

export default function TokenEditEventPage({ params }: PageProps) {
  const { token } = use(params)
  const router = useRouter()
  const t = useTranslations('myEvents')

  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/token/${token}`)
        const data = await response.json()

        if (data.success && data.data) {
          setEvent(data.data)
        } else {
          setError(t('eventNotFound'))
        }
      } catch {
        setError(t('eventNotFound'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [token, t])

  const handleSubmit = async (formData: Record<string, unknown>) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/events/token/${token}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setEvent(data.data)
        // Show success briefly then scroll to top
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
      } else {
        setError(data.error || 'שגיאה בעדכון האירוע')
      }
    } catch {
      setError('שגיאה בעדכון האירוע')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/my-events')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href="/my-events"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('backToMyEvents')}
        </Link>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              {t('eventNotFound')}
            </h2>
            <p className="text-red-600 mb-4">
              {t('eventNotFoundDescription')}
            </p>
            <Button asChild variant="outline">
              <Link href="/my-events">{t('backToMyEvents')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/my-events"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('backToMyEvents')}
        </Link>
        <h1 className="text-2xl font-bold">{t('editEvent')}</h1>
        {event && (
          <p className="text-muted-foreground mt-1">{event.title}</p>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-green-800">
              <Save className="h-5 w-5" />
              <span className="font-medium">{t('eventUpdated')}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Link Share */}
      {event?.edit_token && (
        <EditLinkShare
          token={event.edit_token}
          eventTitle={event.title}
          variant="card"
          className="mb-6"
        />
      )}

      {/* Error Message */}
      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Form */}
      {event && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">פרטי האירוע</CardTitle>
          </CardHeader>
          <CardContent>
            <EventForm
              event={event}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
