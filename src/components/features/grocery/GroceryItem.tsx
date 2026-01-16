'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import type { GroceryItem as GroceryItemType } from '@/types'
import { ClaimDialog } from './ClaimDialog'
import { ItemDetailsModal } from './ItemDetailsModal'
import { ShoppingBasket, Trash2, Loader2, CheckCircle2 } from 'lucide-react'

interface GroceryItemProps {
  item: GroceryItemType
  allItems?: GroceryItemType[]  // All items to show who else is bringing
  onClaim: (itemId: string, claimerName: string, quantity?: number) => Promise<void>
  onUnclaim: (itemId: string) => Promise<void>
  isEditable?: boolean
  onDelete?: (itemId: string) => void
  onQuantityChange?: (itemId: string, quantity: number) => void
}

// Avatar color palette for claimed items
const avatarColors = [
  'bg-blue-400',
  'bg-orange-400',
  'bg-purple-400',
  'bg-pink-400',
  'bg-teal-400',
  'bg-amber-400',
  'bg-rose-400',
  'bg-indigo-400'
]

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 }
  }
}

export function GroceryItem({
  item,
  allItems = [],
  onClaim,
  onUnclaim,
  isEditable = false,
  onDelete
}: GroceryItemProps) {
  const t = useTranslations('grocery')
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if there are other items with the same name (claimed by others)
  const hasOtherClaimers = allItems.some(
    i => i.item_name === item.item_name && i.claimed_by && i.id !== item.id
  )

  const isClaimed = !!item.claimed_by

  const handleClaim = async (name: string, quantity?: number) => {
    setIsLoading(true)
    try {
      await onClaim(item.id, name, quantity)
      setIsClaimDialogOpen(false)
    } catch (error) {
      console.error('Error claiming item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnclaim = async () => {
    setIsLoading(true)
    try {
      await onUnclaim(item.id)
    } catch (error) {
      console.error('Error unclaiming item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate consistent avatar color based on claimer name
  const getAvatarColor = (name: string) => {
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
    return avatarColors[charSum % avatarColors.length]
  }

  const avatarColor = item.claimed_by ? getAvatarColor(item.claimed_by) : avatarColors[0]

  // Format item display name with quantity
  const displayName = item.quantity > 1 ? `${item.quantity}x ${item.item_name}` : item.item_name

  return (
    <>
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
        className={`flex items-center gap-3 px-3 min-h-[80px] py-3 border-b
          transition-all duration-200 font-[family-name:var(--font-jakarta)]
          ${isClaimed
            ? 'bg-[#13ec80]/5 dark:bg-[#13ec80]/10 border-[#13ec80]/20 dark:border-[#13ec80]/10'
            : 'bg-white dark:bg-[#102219] border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#152a1f]'
          }`}
      >
        {/* Actions - LEFT side for RTL */}
        <div className="shrink-0 flex items-center gap-2">
          {isEditable && onDelete && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(item.id)}
              className="text-gray-400 hover:text-red-500 transition-colors p-2
                focus:outline-none focus:ring-2 focus:ring-red-500/40 rounded-lg"
              aria-label={t('removeItem')}
            >
              <Trash2 className="h-5 w-5" aria-hidden="true" />
            </motion.button>
          )}

          {isClaimed ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUnclaim}
              disabled={isLoading}
              className="flex items-center justify-center rounded-full h-11 px-4 gap-1.5
                bg-[#13ec80]/10 dark:bg-[#13ec80]/20 text-[#13ec80] dark:text-[#13ec80]
                hover:bg-[#13ec80]/20 dark:hover:bg-[#13ec80]/30 transition-colors
                focus:outline-none focus:ring-2 focus:ring-[#13ec80]/40
                disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
              aria-label={t('unclaimItem')}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <>
                  <span>{t('unclaimItem')}</span>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsClaimDialogOpen(true)}
              disabled={isLoading}
              className="flex min-w-[90px] cursor-pointer items-center justify-center
                overflow-hidden rounded-full h-11 px-5
                bg-[#13ec80] hover:bg-[#10d970] text-[#0d1b14]
                text-sm font-bold leading-normal
                shadow-sm shadow-[#13ec80]/20 transition-all
                focus:outline-none focus:ring-4 focus:ring-[#13ec80]/40
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <span>{t('claimItem')}</span>
              )}
            </motion.button>
          )}
        </div>

        {/* Clickable Item Area - Opens details modal */}
        <button
          onClick={() => setIsDetailsModalOpen(true)}
          className="flex items-center gap-3 flex-1 min-w-0 focus:outline-none
            rounded-lg -m-1 p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label={`${displayName} - ${t('whoBringsWhat')}`}
        >
          {/* Content - Takes remaining space, right aligned for RTL */}
          <div className="flex flex-col justify-center min-w-0 flex-1 text-right">
            <p
              className={`text-base leading-normal
                ${isClaimed
                  ? 'text-[#0d1b14]/80 dark:text-white/80 font-medium'
                  : 'text-[#0d1b14] dark:text-white font-bold'
                }`}
            >
              {displayName}
            </p>

            {isClaimed ? (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-1 justify-end"
              >
                <p className="text-[#13ec80] dark:text-[#13ec80] text-sm font-bold">
                  {item.claimed_by} ✓
                </p>
                <div
                  className={`size-5 rounded-full ${avatarColor} flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold`}
                  aria-hidden="true"
                >
                  {item.claimed_by?.charAt(0).toUpperCase()}
                </div>
              </motion.div>
            ) : hasOtherClaimers ? (
              <p className="text-[#4c9a73] dark:text-[#13ec80]/60 text-xs font-medium">
                {t('tapToSeeWho')}
              </p>
            ) : item.notes ? (
              <p className="text-[#4c9a73] dark:text-[#13ec80]/60 text-sm font-normal leading-normal line-clamp-2">
                {item.notes}
              </p>
            ) : null}
          </div>

          {/* Icon - RIGHT side for RTL */}
          <motion.div
            initial={false}
            animate={{
              scale: isClaimed ? 0.95 : 1,
              opacity: 1
            }}
            className={`flex size-11 items-center justify-center rounded-full flex-shrink-0
              ${isClaimed
                ? 'bg-[#13ec80]/20 dark:bg-[#13ec80]/15'
                : 'bg-[#13ec80]/10 dark:bg-[#13ec80]/5'
              }`}
          >
            {isClaimed ? (
              <CheckCircle2
                className="h-5 w-5 text-[#13ec80]"
                aria-hidden="true"
              />
            ) : (
              <ShoppingBasket
                className="h-5 w-5 text-[#13ec80]"
                aria-hidden="true"
              />
            )}
          </motion.div>
        </button>
      </motion.div>

      <ClaimDialog
        isOpen={isClaimDialogOpen}
        onClose={() => setIsClaimDialogOpen(false)}
        onClaim={handleClaim}
        itemName={displayName}
        isLoading={isLoading}
        maxQuantity={item.quantity}
      />

      <ItemDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        itemName={item.item_name}
        allItems={allItems}
      />
    </>
  )
}
