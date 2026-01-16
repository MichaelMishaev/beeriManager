'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import type { GroceryEvent, GroceryItem as GroceryItemType, ConsolidatedItem } from '@/types'
import { GroceryItem } from './GroceryItem'
import { GroceryProgressBar } from './GroceryProgressBar'
import { GroceryListSkeleton } from './GroceryListSkeleton'
import { GraduationCap, Calendar, MapPin, CheckCircle2, Circle, PartyPopper, ShoppingBasket } from 'lucide-react'
import { getEventIcon } from '@/lib/data/event-names'
import { EventTypeIcon } from './EventTypeIcon'

interface GroceryPublicListProps {
  event: GroceryEvent
  onClaimItem: (itemId: string, claimerName: string, quantity?: number) => Promise<void>
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

  // Consolidate ALL items (including partial claims) by name into single rows
  // This ensures claimed portions from partial claims are included
  const consolidatedItems = useMemo((): ConsolidatedItem[] => {
    const grouped = new Map<string, GroceryItemType[]>()

    // Group ALL items by name (case-insensitive, trimmed)
    // Include items with parent_item_id - they are partial claims that should be consolidated
    items.forEach(item => {
      const key = item.item_name.toLowerCase().trim()
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(item)
    })

    // Convert groups to consolidated items
    return Array.from(grouped.values()).map(itemGroup => {
      const totalQuantity = itemGroup.reduce((sum, item) => sum + item.quantity, 0)
      const claims = itemGroup
        .filter(item => item.claimed_by)
        .map(item => ({
          claimerName: item.claimed_by!,
          quantity: item.quantity,
          itemId: item.id
        }))
      const unclaimedItems = itemGroup.filter(item => !item.claimed_by)
      const unclaimedQuantity = unclaimedItems.reduce((sum, item) => sum + item.quantity, 0)

      // Use the earliest item as primary (by display_order or created_at)
      const sortedGroup = [...itemGroup].sort((a, b) =>
        (a.display_order ?? 0) - (b.display_order ?? 0)
      )

      return {
        id: sortedGroup[0].id,
        item_name: sortedGroup[0].item_name,
        totalQuantity,
        claims,
        unclaimedItems,
        unclaimedQuantity,
        allItemIds: itemGroup.map(i => i.id),
        notes: sortedGroup[0].notes,
        display_order: sortedGroup[0].display_order ?? 0
      }
    }).sort((a, b) => a.display_order - b.display_order)
  }, [items])

  const filteredItems = consolidatedItems.filter((item) => {
    if (filter === 'unclaimed') return item.unclaimedQuantity > 0
    if (filter === 'claimed') return item.claims.length > 0
    return true
  })

  const formatDate = useCallback((dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'long'
    })
  }, [])

  const formatTime = useCallback((timeStr?: string) => {
    if (!timeStr) return ''
    // Remove seconds if present (09:00:00 -> 09:00)
    return timeStr.slice(0, 5)
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

  const unclaimedCount = consolidatedItems.filter(i => i.unclaimedQuantity > 0).length

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
        <div className="flex w-full flex-col gap-3 items-center">
          <div className="flex gap-3 flex-col items-center">
            {/* Event Image - Compact for mobile */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-gradient-to-br from-[#13ec80] to-[#0d98ba] rounded-2xl h-20 w-20 shadow-lg border-2 border-white dark:border-white/10 flex items-center justify-center"
            >
              <EventTypeIcon
                icon={getEventIcon(event.event_name)}
                size="xl"
                showBackground={false}
                colorOverride="white"
              />
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
                  <span>{formatDate(event.event_date)}</span>
                  {event.event_time && (
                    <>
                      <span className="text-[#4c9a73]/50 dark:text-[#13ec80]/50">|</span>
                      <span>{formatTime(event.event_time)}</span>
                    </>
                  )}
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

      {/* Filter Pills - 44px min touch targets */}
      <motion.div
        variants={itemVariants}
        className="flex gap-2 px-4 py-3 justify-center"
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
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(filterType)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${filterType}`}
              className={`flex h-11 items-center justify-center gap-x-2 rounded-full px-4 cursor-pointer transition-all
                focus:outline-none focus:ring-2 focus:ring-[#13ec80]/30
                ${isActive
                  ? 'bg-[#13ec80] shadow-sm shadow-[#13ec80]/30 text-[#0d1b14] font-bold'
                  : 'bg-white dark:bg-[#1a2e24] border border-[#cfe7db] dark:border-[#2a3d34] text-[#0d1b14] dark:text-white font-medium hover:border-[#13ec80]/50'
                }`}
            >
              {isActive ? (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Circle className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="text-sm font-medium">{t(labelKey)}</span>
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
                <ShoppingBasket className="h-12 w-12 mb-2 opacity-50" aria-hidden="true" />
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
              {filteredItems.map((consolidatedItem) => (
                <GroceryItem
                  key={consolidatedItem.id}
                  consolidatedItem={consolidatedItem}
                  allItems={items}
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
