import * as React from "react"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, formatHebrewDateTime } from "@/lib/utils"

interface Event {
  id: string
  title: string
  description?: string
  start_datetime: string
  end_datetime?: string
  location?: string
  event_type: 'general' | 'meeting' | 'fundraiser' | 'trip' | 'workshop'
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  current_attendees: number
  max_attendees?: number
  registration_enabled: boolean
  qr_code_url?: string
}

interface EventCardProps {
  event: Event
  variant?: 'full' | 'compact'
  showActions?: boolean
  onRegister?: () => void
  onEdit?: () => void
  onView?: () => void
  className?: string
}

const eventTypeLabels = {
  general: 'כללי',
  meeting: 'פגישה',
  fundraiser: 'התרמה',
  trip: 'טיול',
  workshop: 'סדנה'
}

const priorityColors = {
  low: 'secondary',
  normal: 'default',
  high: 'warning',
  urgent: 'urgent'
} as const

const priorityLabels = {
  low: 'נמוך',
  normal: 'רגיל',
  high: 'גבוה',
  urgent: 'דחוף'
}

export function EventCard({
  event,
  variant = 'full',
  showActions = true,
  onRegister,
  onEdit,
  onView,
  className
}: EventCardProps) {
  const startDate = new Date(event.start_datetime)
  const isUpcoming = startDate > new Date()
  const canRegister = event.registration_enabled && event.status === 'published' && isUpcoming

  const attendanceText = event.max_attendees
    ? `${event.current_attendees} מתוך ${event.max_attendees}`
    : `${event.current_attendees} נרשמו`

  const isFull = event.max_attendees && event.current_attendees >= event.max_attendees

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-200 border-r-4 border-r-primary/20",
        event.priority === 'urgent' && "border-r-red-500 shadow-red-100",
        event.priority === 'high' && "border-r-yellow-500",
        className
      )}
      data-testid="event-card"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-right leading-tight">
              {event.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2 justify-end flex-wrap">
              <Badge variant={priorityColors[event.priority]} className="text-xs">
                {priorityLabels[event.priority]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {eventTypeLabels[event.event_type]}
              </Badge>
              {!isUpcoming && (
                <Badge variant="secondary" className="text-xs">
                  הסתיים
                </Badge>
              )}
              {isFull && canRegister && (
                <Badge variant="destructive" className="text-xs">
                  מלא
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {variant === 'full' && event.description && (
          <p className="text-sm text-muted-foreground text-right leading-relaxed">
            {event.description}
          </p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 justify-end">
            <span className="font-medium text-right">
              {formatHebrewDateTime(startDate)}
            </span>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>

          {event.location && (
            <div className="flex items-center gap-2 justify-end">
              <span className="text-right">{event.location}</span>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          <div className="flex items-center gap-2 justify-end">
            <span
              className={cn(
                "text-right",
                isFull ? "text-red-600 font-medium" : "text-muted-foreground"
              )}
            >
              {attendanceText}
            </span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>

          {event.end_datetime && (
            <div className="flex items-center gap-2 justify-end text-xs text-muted-foreground">
              <span className="text-right">
                עד {formatHebrewDateTime(new Date(event.end_datetime))}
              </span>
              <Clock className="h-3 w-3" />
            </div>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="flex gap-2 justify-start pt-3">
          <Button
            variant="outline"
            size="sm"
            size="sm" onClick={onView}
            className="flex-1"
          >
            פרטים
          </Button>

          {canRegister && !isFull && (
            <Button
              size="sm"
              size="sm" onClick={onRegister}
              className="flex-1"
            >
              {event.registration_enabled ? 'הרשמה' : 'הצטרף'}
            </Button>
          )}

          {isFull && canRegister && (
            <Button
              variant="secondary"
              size="sm"
              disabled
              className="flex-1"
            >
              מלא
            </Button>
          )}

          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              size="sm" onClick={onEdit}
            >
              עריכה
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

// Compact version for mobile or lists
export function EventCardCompact({ event, ...props }: EventCardProps) {
  return (
    <EventCard
      {...props}
      event={event}
      variant="compact"
      className={cn("p-3", props.className)}
    />
  )
}