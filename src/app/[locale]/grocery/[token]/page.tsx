'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { GroceryPublicList } from '@/components/features/grocery'
import type { GroceryEvent } from '@/types'
import { Loader2, AlertCircle, ChevronLeft, Share2 } from 'lucide-react'

const PRODUCTION_URL = 'https://beeri.online'

export default function GroceryPublicPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [event, setEvent] = useState<GroceryEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvent = useCallback(async () => {
    try {
      const response = await fetch(`/api/grocery/${token}?_t=${Date.now()}`, {
        cache: 'no-store'
      })
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'רשימת הקניות לא נמצאה')
      }

      setEvent(result.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת הרשימה')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  const handleClaimItem = async (itemId: string, claimerName: string, quantity?: number) => {
    const response = await fetch(`/api/grocery/${token}/items/${itemId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        claimer_name: claimerName,
        quantity: quantity // For partial claiming
      })
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'שגיאה בתפיסת הפריט')
    }

    // Refresh the list
    await fetchEvent()
  }

  const handleUnclaimItem = async (itemId: string) => {
    const response = await fetch(`/api/grocery/${token}/items/${itemId}/claim`, {
      method: 'DELETE'
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'שגיאה בביטול התפיסה')
    }

    // Refresh the list
    await fetchEvent()
  }

  const handleShare = () => {
    const shareUrl = `${PRODUCTION_URL}/grocery/${token}`
    const text = encodeURIComponent(
      `היי! 🛒\n\n` +
      `הצטרפו לרשימת הקניות ל${event?.event_name} של ${event?.class_name}\n\n` +
      `לחצו על הקישור, בחרו פריט ולחצו "אני אביא":\n${shareUrl}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f8f7] dark:bg-[#102219]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-10 w-10 text-[#13ec80]" />
          <p className="text-gray-500">טוען רשימה...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f8f7] dark:bg-[#102219]">
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p className="text-red-500 font-semibold">{error || 'רשימת הקניות לא נמצאה'}</p>
          <button
            onClick={() => router.push('/he/grocery')}
            className="text-[#13ec80] font-semibold underline"
          >
            צור רשימה חדשה
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f6f8f7] dark:bg-[#102219] max-w-[480px] mx-auto shadow-xl">
      {/* Header - positioned below Navigation (h-16 = 64px) */}
      <header className="flex items-center bg-[#f6f8f7]/95 dark:bg-[#102219]/95 backdrop-blur-md p-4 pb-2 justify-between sticky top-16 z-40 border-b border-gray-100 dark:border-white/10">
        <div className="text-[#0d1b14] dark:text-white flex size-12 shrink-0 items-center justify-start cursor-pointer">
          <button onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <h2 className="text-[#0d1b14] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          רשימת קניות
        </h2>
        <div className="flex w-12 items-center justify-end">
          <button
            onClick={handleShare}
            className="flex items-center justify-center h-12 text-[#0d1b14] dark:text-white"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* List */}
      <GroceryPublicList
        event={event}
        onClaimItem={handleClaimItem}
        onUnclaimItem={handleUnclaimItem}
        onRefresh={fetchEvent}
      />
    </div>
  )
}
