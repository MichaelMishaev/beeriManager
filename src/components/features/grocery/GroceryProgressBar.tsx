'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Heart, PartyPopper, Users } from 'lucide-react'

interface GroceryProgressBarProps {
  claimed: number
  total: number
  showText?: boolean
  className?: string
}

export function GroceryProgressBar({
  claimed,
  total,
  showText = true,
  className = ''
}: GroceryProgressBarProps) {
  const t = useTranslations('grocery')
  const percentage = total > 0 ? Math.round((claimed / total) * 100) : 0
  const isComplete = claimed === total && total > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col gap-3 p-4 bg-[#13ec80]/5 dark:bg-[#13ec80]/10 rounded-xl
        border border-[#13ec80]/10 font-[var(--font-jakarta)] ${className}`}
    >
      <div className="flex gap-6 justify-between items-center">
        <p className="text-[#0d1b14] dark:text-white text-base font-bold leading-normal flex items-center gap-2">
          <Heart className="text-[#13ec80] h-5 w-5" aria-hidden="true" />
          <span>{t('itemsClaimed')}</span>
        </p>
        <motion.p
          key={`${claimed}-${total}`}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[#0d1b14] dark:text-white text-sm font-bold leading-normal
            bg-white dark:bg-[#102219] px-3 py-1 rounded-full shadow-sm
            border border-[#cfe7db] dark:border-[#1e3a2c]"
        >
          {claimed}/{total}
        </motion.p>
      </div>

      <div
        className="rounded-full bg-[#cfe7db] dark:bg-[#1e3a2c] overflow-hidden h-3"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('progressFull', { claimed, total })}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            isComplete
              ? 'bg-gradient-to-r from-[#13ec80] to-[#0d98ba]'
              : 'bg-[#13ec80]'
          }`}
        />
      </div>

      {showText && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[#4c9a73] dark:text-[#4c9a73] text-sm font-semibold leading-normal flex items-center gap-1.5"
        >
          {isComplete ? (
            <>
              <PartyPopper className="h-4 w-4" aria-hidden="true" />
              <span>{t('thankEveryone')}</span>
            </>
          ) : (
            <>
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>{t('helpComplete')}</span>
            </>
          )}
        </motion.p>
      )}
    </motion.div>
  )
}
