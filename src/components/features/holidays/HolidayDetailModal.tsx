'use client'

import React from 'react'
import { format, parseISO } from 'date-fns'
import { he, ru } from 'date-fns/locale'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ShareButton } from '@/components/ui/share-button'
import { formatHolidayShareData } from '@/lib/utils/share-formatters'
import type { Holiday } from '@/types'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'

interface HolidayDetailModalProps {
  holiday: Holiday | null
  isOpen: boolean
  onClose: () => void
}

export function HolidayDetailModal({ holiday, isOpen, onClose }: HolidayDetailModalProps) {
  const params = useParams()
  const locale = (params.locale || 'he') as Locale
  const dateLocale = locale === 'ru' ? ru : he

  if (!holiday) return null

  const startDate = parseISO(holiday.start_date)
  const endDate = parseISO(holiday.end_date)
  const isSingleDay = holiday.start_date === holiday.end_date

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        {/* Header with gradient background */}
        <div
          className="p-6 text-white relative"
          style={{
            background: `linear-gradient(135deg, ${holiday.color}dd, ${holiday.color}99)`
          }}
        >
          <DialogClose className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4 text-white" />
            <span className="sr-only">סגור</span>
          </DialogClose>

          <div className="text-center">
            {holiday.icon_emoji && (
              <div className="text-6xl mb-4">{holiday.icon_emoji}</div>
            )}
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white text-center">
                {holiday.hebrew_name}
              </DialogTitle>
            </DialogHeader>
            {holiday.hebrew_date && (
              <p className="text-sm opacity-90 mt-2">{holiday.hebrew_date}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* School closure badge - PROMINENT */}
          {holiday.is_school_closed && (
            <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 text-center animate-in fade-in-50 slide-in-from-top-2 duration-300">
              <span className="text-2xl block mb-1">🏫</span>
              <p className="text-red-900 font-bold text-lg">{locale === 'ru' ? 'Школа закрыта' : 'בית הספר סגור'}</p>
            </div>
          )}

          {/* Date range */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
              <CalendarIcon className="h-4 w-4" />
              <span>{locale === 'ru' ? 'Даты' : 'תאריכים'}</span>
            </div>
            <p className="text-center font-medium">
              {isSingleDay ? (
                format(startDate, 'EEEE, d MMMM yyyy', { locale: dateLocale })
              ) : (
                <>
                  {format(startDate, 'd MMMM', { locale: dateLocale })}
                  {' - '}
                  {format(endDate, 'd MMMM yyyy', { locale: dateLocale })}
                </>
              )}
            </p>
          </div>

          {/* Description */}
          {holiday.description && (
            <div className="text-sm text-muted-foreground text-center leading-relaxed">
              {holiday.description}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <ShareButton
              shareData={formatHolidayShareData(holiday, locale)}
              variant="outline"
              size="lg"
              locale={locale}
              className="flex-1"
              label={locale === 'ru' ? 'Поделиться' : 'שיתוף'}
            />
            <Button
              onClick={onClose}
              variant="default"
              className="flex-1"
              size="lg"
            >
              {locale === 'ru' ? 'Закрыть' : 'סגור'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
