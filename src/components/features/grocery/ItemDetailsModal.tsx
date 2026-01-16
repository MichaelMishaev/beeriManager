'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBasket, Users, Loader2 } from 'lucide-react'
import type { GroceryItem, ConsolidatedItem } from '@/types'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog'

interface ClaimedItemInfo {
  itemId: string
  claimerName: string
  quantity: number
}

interface ItemDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  itemName: string
  itemId: string
  currentItem: GroceryItem | null
  allItems: GroceryItem[]
  onUnclaim?: (itemId: string) => Promise<void>
  consolidatedItem?: ConsolidatedItem
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

// Animation variants
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.15 }
  }
}

export function ItemDetailsModal({
  isOpen,
  onClose,
  itemName,
  itemId,
  currentItem,
  allItems,
  onUnclaim,
  consolidatedItem
}: ItemDetailsModalProps) {
  const t = useTranslations('grocery')
  const [unclaimingItemId, setUnclaimingItemId] = useState<string | null>(null)
  const [confirmUnclaimItem, setConfirmUnclaimItem] = useState<ClaimedItemInfo | null>(null)

  // Find child claims (partial claims from this item) and calculate totals
  const { claimedItems, totalNeeded, totalClaimed, unclaimed } = useMemo(() => {
    // If we have a consolidated item, use its data directly
    if (consolidatedItem) {
      return {
        claimedItems: consolidatedItem.claims.map(c => ({
          itemId: c.itemId,
          claimerName: c.claimerName,
          quantity: c.quantity
        })),
        totalNeeded: consolidatedItem.totalQuantity,
        totalClaimed: consolidatedItem.claims.reduce((sum, c) => sum + c.quantity, 0),
        unclaimed: consolidatedItem.unclaimedQuantity
      }
    }

    // Legacy: Find child items (items that were split from this one via partial claim)
    const childClaims = allItems.filter(item => item.parent_item_id === itemId && item.claimed_by)

    // Collect all claimed items (both child claims and current item if claimed)
    const claimedItems: ClaimedItemInfo[] = []

    // Add child claims (partial claims)
    childClaims.forEach(child => {
      if (child.claimed_by) {
        claimedItems.push({
          itemId: child.id,
          claimerName: child.claimed_by,
          quantity: child.quantity
        })
      }
    })

    // Add current item's claim if it's claimed (full claim or remaining portion)
    if (currentItem?.claimed_by) {
      claimedItems.push({
        itemId: currentItem.id,
        claimerName: currentItem.claimed_by,
        quantity: currentItem.quantity
      })
    }

    // Calculate totals
    const childQuantity = childClaims.reduce((sum, c) => sum + c.quantity, 0)
    const totalNeeded = (currentItem?.quantity ?? 0) + childQuantity
    const totalClaimed = childQuantity + (currentItem?.claimed_by ? currentItem.quantity : 0)

    return {
      claimedItems,
      totalNeeded,
      totalClaimed,
      unclaimed: totalNeeded - totalClaimed
    }
  }, [allItems, itemId, currentItem, consolidatedItem])

  // Show confirmation dialog before unclaiming
  const handleUnclaimClick = (claimed: ClaimedItemInfo) => {
    setConfirmUnclaimItem(claimed)
  }

  // Actually perform the unclaim after confirmation
  const handleUnclaimConfirm = async () => {
    if (!onUnclaim || !confirmUnclaimItem) return
    setUnclaimingItemId(confirmUnclaimItem.itemId)
    setConfirmUnclaimItem(null)
    try {
      await onUnclaim(confirmUnclaimItem.itemId)
    } catch (error) {
      console.error('Error unclaiming item:', error)
    } finally {
      setUnclaimingItemId(null)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-x-4 top-4 bottom-4 z-50
              max-w-sm mx-auto my-auto
              max-h-[calc(100dvh-2rem)]
              bg-white dark:bg-[#0d1b14]
              rounded-3xl
              shadow-2xl
              font-[family-name:var(--font-jakarta)]
              flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="item-details-title"
          >
            {/* Header */}
            <div className="relative bg-[#13ec80]/10 dark:bg-[#13ec80]/20 px-5 pt-5 pb-4 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 left-4 flex size-8 items-center justify-center rounded-full
                  bg-white/80 dark:bg-black/20 text-gray-500 dark:text-white/60
                  hover:bg-white dark:hover:bg-black/40
                  transition-colors focus:outline-none"
                aria-label={t('cancel')}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </motion.button>

              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex size-14 items-center justify-center rounded-full bg-[#13ec80]/20">
                    <ShoppingBasket className="h-7 w-7 text-[#13ec80]" aria-hidden="true" />
                  </div>
                </div>
                <h2 id="item-details-title" className="text-xl font-extrabold text-[#0d1b14] dark:text-white">
                  {itemName}
                </h2>
                <p className="text-sm text-[#4c9a73] dark:text-[#13ec80]/70 font-medium mt-1">
                  {totalClaimed}/{totalNeeded} {t('itemsClaimed')}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 py-4 flex-1 min-h-0 overflow-y-auto">
              {claimedItems.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-[#4c9a73]" aria-hidden="true" />
                    <span className="text-sm font-bold text-[#4c9a73] dark:text-[#13ec80]/70">
                      {t('whoBringsWhat')}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {claimedItems.map((claimed) => (
                      <motion.div
                        key={claimed.itemId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3
                          bg-gray-50 dark:bg-white/5 rounded-xl"
                      >
                        {/* Unclaim button */}
                        {onUnclaim && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUnclaimClick(claimed)}
                            disabled={unclaimingItemId === claimed.itemId}
                            className="flex items-center justify-center rounded-full h-9 px-3 gap-1
                              bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400
                              hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors
                              focus:outline-none focus:ring-2 focus:ring-red-500/40
                              disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold"
                            aria-label={t('unclaimItem')}
                          >
                            {unclaimingItemId === claimed.itemId ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            ) : (
                              <span>{t('unclaimItem')}</span>
                            )}
                          </motion.button>
                        )}
                        <div
                          className={`flex size-10 items-center justify-center rounded-full
                            ${getAvatarColor(claimed.claimerName)} text-white font-bold text-sm shadow-sm`}
                        >
                          {claimed.claimerName.charAt(0).toUpperCase()}
                        </div>
                        <span className="flex-1 text-[#0d1b14] dark:text-white font-bold truncate">
                          {claimed.claimerName}
                        </span>
                        <span className="text-[#13ec80] font-bold text-lg">
                          ×{claimed.quantity}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-400 dark:text-white/40">
                  <ShoppingBasket className="h-10 w-10 mx-auto mb-2 opacity-50" aria-hidden="true" />
                  <p className="text-sm font-medium">{t('noContributorsYet')}</p>
                </div>
              )}

              {/* Unclaimed indicator */}
              {unclaimed > 0 && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl
                  border border-amber-200 dark:border-amber-500/20">
                  <p className="text-amber-700 dark:text-amber-400 text-sm font-bold text-center">
                    {t('remainingItems', { remaining: unclaimed })}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-2 flex-shrink-0 pb-safe">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onClose}
                className="w-full py-3.5 px-6
                  bg-[#13ec80] hover:bg-[#10d970] text-[#0d1b14]
                  font-bold text-base rounded-2xl
                  transition-colors
                  focus:outline-none focus:ring-4 focus:ring-[#13ec80]/40"
              >
                {t('confirm')}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}

      {/* Unclaim Confirmation Dialog */}
      <AlertDialog
        open={!!confirmUnclaimItem}
        onOpenChange={(open) => !open && setConfirmUnclaimItem(null)}
      >
        <AlertDialogContent className="bg-white dark:bg-[#102219] border-gray-200 dark:border-[#2a3d34]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0d1b14] dark:text-white text-right">
              {t('confirmUnclaim')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#4c9a73] dark:text-[#13ec80]/80 text-right">
              {t('claimedByPerson', { name: confirmUnclaimItem?.claimerName || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction
              onClick={handleUnclaimConfirm}
              disabled={!!unclaimingItemId}
              className="bg-red-500 hover:bg-red-600"
            >
              {unclaimingItemId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('confirmCancel')
              )}
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => setConfirmUnclaimItem(null)}
              disabled={!!unclaimingItemId}
            >
              {t('cancel')}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  )
}
