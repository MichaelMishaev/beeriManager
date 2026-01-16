'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, X, ShoppingBasket, ChevronLeft } from 'lucide-react'
import type { GroceryItem } from '@/types'

interface GroceryContributorsSummaryProps {
  items: GroceryItem[]
  className?: string
}

interface ContributorGroup {
  name: string
  items: Array<{
    itemName: string
    quantity: number
  }>
  totalQuantity: number
}

// Avatar color palette
const avatarColors = [
  'bg-blue-500',
  'bg-orange-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-indigo-500'
]

const getAvatarColor = (name: string): string => {
  const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return avatarColors[charSum % avatarColors.length]
}

// Bottom sheet animation variants
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

const sheetVariants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 30,
      stiffness: 300
    }
  },
  exit: {
    y: '100%',
    transition: {
      type: 'spring' as const,
      damping: 30,
      stiffness: 300
    }
  }
}

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      type: 'spring' as const,
      stiffness: 300,
      damping: 25
    }
  })
}

export function GroceryContributorsSummary({
  items,
  className = ''
}: GroceryContributorsSummaryProps) {
  const t = useTranslations('grocery')
  const [isOpen, setIsOpen] = useState(false)

  // Group items by contributor name
  const contributorGroups = useMemo((): ContributorGroup[] => {
    const groupMap = new Map<string, ContributorGroup>()

    items.forEach((item) => {
      if (item.claimed_by) {
        const existing = groupMap.get(item.claimed_by)
        if (existing) {
          existing.items.push({
            itemName: item.item_name,
            quantity: item.quantity
          })
          existing.totalQuantity += item.quantity
        } else {
          groupMap.set(item.claimed_by, {
            name: item.claimed_by,
            items: [{
              itemName: item.item_name,
              quantity: item.quantity
            }],
            totalQuantity: item.quantity
          })
        }
      }
    })

    // Sort by total quantity (descending)
    return Array.from(groupMap.values()).sort((a, b) => b.totalQuantity - a.totalQuantity)
  }, [items])

  const contributorCount = contributorGroups.length
  const totalClaimedItems = contributorGroups.reduce((sum, g) => sum + g.items.length, 0)

  // Don't render if no contributors
  if (contributorCount === 0) {
    return null
  }

  return (
    <>
      {/* Trigger Button - Small pill */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full
          bg-[#13ec80] hover:bg-[#10d970] text-[#0d1b14]
          shadow-lg shadow-[#13ec80]/30
          font-bold text-sm
          transition-all duration-200
          focus:outline-none focus:ring-4 focus:ring-[#13ec80]/40
          font-[family-name:var(--font-jakarta)] ${className}`}
        aria-label={t('whoBringsWhat')}
      >
        <Users className="h-4 w-4" aria-hidden="true" />
        <span>{t('whoBringsWhat')}</span>
        <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5
          rounded-full bg-white/30 text-[#0d1b14] text-xs font-bold">
          {contributorCount}
        </span>
      </motion.button>

      {/* Bottom Sheet Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              aria-hidden="true"
            />

            {/* Sheet */}
            <motion.div
              variants={sheetVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-x-0 bottom-0 z-50
                bg-white dark:bg-[#0d1b14]
                rounded-t-[28px]
                max-h-[85vh]
                flex flex-col
                font-[family-name:var(--font-jakarta)]
                shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="contributors-title"
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-[#13ec80]/20">
                    <Users className="h-6 w-6 text-[#13ec80]" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 id="contributors-title" className="text-xl font-extrabold text-[#0d1b14] dark:text-white">
                      {t('whoBringsWhat')}
                    </h2>
                    <p className="text-sm text-[#4c9a73] dark:text-[#13ec80]/70 font-medium">
                      {t('contributorCount', { count: contributorCount })} • {totalClaimedItems} {t('items')}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="flex size-10 items-center justify-center rounded-full
                    bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60
                    hover:bg-gray-200 dark:hover:bg-white/20
                    transition-colors focus:outline-none focus:ring-2 focus:ring-[#13ec80]/40"
                  aria-label={t('cancel')}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </motion.button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                <div className="space-y-3">
                  {contributorGroups.map((contributor, index) => (
                    <motion.div
                      key={contributor.name}
                      custom={index}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4
                        border border-gray-100 dark:border-white/5"
                    >
                      {/* Contributor Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`flex size-11 items-center justify-center rounded-full
                            ${getAvatarColor(contributor.name)} text-white font-bold text-base shadow-md`}
                        >
                          {contributor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#0d1b14] dark:text-white text-base font-bold truncate">
                            {contributor.name}
                          </p>
                          <p className="text-[#4c9a73] dark:text-[#13ec80]/70 text-xs font-medium">
                            {contributor.items.length} {t('items')}
                          </p>
                        </div>
                        <div className="flex items-center justify-center min-w-[32px] h-8 px-3
                          rounded-full bg-[#13ec80] text-[#0d1b14] text-sm font-bold shadow-sm">
                          {contributor.totalQuantity}
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2 pr-2">
                        {contributor.items.map((item, itemIndex) => (
                          <div
                            key={`${item.itemName}-${itemIndex}`}
                            className="flex items-center gap-3 py-2 px-3
                              bg-white dark:bg-[#102219] rounded-xl
                              border border-gray-100 dark:border-white/5"
                          >
                            <div className="flex size-8 items-center justify-center rounded-full
                              bg-[#13ec80]/10 dark:bg-[#13ec80]/20">
                              <ShoppingBasket className="h-4 w-4 text-[#13ec80]" aria-hidden="true" />
                            </div>
                            <span className="flex-1 text-[#0d1b14] dark:text-white text-sm font-medium truncate">
                              {item.itemName}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[#13ec80] text-sm font-bold">
                                ×{item.quantity}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom padding for safe area */}
                <div className="h-6" />
              </div>

              {/* Footer - Close button */}
              <div className="px-4 py-4 border-t border-gray-100 dark:border-white/10
                bg-white dark:bg-[#0d1b14] safe-area-bottom">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6
                    bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20
                    text-[#0d1b14] dark:text-white text-base font-bold
                    rounded-2xl transition-colors
                    focus:outline-none focus:ring-4 focus:ring-[#13ec80]/30"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  <span>{t('cancel')}</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
