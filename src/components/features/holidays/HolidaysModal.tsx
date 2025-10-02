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
import { he } from 'date-fns/locale'

interface HolidaysModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HolidaysModal({ open, onOpenChange }: HolidaysModalProps) {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(true)
  const [academicYear] = useState('תשפ״ה')

  useEffect(() => {
    if (open) {
      loadHolidays()
    }
  }, [open, academicYear])

  async function loadHolidays() {
    try {
      setLoading(true)
      const response = await fetch(`/api/holidays?academic_year=${academicYear}`)
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
    const text = holidays
      .map(h => {
        const start = parseISO(h.start_date)
        const end = parseISO(h.end_date)

        // Format dates with Hebrew month names
        let dateRange
        if (h.start_date === h.end_date) {
          // Single day
          dateRange = format(start, 'd בMMMM', { locale: he })
        } else {
          // Date range
          const startFormatted = format(start, 'd', { locale: he })
          const endFormatted = format(end, 'd בMMMM', { locale: he })
          dateRange = `${endFormatted} - ${startFormatted}`
        }

        const hebrewDate = h.hebrew_date ? `\n${h.hebrew_date}` : ''
        const schoolClosed = h.is_school_closed ? '\nבית הספר סגור' : ''

        return `${h.icon_emoji || '📅'} *${h.hebrew_name}*${hebrewDate}\n${dateRange}${schoolClosed}`
      })
      .join('\n\n')

    const fullText = `📆 *לוח חגים ומועדים*\nשנת הלימודים ${academicYear}\n\n${text}\n\n🔗 https://beeri.online/`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `לוח חגים ${academicYear}`,
          text: fullText
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(fullText)
      alert('הלוח הועתק ללוח!')
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
            לוח חגים ומועדים
          </DialogTitle>
          <DialogDescription>
            שנת הלימודים {academicYear}
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
            שיתוף
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-2 print:hidden"
          >
            <Download className="h-4 w-4" />
            הדפסה
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
              <p className="text-muted-foreground">לא נמצאו חגים לשנה זו</p>
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
                              בית הספר סגור
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1 text-sm">
                          <div className="text-muted-foreground">
                            {holiday.hebrew_date}
                          </div>
                          <div className="font-medium">
                            {format(parseISO(holiday.start_date), 'd בMMMM', { locale: he })}
                            {holiday.start_date !== holiday.end_date && (
                              <> - {format(parseISO(holiday.end_date), 'd בMMMM', { locale: he })}</>
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
