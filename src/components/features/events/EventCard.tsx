'use client'

import React from 'react'
import { Calendar, MapPin, Users, Clock, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatHebrewDate, formatHebrewTime, getHebrewRelativeTime } from '@/lib/utils/date'
import { EVENT_TYPES, PRIORITY_LEVELS } from '@/lib/utils/constants'
import type { Event } from '@/types'
import Link from 'next/link'

interface EventCardProps {
  event: Event
  variant?: 'full' | 'compact' | 'minimal'
  showActions?: boolean
  onRegister?: () => void
  onEdit?: () => void
  className?: string
}

export function EventCard({
  event,
  variant = 'full',
  showActions = true,
  onRegister,
  onEdit,
  className = ''
}: EventCardProps) {
  const startDate = new Date(event.start_datetime)
  const endDate = event.end_datetime ? new Date(event.end_datetime) : null

  const getEventTypeColor = (type: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800 border-blue-200',
      meeting: 'bg-red-100 text-red-800 border-red-200',
      fundraiser: 'bg-green-100 text-green-800 border-green-200',
      trip: 'bg-purple-100 text-purple-800 border-purple-200',
      workshop: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    return colors[type as keyof typeof colors] || colors.general
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority as keyof typeof colors] || colors.normal
  }

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      ongoing: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow ${className}`}>
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.event_type).split(' ')[0]}`} />
          <div className="flex-1">
            <h4 className="font-medium text-sm">{event.title}</h4>
            <p className="text-xs text-muted-foreground">
              {getHebrewRelativeTime(startDate)}
              {event.location && ` • ${event.location}`}
            </p>
          </div>
        </div>
        {showActions && (
          <Button variant="ghost" asChild size="sm">
            <Link href={`/events/${event.id}`}>פרטים</Link>
          </Button>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg leading-tight">{event.title}</h3>
                {event.priority !== 'normal' && (
                  <Badge variant="outline" className={getPriorityColor(event.priority)}>
                    {PRIORITY_LEVELS[event.priority as keyof typeof PRIORITY_LEVELS]}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatHebrewDate(startDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatHebrewTime(startDate)}</span>
                </div>
              </div>
              {event.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
            <Badge className={getEventTypeColor(event.event_type)}>
              {EVENT_TYPES[event.event_type as keyof typeof EVENT_TYPES]}
            </Badge>
          </div>

          {event.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {event.description}
            </p>
          )}

          {showActions && (
            <div className="flex gap-2">
              <Button size="sm" asChild size="sm">
                <Link href={`/events/${event.id}`}>פרטים</Link>
              </Button>
              {event.registration_enabled && onRegister && (
                <Button variant="outline" size="sm" onClick={onRegister}>
                  הרשמה
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Full variant
  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl">{event.title}</CardTitle>
              {event.priority !== 'normal' && (
                <Badge variant="destructive" className={getPriorityColor(event.priority)}>
                  <Star className="h-3 w-3 ml-1" />
                  {PRIORITY_LEVELS[event.priority as keyof typeof PRIORITY_LEVELS]}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatHebrewDate(startDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {formatHebrewTime(startDate)}
                  {endDate && ` - ${formatHebrewTime(endDate)}`}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge className={getEventTypeColor(event.event_type)}>
              {EVENT_TYPES[event.event_type as keyof typeof EVENT_TYPES]}
            </Badge>
            <Badge variant="outline" className={getStatusColor(event.status)}>
              {event.status === 'published' && 'פורסם'}
              {event.status === 'draft' && 'טיוטה'}
              {event.status === 'ongoing' && 'בתהליך'}
              {event.status === 'completed' && 'הושלם'}
              {event.status === 'cancelled' && 'בוטל'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {event.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.location}</span>
          </div>
        )}

        {event.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Registration Info */}
        {event.registration_enabled && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">הרשמה לאירוע</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {event.current_attendees} נרשמו
                    {event.max_attendees && ` מתוך ${event.max_attendees}`}
                  </span>
                </div>
                {event.registration_deadline && (
                  <p className="text-xs text-muted-foreground mt-1">
                    הרשמה עד: {formatHebrewDate(event.registration_deadline)}
                  </p>
                )}
              </div>
              {onRegister && (
                <Button size="sm" onClick={onRegister}>
                  הרשמה
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Financial Info */}
        {(event.budget_allocated || event.requires_payment) && (
          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="text-sm font-medium mb-2">מידע כספי</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              {event.budget_allocated && (
                <div className="flex justify-between">
                  <span>תקציב מוקצב:</span>
                  <span>₪{event.budget_allocated.toLocaleString()}</span>
                </div>
              )}
              {event.budget_spent > 0 && (
                <div className="flex justify-between">
                  <span>הוצא:</span>
                  <span>₪{event.budget_spent.toLocaleString()}</span>
                </div>
              )}
              {event.requires_payment && event.payment_amount && (
                <div className="flex justify-between font-medium">
                  <span>עלות השתתפות:</span>
                  <span>₪{event.payment_amount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild size="sm">
              <Link href={`/events/${event.id}`}>
                צפייה מלאה
              </Link>
            </Button>

            {event.registration_enabled && onRegister && (
              <Button variant="outline" size="sm" onClick={onRegister}>
                <Users className="h-4 w-4 ml-2" />
                הרשמה לאירוע
              </Button>
            )}

            <Button variant="ghost" asChild size="sm">
              <Link href={`/events/${event.id}/share`}>
                שתף באמצעות WhatsApp
              </Link>
            </Button>

            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                עריכה
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}