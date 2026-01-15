'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { GroceryEvent } from '@/types'
import { GroceryProgressBar } from '@/components/features/grocery'
import { Loader2, AlertCircle, ChevronLeft, ShoppingCart, MessageCircle, Plus } from 'lucide-react'

export default function GroceryAdminPage() {
  const router = useRouter()

  const [events, setEvents] = useState<GroceryEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(`/api/grocery?status=${filter}&_t=${Date.now()}`, {
        cache: 'no-store'
      })
      const result = await response.json()

      if (!result.success) {
        if (response.status === 401) {
          router.push('/he/login?redirect=/he/grocery/admin')
          return
        }
        throw new Error(result.error || 'שגיאה בטעינת הרשימות')
      }

      setEvents(result.data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת הרשימות')
    } finally {
      setIsLoading(false)
    }
  }, [filter, router])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleWhatsAppNudge = (event: GroceryEvent) => {
    const shareUrl = `${window.location.origin}/he/grocery/${event.share_token}`
    const unclaimed = event.total_items - event.claimed_items
    const text = encodeURIComponent(
      `תזכורת! 🛒\n\n` +
      `עדיין חסרים ${unclaimed} פריטים לרשימת הקניות של ${event.event_name} (${event.class_name})\n\n` +
      `עזרו להשלים את הרשימה:\n${shareUrl}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f8f7] dark:bg-[#102219]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-10 w-10 text-[#13ec80]" />
          <p className="text-gray-500">טוען רשימות...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative mx-auto flex h-full min-h-screen w-full max-w-[430px] flex-col overflow-x-hidden shadow-2xl bg-[#f6f8f7] dark:bg-[#102219]">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center bg-[#f6f8f7]/80 dark:bg-[#102219]/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="text-[#0d1b14] dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
          <button onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <h2 className="text-[#0d1b14] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          ניהול רשימות קניות
        </h2>
        <div className="flex w-12 items-center justify-end">
          <button
            onClick={() => router.push('/he/grocery')}
            className="text-[#13ec80] text-base font-bold leading-normal tracking-[0.015em] shrink-0 hover:opacity-80 transition-opacity"
          >
            חדש
          </button>
        </div>
      </header>

      <main className="flex-1 pb-24">
        {/* Title */}
        <div className="pt-6 px-4">
          <p className="text-[#13ec80] text-xs font-bold uppercase tracking-wider mb-1">
            דשבורד מנהל
          </p>
          <h3 className="text-[#0d1b14] dark:text-white tracking-tight text-3xl font-extrabold leading-tight">
            רשימות קניות
          </h3>
        </div>

        {/* Summary Stats */}
        <div className="mx-4 mt-6 p-5 rounded-xl bg-white dark:bg-[#1a2e24] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-center">
            <p className="text-[#0d1b14] dark:text-white text-lg font-semibold">
              סה״כ רשימות פעילות
            </p>
            <p className="text-[#0d1b14] dark:text-white text-2xl font-extrabold">
              {events.filter(e => e.status === 'active').length}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-3 p-4 mt-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('active')}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 cursor-pointer transition-all ${
              filter === 'active'
                ? 'bg-[#13ec80] shadow-sm shadow-[#13ec80]/20 text-[#0d1b14] font-bold'
                : 'bg-white dark:bg-[#1a2e24] border border-gray-100 dark:border-gray-800 text-[#0d1b14] dark:text-white font-medium'
            }`}
          >
            <p className="text-sm">פעילות</p>
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 cursor-pointer transition-all ${
              filter === 'completed'
                ? 'bg-[#13ec80] shadow-sm shadow-[#13ec80]/20 text-[#0d1b14] font-bold'
                : 'bg-white dark:bg-[#1a2e24] border border-gray-100 dark:border-gray-800 text-[#0d1b14] dark:text-white font-medium'
            }`}
          >
            <p className="text-sm">הושלמו</p>
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 cursor-pointer transition-all ${
              filter === 'all'
                ? 'bg-[#13ec80] shadow-sm shadow-[#13ec80]/20 text-[#0d1b14] font-bold'
                : 'bg-white dark:bg-[#1a2e24] border border-gray-100 dark:border-gray-800 text-[#0d1b14] dark:text-white font-medium'
            }`}
          >
            <p className="text-sm">הכל</p>
          </button>
        </div>

        {/* Events List */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <AlertCircle className="h-12 w-12 mb-2 text-red-400" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <ShoppingCart className="h-12 w-12 mb-2" />
            <p className="text-sm">אין רשימות קניות</p>
            <button
              onClick={() => router.push('/he/grocery')}
              className="mt-4 text-[#13ec80] font-semibold underline"
            >
              צור רשימה חדשה
            </button>
          </div>
        ) : (
          <div className="space-y-4 px-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-[#1a2e24] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
              >
                {/* Event Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[#0d1b14] dark:text-white text-base font-bold">
                        {event.event_name}
                      </h4>
                      <p className="text-gray-500 text-sm">
                        {event.class_name} • {formatDate(event.created_at)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      event.status === 'active'
                        ? 'bg-[#13ec80]/10 text-[#13ec80]'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {event.status === 'active' ? 'פעיל' : 'הושלם'}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="p-4">
                  <GroceryProgressBar
                    claimed={event.claimed_items}
                    total={event.total_items}
                    showText={false}
                  />
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={() => router.push(`/he/grocery/${event.share_token}`)}
                    className="flex-1 h-10 rounded-lg bg-gray-100 dark:bg-[#2a3d34] text-[#0d1b14] dark:text-white text-sm font-semibold hover:bg-gray-200 dark:hover:bg-[#3a4d44] transition-colors"
                  >
                    צפה ברשימה
                  </button>
                  {event.status === 'active' && event.claimed_items < event.total_items && (
                    <button
                      onClick={() => handleWhatsAppNudge(event)}
                      className="flex items-center gap-1 h-10 px-4 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:bg-[#25D366]/90 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      תזכורת
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4">
        <button
          onClick={() => router.push('/he/grocery')}
          className="w-full bg-[#0d1b14] dark:bg-white text-white dark:text-[#0d1b14] font-bold py-4 px-6 rounded-full shadow-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform"
        >
          <Plus className="h-5 w-5" />
          רשימת קניות חדשה
        </button>
      </div>
    </div>
  )
}
