'use client'

import React, { useEffect, useState } from 'react'
import { ShareButton } from '@/components/ui/share-button'
import { formatHolidayShareData } from '@/lib/utils/share-formatters'
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
    <ShareButton
      shareData={formatHolidayShareData(nextClosure, locale)}
      variant="outline"
      size="sm"
      locale={locale}
      label={buttonText}
      className="w-full bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 hover:border-amber-400 font-medium shadow-sm"
    />
  )
}
