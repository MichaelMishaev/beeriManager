'use client'

import { useState } from 'react'
import { Send, Star, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface EventFeedbackFormProps {
  eventId: string
  eventTitle: string
}

export function EventFeedbackForm({ eventId, eventTitle }: EventFeedbackFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!rating) {
      toast.error('נא לבחור דירוג')
      return
    }

    if (!message.trim()) {
      toast.error('נא להזין הודעה')
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
          event_id: eventId,
          rating,
          message: message.trim(),
          category: 'event',
          subject: `משוב על אירוע: ${eventTitle}`,
          is_anonymous: true
        })
      })

      const result = await response.json()

      if (result.success) {
        setIsSubmitted(true)
        toast.success('המשוב נשלח בהצלחה!')
        // Reset form after 3 seconds
        setTimeout(() => {
          setRating(0)
          setMessage('')
          setIsSubmitted(false)
        }, 3000)
      } else {
        toast.error(result.error || 'שגיאה בשליחת המשוב')
      }
    } catch (error) {
      toast.error('שגיאה בשליחת המשוב')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="py-8 text-center">
          <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            תודה על המשוב!
          </h3>
          <p className="text-sm text-green-700">
            המשוב שלכם עוזר לנו לשפר את האירועים הבאים
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          שליחת משוב על האירוע
        </CardTitle>
        <CardDescription>
          המשוב שלכם חשוב לנו! שתפו אותנו בחוויה שלכם מהאירוע "{eventTitle}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <Label className="mb-2 block text-sm">איך היה האירוע? *</Label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
 onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                  <Star
                    className={cn(
                      'h-7 w-7 transition-colors',
                      (rating >= star) || (hoveredRating >= star)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="mr-2 text-xs text-muted-foreground">
                  {rating === 1 && 'לא טוב'}
                  {rating === 2 && 'בסדר'}
                  {rating === 3 && 'טוב'}
                  {rating === 4 && 'טוב מאוד'}
                  {rating === 5 && 'מעולה!'}
                </span>
              )}
            </div>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message" className="text-sm">ספרו לנו עוד... *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="מה אהבתם? מה אפשר לשפר? הצעות לעתיד..."
              rows={4}
              className="mt-1.5 text-sm"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {message.length} / 1000 תווים
            </p>
          </div>

          {/* Anonymous notice */}
          <div className="bg-muted/50 rounded-lg p-3 text-xs">
            <p className="text-muted-foreground">
              🔒 המשוב נשלח באופן אנונימי ולא ישויך אליכם באופן אישי
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !rating || !message.trim()}
            className="w-full"
            size="sm"
          >
            {isSubmitting ? (
              <>שולח...</>
            ) : (
              <>
                <Send className="h-3 w-3 ml-2" />
                שלח משוב
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}