'use client'

import { useState, useEffect } from 'react'
import { Bell, Plus, Trash2, Edit2, Save, X, Calendar, ShirtIcon as Tshirt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { UrgentMessage } from '@/types'
import { logger } from '@/lib/logger'
import { Textarea } from '@/components/ui/textarea'

const messageTypes = [
  { value: 'white_shirt', label: '👕 חולצה לבנה', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
  { value: 'urgent', label: '🚨 דחוף', color: 'bg-red-50 border-red-200 text-red-800' },
  { value: 'info', label: 'ℹ️ מידע', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { value: 'warning', label: '⚠️ אזהרה', color: 'bg-orange-50 border-orange-200 text-orange-800' },
] as const

export default function AdminUrgentMessagesPage() {
  const [messages, setMessages] = useState<UrgentMessage[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

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
      toast.error('שגיאה בטעינת הודעות דחופות')
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
        toast.success('הודעות דחופות נשמרו בהצלחה')
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
      toast.error('שגיאה בשמירת הודעות דחופות')
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
    toast.success(`נוספה תזכורת לחולצה לבנה ל-${days} ימים`)
  }

  function updateMessage(id: string, field: keyof UrgentMessage, value: any) {
    setMessages(messages.map(m =>
      m.id === id ? { ...m, [field]: value, updated_at: new Date().toISOString() } : m
    ))
  }

  async function deleteMessage(id: string) {
    console.log('[Delete] Starting delete for id:', id)
    if (confirm('האם למחוק הודעה זו?')) {
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
          toast.success('ההודעה נמחקה')
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
        toast.error('שגיאה במחיקת ההודעה')
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">טוען...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            ניהול הודעות דחופות
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={addMessage}
            className="gap-2 w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            הוסף הודעה
          </Button>
          <Button
            onClick={saveMessages}
            disabled={isSaving}
            variant="default"
            className="gap-2 w-full sm:w-auto"
          >
            <Save className="h-5 w-5" />
            {isSaving ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </div>
      </div>

      {/* Quick White Shirt Buttons */}
      <Card className="mb-8 bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tshirt className="h-5 w-5" />
            תזכורת מהירה לחולצה לבנה
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            <Button
              onClick={() => addWhiteShirtAlert(1)}
              variant="outline"
              className="w-full"
            >
              + 1 יום
            </Button>
            <Button
              onClick={() => addWhiteShirtAlert(3)}
              variant="outline"
              className="w-full"
            >
              + 3 ימים
            </Button>
            <Button
              onClick={() => addWhiteShirtAlert(7)}
              variant="outline"
              className="w-full"
            >
              + שבוע
            </Button>
            <Button
              onClick={() => addWhiteShirtAlert(14)}
              variant="outline"
              className="w-full"
            >
              + שבועיים
            </Button>
            <Button
              onClick={() => addWhiteShirtAlert(30)}
              variant="outline"
              className="w-full sm:col-span-1 col-span-2"
            >
              + חודש
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            לחצו כדי להוסיף תזכורת לחולצה לבנה למשך התקופה הנבחרת
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {messages.map((message) => {
          const typeInfo = messageTypes.find(t => t.value === message.type)
          const isActive = message.is_active &&
            new Date(message.start_date) <= new Date() &&
            new Date(message.end_date) >= new Date()

          return (
            <Card
              key={message.id}
              className={`
                ${isActive ? 'border-2 border-green-500' : 'border'}
                ${editingId === message.id ? 'ring-2 ring-blue-500' : ''}
              `}
              data-testid="urgent-message-card"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={typeInfo?.color}>
                      {typeInfo?.label}
                    </Badge>
                    {isActive && (
                      <Badge variant="default" className="bg-green-600">
                        פעילה כעת
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editingId === message.id ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(message.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMessage(message.id)}
                      className="text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingId === message.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">סוג הודעה</label>
                      <select
                        value={message.type}
                        onChange={(e) => updateMessage(message.id, 'type', e.target.value)}
                        className="w-full border rounded-md px-3 py-2 mt-1"
                      >
                        {messageTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">כותרת (עברית) *</label>
                        <Input
                          value={message.title_he}
                          onChange={(e) => updateMessage(message.id, 'title_he', e.target.value)}
                          placeholder="תזכורת חשובה"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">כותרת (רוסית) *</label>
                        <Input
                          value={message.title_ru}
                          onChange={(e) => updateMessage(message.id, 'title_ru', e.target.value)}
                          placeholder="Важное напоминание"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">תיאור (עברית)</label>
                        <Textarea
                          value={message.description_he || ''}
                          onChange={(e) => updateMessage(message.id, 'description_he', e.target.value)}
                          placeholder="פרטים נוספים..."
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">תיאור (רוסית)</label>
                        <Textarea
                          value={message.description_ru || ''}
                          onChange={(e) => updateMessage(message.id, 'description_ru', e.target.value)}
                          placeholder="Дополнительная информация..."
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          תאריך התחלה
                        </label>
                        <Input
                          type="date"
                          value={message.start_date}
                          onChange={(e) => updateMessage(message.id, 'start_date', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          תאריך סיום
                        </label>
                        <Input
                          type="date"
                          value={message.end_date}
                          onChange={(e) => updateMessage(message.id, 'end_date', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={message.is_active}
                        onChange={(e) => updateMessage(message.id, 'is_active', e.target.checked)}
                        id={`active-${message.id}`}
                      />
                      <label htmlFor={`active-${message.id}`} className="text-sm">
                        הודעה פעילה
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <strong className="text-lg">{message.title_he}</strong>
                      {message.title_ru && (
                        <span className="text-muted-foreground mr-2">({message.title_ru})</span>
                      )}
                    </div>
                    {message.description_he && (
                      <p className="text-sm">{message.description_he}</p>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>📅 {new Date(message.start_date).toLocaleDateString('he-IL')} - {new Date(message.end_date).toLocaleDateString('he-IL')}</span>
                      <span>{message.is_active ? '✅ פעילה' : '❌ לא פעילה'}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {messages.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">אין הודעות דחופות. לחץ על &quot;הוסף הודעה&quot; להתחיל.</p>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>הערה:</strong> ההודעות יוצגו בדף הבית רק אם הן פעילות ובטווח התאריכים. לאחר שמירת השינויים, יש לעשות commit ו-push לגיט.
        </p>
      </div>
    </div>
  )
}
