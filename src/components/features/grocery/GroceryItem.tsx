'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import type { GroceryItem as GroceryItemType } from '@/types'
import { ClaimDialog } from './ClaimDialog'
import { ShoppingBasket, Trash2, Loader2, CheckCircle2 } from 'lucide-react'

interface GroceryItemProps {
  item: GroceryItemType
  onClaim: (itemId: string, claimerName: string) => Promise<void>
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
  onClaim,
  onUnclaim,
  isEditable = false,
  onDelete
}: GroceryItemProps) {
  const t = useTranslations('grocery')
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isClaimed = !!item.claimed_by

  const handleClaim = async (name: string) => {
    setIsLoading(true)
    try {
      await onClaim(item.id, name)
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
        className={`flex items-center gap-4 px-3 min-h-[80px] py-3 justify-between border-b
          transition-all duration-200 font-[family-name:var(--font-jakarta)]
          ${isClaimed
            ? 'bg-gray-50/80 dark:bg-[#102219]/60 border-gray-100 dark:border-white/5'
            : 'bg-white dark:bg-[#102219] border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#152a1f]'
          }`}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Icon */}
          <motion.div
            initial={false}
            animate={{
              scale: isClaimed ? 0.9 : 1,
              opacity: isClaimed ? 0.6 : 1
            }}
            className={`flex size-11 items-center justify-center rounded-full flex-shrink-0
              ${isClaimed
                ? 'bg-gray-100 dark:bg-white/5'
                : 'bg-[#13ec80]/10 dark:bg-[#13ec80]/5'
              }`}
          >
            <ShoppingBasket
              className={`h-5 w-5 ${isClaimed ? 'text-gray-400' : 'text-[#13ec80]'}`}
              aria-hidden="true"
            />
          </motion.div>

          {/* Content */}
          <div className="flex flex-col justify-center min-w-0 flex-1">
            <p
              className={`text-base leading-normal truncate
                ${isClaimed
                  ? 'text-gray-500 dark:text-white/50 font-medium line-through'
                  : 'text-[#0d1b14] dark:text-white font-bold'
                }`}
            >
              {displayName}
            </p>

            {isClaimed ? (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 mt-0.5"
              >
                <div
                  className={`size-4 rounded-full ${avatarColor} flex-shrink-0`}
                  aria-hidden="true"
                />
                <p className="text-gray-500 dark:text-white/40 text-xs font-semibold truncate">
                  {t('claimedBy', { name: item.claimed_by })}
                </p>
              </motion.div>
            ) : item.notes ? (
              <p className="text-[#4c9a73] dark:text-[#13ec80]/60 text-sm font-normal leading-normal line-clamp-2">
                {item.notes}
              </p>
            ) : null}
          </div>
        </div>

        {/* Actions */}
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
              className="flex items-center justify-center rounded-full h-10 w-10
                bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/30
                hover:bg-gray-200 dark:hover:bg-white/20 transition-colors
                focus:outline-none focus:ring-2 focus:ring-gray-400/40
                disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('unclaimItem')}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              )}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsClaimDialogOpen(true)}
              disabled={isLoading}
              className="flex min-w-[84px] cursor-pointer items-center justify-center
                overflow-hidden rounded-full h-10 px-5
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
      </motion.div>

      <ClaimDialog
        isOpen={isClaimDialogOpen}
        onClose={() => setIsClaimDialogOpen(false)}
        onClaim={handleClaim}
        itemName={displayName}
        isLoading={isLoading}
      />
    </>
  )
}
