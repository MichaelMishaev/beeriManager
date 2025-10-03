'use client'

import React, { useEffect, useState } from 'react'
import { Calendar, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Holiday } from '@/types'
import { format, parseISO } from 'date-fns'
import { he, ru } from 'date-fns/locale'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { Locale } from '@/i18n/config'

interface HolidaysModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HolidaysModal({ open, onOpenChange }: HolidaysModalProps) {
  const params = useParams()
  const locale = (params.locale || 'he') as Locale
  const t = useTranslations('calendar')
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(true)
  const [academicYear] = useState('תשפ״ה')

  // Get the appropriate date-fns locale
  const dateLocale = locale === 'ru' ? ru : he

  useEffect(() => {
    if (open) {
      loadHolidays()
    }
  }, [open, academicYear, locale])

  async function loadHolidays() {
    try {
      setLoading(true)
      // Don't filter by academic_year to show all holidays including past ones
      const response = await fetch(`/api/holidays?locale=${locale}&limit=100`)
      const data = await response.json()

      if (data.success) {
        setHolidays(data.data || [])
      }
    } catch (error) {
      console.error('Error loading holidays:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const schoolClosedText = locale === 'ru' ? 'Школа закрыта' : 'בית הספר סגור'
    const text = holidays
      .map(h => {
        const start = parseISO(h.start_date)
        const end = parseISO(h.end_date)

        // Format dates with locale-specific month names
        let dateRange
        if (h.start_date === h.end_date) {
          // Single day
          dateRange = locale === 'ru'
            ? format(start, 'd MMMM', { locale: dateLocale })
            : format(start, 'd בMMMM', { locale: dateLocale })
        } else {
          // Date range
          const startFormatted = format(start, 'd', { locale: dateLocale })
          const endFormatted = locale === 'ru'
            ? format(end, 'd MMMM', { locale: dateLocale })
            : format(end, 'd בMMMM', { locale: dateLocale })
          dateRange = `${endFormatted} - ${startFormatted}`
        }

        const hebrewDate = h.hebrew_date ? `\n${h.hebrew_date}` : ''
        const schoolClosed = h.is_school_closed ? `\n${schoolClosedText}` : ''

        return `${h.icon_emoji || '📅'} *${h.hebrew_name}*${hebrewDate}\n${dateRange}${schoolClosed}`
      })
      .join('\n\n')

    const modalTitle = t('holidaysAndEvents')
    const moreInfo = locale === 'ru'
      ? 'Подробнее на https://beeri.online'
      : 'לעוד מידע כנסו ל https://beeri.online'
    const fullText = `📆 *${modalTitle}*\n${t('schoolYearHolidays')}\n\n${text}\n\n${moreInfo}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${modalTitle} ${academicYear}`,
          text: fullText
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(fullText)
      const copiedText = locale === 'ru' ? 'Скопировано в буфер обмена!' : 'הלוח הועתק ללוח!'
      alert(copiedText)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            {t('holidaysAndEvents')}
          </DialogTitle>
          <DialogDescription>
            {t('schoolYearHolidays')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            {t('share')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-2 print:hidden"
          >
            <Download className="h-4 w-4" />
            {t('print')}
          </Button>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : holidays.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {locale === 'ru' ? 'Праздники не найдены' : 'לא נמצאו חגים לשנה זו'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {holidays.map((holiday) => {
                const isPast = parseISO(holiday.end_date) < new Date()

                return (
                  <div
                    key={holiday.id}
                    className="p-4 rounded-lg border transition-all hover:shadow-md"
                    style={{
                      background: isPast
                        ? '#f5f5f5'
                        : `linear-gradient(135deg, ${holiday.color}20, ${holiday.color}08)`,
                      borderColor: holiday.color + '40',
                      opacity: isPast ? 0.6 : 1
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {holiday.icon_emoji && (
                        <div className="text-3xl flex-shrink-0">
                          {holiday.icon_emoji}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-lg font-bold">
                            {holiday.hebrew_name}
                          </h3>
                          {holiday.is_school_closed && (
                            <Badge
                              variant="secondary"
                              className="bg-red-100 text-red-800 text-xs flex-shrink-0"
                            >
                              {locale === 'ru' ? 'Школа закрыта' : 'בית הספר סגור'}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1 text-sm">
                          <div className="text-muted-foreground">
                            {holiday.hebrew_date}
                          </div>
                          <div className="font-medium">
                            {locale === 'ru'
                              ? format(parseISO(holiday.start_date), 'd MMMM', { locale: dateLocale })
                              : format(parseISO(holiday.start_date), 'd בMMMM', { locale: dateLocale })
                            }
                            {holiday.start_date !== holiday.end_date && (
                              <> - {locale === 'ru'
                                ? format(parseISO(holiday.end_date), 'd MMMM', { locale: dateLocale })
                                : format(parseISO(holiday.end_date), 'd בMMMM', { locale: dateLocale })
                              }</>
                            )}
                          </div>
                        </div>

                        {holiday.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {holiday.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <div className="text-xs text-muted-foreground text-center mt-4 print:block">
          נוצר באמצעות מערכת ניהול ועד הורים • beeri.online
        </div>
      </DialogContent>
    </Dialog>
  )
}
