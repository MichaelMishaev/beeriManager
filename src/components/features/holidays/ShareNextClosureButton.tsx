'use client'

import React, { useEffect, useState } from 'react'
import { Share2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, parseISO, isAfter, isBefore, addDays, startOfDay } from 'date-fns'
import { he, ru } from 'date-fns/locale'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'
import type { Holiday } from '@/types'

export function ShareNextClosureButton() {
  const params = useParams()
  const locale = (params.locale || 'he') as Locale
  const dateLocale = locale === 'ru' ? ru : he
  const [nextClosure, setNextClosure] = useState<Holiday | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNextClosure()
  }, [locale])

  async function loadNextClosure() {
    try {
      setLoading(true)
      const response = await fetch(`/api/holidays?locale=${locale}`)
      const data = await response.json()

      if (data.success && data.data) {
        const today = startOfDay(new Date())
        const tomorrow = addDays(today, 1)
        const nextWeek = addDays(today, 7)

        // Find ongoing or upcoming school closures within the next 7 days
        const upcomingClosure = data.data.find((holiday: Holiday) => {
          if (!holiday.is_school_closed) return false

          const startDate = startOfDay(parseISO(holiday.start_date))
          const endDate = startOfDay(parseISO(holiday.end_date))

          // Show if:
          // 1. Closure is ongoing (started before/on today, ends in future)
          // 2. Closure starts in the future (tomorrow onwards)
          const isOngoing = startDate <= today && endDate >= today
          const isFuture = isAfter(startDate, today) && isBefore(startDate, nextWeek)

          return isOngoing || isFuture
        })

        setNextClosure(upcomingClosure || null)
      }
    } catch (error) {
      console.error('Error loading next closure:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!nextClosure) return

    const startDate = parseISO(nextClosure.start_date)
    const endDate = parseISO(nextClosure.end_date)
    const today = startOfDay(new Date())
    const tomorrow = addDays(today, 1)

    // Check if it's tomorrow
    const isTomorrow = startDate.getTime() === tomorrow.getTime()

    let whenText = ''
    if (isTomorrow) {
      whenText = locale === 'ru' ? '⚠️ ЗАВТРА' : '⚠️ מחר'
    } else {
      const formattedDate = format(startDate, locale === 'ru' ? 'd MMMM' : 'd בMMMM', { locale: dateLocale })
      whenText = locale === 'ru' ? `📅 ${formattedDate}` : `📅 ${formattedDate}`
    }

    const schoolClosedText = locale === 'ru' ? '🏫 ШКОЛА ЗАКРЫТА' : '🏫 בית הספר סגור'
    const hebrewDate = nextClosure.hebrew_date ? `\n(${nextClosure.hebrew_date})` : ''

    // Date range
    let dateRange = ''
    if (nextClosure.start_date !== nextClosure.end_date) {
      const endFormatted = format(endDate, locale === 'ru' ? 'd MMMM' : 'd בMMMM', { locale: dateLocale })
      const rangeText = locale === 'ru' ? 'по' : 'עד'
      dateRange = `\n${rangeText} ${endFormatted}`
    }

    const moreInfo = locale === 'ru'
      ? '\n\nПодробнее на https://beeri.online'
      : '\n\nלעוד מידע כנסו ל https://beeri.online'

    const text = `${whenText}\n\n*${nextClosure.hebrew_name}*${hebrewDate}${dateRange}\n\n${schoolClosedText}${moreInfo}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: locale === 'ru' ? 'Школа закрыта' : 'בית הספר סגור',
          text
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // Fallback to clipboard
          await navigator.clipboard.writeText(text)
          alert(locale === 'ru' ? 'Скопировано!' : 'הועתק!')
        }
      }
    } else {
      // Fallback to WhatsApp
      const encodedText = encodeURIComponent(text)
      window.open(`https://wa.me/?text=${encodedText}`, '_blank')
    }
  }

  if (loading || !nextClosure) {
    return null
  }

  const startDate = parseISO(nextClosure.start_date)
  const today = startOfDay(new Date())
  const tomorrow = addDays(today, 1)
  const isTomorrow = startDate.getTime() === tomorrow.getTime()

  let buttonText = ''
  if (isTomorrow) {
    buttonText = locale === 'ru' ? 'Завтра школа закрыта' : 'בית הספר סגור מחר'
  } else {
    // Check if it's a multi-day closure
    if (nextClosure.start_date !== nextClosure.end_date) {
      const endDate = parseISO(nextClosure.end_date)
      const startDay = format(startDate, 'd', { locale: dateLocale })
      const endDay = format(endDate, 'd', { locale: dateLocale })
      const month = format(startDate, 'MMMM', { locale: dateLocale })
      buttonText = locale === 'ru'
        ? `Школа закрыта ${startDay}-${endDay} ${month}`
        : `בית הספר סגור ${startDay}-${endDay} ב${month}`
    } else {
      const formattedDate = format(startDate, locale === 'ru' ? 'd MMMM' : 'd בMMMM', { locale: dateLocale })
      buttonText = locale === 'ru'
        ? `Школа закрыта ${formattedDate}`
        : `בית הספר סגור ${formattedDate}`
    }
  }

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className="gap-2 border-red-500 text-red-700 hover:bg-red-50 hover:text-red-800 font-medium"
    >
      <Share2 className="h-4 w-4" />
      {buttonText}
    </Button>
  )
}
