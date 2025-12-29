'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { CreateEventArgs, CreateUrgentMessageArgs } from '@/lib/ai/tools'

interface ManualEventFormProps {
  type: 'event' | 'urgent_message'
  prefillData?: Partial<CreateEventArgs> | Partial<CreateUrgentMessageArgs>
  onSubmit: (data: CreateEventArgs | CreateUrgentMessageArgs) => void
  onCancel: () => void
}

export default function ManualEventForm({
  type,
  prefillData,
  onSubmit,
  onCancel,
}: ManualEventFormProps) {
  const [formData, setFormData] = useState<any>(prefillData || {})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (type === 'event') {
      // Build event data with Russian translation
      const eventData: CreateEventArgs = {
        title: formData.title || '',
        title_ru: formData.title_ru || formData.title || '', // Allow manual Russian or copy from Hebrew
        start_datetime: formData.start_datetime || '',
        end_datetime: formData.end_datetime || undefined,
        description: formData.description || undefined,
        description_ru: formData.description_ru || formData.description || undefined,
        location: formData.location || undefined,
        location_ru: formData.location_ru || formData.location || undefined,
      }
      onSubmit(eventData)
    } else {
      // Build urgent message data
      const messageData: CreateUrgentMessageArgs = {
        title_he: formData.title_he || formData.title || '',
        title_ru: formData.title_ru || formData.title_he || formData.title || '',
        description_he: formData.description_he || formData.description,
        description_ru: formData.description_ru || formData.description_he || formData.description,
        end_date: formData.end_date || '',
        type: formData.messageType || 'info',
      }
      onSubmit(messageData)
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 max-h-[70vh] overflow-y-auto" dir="rtl">
      <h3 className="text-lg font-bold mb-4">
        {type === 'event' ? '📅 טופס ידני - אירוע' : '📢 טופס ידני - הודעה דחופה'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Event Form */}
        {type === 'event' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                שם האירוע <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="לדוגמה: מסיבת פורים"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                תאריך ושעה <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.start_datetime || ''}
                onChange={(e) =>
                  setFormData({ ...formData, start_datetime: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                תאריך וש עה סיום (אופציונלי)
              </label>
              <input
                type="datetime-local"
                value={formData.end_datetime || ''}
                onChange={(e) =>
                  setFormData({ ...formData, end_datetime: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">מיקום (אופציונלי)</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="לדוגמה: אולם בית הספר"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">תיאור (אופציונלי)</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="פרטים נוספים על האירוע..."
              />
            </div>
          </>
        )}

        {/* Urgent Message Form */}
        {type === 'urgent_message' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                כותרת ההודעה <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title_he || formData.title || ''}
                onChange={(e) =>
                  setFormData({ ...formData, title_he: e.target.value, title: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="לדוגמה: תזכורת חולצה לבנה למחר"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                תאריך סיום <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.end_date || ''}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
              <p className="text-xs text-gray-500 mt-1">עד מתי להציג את ההודעה?</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">סוג הודעה</label>
              <select
                value={formData.messageType || 'info'}
                onChange={(e) =>
                  setFormData({ ...formData, messageType: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="info">מידע</option>
                <option value="urgent">דחוף</option>
                <option value="warning">אזהרה</option>
                <option value="white_shirt">חולצה לבנה</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">תיאור (אופציונלי)</label>
              <textarea
                value={formData.description_he || formData.description || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description_he: e.target.value,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="פרטים נוספים..."
              />
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg px-4 py-2.5 font-medium transition-opacity hover:opacity-90"
          >
            💾 שמור ואשר
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 rounded-lg px-4 py-2.5 font-medium transition-colors hover:bg-gray-300"
          >
            <ArrowRight className="h-4 w-4" />
            חזור ל-AI
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
        <p className="font-medium mb-1">💡 טיפ:</p>
        <p>
          השדות יתורגמו אוטומטית לרוסית. אם תרצה, תוכל לחזור ל-AI ולנסות שוב עם
          פורמט פשוט יותר.
        </p>
      </div>
    </div>
  )
}
