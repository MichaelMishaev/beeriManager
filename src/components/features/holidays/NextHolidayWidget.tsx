'use client'

import React, { useEffect, useState } from 'react'
import { Calendar, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Holiday } from '@/types'
import { format, differenceInDays, parseISO } from 'date-fns'
import { he, ru } from 'date-fns/locale'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'

interface NextHolidayWidgetProps {
  onClick?: () => void
}

export function NextHolidayWidget({ onClick }: NextHolidayWidgetProps) {
  const params = useParams()
  const locale = (params.locale || 'he') as Locale
  const [nextHoliday, setNextHoliday] = useState<Holiday | null>(null)
  const [loading, setLoading] = useState(true)

  // Get the appropriate date-fns locale
  const dateLocale = locale === 'ru' ? ru : he

  useEffect(() => {
    loadNextHoliday()
  }, [locale])

  async function loadNextHoliday() {
    try {
      const response = await fetch(`/api/holidays?upcoming=true&limit=1&locale=${locale}`)
      const data = await response.json()

      if (data.success && data.data.length > 0) {
        setNextHoliday(data.data[0])
      }
    } catch (error) {
      console.error('Error loading next holiday:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-6 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!nextHoliday) {
    return null
  }

  const daysUntil = differenceInDays(parseISO(nextHoliday.start_date), new Date())
  const isToday = daysUntil === 0
  const isTomorrow = daysUntil === 1

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${nextHoliday.color}15, ${nextHoliday.color}05)`,
        borderColor: nextHoliday.color + '40'
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {locale === 'ru' ? 'Следующий праздник' : 'החג הבא'}
          </CardTitle>
          {nextHoliday.is_school_closed && (
            <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
              {locale === 'ru' ? 'Школа закрыта' : 'בית הספר סגור'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          {nextHoliday.icon_emoji && (
            <div className="text-4xl flex-shrink-0">
              {nextHoliday.icon_emoji}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold mb-1">
              {nextHoliday.hebrew_name}
            </h3>
            {nextHoliday.hebrew_date && (
              <p className="text-sm text-muted-foreground">
                {nextHoliday.hebrew_date}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {locale === 'ru'
                ? (isToday ? 'Сегодня!' : isTomorrow ? 'Завтра' : `Через ${daysUntil} ${daysUntil === 1 ? 'день' : daysUntil < 5 ? 'дня' : 'дней'}`)
                : (isToday ? 'היום!' : isTomorrow ? 'מחר' : `בעוד ${daysUntil} ימים`)
              }
            </span>
          </div>
          <div className="text-muted-foreground">
            {locale === 'ru'
              ? format(parseISO(nextHoliday.start_date), 'd MMMM', { locale: dateLocale })
              : format(parseISO(nextHoliday.start_date), 'd בMMMM', { locale: dateLocale })
            }
          </div>
        </div>

        {nextHoliday.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {nextHoliday.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
