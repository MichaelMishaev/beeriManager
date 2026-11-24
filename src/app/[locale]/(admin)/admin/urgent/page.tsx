'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Bell, Plus, Trash2, Edit2, Save, X, Calendar, Info, ShirtIcon as Tshirt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  AdminEmptyState,
  AdminFormSection,
  AdminPageHeader,
  StatusPill,
} from '@/components/features/admin'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'
import type { UrgentMessage } from '@/types'
import { logger } from '@/lib/logger'
import { Textarea } from '@/components/ui/textarea'

const messageTypes = [
  { value: 'white_shirt', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
  { value: 'urgent', color: 'bg-red-50 border-red-200 text-red-800' },
  { value: 'info', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { value: 'warning', color: 'bg-orange-50 border-orange-200 text-orange-800' },
] as const

const quickDurations = [
  { days: 1, key: 'day1' },
  { days: 3, key: 'days3' },
  { days: 7, key: 'week1' },
  { days: 14, key: 'weeks2' },
  { days: 30, key: 'month1' },
] as const

export default function AdminUrgentMessagesPage() {
  const [messages, setMessages] = useState<UrgentMessage[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const t = useTranslations('admin.messaging.urgent')
  const tc = useTranslations('admin.common')
  const locale = useLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'he-IL'

  useEffect(() => {
    loadMessages()
  }, [])

  async function loadMessages() {
    try {
      console.log('[LoadMessages] Fetching messages...')
      // Add cache-busting timestamp
      const response = await fetch(`/api/urgent-messages?all=true&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      console.log('[LoadMessages] Received:', data.data?.length || 0, 'messages')
      if (data.success) {
        setMessages(data.data || [])
        console.log('[LoadMessages] State updated with', data.data?.length || 0, 'messages')
      }
    } catch (error) {
      console.error('[LoadMessages] Error:', error)
      logger.error('Failed to load urgent messages', { error })
      toast.error(t('toast.loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  async function saveMessages() {
    setIsSaving(true)
    try {
      console.log('[SaveMessages] Sending save request with', messages.length, 'messages')
      const response = await fetch('/api/urgent-messages/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ messages }),
      })

      console.log('[SaveMessages] Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[SaveMessages] Server error:', response.status, errorData)
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      console.log('[SaveMessages] Response data:', data)

      if (data.success) {
        toast.success(t('toast.saveSuccess'))
        logger.success('Urgent messages saved', { count: messages.length })
        // Small delay to ensure DB consistency before reload
        await new Promise(resolve => setTimeout(resolve, 300))
        // Reload messages from server to get fresh data with UUIDs
        await loadMessages()
      } else {
        throw new Error(data.error || 'Unknown error')
      }
    } catch (error) {
      console.error('[SaveMessages] Error:', error)
      logger.error('Failed to save urgent messages', { error })
      toast.error(t('toast.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  function addMessage() {
    const newMessage: UrgentMessage = {
      id: Date.now().toString(),
      type: 'info',
      title_he: '',
      title_ru: '',
      description_he: '',
      description_ru: '',
      is_active: true,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      icon: 'ℹ️',
      color: 'bg-blue-50',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setMessages([...messages, newMessage])
    setEditingId(newMessage.id)
  }

  function addWhiteShirtAlert(days: number) {
    const now = new Date()
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() + days)

    const newMessage: UrgentMessage = {
      id: Date.now().toString(),
      type: 'white_shirt',
      title_he: 'תזכורת: חולצה לבנה!',
      title_ru: 'Напоминание: белая рубашка!',
      description_he: 'כל תלמידי בית הספר',
      description_ru: 'Для всех учеников школы',
      is_active: true,
      start_date: now.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      icon: '👕',
      color: 'bg-yellow-50',
      share_text_he: '👕 תזכורת: חולצה לבנה!\n\nכל תלמידי בית הספר בארי 💙',
      share_text_ru: '👕 Напоминание: белая рубашка!\n\nДля всех учеников школы Беэри 💙',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setMessages([...messages, newMessage])
    toast.success(t('toast.quickAdded', { days }))
  }

  function updateMessage<K extends keyof UrgentMessage>(id: string, field: K, value: UrgentMessage[K]) {
    setMessages(messages.map(m =>
      m.id === id ? { ...m, [field]: value, updated_at: new Date().toISOString() } : m
    ))
  }

  async function deleteMessage(id: string) {
    console.log('[Delete] Starting delete for id:', id)
    if (confirm(t('deleteConfirm'))) {
      console.log('[Delete] User confirmed')
      // Save original messages for rollback
      const originalMessages = [...messages]
      // Remove from local state immediately for better UX
      const updatedMessages = messages.filter(m => m.id !== id)
      console.log('[Delete] Updated messages:', updatedMessages.length, 'messages')
      console.log('[Delete] Message IDs being sent:', updatedMessages.map(m => m.id))
      setMessages(updatedMessages)

      // Save immediately to database
      try {
        setIsSaving(true)
        console.log('[Delete] Sending save request...')
        const response = await fetch('/api/urgent-messages/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify({ messages: updatedMessages }),
        })

        console.log('[Delete] Response status:', response.status)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('[Delete] Server error:', response.status, errorData)
          throw new Error(errorData.error || `Server error: ${response.status}`)
        }

        const data = await response.json()
        console.log('[Delete] Response data:', data)

        if (data.success) {
          toast.success(t('toast.deleteSuccess'))
          logger.success('Message deleted', { id })
          // Small delay to ensure DB consistency before reload
          await new Promise(resolve => setTimeout(resolve, 300))
          // Reload messages from server to ensure sync
          console.log('[Delete] Reloading messages...')
          await loadMessages()
          console.log('[Delete] ✅ Delete complete')
        } else {
          throw new Error(data.error || 'Unknown error')
        }
      } catch (error) {
        console.error('[Delete] ❌ Error:', error)
        logger.error('Failed to delete message', { error })
        toast.error(t('toast.deleteError'))
        // Restore the message on error
        setMessages(originalMessages)
      } finally {
        setIsSaving(false)
      }
    } else {
      console.log('[Delete] User cancelled')
    }
  }

  if (isLoading) {
    return (
      <div className="py-8 text-center text-gray-500">{tc('loading')}</div>
    )
  }

  const fieldLabel = 'mb-1 block text-sm font-medium text-[#003153]'
  const inputClass = 'h-11'

  return (
    <div className="space-y-4">
      <AdminPageHeader title={t('title')} backHref="/admin/more" />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={addMessage} className="min-h-[44px] w-full gap-2 sm:w-auto">
          <Plus className="h-5 w-5" />
          {t('add')}
        </Button>
        <Button
          onClick={saveMessages}
          disabled={isSaving}
          variant="default"
          className="min-h-[44px] w-full gap-2 sm:w-auto"
        >
          <Save className="h-5 w-5" />
          {isSaving ? t('saving') : t('save')}
        </Button>
      </div>

      {/* Quick White Shirt Buttons */}
      <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
        <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-[#003153]">
          <Tshirt className="h-5 w-5" />
          {t('quickTitle')}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {quickDurations.map((q) => (
            <Button
              key={q.key}
              onClick={() => addWhiteShirtAlert(q.days)}
              variant="outline"
              className={cn('min-h-[44px] w-full bg-white', q.key === 'month1' && 'col-span-2 sm:col-span-1')}
            >
              {t(`quick.${q.key}`)}
            </Button>
          ))}
        </div>
        <p className="mt-3 text-center text-sm text-gray-600">{t('quickHint')}</p>
      </section>

      <div className="space-y-3">
        {messages.map((message) => {
          const typeInfo = messageTypes.find(mt => mt.value === message.type)
          const isActive = message.is_active &&
            new Date(message.start_date) <= new Date() &&
            new Date(message.end_date) >= new Date()

          return (
            <div
              key={message.id}
              className={cn(
                'rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]',
                isActive ? 'border-2 border-green-500' : 'border border-transparent',
                editingId === message.id && 'ring-2 ring-[#0D98BA]'
              )}
              data-testid="urgent-message-card"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Badge className={typeInfo?.color}>
                    {typeInfo ? t(`types.${typeInfo.value}`) : null}
                  </Badge>
                  {isActive && <StatusPill tone="success">{t('activeNow')}</StatusPill>}
                </div>
                <div className="flex flex-none gap-1">
                  {editingId === message.id ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-11 w-11 p-0"
                      aria-label={t('aria.close')}
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-11 w-11 p-0"
                      aria-label={t('aria.edit')}
                      onClick={() => setEditingId(message.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={t('aria.delete')}
                    onClick={() => deleteMessage(message.id)}
                    className="h-11 w-11 rounded-lg p-0 text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {editingId === message.id ? (
                <div className="space-y-4">
                  <div>
                    <label className={fieldLabel}>{t('fields.type')}</label>
                    <select
                      value={message.type}
                      onChange={(e) => updateMessage(message.id, 'type', e.target.value as UrgentMessage['type'])}
                      className="mt-1 h-11 w-full rounded-md border bg-white px-3"
                    >
                      {messageTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {t(`types.${type.value}`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={fieldLabel}>{t('fields.titleHe')}</label>
                      {/* Placeholders are example data in the language of the field, not admin UI text */}
                      <Input
                        className={inputClass}
                        value={message.title_he}
                        onChange={(e) => updateMessage(message.id, 'title_he', e.target.value)}
                        placeholder="תזכורת חשובה"
                      />
                    </div>
                    <div>
                      <label className={fieldLabel}>{t('fields.titleRu')}</label>
                      <Input
                        className={inputClass}
                        value={message.title_ru}
                        onChange={(e) => updateMessage(message.id, 'title_ru', e.target.value)}
                        placeholder="Важное напоминание"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={fieldLabel}>{t('fields.descriptionHe')}</label>
                      <Textarea
                        value={message.description_he || ''}
                        onChange={(e) => updateMessage(message.id, 'description_he', e.target.value)}
                        placeholder="פרטים נוספים..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className={fieldLabel}>{t('fields.descriptionRu')}</label>
                      <Textarea
                        value={message.description_ru || ''}
                        onChange={(e) => updateMessage(message.id, 'description_ru', e.target.value)}
                        placeholder="Дополнительная информация..."
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={cn(fieldLabel, 'flex items-center gap-2')}>
                        <Calendar className="h-4 w-4" />
                        {t('fields.startDate')}
                      </label>
                      <Input
                        className={inputClass}
                        type="date"
                        value={message.start_date}
                        onChange={(e) => updateMessage(message.id, 'start_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={cn(fieldLabel, 'flex items-center gap-2')}>
                        <Calendar className="h-4 w-4" />
                        {t('fields.endDate')}
                      </label>
                      <Input
                        className={inputClass}
                        type="date"
                        value={message.end_date}
                        onChange={(e) => updateMessage(message.id, 'end_date', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex min-h-[44px] items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-5 w-5"
                      checked={message.is_active}
                      onChange={(e) => updateMessage(message.id, 'is_active', e.target.checked)}
                      id={`active-${message.id}`}
                    />
                    <label htmlFor={`active-${message.id}`} className="text-sm">
                      {t('fields.isActive')}
                    </label>
                  </div>
                </div>
              ) : (
                <div className="min-w-0 space-y-2 [overflow-wrap:anywhere]">
                  <div>
                    <strong className="text-lg text-[#003153]">{message.title_he}</strong>
                    {message.title_ru && (
                      <span className="ms-2 text-gray-500">({message.title_ru})</span>
                    )}
                  </div>
                  {message.description_he && (
                    <p className="text-sm">{message.description_he}</p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      {new Date(message.start_date).toLocaleDateString(dateLocale)} - {new Date(message.end_date).toLocaleDateString(dateLocale)}
                    </span>
                    <span>{message.is_active ? t('statusActive') : t('statusInactive')}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {messages.length === 0 && <AdminEmptyState icon={Bell} title={t('empty')} />}

      <AdminFormSection>
        <p className="flex items-start gap-2 text-sm text-[#003153]">
          <Info className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <span>
            <strong>{t('noteLabel')}</strong> {t('noteBody')}
          </span>
        </p>
      </AdminFormSection>
    </div>
  )
}
