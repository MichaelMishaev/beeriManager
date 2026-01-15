'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import type { GroceryEvent } from '@/types'
import { GroceryItem } from './GroceryItem'
import { GroceryProgressBar } from './GroceryProgressBar'
import { GroceryListSkeleton } from './GroceryListSkeleton'
import { ShoppingCart, GraduationCap, Calendar, MapPin, CheckCircle2, Circle, PartyPopper } from 'lucide-react'

interface GroceryPublicListProps {
  event: GroceryEvent
  onClaimItem: (itemId: string, claimerName: string) => Promise<void>
  onUnclaimItem: (itemId: string) => Promise<void>
  onRefresh?: () => void
  isLoading?: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

export function GroceryPublicList({
  event,
  onClaimItem,
  onUnclaimItem,
  onRefresh,
  isLoading = false
}: GroceryPublicListProps) {
  const t = useTranslations('grocery')
  const [filter, setFilter] = useState<'all' | 'unclaimed' | 'claimed'>('all')

  const items = event.items || []

  const filteredItems = items.filter((item) => {
    if (filter === 'unclaimed') return !item.claimed_by
    if (filter === 'claimed') return !!item.claimed_by
    return true
  })

  const formatDate = useCallback((dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }, [])

  // Smarter auto-refresh: 10 seconds when active, 30 seconds when idle
  useEffect(() => {
    if (!onRefresh) return

    // Use visibility API for smarter polling
    const getInterval = () => {
      if (document.hidden) return 30000 // 30 seconds when tab is not visible
      return 10000 // 10 seconds when visible
    }

    let intervalId: NodeJS.Timeout

    const startPolling = () => {
      intervalId = setInterval(() => {
        onRefresh()
      }, getInterval())
    }

    const handleVisibilityChange = () => {
      clearInterval(intervalId)
      startPolling()
    }

    startPolling()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [onRefresh])

  const unclaimedCount = items.filter(i => !i.claimed_by).length

  // Show skeleton while loading
  if (isLoading) {
    return <GroceryListSkeleton />
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative flex h-auto w-full flex-col group/design-root overflow-x-hidden max-w-[480px] mx-auto bg-white dark:bg-[#102219] font-[family-name:var(--font-jakarta)]"
    >
      {/* ProfileHeader / Event Details */}
      <motion.div
        variants={itemVariants}
        className="flex p-4 bg-[#f6f8f7] dark:bg-[#102219]"
      >
        <div className="flex w-full flex-col gap-4 items-center">
          <div className="flex gap-6 flex-col items-center">
            {/* Event Image Placeholder */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-gradient-to-br from-[#13ec80] to-[#0d98ba] rounded-xl min-h-40 w-40 shadow-lg border-4 border-white dark:border-white/10 flex items-center justify-center"
            >
              <ShoppingCart className="text-white h-12 w-12" aria-hidden="true" />
            </motion.div>
            <div className="flex flex-col items-center justify-center gap-1">
              <h1 className="text-[#0d1b14] dark:text-white text-[24px] font-extrabold leading-tight tracking-[-0.015em] text-center">
                {event.event_name}
              </h1>
              <div className="flex items-center gap-2 text-[#4c9a73] dark:text-[#13ec80]/80 text-base font-medium">
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
                <span>{event.class_name}</span>
              </div>
              {event.event_date && (
                <div className="flex items-center gap-2 text-[#4c9a73] dark:text-[#13ec80]/80 text-base font-medium">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {formatDate(event.event_date)}
                    {event.event_time && ` - ${event.event_time}`}
                  </span>
                </div>
              )}
              {event.event_address && (
                <div className="flex items-center gap-2 text-[#4c9a73] dark:text-[#13ec80]/80 text-base font-medium">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span>{event.event_address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div variants={itemVariants} className="px-4 py-2">
        <GroceryProgressBar
          claimed={event.claimed_items}
          total={event.total_items}
        />
      </motion.div>

      {/* SectionHeader */}
      <motion.div
        variants={itemVariants}
        className="px-4 pt-4 flex items-center justify-between"
      >
        <h2 className="text-[#0d1b14] dark:text-white text-xl font-extrabold leading-tight tracking-[-0.015em]">
          {t('groceryList')}
        </h2>
        <span className="text-xs font-bold text-[#4c9a73] uppercase tracking-wider">
          {unclaimedCount} {t('availableItems')}
        </span>
      </motion.div>

      {/* Filter Pills */}
      <motion.div
        variants={itemVariants}
        className="flex gap-3 p-4 overflow-x-auto no-scrollbar"
        role="tablist"
        aria-label={t('filterAll')}
      >
        {(['all', 'unclaimed', 'claimed'] as const).map((filterType) => {
          const isActive = filter === filterType
          const labelKey = filterType === 'all' ? 'filterAll' : filterType === 'unclaimed' ? 'filterAvailable' : 'filterClaimed'

          return (
            <motion.button
              key={filterType}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilter(filterType)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${filterType}`}
              className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 cursor-pointer transition-all
                focus:outline-none focus:ring-4 focus:ring-[#13ec80]/30
                ${isActive
                  ? 'bg-[#13ec80] shadow-md shadow-[#13ec80]/30 text-[#0d1b14] font-bold'
                  : 'bg-white dark:bg-[#1a2e24] border border-[#cfe7db] dark:border-[#2a3d34] text-[#0d1b14] dark:text-white font-medium hover:border-[#13ec80]/50'
                }`}
            >
              {isActive ? (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Circle className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="text-sm">{t(labelKey)}</span>
            </motion.button>
          )
        })}
      </motion.div>

      {/* List Items */}
      <div
        id={`panel-${filter}`}
        role="tabpanel"
        className="flex flex-col px-2 pb-24"
      >
        <AnimatePresence mode="wait">
          {filteredItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12 text-[#4c9a73]"
            >
              {filter === 'unclaimed' ? (
                <PartyPopper className="h-12 w-12 mb-2 opacity-50" aria-hidden="true" />
              ) : (
                <ShoppingCart className="h-12 w-12 mb-2 opacity-50" aria-hidden="true" />
              )}
              <p className="text-base font-medium">
                {filter === 'unclaimed'
                  ? t('noAvailableItems')
                  : filter === 'claimed'
                  ? t('noClaimedItems')
                  : t('listEmpty')}
              </p>
              {filter === 'unclaimed' && (
                <p className="text-sm opacity-70 mt-1">{t('thankYouParticipation')}</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {filteredItems.map((item) => (
                <GroceryItem
                  key={item.id}
                  item={item}
                  onClaim={onClaimItem}
                  onUnclaim={onUnclaimItem}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
