'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { GraduationCap } from 'lucide-react'
import { duoCard } from '@/components/ui/duo'
import { EASE_OUT } from '@/components/ui/motion'

const DAY_MS = 24 * 60 * 60 * 1000

// Israeli elementary school year: Sept 1 → June 30
function getSchoolYear(now: Date) {
  const y = now.getFullYear()
  const startYear = now.getMonth() >= 8 ? y : y - 1 // getMonth: 8 = September
  const start = new Date(startYear, 8, 1)
  const end = new Date(startYear + 1, 5, 30, 23, 59)
  const isSummer = now > end
  const percent = isSummer ? 100 : Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100)
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / DAY_MS))
  return { percent: Math.min(100, Math.max(0, percent)), daysLeft, isSummer }
}

/** Duolingo XP-bar style progress through the school year. */
export function SchoolYearProgress() {
  const t = useTranslations('homepage')
  const { percent, daysLeft, isSummer } = getSchoolYear(new Date())

  return (
    <div className={`${duoCard} p-4 mb-3`}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-[#FFBA00] shadow-[0_3px_0_#c98f00] flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-[#003153]" />
          </span>
          <span className="font-extrabold text-[#003153]">{t('schoolYearTitle')}</span>
        </div>
        <span className="font-extrabold text-[#C25E00] tabular-nums" dir="ltr">{percent}%</span>
      </div>

      {/* Track + fill. The thin white stripe on top is Duolingo's signature "gloss". */}
      <div
        className="relative h-4 rounded-full bg-[#e5e5e5] overflow-hidden"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('schoolYearTitle')}
      >
        <motion.div
          className="absolute inset-y-0 start-0 rounded-full bg-[#FFBA00]"
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.max(percent, 4)}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.2, ease: EASE_OUT }}
        >
          <span aria-hidden className="absolute top-[3px] inset-x-2 h-1 rounded-full bg-white/50" />
        </motion.div>
      </div>

      <p className="mt-2 text-sm font-bold text-gray-600">
        {isSummer ? t('summerBreak') : t('schoolYearDaysLeft', { days: daysLeft })}
      </p>
    </div>
  )
}
