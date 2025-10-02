'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle, Send, Calendar, X, Home } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function ComplaintPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showEventSelector, setShowEventSelector] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reporter_name: '',
    reporter_contact: ''
  })

  // Load events when event selector is shown
  useEffect(() => {
    if (showEventSelector && events.length === 0) {
      loadEvents()
    }
  }, [showEventSelector])

  async function loadEvents() {
    try {
      const response = await fetch('/api/events?limit=50')
      const result = await response.json()
      if (result.success) {
        // Filter future and recent events
        const now = new Date()
        const filtered = result.data.filter((event: any) => {
          const eventDate = new Date(event.event_date)
          const daysDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          return daysDiff > -7 && daysDiff < 30 // Last 7 days to next 30 days
        })
        setEvents(filtered)
      }
    } catch (error) {
      console.error('Error loading events:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('נא למלא את שדה הבעיה')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: 'complaint',
          subject: formData.title,
          message: formData.description || formData.title,
          parent_name: formData.reporter_name || null,
          contact_email: formData.reporter_contact || null,
          is_anonymous: !formData.reporter_name,
          rating: undefined
        })
      })

      const result = await response.json()

      if (result.success) {
        setIsSubmitted(true)
        toast.success('התלונה נקלטה בהצלחה!')
      } else {
        toast.error(result.error || 'שגיאה בשליחת התלונה')
      }
    } catch (error) {
      console.error('Error submitting complaint:', error)
      toast.error('שגיאה בשליחת התלונה')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success confirmation screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-8 pb-8 px-6 text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-6">
                <CheckCircle className="h-20 w-20 text-green-600" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-green-600">התלונה נקלטה בהצלחה!</h1>
              <p className="text-lg text-muted-foreground">
                תודה על הפנייה. ועד ההורים יטפל בבעיה בהקדם האפשרי.
              </p>
            </div>

            <div className="pt-6">
              <Button
                onClick={() => router.push('/')}
                size="lg"
                className="w-full h-14 text-lg"
              >
                <Home className="h-5 w-5 ml-2" />
                חזרה לדף הבית
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Complaint form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 pb-6">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="rounded-full bg-blue-100 p-3">
                <AlertTriangle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">דיווח על בעיה</h1>
            <p className="text-sm text-muted-foreground">
              שתפו אותנו בבעיה ונטפל בה בהקדם
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-base">מה הבעיה? *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="לדוגמה: תקלה בחצר בית הספר"
                required
                className="mt-1.5 text-base h-11"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-base">פרטים נוספים (אופציונלי)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="תארו את הבעיה בקצרה..."
                rows={3}
                className="mt-1.5 text-base"
              />
            </div>

            <div>
              <Label htmlFor="reporter_name" className="text-base">שם מלא (אופציונלי)</Label>
              <Input
                id="reporter_name"
                value={formData.reporter_name}
                onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
                placeholder="שם ושם משפחה"
                className="mt-1.5 text-base h-11"
              />
            </div>

            <div>
              <Label htmlFor="reporter_contact" className="text-base">טלפון (אופציונלי)</Label>
              <Input
                id="reporter_contact"
                type="tel"
                value={formData.reporter_contact}
                onChange={(e) => setFormData({ ...formData, reporter_contact: e.target.value })}
                placeholder="050-1234567"
                className="mt-1.5 text-base h-11"
                dir="ltr"
              />
            </div>

            {/* Event connection section */}
            {!showEventSelector ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEventSelector(true)}
                className="w-full h-11"
              >
                <Calendar className="h-4 w-4 ml-2" />
                קשור לאירוע (אופציונלי)
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base">בחר אירוע</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowEventSelector(false)
                      setSelectedEventId(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Select value={selectedEventId || undefined} onValueChange={setSelectedEventId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="בחר אירוע..." />
                  </SelectTrigger>
                  <SelectContent>
                    {events.length === 0 ? (
                      <SelectItem value="none" disabled>אין אירועים זמינים</SelectItem>
                    ) : (
                      events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} - {new Date(event.event_date).toLocaleDateString('he-IL')}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base mt-6"
              size="lg"
            >
              {isSubmitting ? (
                <>שולח...</>
              ) : (
                <>
                  <Send className="h-5 w-5 ml-2" />
                  שלח תלונה
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}