'use client'

import React, { useEffect, useState } from 'react'
import { Sparkles, Clock, Share2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Holiday } from '@/types'
import { format, differenceInDays, parseISO, startOfDay, addDays } from 'date-fns'
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

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click

    const startDate = parseISO(nextHoliday.start_date)
    const endDate = parseISO(nextHoliday.end_date)
    const today = startOfDay(new Date())
    const tomorrow = addDays(today, 1)

    // Check if it's tomorrow
    const isTomorrowDate = startDate.getTime() === tomorrow.getTime()
    const isTodayDate = startDate.getTime() === today.getTime()

    let whenText = ''
    if (isTodayDate) {
      whenText = locale === 'ru' ? '🔴 СЕГОДНЯ' : '🔴 היום'
    } else if (isTomorrowDate) {
      whenText = locale === 'ru' ? '⚠️ ЗАВТРА' : '⚠️ מחר'
    } else {
      const formattedDate = format(startDate, locale === 'ru' ? 'd MMMM' : 'd בMMMM', { locale: dateLocale })
      whenText = locale === 'ru' ? `📅 ${formattedDate}` : `📅 ${formattedDate}`
    }

    const schoolClosedText = nextHoliday.is_school_closed
      ? (locale === 'ru' ? '\n🏫 ШКОЛА ЗАКРЫТА' : '\n🏫 בית הספר סגור')
      : ''
    const hebrewDate = nextHoliday.hebrew_date ? `\n(${nextHoliday.hebrew_date})` : ''

    // Date range
    let dateRange = ''
    if (nextHoliday.start_date !== nextHoliday.end_date) {
      const endFormatted = format(endDate, locale === 'ru' ? 'd MMMM' : 'd בMMMM', { locale: dateLocale })
      const rangeText = locale === 'ru' ? 'по' : 'עד'
      dateRange = `\n${rangeText} ${endFormatted}`
    }

    const moreInfo = locale === 'ru'
      ? '\n\nПодробнее на https://beeri.online'
      : '\n\nלעוד מידע כנסו ל https://beeri.online'

    const text = `${whenText}\n\n*${nextHoliday.hebrew_name}*${hebrewDate}${dateRange}${schoolClosedText}${moreInfo}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: locale === 'ru' ? nextHoliday.hebrew_name : nextHoliday.hebrew_name,
          text
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(text)
          alert(locale === 'ru' ? 'Скопировано!' : 'הועתק!')
        }
      }
    } else {
      const encodedText = encodeURIComponent(text)
      window.open(`https://wa.me/?text=${encodedText}`, '_blank')
    }
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] relative"
      onClick={onClick}
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
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-primary/10"
              onClick={handleShare}
              title={locale === 'ru' ? 'Поделиться' : 'שיתוף'}
            >
              <Share2 className="h-4 w-4" />
            </Button>
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
      </CardContent>
    </Card>
  )
}
