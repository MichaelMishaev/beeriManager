'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Calendar, MapPin, AlertCircle, Sparkles, ExternalLink } from 'lucide-react'
import type { CreateEventArgs, CreateUrgentMessageArgs, CreateHighlightArgs } from '@/lib/ai/tools'
import { Badge } from '@/components/ui/badge'
import { trackAIInteraction, EventAction } from '@/lib/analytics'
import { logger } from '@/lib/logger'

interface ExtractedData {
  type: 'event' | 'events' | 'urgent_message' | 'highlight'
  data: CreateEventArgs | CreateEventArgs[] | CreateUrgentMessageArgs | CreateHighlightArgs
}

interface AIConfirmationPreviewProps {
  extractedData: ExtractedData
  onClose: () => void
}

export default function AIConfirmationPreview({
  extractedData,
  onClose,
}: AIConfirmationPreviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setError(null)

    // Track AI suggestion acceptance
    trackAIInteraction(EventAction.AI_SUGGESTION_ACCEPT, 'User accepted AI suggestion', {
      dataType: extractedData.type,
    })

    try {
      const response = await fetch('/api/ai-assistant/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extractedData),
      })

      const result = await response.json()

      if (result.success) {
        // Show success state
        setSuccess(true)
        trackAIInteraction('insert_success', 'AI suggestion saved successfully', {
          dataType: extractedData.type,
        })
        // Close after 2 seconds
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setError(result.error || 'שגיאה בשמירה')
        trackAIInteraction('insert_error', 'AI suggestion save failed', {
          dataType: extractedData.type,
          error: result.error,
        })
      }
    } catch (err) {
      logger.error('Failed to insert data', {
        component: 'AIConfirmationPreview',
        action: 'insert',
        error: err,
        data: { dataType: extractedData.type }
      })
      setError('שגיאה בחיבור לשרת')
      trackAIInteraction('insert_error', 'AI suggestion save failed', {
        dataType: extractedData.type,
        error: err,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = () => {
    // Track AI suggestion rejection
    trackAIInteraction(EventAction.AI_SUGGESTION_REJECT, 'User rejected AI suggestion', {
      dataType: extractedData.type,
    })
    onClose()
  }

  // Success state - beautiful confirmation
  if (success) {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" />

        {/* Success Modal */}
        <div className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl">
          <div className="p-8 text-center" dir="rtl">
            {/* Success Icon with Animation */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg animate-bounce">
              <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
            </div>

            {/* Success Message */}
            <h3 className="mb-2 text-2xl font-bold text-gray-900">
              {extractedData.type === 'events'
                ? `${(extractedData.data as CreateEventArgs[]).length} אירועים נוצרו בהצלחה!`
                : extractedData.type === 'event'
                ? 'האירוע נוצר בהצלחה!'
                : extractedData.type === 'highlight'
                ? 'ההדגשה נוצרה בהצלחה!'
                : 'ההודעה נוצרה בהצלחה!'}
            </h3>
            <p className="text-base text-gray-600">
              {extractedData.type === 'events'
                ? 'כל האירועים נשמרו במערכת ונוספו ללוח השנה'
                : extractedData.type === 'event'
                ? 'האירוע נשמר במערכת ונוסף ללוח השנה'
                : extractedData.type === 'highlight'
                ? 'ההדגשה נוספה לקרוסלת דף הבית'
                : 'ההודעה הדחופה פורסמה בהצלחה'}
            </p>

            {/* Progress indicator */}
            <div className="mt-6">
              <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full animate-pulse bg-gradient-to-r from-emerald-500 to-teal-600" />
              </div>
              <p className="mt-2 text-sm text-gray-500">סוגר אוטומטית...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-[60] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="rounded-t-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">אישור לפני יצירה</h3>
              <p className="text-sm text-white/90">בדוק שהמידע נכון</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6" dir="rtl">
          {extractedData.type === 'event' ? (
            <EventPreview data={extractedData.data as CreateEventArgs} />
          ) : extractedData.type === 'events' ? (
            <MultipleEventsPreview data={extractedData.data as CreateEventArgs[]} />
          ) : extractedData.type === 'highlight' ? (
            <HighlightPreview data={extractedData.data as CreateHighlightArgs} />
          ) : (
            <UrgentMessagePreview data={extractedData.data as CreateUrgentMessageArgs} />
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>{isSubmitting ? 'שומר...' : 'אישור ויצירה'}</span>
            </button>
            <button
              onClick={handleReject}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle className="h-5 w-5" />
              <span>ביטול</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function EventPreview({ data }: { data: CreateEventArgs }) {
  const { dateStr, timeStr } = formatDateTime(data.start_datetime)

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>אירוע חדש</span>
        </div>
        <h4 className="text-xl font-bold text-gray-900">{data.title}</h4>
        {data.title_ru && (
          <p className="mt-1 text-sm text-gray-600">{data.title_ru}</p>
        )}
      </div>

      <div className="space-y-3 rounded-xl border-2 border-gray-100 bg-gray-50 p-4">
        <div className="flex items-start gap-3">
          <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900">{dateStr}</p>
            {timeStr !== '00:00' && (
              <p className="text-sm text-gray-600">שעה: {timeStr}</p>
            )}
          </div>
        </div>

        {data.location && (
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-medium text-gray-900">{data.location}</p>
              {data.location_ru && (
                <p className="text-sm text-gray-600">{data.location_ru}</p>
              )}
            </div>
          </div>
        )}

        {data.description && (
          <div className="mt-3 rounded-lg bg-white p-3">
            <p className="text-sm leading-relaxed text-gray-700">
              {data.description}
            </p>
            {data.description_ru && (
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {data.description_ru}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function UrgentMessagePreview({ data }: { data: CreateUrgentMessageArgs }) {
  const typeIcons = {
    white_shirt: '👕',
    urgent: '🚨',
    info: 'ℹ️',
    warning: '⚠️',
  }

  const typeLabels = {
    white_shirt: 'חולצה לבנה',
    urgent: 'דחוף',
    info: 'מידע',
    warning: 'אזהרה',
  }

  const type = data.type || 'info'

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl ${data.color || 'bg-blue-50'} p-4 ${type === 'urgent' ? 'ring-2 ring-red-500' : ''}`}
      >
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
          <span className="text-2xl">{data.icon || typeIcons[type]}</span>
          <span>{typeLabels[type]}</span>
        </div>
        <h4 className="text-xl font-bold text-gray-900">{data.title_he}</h4>
        <p className="mt-1 text-base text-gray-700">{data.title_ru}</p>
      </div>

      {(data.description_he || data.description_ru) && (
        <div className="rounded-xl border-2 border-gray-100 bg-gray-50 p-4">
          {data.description_he && (
            <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">
              {data.description_he}
            </p>
          )}
          {data.description_ru && (
            <p className="mt-2 text-sm leading-relaxed text-gray-600 whitespace-pre-line">
              {data.description_ru}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border-2 border-gray-100 bg-white p-4 text-sm">
        <div>
          <p className="font-medium text-gray-600">תאריך התחלה</p>
          <p className="text-gray-900">
            {new Date(data.start_date || new Date()).toLocaleDateString('he-IL')}
          </p>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div>
          <p className="font-medium text-gray-600">תאריך סיום</p>
          <p className="text-gray-900">
            {new Date(data.end_date).toLocaleDateString('he-IL')}
          </p>
        </div>
      </div>
    </div>
  )
}

function MultipleEventsPreview({ data }: { data: CreateEventArgs[] }) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>אירועים מרובים</span>
        </div>
        <h4 className="text-xl font-bold text-gray-900">
          {data.length} אירועים נמצאו
        </h4>
        <p className="mt-1 text-sm text-gray-600">
          כל האירועים יווצרו ביחד
        </p>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {data.map((event, index) => (
          <div
            key={index}
            className="rounded-xl border-2 border-gray-100 bg-gray-50 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                {index + 1}
              </span>
              <h5 className="font-bold text-gray-900">{event.title}</h5>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>{formatDateTime(event.start_datetime).dateStr}</span>
                {formatDateTime(event.start_datetime).timeStr !== '00:00' && (
                  <span className="text-gray-600">
                    • {formatDateTime(event.start_datetime).timeStr}
                  </span>
                )}
              </div>

              {event.location && (
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span>{event.location}</span>
                </div>
              )}

              {event.description && (
                <p className="text-gray-600">{event.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HighlightPreview({ data }: { data: CreateHighlightArgs }) {
  const typeLabels = {
    achievement: 'הישג',
    sports: 'ספורט',
    award: 'פרס',
    event: 'אירוע',
    announcement: 'הודעה',
  }

  // Default badge color if not provided
  const badgeColor = data.badge_color || 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
          <Sparkles className="h-4 w-4" />
          <span>הדגשה חדשה</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-5xl">{data.icon}</span>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900">{data.title_he}</h4>
            {data.title_ru && (
              <p className="mt-1 text-sm text-gray-600">{data.title_ru}</p>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 rounded-xl border-2 border-gray-100 bg-gray-50 p-4">
        {/* Type and Category */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {typeLabels[data.type]}
          </Badge>
          <Badge className={badgeColor}>
            {data.category_he}
          </Badge>
          {data.category_ru && (
            <Badge variant="outline" className="text-xs">
              {data.category_ru}
            </Badge>
          )}
        </div>

        {/* Description */}
        <div className="rounded-lg bg-white p-3">
          <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">
            {data.description_he}
          </p>
          {data.description_ru && (
            <p className="mt-2 text-sm leading-relaxed text-gray-600 whitespace-pre-line">
              {data.description_ru}
            </p>
          )}
        </div>

        {/* Event Date */}
        {data.event_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-gray-700">
              תאריך האירוע:
            </span>
            <span className="text-gray-900">
              {new Date(data.event_date).toLocaleDateString('he-IL')}
            </span>
          </div>
        )}

        {/* Display Dates */}
        {(data.start_date || data.end_date) && (
          <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 text-xs">
            {data.start_date ? (
              <div>
                <p className="font-medium text-gray-600">תצוגה מ-</p>
                <p className="text-gray-900">
                  {new Date(data.start_date).toLocaleDateString('he-IL')}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600">תצוגה מיידית</p>
              </div>
            )}
            {data.end_date && (
              <>
                <div className="h-8 w-px bg-gray-300" />
                <div>
                  <p className="font-medium text-gray-600">תצוגה עד</p>
                  <p className="text-gray-900">
                    {new Date(data.end_date).toLocaleDateString('he-IL')}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* CTA Button Preview */}
        {data.cta_text_he && (
          <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 p-3">
            <div className="flex items-center gap-2 text-sm">
              <ExternalLink className="h-4 w-4 text-emerald-600" />
              <span className="font-medium text-gray-700">כפתור קריאה לפעולה:</span>
            </div>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs bg-white">
                {data.cta_text_he}
              </Badge>
              {data.cta_text_ru && (
                <Badge variant="outline" className="text-xs bg-white">
                  {data.cta_text_ru}
                </Badge>
              )}
            </div>
            {data.cta_link && (
              <p className="mt-2 text-xs text-gray-600 truncate">
                קישור: {data.cta_link}
              </p>
            )}
          </div>
        )}

        {/* Image URL */}
        {data.image_url && (
          <div className="rounded-lg bg-purple-50 p-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-lg">🖼️</span>
              <span className="font-medium text-gray-700">תמונה:</span>
            </div>
            <p className="mt-1 text-xs text-gray-600 truncate">
              {data.image_url}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function formatDateTime(isoString: string) {
  const date = new Date(isoString)
  const dateStr = date.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = date.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return { dateStr, timeStr }
}
