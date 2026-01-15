'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { GroceryItemEditor } from '@/components/features/grocery'
import type { GroceryItem } from '@/types'
import { Loader2, AlertCircle, ChevronLeft } from 'lucide-react'

export default function GroceryItemsPage() {
  const t = useTranslations('grocery')
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [items, setItems] = useState<GroceryItem[]>([])
  const [_eventId, setEventId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch(`/api/grocery/${token}?_t=${Date.now()}`, {
        cache: 'no-store'
      })
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'רשימת הקניות לא נמצאה')
      }

      setEventId(result.data.id)
      setItems(result.data.items || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת הרשימה')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleAddItem = async (item: { item_name: string; quantity: number }) => {
    const response = await fetch(`/api/grocery/${token}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'שגיאה בהוספת הפריט')
    }

    // Refresh items
    await fetchItems()
  }

  const handleRemoveItem = async (itemId: string) => {
    const response = await fetch(`/api/grocery/${token}/items/${itemId}`, {
      method: 'DELETE'
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'שגיאה במחיקת הפריט')
    }

    // Refresh items
    await fetchItems()
  }

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    const response = await fetch(`/api/grocery/${token}/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'שגיאה בעדכון הכמות')
    }

    // Update local state immediately for better UX
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  const handleDone = () => {
    router.push(`/he/grocery/success/${token}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f8f7] dark:bg-[#102219]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-10 w-10 text-[#13ec80]" />
          <p className="text-gray-500">{t('loadingList')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f8f7] dark:bg-[#102219]">
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p className="text-red-500 font-semibold">{error}</p>
          <button
            onClick={() => router.push('/he/grocery')}
            className="text-[#13ec80] font-semibold underline"
          >
            {t('createFirstList')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f6f8f7] dark:bg-[#102219] max-w-[430px] mx-auto shadow-2xl font-[family-name:var(--font-jakarta)]">
      {/* Header - iOS Style */}
      <header className="sticky top-0 z-50 bg-[#f6f8f7]/80 dark:bg-[#102219]/80 backdrop-blur-md border-b border-[#cfe7db] dark:border-[#1e3a2c]">
        <div className="flex items-center p-4 justify-between max-w-md mx-auto">
          <button
            onClick={() => router.back()}
            className="text-[#0d1b14] dark:text-white flex size-10 items-center justify-start cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-[#13ec80]/30 rounded-lg"
            aria-label={t('back')}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-[#0d1b14] dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">
            {t('addingItems')}
          </h2>
          <div className="flex w-10 items-center justify-end">
            <button
              onClick={handleDone}
              className="text-[#13ec80] text-base font-bold cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-[#13ec80]/30 rounded px-2 py-1"
            >
              {t('finish')}
            </button>
          </div>
        </div>
      </header>

      {/* Item Editor */}
      <GroceryItemEditor
        items={items}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onDone={handleDone}
      />
    </div>
  )
}
