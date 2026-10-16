'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import type { Event } from '@/types'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function greetingKey(hour: number) {
  if (hour < 12) return 'greetingMorning'
  if (hour < 17) return 'greetingAfternoon'
  return 'greetingEvening'
}

/**
 * Duolingo-style mascot + speech bubble. The school logo plays the mascot:
 * it hops in on a spring, then the bubble pops out from its tail.
 */
export function DuoGreeting({ upcomingEvents }: { upcomingEvents: Event[] }) {
  const t = useTranslations('homepage')
  const now = Date.now()
  const eventsThisWeek = upcomingEvents.filter((e) => {
    const start = new Date(e.start_datetime).getTime()
    return start >= now && start - now <= WEEK_MS
  }).length

  return (
    <div className="flex items-end gap-3 mb-4">
      {/* Mascot */}
      <motion.div
        className="relative flex-shrink-0"
        initial={{ y: 30, opacity: 0, scale: 0.6 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 0.1 }}
      >
        <div className="w-16 h-16 rounded-full bg-white border-2 border-[#e5e5e5] shadow-[0_4px_0_#e5e5e5] flex items-center justify-center overflow-hidden">
          <Image src="/logo-square.png" alt={t('mascotAlt')} width={60} height={60} priority className="h-[60px] w-[60px] object-contain" />
        </div>
        {/* soft floor shadow, like Duo standing on the page */}
        <div aria-hidden className="mx-auto mt-1 h-1.5 w-10 rounded-full bg-black/10" />
      </motion.div>

      {/* Speech bubble — tail points back at the mascot (inline-start side, so it mirrors in LTR) */}
      <motion.div
        className="relative flex-1 min-w-0 mb-4 bg-white border-2 border-[#e5e5e5] rounded-2xl px-4 py-3 shadow-[0_4px_0_#e5e5e5] text-start origin-bottom-left rtl:origin-bottom-right"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.35 }}
      >
        {/* Rotated square: two bordered sides form an arrow pointing at the mascot.
            LTR: left+bottom borders → corner points left. RTL: top+right → points right. */}
        <span
          aria-hidden
          className="absolute bottom-3 -start-[9px] w-4 h-4 bg-white rotate-45 border-[#e5e5e5] border-l-2 border-b-2 rtl:border-l-0 rtl:border-b-0 rtl:border-t-2 rtl:border-r-2"
        />
        <p className="text-base md:text-lg font-extrabold text-[#003153] leading-snug">
          {t(greetingKey(new Date().getHours()))}
        </p>
        <p className="text-sm md:text-base font-medium text-gray-600 leading-snug">
          {t('eventsThisWeek', { count: eventsThisWeek })}
        </p>
      </motion.div>
    </div>
  )
}
