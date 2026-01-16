'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import type { GroceryItem as GroceryItemType, ConsolidatedItem } from '@/types'
import { ClaimDialog } from './ClaimDialog'
import { ItemDetailsModal } from './ItemDetailsModal'
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
import { ShoppingBasket, Trash2, Loader2, CheckCircle2 } from 'lucide-react'

interface GroceryItemProps {
  // Support both legacy single item and new consolidated item
  item?: GroceryItemType
  consolidatedItem?: ConsolidatedItem
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
  consolidatedItem,
  allItems = [],
  onClaim,
  onUnclaim,
  isEditable = false,
  onDelete
}: GroceryItemProps) {
  const t = useTranslations('grocery')
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isUnclaimConfirmOpen, setIsUnclaimConfirmOpen] = useState(false)
  const [selectedUnclaimId, setSelectedUnclaimId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Use consolidated item if provided, otherwise fall back to legacy single item
  const isConsolidated = !!consolidatedItem

  // Extract data from consolidated or legacy item
  const itemName = consolidatedItem?.item_name ?? item?.item_name ?? ''
  const totalQuantity = consolidatedItem?.totalQuantity ?? item?.quantity ?? 0
  const claims = consolidatedItem?.claims ?? (item?.claimed_by ? [{ claimerName: item.claimed_by, quantity: item.quantity, itemId: item.id }] : [])
  const unclaimedQuantity = consolidatedItem?.unclaimedQuantity ?? (item?.claimed_by ? 0 : item?.quantity ?? 0)
  const unclaimedItems = consolidatedItem?.unclaimedItems ?? (item && !item.claimed_by ? [item] : [])
  const primaryId = consolidatedItem?.id ?? item?.id ?? ''
  const notes = consolidatedItem?.notes ?? item?.notes

  // For legacy support: check child claims
  const childClaims = item ? allItems.filter(i => i.parent_item_id === item.id && i.claimed_by) : []
  const childClaimedQuantity = childClaims.reduce((sum, c) => sum + c.quantity, 0)

  // Determine states
  const hasClaims = claims.length > 0
  const hasUnclaimed = unclaimedQuantity > 0
  const isFullyClaimed = hasClaims && !hasUnclaimed

  const handleClaim = async (name: string, quantity?: number) => {
    setIsLoading(true)
    try {
      // Claim the first unclaimed item in the group
      const targetItem = unclaimedItems[0]
      if (targetItem) {
        await onClaim(targetItem.id, name, quantity)
      }
      setIsClaimDialogOpen(false)
    } catch (error) {
      console.error('Error claiming item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnclaimClick = (claimItemId?: string) => {
    // For consolidated items, we need to know which claim to unclaim
    if (claimItemId) {
      setSelectedUnclaimId(claimItemId)
    } else if (claims.length === 1) {
      setSelectedUnclaimId(claims[0].itemId)
    } else if (item) {
      setSelectedUnclaimId(item.id)
    }
    setIsUnclaimConfirmOpen(true)
  }

  const handleUnclaimConfirm = async () => {
    if (!selectedUnclaimId) return
    setIsLoading(true)
    setIsUnclaimConfirmOpen(false)
    try {
      await onUnclaim(selectedUnclaimId)
    } catch (error) {
      console.error('Error unclaiming item:', error)
    } finally {
      setIsLoading(false)
      setSelectedUnclaimId(null)
    }
  }

  // Generate consistent avatar color based on claimer name
  const getAvatarColor = (name: string) => {
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
    return avatarColors[charSum % avatarColors.length]
  }

  // For display
  const displayQuantity = isConsolidated ? totalQuantity : (totalQuantity + childClaimedQuantity)
  const displayName = displayQuantity > 1 ? `${displayQuantity}x ${itemName}` : itemName
  const primaryClaimer = claims[0]?.claimerName
  const avatarColor = primaryClaimer ? getAvatarColor(primaryClaimer) : avatarColors[0]

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
          ${isFullyClaimed
            ? 'bg-[#13ec80]/5 dark:bg-[#13ec80]/10 border-[#13ec80]/20 dark:border-[#13ec80]/10'
            : 'bg-white dark:bg-[#102219] border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#152a1f]'
          }`}
      >
        {/* Actions - LEFT side for RTL */}
        <div className="shrink-0 flex items-center gap-2">
          {/* Only show delete for unclaimed items - claimed items must be unclaimed first */}
          {isEditable && onDelete && !isFullyClaimed && item && (
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

          {/* Show claim button if there's unclaimed quantity */}
          {hasUnclaimed ? (
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
          ) : hasClaims && claims.length === 1 ? (
            // Single claimer - show unclaim button
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleUnclaimClick(claims[0].itemId)}
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
            // Multiple claimers - show checkmark (click item to see details)
            <div className="flex items-center justify-center rounded-full h-11 px-4
              bg-[#13ec80]/10 dark:bg-[#13ec80]/20 text-[#13ec80]">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </div>
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
                ${isFullyClaimed
                  ? 'text-[#0d1b14]/80 dark:text-white/80 font-medium'
                  : 'text-[#0d1b14] dark:text-white font-bold'
                }`}
            >
              {displayName}
            </p>

            {/* Show claims summary */}
            {hasClaims && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-1 justify-end flex-wrap"
              >
                {/* Show claimers */}
                <div className="flex items-center gap-1">
                  {claims.slice(0, 2).map((claim, idx) => (
                    <div key={claim.itemId} className="flex items-center gap-1">
                      <span className="text-[#13ec80] dark:text-[#13ec80] text-sm font-bold">
                        {claim.claimerName} {claim.quantity > 1 && `(${claim.quantity})`} ✓
                      </span>
                      {idx < Math.min(claims.length - 1, 1) && (
                        <span className="text-[#13ec80]/50">•</span>
                      )}
                    </div>
                  ))}
                  {claims.length > 2 && (
                    <span className="text-[#13ec80]/70 text-xs">+{claims.length - 2}</span>
                  )}
                </div>
                {/* Avatar for primary claimer */}
                <div
                  className={`size-5 rounded-full ${avatarColor} flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold`}
                  aria-hidden="true"
                >
                  {primaryClaimer?.charAt(0).toUpperCase()}
                </div>
              </motion.div>
            )}

            {/* Show remaining unclaimed if partially claimed */}
            {hasClaims && hasUnclaimed && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-0.5 justify-end"
              >
                <p className="text-[#4c9a73] dark:text-[#13ec80]/60 text-xs font-medium">
                  {unclaimedQuantity} {t('remaining')}
                </p>
              </motion.div>
            )}

            {/* Show notes if no claims */}
            {!hasClaims && notes && (
              <p className="text-[#4c9a73] dark:text-[#13ec80]/60 text-sm font-normal leading-normal line-clamp-2">
                {notes}
              </p>
            )}
          </div>

          {/* Icon - RIGHT side for RTL */}
          <motion.div
            initial={false}
            animate={{
              scale: isFullyClaimed ? 0.95 : 1,
              opacity: 1
            }}
            className={`flex size-11 items-center justify-center rounded-full flex-shrink-0
              ${isFullyClaimed
                ? 'bg-[#13ec80]/20 dark:bg-[#13ec80]/15'
                : 'bg-[#13ec80]/10 dark:bg-[#13ec80]/5'
              }`}
          >
            {isFullyClaimed ? (
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
        maxQuantity={unclaimedQuantity}
      />

      <ItemDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        itemName={itemName}
        itemId={primaryId}
        currentItem={item || (unclaimedItems[0] ?? null)}
        allItems={allItems}
        onUnclaim={onUnclaim}
        consolidatedItem={consolidatedItem}
      />

      {/* Unclaim Confirmation Dialog */}
      <AlertDialog
        open={isUnclaimConfirmOpen}
        onOpenChange={setIsUnclaimConfirmOpen}
      >
        <AlertDialogContent className="bg-white dark:bg-[#102219] border-gray-200 dark:border-[#2a3d34]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0d1b14] dark:text-white text-right">
              {t('confirmUnclaim')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#4c9a73] dark:text-[#13ec80]/80 text-right">
              {t('claimedByPerson', {
                name: selectedUnclaimId
                  ? claims.find(c => c.itemId === selectedUnclaimId)?.claimerName || ''
                  : primaryClaimer || ''
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction
              onClick={handleUnclaimConfirm}
              disabled={isLoading}
              variant="destructive"
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('confirmCancel')
              )}
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => setIsUnclaimConfirmOpen(false)}
              disabled={isLoading}
            >
              {t('cancel')}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
