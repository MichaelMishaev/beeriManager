'use client'

import React, { useEffect, useState } from 'react'
import { Sparkles, Clock, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShareButton } from '@/components/ui/share-button'
import { formatHolidayShareData } from '@/lib/utils/share-formatters'
import type { Holiday } from '@/types'
import { format, differenceInDays, parseISO, startOfDay } from 'date-fns'
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

  const today = startOfDay(new Date())
  const startDate = startOfDay(parseISO(nextHoliday.start_date))
  const endDate = startOfDay(parseISO(nextHoliday.end_date))

  // Check if holiday is currently ongoing
  const isOngoing = startDate <= today && endDate >= today

  // Calculate days until start
  const daysUntilStart = differenceInDays(startDate, today)

  const isStartToday = daysUntilStart === 0
  const isStartTomorrow = daysUntilStart === 1

  // Get the correct chevron icon for the locale direction
  const ChevronIcon = locale === 'he' ? ChevronLeft : ChevronRight

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] relative overflow-hidden"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={locale === 'ru' ? `Показать все праздники - ${nextHoliday.hebrew_name}` : `הצג את כל החגים - ${nextHoliday.hebrew_name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      style={{
        background: `linear-gradient(135deg, ${nextHoliday.color}15, ${nextHoliday.color}05)`,
        borderColor: nextHoliday.color + '40'
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {locale === 'ru' ? 'Следующий праздник' : 'החג הבא'}
          </CardTitle>
          <div className="flex items-center gap-2">
            {nextHoliday.is_school_closed && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                {locale === 'ru' ? 'Школа закрыта' : 'בית הספר סגור'}
              </Badge>
            )}
            <div onClick={(e) => e.stopPropagation()}>
              <ShareButton
                shareData={formatHolidayShareData(nextHoliday, locale)}
                variant="ghost"
                size="icon"
                locale={locale}
                className="h-8 w-8"
              />
            </div>
          </div>
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
              {isOngoing
                ? (locale === 'ru' ? `До ${format(endDate, 'd MMMM', { locale: dateLocale })}` : `עד ${format(endDate, 'd בMMMM', { locale: dateLocale })}`)
                : locale === 'ru'
                  ? (isStartToday ? 'Сегодня!' : isStartTomorrow ? 'Завтра' : `Через ${daysUntilStart} ${daysUntilStart === 1 ? 'день' : daysUntilStart < 5 ? 'дня' : 'дней'}`)
                  : (isStartToday ? 'היום!' : isStartTomorrow ? 'מחר' : `בעוד ${daysUntilStart} ימים`)
              }
            </span>
          </div>
          <div className="text-muted-foreground">
            {isOngoing
              ? (locale === 'ru' ? 'Сейчас' : 'כעת')
              : locale === 'ru'
                ? format(startDate, 'd MMMM', { locale: dateLocale })
                : format(startDate, 'd בMMMM', { locale: dateLocale })
            }
          </div>
        </div>

        {nextHoliday.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {nextHoliday.description}
          </p>
        )}

        {/* Clickability indicator - prominent CTA button style */}
        <div className="mt-4 pt-3 border-t border-current/10 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {locale === 'ru' ? 'Все праздники' : 'הצג את כל החגים'}
            </span>
            <ChevronIcon className="h-4 w-4 text-primary group-hover:translate-x-[-3px] transition-transform duration-300" />
          </div>
        </div>
      </CardContent>

      {/* Hover overlay effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${nextHoliday.color}15, transparent)`
        }}
      />
    </Card>
  )
}
