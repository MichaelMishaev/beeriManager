'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { GroceryShareSuccess } from '@/components/features/grocery'
import type { GroceryEvent } from '@/types'
import { Loader2, AlertCircle } from 'lucide-react'

export default function GrocerySuccessPage() {
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

  const handleViewEvent = () => {
    router.push(`/he/grocery/${token}`)
  }

  const handleBackToDashboard = () => {
    router.push('/he/grocery')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f8f7] dark:bg-[#102219]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-10 w-10 text-[#13ec80]" />
          <p className="text-gray-500">טוען...</p>
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
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f6f8f7] dark:bg-[#102219] max-w-[430px] mx-auto shadow-2xl">
      <GroceryShareSuccess
        event={event}
        onViewEvent={handleViewEvent}
        onBackToDashboard={handleBackToDashboard}
      />
    </div>
  )
}
