'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { GroceryEvent } from '@/types'
import { X, CheckCircle2, Link2, Copy, Check, Share2, MapPin, ShoppingBasket, ChevronLeft, Bookmark, ChevronRight } from 'lucide-react'
import { getEventIcon } from '@/lib/data/event-names'
import { EventTypeIcon } from './EventTypeIcon'

const PRODUCTION_URL = 'https://beeri.online'

interface GroceryShareSuccessProps {
  event: GroceryEvent
  onViewEvent: () => void
  onBackToDashboard?: () => void
}

export function GroceryShareSuccess({
  event,
  onViewEvent,
  onBackToDashboard
}: GroceryShareSuccessProps) {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('grocery')
  const router = useRouter()
  const locale = useLocale()

  const shareUrl = `${PRODUCTION_URL}/grocery/${event.share_token}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying link:', error)
    }
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `היי! \n\n` +
      `הצטרפו לרשימת הקניות ל${event.event_name} של ${event.class_name}\n\n` +
      `לחצו על הקישור, בחרו פריט ולחצו "אני אביא":\n${shareUrl}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  return (
    <div className="w-full max-w-[430px] flex flex-col min-h-screen bg-[#f6f8f7] dark:bg-[#102219] pb-10 font-[family-name:var(--font-jakarta)]">
      {/* TopAppBar Component */}
      <div className="flex items-center bg-[#f6f8f7] dark:bg-[#102219] p-4 pb-2 justify-between sticky top-0 z-10">
        <div className="text-[#0d1b14] dark:text-white flex size-12 shrink-0 items-center justify-start">
          <X className="h-6 w-6 cursor-pointer" onClick={onBackToDashboard} />
        </div>
        <h2 className="text-[#0d1b14] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12">
          הרשימה נוצרה
        </h2>
      </div>

      {/* Success EmptyState Header */}
      <div className="flex flex-col px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Success Visual */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-24 h-24 bg-[#13ec80]/20 rounded-full animate-pulse"></div>
            <div className="relative bg-[#13ec80] text-[#102219] size-20 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>
          <div className="flex max-w-[480px] flex-col items-center gap-2">
            <p className="text-[#0d1b14] dark:text-white text-2xl font-extrabold leading-tight tracking-[-0.015em] text-center">
              הרשימה נוצרה בהצלחה!
            </p>
            <p className="text-[#4c6659] dark:text-gray-400 text-sm font-normal leading-normal max-w-[320px] text-center">
              שתפו את הקישור עם ההורים בכיתה כדי שיוכלו לבחור מה להביא
            </p>
          </div>
        </div>
      </div>

      {/* ListItem (Link Preview) */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-4 bg-white dark:bg-[#1a2e24] px-4 py-3 rounded-xl border border-[#e0e8e4] dark:border-[#2a3d34] justify-between shadow-sm">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="text-[#13ec80] flex items-center justify-center rounded-lg bg-[#13ec80]/10 shrink-0 size-10">
              <Link2 className="h-5 w-5" />
            </div>
            <p className="text-[#0d1b14] dark:text-white text-sm font-medium leading-normal truncate">
              {shareUrl.replace(/^https?:\/\//, '')}
            </p>
          </div>
          <button
            onClick={handleCopyLink}
            className={`shrink-0 flex items-center justify-center size-10 rounded-full transition-colors ${
              copied ? 'bg-[#13ec80] text-[#0d1b14]' : 'text-[#13ec80] hover:bg-[#13ec80]/5'
            }`}
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>
        {copied && (
          <p className="text-center text-sm text-[#13ec80] mt-2 font-medium flex items-center justify-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            הקישור הועתק!
          </p>
        )}
      </div>

      {/* SingleButton (Primary CTA) */}
      <div className="flex px-4 py-3 mb-4">
        <button
          onClick={handleWhatsAppShare}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 flex-1 bg-[#25D366] hover:bg-[#22c55e] text-white gap-3 text-base font-bold leading-normal tracking-[0.015em] shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] transition-all active:scale-[0.98]"
        >
          <Share2 className="h-5 w-5" />
          <span className="truncate">שתף ב-WhatsApp</span>
        </button>
      </div>

      {/* Tip Callout - My Lists */}
      <div className="px-4 mb-6">
        <button
          onClick={() => router.push(`/${locale}/my-lists`)}
          className="w-full group"
        >
          <div className="flex items-center gap-3 bg-gradient-to-l from-[#13ec80]/5 to-[#0d98ba]/5 dark:from-[#13ec80]/10 dark:to-[#0d98ba]/10 backdrop-blur-sm px-4 py-3.5 rounded-xl border border-[#13ec80]/20 dark:border-[#13ec80]/30 transition-all hover:border-[#13ec80]/40 hover:shadow-[0_2px_12px_rgba(19,236,128,0.1)]">
            <div className="flex items-center justify-center shrink-0 size-10 rounded-full bg-[#13ec80]/10 dark:bg-[#13ec80]/20">
              <Bookmark className="h-5 w-5 text-[#13ec80]" />
            </div>
            <div className="flex-1 text-right min-w-0">
              <p className="text-[#0d1b14] dark:text-white text-sm font-semibold leading-tight">
                {t('successTipTitle')}
              </p>
              <p className="text-[#4c6659] dark:text-gray-400 text-xs leading-normal mt-0.5 line-clamp-2">
                {t('successTipMyLists')}
              </p>
            </div>
            <div className="flex items-center shrink-0">
              <ChevronRight className="h-5 w-5 text-[#13ec80] transform rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            </div>
          </div>
        </button>
      </div>

      {/* Card (Event Summary) */}
      <div className="px-4">
        <p className="text-[#0d1b14] dark:text-white text-sm font-bold px-1 mb-3">סיכום האירוע</p>
        <div className="flex items-stretch justify-between gap-4 rounded-xl bg-white dark:bg-[#1a2e24] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#e0e8e4] dark:border-[#2a3d34]">
          <div className="flex flex-[2_2_0px] flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-[#13ec80] text-xs font-bold uppercase tracking-wider">פרטים מאושרים</p>
              <p className="text-[#0d1b14] dark:text-white text-lg font-bold leading-tight">{event.event_name}</p>
              <p className="text-[#4c6659] dark:text-gray-400 text-sm font-normal leading-normal">
                {event.class_name}
                {event.event_date && ` - ${formatDate(event.event_date)}`}
                {event.event_time && `, ${event.event_time}`}
              </p>
              {event.event_address && (
                <div className="flex items-center gap-1.5 text-[#4c6659] dark:text-gray-400 text-sm">
                  <MapPin className="h-4 w-4" />
                  {event.event_address}
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-2">
                <ShoppingBasket className="h-4 w-4 text-[#13ec80]" />
                <p className="text-[#4c6659] dark:text-gray-400 text-xs font-medium">
                  {event.total_items} פריטים ברשימה
                </p>
              </div>
            </div>
            <button
              onClick={onViewEvent}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 flex-row-reverse bg-[#f6f8f7] dark:bg-[#2a3d34] text-[#0d1b14] dark:text-white pl-2 gap-1 text-sm font-semibold leading-normal w-fit transition-colors hover:bg-[#e7f3ed]"
            >
              <ChevronLeft className="h-[18px] w-[18px]" />
              <span className="truncate">צפה ברשימה</span>
            </button>
          </div>
          <div className="w-24 h-24 sm:w-32 sm:h-auto bg-gradient-to-br from-[#13ec80] to-[#0d98ba] rounded-lg shrink-0 border border-[#e0e8e4] dark:border-transparent flex items-center justify-center">
            <EventTypeIcon
              icon={getEventIcon(event.event_name)}
              size="xl"
              showBackground={false}
              colorOverride="white"
            />
          </div>
        </div>
      </div>

      {/* Secondary Actions */}
      {onBackToDashboard && (
        <div className="mt-auto px-4 py-8 flex flex-col gap-4">
          <button
            onClick={onBackToDashboard}
            className="w-full text-[#4c6659] dark:text-gray-400 text-sm font-bold text-center py-2 underline decoration-[#13ec80]/30 underline-offset-4 hover:text-[#13ec80] transition-colors"
          >
            חזרה לדשבורד
          </button>
        </div>
      )}
      <div className="h-5"></div>
    </div>
  )
}
