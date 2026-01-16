'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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
  Package
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
import type { GroceryEvent, GroceryItem } from '@/types'

export default function GroceryEditPage() {
  const params = useParams()
  const token = params.token as string
  const t = useTranslations('groceryEdit')
  const router = useRouter()
  const itemInputRef = useRef<HTMLInputElement>(null)

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
      } else {
        setError(t('notFound'))
      }
    } catch {
      setError(t('notFound'))
    } finally {
      setIsLoading(false)
    }
  }, [token, t])

  useEffect(() => {
    fetchGroceryEvent()
  }, [fetchGroceryEvent])

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
      }
    } catch {
      // Rollback on error
      setItems(prev => prev.filter(item => item.id !== tempId))
    } finally {
      setIsAddingItem(false)
      itemInputRef.current?.focus()
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    // Optimistic update
    const removedItem = items.find(item => item.id === itemId)
    setItems(prev => prev.filter(item => item.id !== itemId))

    try {
      const response = await fetch(`/api/grocery/${token}/items/${itemId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        // Rollback on error
        if (removedItem) {
          setItems(prev => [...prev, removedItem])
        }
      }
    } catch {
      // Rollback on error
      if (removedItem) {
        setItems(prev => [...prev, removedItem])
      }
    }
  }

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return

    // Optimistic update
    const originalItem = items.find(item => item.id === itemId)
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ))

    try {
      const response = await fetch(`/api/grocery/${token}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      })

      if (!response.ok && originalItem) {
        // Rollback on error
        setItems(prev => prev.map(item =>
          item.id === itemId ? originalItem : item
        ))
      }
    } catch {
      // Rollback on error
      if (originalItem) {
        setItems(prev => prev.map(item =>
          item.id === itemId ? originalItem : item
        ))
      }
    }
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
              onClick={() => router.push('/my-grocery')}
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
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300" dir="rtl">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-emerald-700 font-medium">{t('success')}</p>
          </div>
        )}

        {/* Error Message */}
        {error && groceryEvent && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3" dir="rtl">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-red-700">{error}</p>
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

              {/* Clean Date Summary - Industry Standard */}
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
        <Card className="border-0 shadow-lg">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2" dir="rtl">
              <Package className="h-5 w-5 text-emerald-500" />
              {t('itemsTitle')} ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Item Input - RTL layout */}
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
            {items.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('noItems')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 sm:p-3 bg-slate-50 rounded-xl"
                    dir="rtl"
                  >
                    {/* RTL Order: Badge (right) → Name → Quantity → Delete (left) */}

                    {/* Item Number Badge - RIGHT side */}
                    <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 text-emerald-600 text-xs sm:text-sm font-bold shrink-0">
                      {index + 1}
                    </div>

                    {/* Item Name - Takes remaining space */}
                    <span className="flex-1 text-slate-800 font-medium text-sm sm:text-base min-w-0 break-words leading-tight">
                      {item.item_name}
                    </span>

                    {/* Quantity Controls */}
                    <div className="flex items-center bg-white rounded-full border border-slate-200 shrink-0" dir="ltr">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-30 transition-colors"
                        aria-label="-"
                      >
                        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <span className="w-7 sm:w-8 text-center font-bold text-slate-700 text-sm sm:text-base">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        aria-label="+"
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>

                    {/* Delete Button - LEFT side */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      aria-label={t('deleteItem')}
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Item Count Summary */}
            {items.length > 0 && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100" dir="rtl">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">{t('totalItems')}</span>
                  <span className="font-bold text-emerald-800">{items.length}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Link Back */}
        <div className="mt-6 text-center" dir="rtl">
          <Link
            href="/my-grocery"
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
