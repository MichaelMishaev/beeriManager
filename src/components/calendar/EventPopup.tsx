'use client'

import { Calendar, MapPin, Users, AlertCircle, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  description?: string
  start_datetime: string
  end_datetime?: string
  location?: string
  event_type: 'general' | 'meeting' | 'fundraiser' | 'trip' | 'workshop'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
  registration_enabled: boolean
  max_attendees?: number
  current_attendees?: number
  requires_payment?: boolean
  payment_amount?: number
}

interface EventPopupProps {
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const eventTypeLabels = {
  general: 'כללי',
  meeting: 'ישיבה',
  fundraiser: 'גיוס כספים',
  trip: 'טיול',
  workshop: 'סדנה/הרצאה'
}

const eventTypeColors = {
  general: 'bg-blue-100 text-blue-800 border-blue-200',
  meeting: 'bg-purple-100 text-purple-800 border-purple-200',
  fundraiser: 'bg-green-100 text-green-800 border-green-200',
  trip: 'bg-orange-100 text-orange-800 border-orange-200',
  workshop: 'bg-indigo-100 text-indigo-800 border-indigo-200'
}

const priorityLabels = {
  low: 'נמוכה',
  normal: 'רגילה',
  high: 'גבוהה',
  urgent: 'דחוף'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
}

export default function EventPopup({ event, open, onOpenChange }: EventPopupProps) {
  if (!event) return null

  const startDate = new Date(event.start_datetime)
  const endDate = event.end_datetime ? new Date(event.end_datetime) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{event.title}</DialogTitle>
              <DialogDescription className="flex flex-wrap gap-2">
                <Badge className={eventTypeColors[event.event_type]}>
                  {eventTypeLabels[event.event_type]}
                </Badge>
                <Badge className={priorityColors[event.priority]}>
                  {priorityLabels[event.priority]}
                </Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Description */}
          {event.description && (
            <div>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* Date and Time */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">תאריך ושעה</div>
                <div className="text-sm text-muted-foreground">
                  {format(startDate, 'EEEE, d בMMMM yyyy', { locale: he })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(startDate, 'HH:mm')}
                  {endDate && ` - ${format(endDate, 'HH:mm')}`}
                </div>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">מיקום</div>
                  <div className="text-sm text-muted-foreground">
                    {event.location}
                  </div>
                </div>
              </div>
            )}

            {/* Registration */}
            {event.registration_enabled && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">הרשמה</div>
                  <div className="text-sm text-muted-foreground">
                    {event.current_attendees || 0} נרשמו
                    {event.max_attendees && ` מתוך ${event.max_attendees} מקומות`}
                  </div>
                  {event.max_attendees && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(((event.current_attendees || 0) / event.max_attendees) * 100, 100)}%`
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment */}
            {event.requires_payment && event.payment_amount && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">תשלום נדרש</div>
                  <div className="text-sm text-muted-foreground">
                    ₪{event.payment_amount}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button asChild className="flex-1">
              <Link href={`/events/${event.id}`}>
                <AlertCircle className="h-4 w-4 ml-2" />
                פרטים מלאים
              </Link>
            </Button>
            {event.registration_enabled && (
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/events/${event.id}#register`}>
                  <Users className="h-4 w-4 ml-2" />
                  הירשם לאירוע
                </Link>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
