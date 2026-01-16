'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import {
  ChevronLeft,
  Loader2,
  Save,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  GraduationCap,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  Package,
  Check,
  History,
  UserCheck,
  UserMinus,
  Pencil,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { GroceryContributorsSummary } from '@/components/features/grocery/GroceryContributorsSummary'
import { cn } from '@/lib/utils'
import type { GroceryEvent, GroceryItem } from '@/types'

// Activity entry interface for history tracking
interface ActivityEntry {
  id: string
  timestamp: string
  action: 'claimed' | 'unclaimed' | 'added' | 'removed' | 'edited'
  item_name: string
  user_name?: string
  quantity?: number
}

// Swipeable Item Row Component
interface SwipeableItemRowProps {
  item: GroceryItem
  index: number
  isEditing: boolean
  editingName: string
  onStartEdit: () => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onEditNameChange: (name: string) => void
  onUpdateQuantity: (quantity: number) => void
  onRemove: () => void
  t: ReturnType<typeof useTranslations>
}

function SwipeableItemRow({
  item,
  index,
  isEditing,
  editingName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditNameChange,
  onUpdateQuantity,
  onRemove,
  t
}: SwipeableItemRowProps) {
  const x = useMotionValue(0)
  const background = useTransform(x, [-120, 0], ['#ef4444', '#f8fafc'])
  const deleteOpacity = useTransform(x, [-120, -60, 0], [1, 0.5, 0])
  const scale = useTransform(x, [-120, 0], [1, 0.8])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -100) {
      onRemove()
    }
  }

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -200, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Delete background */}
      <motion.div
        className="absolute inset-y-0 left-0 w-24 flex items-center justify-center rounded-xl"
        style={{ background }}
      >
        <motion.div style={{ opacity: deleteOpacity, scale }}>
          <Trash2 className="h-6 w-6 text-white" />
        </motion.div>
      </motion.div>

      {/* Draggable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative flex items-center gap-2 p-2 sm:p-3 bg-slate-50 rounded-xl cursor-grab active:cursor-grabbing"
        dir="rtl"
      >
        {/* Item Number Badge with claim status */}
        <div className={cn(
          "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all duration-300",
          item.claimed_by
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
            : "bg-emerald-100 text-emerald-600"
        )}>
          {item.claimed_by ? <Check className="h-4 w-4" /> : index + 1}
        </div>

        {/* Item Name + Claimed Status */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editingName}
                onChange={(e) => onEditNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSaveEdit()
                  if (e.key === 'Escape') onCancelEdit()
                }}
                className="h-8 text-sm"
                autoFocus
              />
              <button
                onClick={onSaveEdit}
                className="p-1.5 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={onCancelEdit}
                className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={onStartEdit}
              className="cursor-pointer group"
            >
              <span className={cn(
                "block text-slate-800 font-medium text-sm sm:text-base min-w-0 break-words leading-tight group-hover:text-blue-600 transition-colors",
                item.claimed_by && "line-through text-slate-400"
              )}>
                {item.item_name}
                <Pencil className="inline-block h-3 w-3 mr-1 opacity-0 group-hover:opacity-50 transition-opacity" />
              </span>
              {item.claimed_by && (
                <span className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                  <UserCheck className="h-3 w-3" />
                  {item.claimed_by}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quantity Controls */}
        {!isEditing && (
          <div className="flex items-center bg-white rounded-full border border-slate-200 shrink-0" dir="ltr">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-30 transition-colors"
              aria-label={t('decreaseQuantity', { item: item.item_name })}
            >
              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <span className="w-7 sm:w-8 text-center font-bold text-slate-700 text-sm sm:text-base">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              aria-label={t('increaseQuantity', { item: item.item_name })}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        )}

        {/* Delete Button (visible on desktop) */}
        {!isEditing && (
          <button
            type="button"
            onClick={onRemove}
            className="hidden sm:flex w-7 h-7 sm:w-8 sm:h-8 items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            aria-label={t('deleteItem')}
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}

// Activity History Component
interface ActivityHistoryProps {
  activities: ActivityEntry[]
  t: ReturnType<typeof useTranslations>
}

function ActivityHistory({ activities, t }: ActivityHistoryProps) {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'עכשיו'
    if (diffMins < 60) return `לפני ${diffMins} דקות`
    if (diffHours < 24) return `לפני ${diffHours} שעות`
    if (diffDays < 7) return `לפני ${diffDays} ימים`
    return date.toLocaleDateString('he-IL')
  }

  const getActionIcon = (action: ActivityEntry['action']) => {
    switch (action) {
      case 'claimed': return <UserCheck className="h-4 w-4" />
      case 'unclaimed': return <UserMinus className="h-4 w-4" />
      case 'added': return <Plus className="h-4 w-4" />
      case 'removed': return <Trash2 className="h-4 w-4" />
      case 'edited': return <Pencil className="h-4 w-4" />
    }
  }

  const getActionColor = (action: ActivityEntry['action']) => {
    switch (action) {
      case 'claimed': return 'bg-emerald-100 text-emerald-600'
      case 'unclaimed': return 'bg-red-100 text-red-600'
      case 'added': return 'bg-blue-100 text-blue-600'
      case 'removed': return 'bg-red-100 text-red-600'
      case 'edited': return 'bg-purple-100 text-purple-600'
    }
  }

  const getActionText = (action: ActivityEntry['action']) => {
    switch (action) {
      case 'claimed': return t('actionClaimed')
      case 'unclaimed': return t('actionUnclaimed')
      case 'added': return t('actionAdded')
      case 'removed': return t('actionRemoved')
      case 'edited': return t('actionEdited')
    }
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400">
        <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">{t('noActivity')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      <AnimatePresence>
        {activities.slice(0, 10).map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3 text-sm"
            dir="rtl"
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              getActionColor(activity.action)
            )}>
              {getActionIcon(activity.action)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-700">
                <span className="font-medium">{activity.user_name || t('someone')}</span>
                {' '}
                {getActionText(activity.action)}
                {' '}
                <span className="font-medium">{activity.item_name}</span>
                {activity.quantity && activity.quantity > 1 && (
                  <span className="text-slate-500"> (×{activity.quantity})</span>
                )}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatTimeAgo(activity.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function GroceryEditPage() {
  const params = useParams()
  const token = params.token as string
  const t = useTranslations('groceryEdit')
  const router = useRouter()
  const itemInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const [groceryEvent, setGroceryEvent] = useState<GroceryEvent | null>(null)
  const [items, setItems] = useState<GroceryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [eventName, setEventName] = useState('')
  const [className, setClassName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [eventAddress, setEventAddress] = useState('')
  const [creatorName, setCreatorName] = useState('')
  const [status, setStatus] = useState<'active' | 'completed' | 'archived'>('active')

  // New item state
  const [newItemName, setNewItemName] = useState('')
  const [isAddingItem, setIsAddingItem] = useState(false)

  // Inline editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingItemName, setEditingItemName] = useState('')

  // Activity history state
  const [activities, setActivities] = useState<ActivityEntry[]>([])

  // Pending deletions for undo functionality
  const pendingDeletions = useRef<Map<string, { item: GroceryItem; timeoutId: NodeJS.Timeout }>>(new Map())

  // Filter out partial claim items (items with parent_item_id) - they're shown under their parent
  const mainItems = useMemo(() => {
    return items.filter(item => !item.parent_item_id)
  }, [items])

  // Calculate statistics - only count main items, not partial claim splits
  const stats = useMemo(() => {
    const claimed = mainItems.filter(item => item.claimed_by).length
    const unclaimed = mainItems.filter(item => !item.claimed_by).length
    const totalQuantity = mainItems.reduce((sum, item) => sum + item.quantity, 0)
    return { claimed, unclaimed, totalQuantity, total: mainItems.length }
  }, [mainItems])

  // Fetch activities from database
  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch(`/api/grocery/${token}/activities?limit=50&_t=${Date.now()}`, {
        cache: 'no-store'
      })
      const data = await response.json()

      if (data.success && data.data) {
        const dbActivities: ActivityEntry[] = data.data.map((activity: {
          id: string
          created_at: string
          action: 'claimed' | 'unclaimed' | 'added' | 'removed' | 'edited'
          item_name: string
          user_name?: string
          quantity?: number
        }) => ({
          id: activity.id,
          timestamp: activity.created_at,
          action: activity.action,
          item_name: activity.item_name,
          user_name: activity.user_name,
          quantity: activity.quantity
        }))
        setActivities(dbActivities)
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err)
    }
  }, [token])

  // Fetch grocery event data
  const fetchGroceryEvent = useCallback(async () => {
    try {
      const response = await fetch(`/api/grocery/${token}?_t=${Date.now()}`, {
        cache: 'no-store'
      })
      const data = await response.json()

      if (data.success && data.data) {
        const event = data.data as GroceryEvent
        setGroceryEvent(event)
        setItems(event.items || [])
        // Populate form fields
        setEventName(event.event_name || '')
        setClassName(event.class_name || '')
        setEventDate(event.event_date || '')
        setEventTime(event.event_time || '')
        setEventAddress(event.event_address || '')
        setCreatorName(event.creator_name || '')
        setStatus(event.status)

        // Fetch activities from database
        await fetchActivities()
      } else {
        setError(t('notFound'))
      }
    } catch {
      setError(t('notFound'))
    } finally {
      setIsLoading(false)
    }
  }, [token, t, fetchActivities])

  useEffect(() => {
    fetchGroceryEvent()
  }, [fetchGroceryEvent])

  // Cleanup pending deletions on unmount
  useEffect(() => {
    return () => {
      pendingDeletions.current.forEach(({ timeoutId }) => clearTimeout(timeoutId))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/grocery/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: eventName,
          class_name: className,
          event_date: eventDate || null,
          event_time: eventTime || null,
          event_address: eventAddress || null,
          creator_name: creatorName || null,
          status
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setGroceryEvent(data.data)
        setTimeout(() => {
          router.push(`/grocery/${token}`)
        }, 1500)
      } else {
        setError(data.error || t('error'))
      }
    } catch {
      setError(t('error'))
    } finally {
      setIsSaving(false)
    }
  }

  // Item management handlers
  const handleAddItem = async () => {
    if (!newItemName.trim() || isAddingItem) return

    const itemName = newItemName.trim()
    setNewItemName('')
    setIsAddingItem(true)

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimisticItem: GroceryItem = {
      id: tempId,
      grocery_event_id: groceryEvent?.id || '',
      item_name: itemName,
      quantity: 1,
      display_order: items.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setItems(prev => [...prev, optimisticItem])

    // Add to activity
    setActivities(prev => [{
      id: `add-${tempId}`,
      timestamp: new Date().toISOString(),
      action: 'added',
      item_name: itemName,
      user_name: creatorName || undefined
    }, ...prev])

    try {
      const response = await fetch(`/api/grocery/${token}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_name: itemName, quantity: 1 })
      })

      const data = await response.json()

      if (data.success) {
        // Replace temp item with real item
        setItems(prev => prev.map(item =>
          item.id === tempId ? data.data : item
        ))
      } else {
        // Rollback on error
        setItems(prev => prev.filter(item => item.id !== tempId))
        setActivities(prev => prev.filter(a => a.id !== `add-${tempId}`))
      }
    } catch {
      // Rollback on error
      setItems(prev => prev.filter(item => item.id !== tempId))
      setActivities(prev => prev.filter(a => a.id !== `add-${tempId}`))
    } finally {
      setIsAddingItem(false)
      itemInputRef.current?.focus()
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    // Check if already pending deletion
    if (pendingDeletions.current.has(itemId)) return

    const removedItem = items.find(item => item.id === itemId)
    if (!removedItem) return

    // Optimistic update - remove from UI
    setItems(prev => prev.filter(item => item.id !== itemId))

    // Add to activity
    const activityId = `remove-${itemId}-${Date.now()}`
    setActivities(prev => [{
      id: activityId,
      timestamp: new Date().toISOString(),
      action: 'removed',
      item_name: removedItem.item_name,
      user_name: creatorName || undefined
    }, ...prev])

    // Show toast with undo option
    const { dismiss } = toast({
      title: t('itemRemoved'),
      description: removedItem.item_name,
      duration: 5000,
      action: (
        <ToastAction
          altText={t('undo')}
          onClick={() => {
            // Cancel the pending deletion
            const pending = pendingDeletions.current.get(itemId)
            if (pending) {
              clearTimeout(pending.timeoutId)
              pendingDeletions.current.delete(itemId)
            }
            // Restore the item
            setItems(prev => [...prev, removedItem].sort((a, b) =>
              (a.display_order || 0) - (b.display_order || 0)
            ))
            // Remove the activity entry
            setActivities(prev => prev.filter(a => a.id !== activityId))
            dismiss()
          }}
        >
          {t('undo')}
        </ToastAction>
      ),
    })

    // Set up delayed actual deletion
    const timeoutId = setTimeout(async () => {
      pendingDeletions.current.delete(itemId)
      try {
        await fetch(`/api/grocery/${token}/items/${itemId}`, {
          method: 'DELETE'
        })
      } catch {
        // If deletion fails, restore the item
        setItems(prev => [...prev, removedItem].sort((a, b) =>
          (a.display_order || 0) - (b.display_order || 0)
        ))
        setActivities(prev => prev.filter(a => a.id !== activityId))
      }
    }, 5000)

    pendingDeletions.current.set(itemId, { item: removedItem, timeoutId })
  }

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return

    // Get the original item to check if it's claimed
    const originalItem = items.find(item => item.id === itemId)
    if (!originalItem) return

    // Optimistic update
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ))

    try {
      const response = await fetch(`/api/grocery/${token}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      })

      const data = await response.json()

      if (!response.ok) {
        // Rollback on error
        setItems(prev => prev.map(item =>
          item.id === itemId ? originalItem : item
        ))
      } else if (data.additionalItemCreated) {
        // Special case: quantity increase on a claimed item
        // The API created a new unclaimed item, we need to refetch to see it
        // Revert the optimistic update first (the claimed item's quantity didn't change)
        setItems(prev => prev.map(item =>
          item.id === itemId ? originalItem : item
        ))
        // Then refetch to get the new unclaimed item
        await fetchGroceryEvent()

        toast({
          title: t('quantityAddedTitle'),
          description: t('quantityAddedDescription'),
          duration: 4000,
        })
      }
    } catch {
      // Rollback on error
      setItems(prev => prev.map(item =>
        item.id === itemId ? originalItem : item
      ))
    }
  }

  // Inline editing handlers
  const handleStartEdit = (item: GroceryItem) => {
    setEditingItemId(item.id)
    setEditingItemName(item.item_name)
  }

  const handleSaveEdit = async () => {
    if (!editingItemId || !editingItemName.trim()) {
      handleCancelEdit()
      return
    }

    const originalItem = items.find(item => item.id === editingItemId)
    if (!originalItem || originalItem.item_name === editingItemName.trim()) {
      handleCancelEdit()
      return
    }

    const newName = editingItemName.trim()

    // Optimistic update
    setItems(prev => prev.map(item =>
      item.id === editingItemId ? { ...item, item_name: newName } : item
    ))

    // Add to activity
    setActivities(prev => [{
      id: `edit-${editingItemId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'edited',
      item_name: newName,
      user_name: creatorName || undefined
    }, ...prev])

    setEditingItemId(null)
    setEditingItemName('')

    try {
      const response = await fetch(`/api/grocery/${token}/items/${originalItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_name: newName })
      })

      if (!response.ok) {
        // Rollback on error
        setItems(prev => prev.map(item =>
          item.id === originalItem.id ? originalItem : item
        ))
      }
    } catch {
      // Rollback on error
      setItems(prev => prev.map(item =>
        item.id === originalItem.id ? originalItem : item
      ))
    }
  }

  const handleCancelEdit = () => {
    setEditingItemId(null)
    setEditingItemName('')
  }

  const formatDateParts = (dateStr: string) => {
    if (!dateStr) return null
    try {
      const date = new Date(dateStr + 'T00:00:00')
      if (isNaN(date.getTime())) return null

      const parts = new Intl.DateTimeFormat('he-IL', {
        day: 'numeric',
        month: 'long'
      }).formatToParts(date)

      const day = parts.find((p) => p.type === 'day')?.value ?? ''
      const month = parts.find((p) => p.type === 'month')?.value ?? ''

      return { day, month }
    } catch {
      return null
    }
  }

  const formattedDate = formatDateParts(eventDate)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error && !groceryEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t('notFound')}</h2>
            <p className="text-slate-500 mb-6">{error}</p>
            <Button
              variant="outline"
              onClick={() => router.push('/my-lists')}
            >
              <ChevronLeft className="h-4 w-4 ml-1" />
              {t('backToMyLists')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-6" dir="rtl">
          <Link
            href={`/grocery/${token}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-blue-600 transition-colors mb-4"
          >
            {t('backToList')}
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
              <p className="text-sm text-slate-500">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3"
            dir="rtl"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-emerald-700 font-medium">{t('success')}</p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && groceryEvent && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3" dir="rtl">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6" dir="rtl">
          <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm text-center">
            <div className="text-2xl font-bold text-slate-800">{mainItems.length}</div>
            <div className="text-xs text-slate-500">{t('totalItems')}</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.claimed}</div>
            <div className="text-xs text-emerald-600">{t('claimedItems')}</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.unclaimed}</div>
            <div className="text-xs text-amber-600">{t('unclaimedItems')}</div>
          </div>
        </div>

        {/* Contributors Summary Button */}
        {items.some(item => item.claimed_by) && (
          <div className="mb-6 flex justify-center" dir="rtl">
            <GroceryContributorsSummary items={items} />
          </div>
        )}

        {/* Event Details Form */}
        <Card className="border-0 shadow-lg mb-6">
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2" dir="rtl">
              <FileText className="h-5 w-5 text-blue-500" />
              {t('eventDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Event Name */}
              <div className="space-y-2">
                <Label htmlFor="eventName" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  {t('eventName')}
                </Label>
                <Input
                  id="eventName"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder={t('eventNamePlaceholder')}
                  required
                  className="h-11"
                />
              </div>

              {/* Class Name */}
              <div className="space-y-2">
                <Label htmlFor="className" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-400" />
                  {t('className')}
                </Label>
                <Input
                  id="className"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder={t('classNamePlaceholder')}
                  required
                  className="h-11"
                />
              </div>

              {/* Date and Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {t('eventDate')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="eventDate"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="h-11 pl-12 pr-4"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventTime" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {t('eventTime')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="eventTime"
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="h-11 pl-12 pr-4"
                      dir="ltr"
                      step="60"
                    />
                  </div>
                </div>
              </div>

              {/* Clean Date Summary */}
              {formattedDate && (
                <div className="flex items-center justify-center gap-3 py-3 px-4 bg-slate-50 rounded-lg border border-slate-200" dir="rtl">
                  <Calendar className="h-4 w-4 text-blue-500 shrink-0" />
                  <span className="text-base font-semibold text-slate-700">
                    {formattedDate.day} {formattedDate.month}
                  </span>
                  {eventTime && (
                    <>
                      <span className="text-slate-300">|</span>
                      <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="text-base font-semibold text-slate-700" dir="ltr">
                        {eventTime.slice(0, 5)}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="eventAddress" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {t('eventAddress')}
                </Label>
                <Input
                  id="eventAddress"
                  value={eventAddress}
                  onChange={(e) => setEventAddress(e.target.value)}
                  placeholder={t('eventAddressPlaceholder')}
                  className="h-11"
                />
              </div>

              {/* Creator Name */}
              <div className="space-y-2">
                <Label htmlFor="creatorName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  {t('creatorName')}
                </Label>
                <Input
                  id="creatorName"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder={t('creatorNamePlaceholder')}
                  className="h-11"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  {t('status')}
                </Label>
                <Select
                  value={status}
                  onValueChange={(value: 'active' | 'completed' | 'archived') => setStatus(value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('statusActive')}</SelectItem>
                    <SelectItem value="completed">{t('statusCompleted')}</SelectItem>
                    <SelectItem value="archived">{t('statusArchived')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/grocery/${token}`)}
                  disabled={isSaving}
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      {t('saving')}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      {t('save')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Items Management */}
        <Card className="border-0 shadow-lg mb-6">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2" dir="rtl">
              <Package className="h-5 w-5 text-emerald-500" />
              {t('itemsTitle')} ({mainItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Swipe hint for mobile */}
            <p className="text-xs text-slate-400 text-center mb-3 sm:hidden" dir="rtl">
              {t('swipeToDelete')} • {t('tapToEdit')}
            </p>

            {/* Add Item Input */}
            <div className="flex gap-2 mb-4" dir="rtl">
              <Input
                ref={itemInputRef}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                placeholder={t('itemPlaceholder')}
                className="h-11 sm:h-12 flex-1"
                disabled={isAddingItem}
              />
              <Button
                type="button"
                onClick={handleAddItem}
                disabled={!newItemName.trim() || isAddingItem}
                className="h-11 sm:h-12 bg-emerald-500 hover:bg-emerald-600 text-white px-4 sm:px-5 shrink-0"
              >
                {isAddingItem ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Items List */}
            {mainItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('noItems')}</p>
              </div>
            ) : (
              <div className="space-y-2" role="list" aria-label="רשימת פריטים">
                <AnimatePresence mode="popLayout">
                  {mainItems.map((item, index) => (
                    <SwipeableItemRow
                      key={item.id}
                      item={item}
                      index={index}
                      isEditing={editingItemId === item.id}
                      editingName={editingItemName}
                      onStartEdit={() => handleStartEdit(item)}
                      onSaveEdit={handleSaveEdit}
                      onCancelEdit={handleCancelEdit}
                      onEditNameChange={setEditingItemName}
                      onUpdateQuantity={(qty) => handleUpdateQuantity(item.id, qty)}
                      onRemove={() => handleRemoveItem(item.id)}
                      t={t}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Item Count Summary */}
            {mainItems.length > 0 && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100" dir="rtl">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">{t('totalItems')}</span>
                  <span className="font-bold text-emerald-800">{mainItems.length}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity History */}
        <Card className="border-0 shadow-lg mb-6">
          <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2" dir="rtl">
              <History className="h-5 w-5 text-amber-500" />
              {t('activityHistory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityHistory activities={activities} t={t} />
          </CardContent>
        </Card>

        {/* Quick Link Back */}
        <div className="mt-6 text-center" dir="rtl">
          <Link
            href="/my-lists"
            className="text-sm text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
          >
            {t('backToMyLists')}
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  )
}
