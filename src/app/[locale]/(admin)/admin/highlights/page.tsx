'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Plus, Trash2, Edit2, Save, X, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Highlight } from '@/types'
import { logger } from '@/lib/logger'
import { Textarea } from '@/components/ui/textarea'
import { trackAdminAction, trackPageView, EventAction } from '@/lib/analytics'

const highlightTypes = [
  { value: 'achievement', label: '🏆 הישג', icon: '🏆' },
  { value: 'sports', label: '⚽ ספורט', icon: '⚽' },
  { value: 'award', label: '🎖️ פרס', icon: '🎖️' },
  { value: 'event', label: '🎉 אירוע', icon: '🎉' },
  { value: 'announcement', label: '📢 הודעה', icon: '📢' },
] as const

const emojiOptions = [
  // Achievements & Awards
  { value: '🏆', label: '🏆 גביע', category: 'achievements' },
  { value: '🥇', label: '🥇 מדליית זהב', category: 'achievements' },
  { value: '🥈', label: '🥈 מדליית כסף', category: 'achievements' },
  { value: '🥉', label: '🥉 מדליית ארד', category: 'achievements' },
  { value: '🎖️', label: '🎖️ מדליה', category: 'achievements' },
  { value: '⭐', label: '⭐ כוכב', category: 'achievements' },
  { value: '✨', label: '✨ נצנוץ', category: 'achievements' },
  { value: '🌟', label: '🌟 כוכב זוהר', category: 'achievements' },

  // Ball Sports
  { value: '⚽', label: '⚽ כדורגל', category: 'sports' },
  { value: '🏀', label: '🏀 כדורסל', category: 'sports' },
  { value: '🏐', label: '🏐 כדורעף', category: 'sports' },
  { value: '🎾', label: '🎾 טניס', category: 'sports' },
  { value: '🏈', label: '🏈 פוטבול', category: 'sports' },
  { value: '⚾', label: '⚾ בייסבול', category: 'sports' },
  { value: '🥎', label: '🥎 סופטבול', category: 'sports' },
  { value: '🏓', label: '🏓 טניס שולחן', category: 'sports' },
  { value: '🏸', label: '🏸 בדמינטון', category: 'sports' },

  // Water Sports
  { value: '🏄', label: '🏄 גלישה', category: 'sports' },
  { value: '🏊', label: '🏊 שחייה', category: 'sports' },
  { value: '🤽', label: '🤽 כדור מים', category: 'sports' },
  { value: '🚣', label: '🚣 חתירה', category: 'sports' },

  // Other Sports
  { value: '🎿', label: '🎿 סקי', category: 'sports' },
  { value: '🏂', label: '🏂 סנובורד', category: 'sports' },
  { value: '🤸', label: '🤸 התעמלות', category: 'sports' },
  { value: '🤾', label: '🤾 כדוריד', category: 'sports' },
  { value: '🥋', label: '🥋 ג\'ודו', category: 'sports' },
  { value: '🥊', label: '🥊 אגרוף', category: 'sports' },
  { value: '🎯', label: '🎯 חץ וקשת', category: 'sports' },

  // Events & Celebrations
  { value: '🎉', label: '🎉 חגיגה', category: 'events' },
  { value: '🎊', label: '🎊 קונפטי', category: 'events' },
  { value: '🎈', label: '🎈 בלון', category: 'events' },
  { value: '🎂', label: '🎂 עוגה', category: 'events' },
  { value: '🎁', label: '🎁 מתנה', category: 'events' },

  // Announcements
  { value: '📢', label: '📢 מגפון', category: 'announcements' },
  { value: '📣', label: '📣 הכרזה', category: 'announcements' },
  { value: '🔔', label: '🔔 פעמון', category: 'announcements' },

  // Education & Arts
  { value: '🎓', label: '🎓 כובע גמר', category: 'education' },
  { value: '📚', label: '📚 ספרים', category: 'education' },
  { value: '✏️', label: '✏️ עיפרון', category: 'education' },
  { value: '🎨', label: '🎨 פלטה', category: 'education' },
  { value: '🎭', label: '🎭 תיאטרון', category: 'education' },
  { value: '🎬', label: '🎬 סרט', category: 'education' },
  { value: '🎵', label: '🎵 מוזיקה', category: 'education' },
  { value: '🎸', label: '🎸 גיטרה', category: 'education' },

  // Other
  { value: '🔥', label: '🔥 אש', category: 'other' },
  { value: '💪', label: '💪 כוח', category: 'other' },
  { value: '👏', label: '👏 מחיאות כפיים', category: 'other' },
  { value: '🙌', label: '🙌 ידיים באוויר', category: 'other' },
  { value: '❤️', label: '❤️ לב', category: 'other' },
  { value: '💙', label: '💙 לב כחול', category: 'other' },
]

const badgeColorOptions = [
  { value: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900', label: '🟡 זהב (הישגים)' },
  { value: 'bg-gradient-to-r from-green-400 to-green-500 text-green-900', label: '🟢 ירוק (ספורט)' },
  { value: 'bg-gradient-to-r from-purple-400 to-purple-500 text-purple-900', label: '🟣 סגול (פרסים)' },
  { value: 'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900', label: '🟠 כתום (כדורסל)' },
  { value: 'bg-gradient-to-r from-pink-400 to-pink-500 text-pink-900', label: '🩷 ורוד (אירועים)' },
  { value: 'bg-gradient-to-r from-blue-400 to-blue-500 text-blue-900', label: '🔵 כחול (מידע)' },
  { value: 'bg-gradient-to-r from-red-400 to-red-500 text-red-900', label: '🔴 אדום (דחוף)' },
]

export default function AdminHighlightsPage() {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTranslating, setIsTranslating] = useState<string | null>(null)

  useEffect(() => {
    loadHighlights()
    // Track page view
    trackPageView({
      page_path: '/admin/highlights',
      page_title: 'Admin Highlights Management',
    })
  }, [])

  async function translateToRussian(highlightId: string) {
    const highlight = highlights.find(h => h.id === highlightId)
    if (!highlight) return

    // Check if there's Hebrew content to translate
    if (!highlight.title_he && !highlight.description_he && !highlight.category_he) {
      toast.error('אין תוכן בעברית לתרגום')
      return
    }

    setIsTranslating(highlightId)
    trackAdminAction(EventAction.CLICK, 'Translate highlight to Russian', 'AdminHighlightsPage', { highlightId })
    try {
      const textsToTranslate = [
        { key: 'title_ru', value: highlight.title_he || '' },
        { key: 'description_ru', value: highlight.description_he || '' },
        { key: 'category_ru', value: highlight.category_he || '' },
      ].filter(t => t.value.trim().length > 0)

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: textsToTranslate }),
      })

      const data = await response.json()
      if (data.success && data.data) {
        // Update the highlight with translations
        setHighlights(highlights.map(h => {
          if (h.id === highlightId) {
            return {
              ...h,
              title_ru: data.data.title_ru || h.title_ru,
              description_ru: data.data.description_ru || h.description_ru,
              category_ru: data.data.category_ru || h.category_ru,
            }
          }
          return h
        }))
        toast.success('תורגם לרוסית בהצלחה!')
        trackAdminAction('translate_success', 'Highlight translated successfully', 'AdminHighlightsPage', { highlightId })
      } else {
        toast.error(data.error || 'שגיאה בתרגום')
        trackAdminAction('translate_error', 'Highlight translation failed', 'AdminHighlightsPage', { highlightId, error: data.error })
      }
    } catch (error) {
      console.error('Translation error:', error)
      toast.error('שגיאה בתרגום')
      trackAdminAction('translate_error', 'Highlight translation failed', 'AdminHighlightsPage', { highlightId, error })
    } finally {
      setIsTranslating(null)
    }
  }

  async function loadHighlights() {
    try {
      console.log('[LoadHighlights] Fetching highlights...')
      const response = await fetch(`/api/highlights?all=true&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      console.log('[LoadHighlights] Received:', data.data?.length || 0, 'highlights')
      if (data.success) {
        setHighlights(data.data || [])
        console.log('[LoadHighlights] State updated with', data.data?.length || 0, 'highlights')
      }
    } catch (error) {
      console.error('[LoadHighlights] Error:', error)
      logger.error('Failed to load highlights', { error })
      toast.error('שגיאה בטעינת ההדגשות')
    } finally {
      setIsLoading(false)
    }
  }

  async function createHighlight(highlight: Omit<Highlight, 'id' | 'created_at' | 'updated_at'>) {
    setIsSaving(true)
    trackAdminAction(EventAction.CREATE, 'Create new highlight', 'AdminHighlightsPage', { type: highlight.type })
    try {
      const response = await fetch('/api/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(highlight),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('הדגשה נוצרה בהצלחה')
        logger.success('Highlight created', { id: data.data.id })
        trackAdminAction('create_success', 'Highlight created successfully', 'AdminHighlightsPage', { id: data.data.id, type: highlight.type })
        await loadHighlights()
        setEditingId(null)
      } else {
        // Show detailed validation errors
        if (data.details && Array.isArray(data.details)) {
          const errorMessage = data.details.join('\n')
          toast.error(`${data.error}\n${errorMessage}`, { duration: 5000 })
        } else {
          toast.error(data.error || 'שגיאה ביצירת הדגשה')
        }
        trackAdminAction('create_error', 'Highlight creation failed', 'AdminHighlightsPage', { error: data.error })
        throw new Error(data.error)
      }
    } catch (error) {
      logger.error('Failed to create highlight', { error })
      // Don't show duplicate toast if we already showed detailed errors
    } finally {
      setIsSaving(false)
    }
  }

  async function updateHighlight(id: string, updates: Partial<Highlight>) {
    setIsSaving(true)
    trackAdminAction(EventAction.UPDATE, 'Update highlight', 'AdminHighlightsPage', { id })
    try {
      const response = await fetch(`/api/highlights/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('הדגשה עודכנה בהצלחה')
        logger.success('Highlight updated', { id })
        trackAdminAction('update_success', 'Highlight updated successfully', 'AdminHighlightsPage', { id })
        await loadHighlights()
        setEditingId(null)
      } else {
        // Show detailed validation errors
        if (data.details && Array.isArray(data.details)) {
          const errorMessage = data.details.join('\n')
          toast.error(`${data.error}\n${errorMessage}`, { duration: 5000 })
        } else {
          toast.error(data.error || 'שגיאה בעדכון הדגשה')
        }
        trackAdminAction('update_error', 'Highlight update failed', 'AdminHighlightsPage', { id, error: data.error })
        throw new Error(data.error)
      }
    } catch (error) {
      logger.error('Failed to update highlight', { error })
      // Don't show duplicate toast if we already showed detailed errors
    } finally {
      setIsSaving(false)
    }
  }

  function addHighlight() {
    trackAdminAction(EventAction.CLICK, 'Add new highlight button clicked', 'AdminHighlightsPage')
    // Calculate highest display_order and add 1 so new item appears first
    const maxOrder = highlights.length > 0
      ? Math.max(...highlights.map(h => h.display_order || 0))
      : 0
    const newHighlight: Highlight = {
      id: `temp-${Date.now()}`,
      type: 'achievement',
      icon: '🏆',
      title_he: '',
      title_ru: '',
      description_he: '',
      description_ru: '',
      category_he: '',
      category_ru: '',
      badge_color: 'bg-gradient-to-r from-blue-400 to-blue-500 text-blue-900',
      is_active: true,
      display_order: maxOrder + 1,
      cta_text_he: 'קרא עוד',
      cta_text_ru: 'Читать далее',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    // Add new highlight at the beginning of the list
    setHighlights([newHighlight, ...highlights])
    setEditingId(newHighlight.id)
  }

  function updateLocalHighlight(id: string, field: keyof Highlight, value: any) {
    setHighlights(highlights.map(h =>
      h.id === id ? { ...h, [field]: value } : h
    ))
  }

  // Validate if highlight has all required fields
  function validateHighlight(highlight: Highlight): { isValid: boolean; missingField?: string } {
    if (!highlight.icon || highlight.icon.trim().length === 0) {
      return { isValid: false, missingField: 'icon' }
    }
    if (!highlight.title_he || highlight.title_he.trim().length < 2) {
      return { isValid: false, missingField: 'title_he' }
    }
    if (!highlight.description_he || highlight.description_he.trim().length < 10) {
      return { isValid: false, missingField: 'description_he' }
    }
    if (!highlight.category_he || highlight.category_he.trim().length < 2) {
      return { isValid: false, missingField: 'category_he' }
    }
    return { isValid: true }
  }

  // Scroll to first missing field
  function scrollToMissingField(fieldName: string) {
    const fieldMap: Record<string, string> = {
      'icon': 'אייקון',
      'title_he': 'כותרת (עברית)',
      'description_he': 'תיאור (עברית)',
      'category_he': 'קטגוריה (עברית)',
    }

    const hebrewName = fieldMap[fieldName]
    if (hebrewName) {
      toast.error(`יש למלא את השדה: ${hebrewName}`)

      // Find and scroll to the field
      setTimeout(() => {
        const labels = Array.from(document.querySelectorAll('label'))
        const targetLabel = labels.find(label => label.textContent?.includes(hebrewName))
        if (targetLabel) {
          targetLabel.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Find the input/textarea/select after the label
          const nextElement = targetLabel.nextElementSibling as HTMLElement
          if (nextElement) {
            nextElement.focus()
            nextElement.classList.add('ring-2', 'ring-red-500')
            setTimeout(() => {
              nextElement.classList.remove('ring-2', 'ring-red-500')
            }, 2000)
          }
        }
      }, 100)
    }
  }

  async function saveHighlight(highlight: Highlight) {
    if (highlight.id.startsWith('temp-')) {
      // New highlight - create it
      const { id, created_at, updated_at, ...highlightData } = highlight
      await createHighlight(highlightData)
    } else {
      // Existing highlight - update it
      const { id, created_at, updated_at, ...updates } = highlight
      await updateHighlight(highlight.id, updates)
    }
  }

  async function deleteHighlight(id: string) {
    console.log('[Delete] Starting delete for id:', id)
    trackAdminAction(EventAction.DELETE, 'Delete highlight initiated', 'AdminHighlightsPage', { id })
    if (confirm('האם למחוק הדגשה זו?')) {
      console.log('[Delete] User confirmed')

      // If it's a temporary highlight, just remove it from state
      if (id.startsWith('temp-')) {
        setHighlights(highlights.filter(h => h.id !== id))
        toast.success('ההדגשה הוסרה')
        trackAdminAction('delete_temp', 'Temporary highlight cancelled', 'AdminHighlightsPage', { id })
        return
      }

      // Remove from local state immediately for better UX
      const updatedHighlights = highlights.filter(h => h.id !== id)
      setHighlights(updatedHighlights)

      // Delete from database
      try {
        setIsSaving(true)
        console.log('[Delete] Sending delete request...')
        const response = await fetch(`/api/highlights/${id}`, {
          method: 'DELETE',
        })

        console.log('[Delete] Response status:', response.status)
        const data = await response.json()
        console.log('[Delete] Response data:', data)

        if (data.success) {
          toast.success('ההדגשה נמחקה')
          logger.success('Highlight deleted', { id })
          trackAdminAction('delete_success', 'Highlight deleted successfully', 'AdminHighlightsPage', { id })
          console.log('[Delete] Reloading highlights...')
          await loadHighlights()
          console.log('[Delete] ✅ Delete complete')
        } else {
          trackAdminAction('delete_error', 'Highlight deletion failed', 'AdminHighlightsPage', { id, error: data.error })
          throw new Error(data.error)
        }
      } catch (error) {
        console.error('[Delete] ❌ Error:', error)
        logger.error('Failed to delete highlight', { error })
        toast.error('שגיאה במחיקת ההדגשה')
        // Restore the highlight on error
        setHighlights(highlights)
      } finally {
        setIsSaving(false)
      }
    } else {
      console.log('[Delete] User cancelled')
      trackAdminAction('delete_cancelled', 'Highlight deletion cancelled', 'AdminHighlightsPage', { id })
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8" />
            ניהול קרוסלת הדגשות
          </h1>
        </div>
        <Button
          onClick={addHighlight}
          className="gap-2 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          הוסף הדגשה חדשה
        </Button>
      </div>

      <div className="space-y-4">
        {highlights.map((highlight) => {
          const typeInfo = highlightTypes.find(t => t.value === highlight.type)
          const isEditing = editingId === highlight.id
          const validation = validateHighlight(highlight)
          const canSave = validation.isValid

          return (
            <Card
              key={highlight.id}
              className={`
                ${highlight.is_active ? 'border-2 border-green-500' : 'border'}
                ${isEditing ? 'ring-2 ring-blue-500' : ''}
              `}
              data-testid="highlight-card"
            >
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="text-sm">
                      {typeInfo?.label}
                    </Badge>
                    {highlight.is_active && (
                      <Badge variant="default" className="bg-green-600">
                        פעילה
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      סדר: {highlight.display_order}
                    </Badge>
                    {isEditing && !canSave && (
                      <Badge variant="destructive" className="text-xs animate-pulse">
                        חסרים שדות חובה
                      </Badge>
                    )}
                    {isEditing && canSave && (
                      <Badge variant="default" className="text-xs bg-green-600">
                        מוכן לשמירה ✓
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            if (canSave) {
                              // Find the current highlight from state to ensure we have the latest changes
                              const currentHighlight = highlights.find(h => h.id === highlight.id)
                              if (currentHighlight) {
                                saveHighlight(currentHighlight)
                              }
                            } else {
                              scrollToMissingField(validation.missingField!)
                            }
                          }}
                          disabled={isSaving || !canSave}
                          className={!canSave ? 'opacity-50 cursor-not-allowed' : ''}
                          title={!canSave ? 'יש למלא את כל השדות החובה' : ''}
                        >
                          <Save className="h-4 w-4 ml-1" />
                          {isSaving ? 'שומר...' : 'שמור'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (highlight.id.startsWith('temp-')) {
                              setHighlights(highlights.filter(h => h.id !== highlight.id))
                            } else {
                              loadHighlights()
                            }
                            setEditingId(null)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(highlight.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteHighlight(highlight.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    {/* Translate Button */}
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => translateToRussian(highlight.id)}
                        disabled={isTranslating === highlight.id}
                        className="gap-2"
                      >
                        <Languages className="h-4 w-4" />
                        {isTranslating === highlight.id ? 'מתרגם...' : 'תרגם לרוסית'}
                      </Button>
                    </div>

                    {/* Type and Icon */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Type Selector */}
                      <div className="relative">
                        <label className="text-sm font-medium block mb-2">
                          סוג הדגשה <span className="text-red-500 font-bold text-base" title="שדה חובה">*</span>
                        </label>
                        <select
                          value={highlight.type}
                          onChange={(e) => {
                            const type = e.target.value as Highlight['type']
                            const typeInfo = highlightTypes.find(t => t.value === type)
                            // Update both type and icon together to avoid race condition
                            setHighlights(highlights.map(h =>
                              h.id === highlight.id
                                ? { ...h, type, icon: typeInfo?.icon || h.icon }
                                : h
                            ))
                          }}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer appearance-none text-base"
                          style={{ minHeight: '48px' }}
                        >
                          {highlightTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute left-3 top-[46px] flex items-center">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Icon Selector with Preview */}
                      <div>
                        <label className="text-sm font-medium block mb-2">
                          אייקון <span className="text-red-500 font-bold text-base" title="שדה חובה">*</span>
                        </label>
                        <div className="flex gap-3 items-start">
                          {/* Icon Preview Box */}
                          <div className="flex-shrink-0 w-16 h-16 border-2 border-gray-300 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                            <span className="text-4xl">{highlight.icon}</span>
                          </div>

                          {/* Icon Dropdown */}
                          <div className="flex-1 relative">
                            <select
                              value={highlight.icon}
                              onChange={(e) => updateLocalHighlight(highlight.id, 'icon', e.target.value)}
                              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer appearance-none text-base"
                              style={{ minHeight: '48px' }}
                            >
                              <optgroup label="🏆 הישגים ופרסים">
                                {emojiOptions.filter(e => e.category === 'achievements').map((emoji) => (
                                  <option key={emoji.value} value={emoji.value}>
                                    {emoji.label}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="⚽ ספורט כדורים">
                                {emojiOptions.filter(e => e.category === 'sports' && ['⚽', '🏀', '🏐', '🎾', '🏈', '⚾', '🥎', '🏓', '🏸'].includes(e.value)).map((emoji) => (
                                  <option key={emoji.value} value={emoji.value}>
                                    {emoji.label}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="🏄 ספורט מים">
                                {emojiOptions.filter(e => e.category === 'sports' && ['🏄', '🏊', '🤽', '🚣'].includes(e.value)).map((emoji) => (
                                  <option key={emoji.value} value={emoji.value}>
                                    {emoji.label}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="🤸 ספורט אחר">
                                {emojiOptions.filter(e => e.category === 'sports' && !['⚽', '🏀', '🏐', '🎾', '🏈', '⚾', '🥎', '🏓', '🏸', '🏄', '🏊', '🤽', '🚣'].includes(e.value)).map((emoji) => (
                                  <option key={emoji.value} value={emoji.value}>
                                    {emoji.label}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="🎉 אירועים">
                                {emojiOptions.filter(e => e.category === 'events').map((emoji) => (
                                  <option key={emoji.value} value={emoji.value}>
                                    {emoji.label}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="📢 הודעות">
                                {emojiOptions.filter(e => e.category === 'announcements').map((emoji) => (
                                  <option key={emoji.value} value={emoji.value}>
                                    {emoji.label}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="🎓 חינוך ואמנות">
                                {emojiOptions.filter(e => e.category === 'education').map((emoji) => (
                                  <option key={emoji.value} value={emoji.value}>
                                    {emoji.label}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="💪 אחר">
                                {emojiOptions.filter(e => e.category === 'other').map((emoji) => (
                                  <option key={emoji.value} value={emoji.value}>
                                    {emoji.label}
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                            <div className="pointer-events-none absolute left-3 top-3 flex items-center">
                              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Titles */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          כותרת (עברית) <span className="text-red-500 font-bold text-base" title="שדה חובה">*</span>
                          <span className="text-xs text-gray-500"> (לפחות 2 תווים)</span>
                        </label>
                        <Input
                          value={highlight.title_he}
                          onChange={(e) => updateLocalHighlight(highlight.id, 'title_he', e.target.value)}
                          placeholder="הישג מדהים!"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          כותרת (רוסית) <span className="text-xs text-gray-500">(אופציונלי)</span>
                        </label>
                        <Input
                          value={highlight.title_ru}
                          onChange={(e) => updateLocalHighlight(highlight.id, 'title_ru', e.target.value)}
                          placeholder="Потрясающее достижение!"
                        />
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          תיאור (עברית) <span className="text-red-500 font-bold text-base" title="שדה חובה">*</span>
                          <span className="text-xs text-gray-500"> (לפחות 10 תווים)</span>
                        </label>
                        <Textarea
                          value={highlight.description_he}
                          onChange={(e) => updateLocalHighlight(highlight.id, 'description_he', e.target.value)}
                          placeholder="תיאור מפורט של ההישג..."
                          rows={10}
                          className="resize-y min-h-[200px]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          תיאור (רוסית) <span className="text-xs text-gray-500">(אופציונלי)</span>
                        </label>
                        <Textarea
                          value={highlight.description_ru}
                          onChange={(e) => updateLocalHighlight(highlight.id, 'description_ru', e.target.value)}
                          placeholder="Подробное описание достижения..."
                          rows={10}
                          className="resize-y min-h-[200px]"
                        />
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          קטגוריה (עברית) <span className="text-red-500 font-bold text-base" title="שדה חובה">*</span>
                          <span className="text-xs text-gray-500"> (לפחות 2 תווים)</span>
                        </label>
                        <Input
                          value={highlight.category_he}
                          onChange={(e) => updateLocalHighlight(highlight.id, 'category_he', e.target.value)}
                          placeholder="הישגים"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          קטגוריה (רוסית) <span className="text-xs text-gray-500">(אופציונלי)</span>
                        </label>
                        <Input
                          value={highlight.category_ru}
                          onChange={(e) => updateLocalHighlight(highlight.id, 'category_ru', e.target.value)}
                          placeholder="Достижения"
                        />
                      </div>
                    </div>

                    {/* Badge Color */}
                    <div className="relative">
                      <label className="text-sm font-medium block mb-1">צבע תגית</label>
                      <select
                        value={highlight.badge_color}
                        onChange={(e) => updateLocalHighlight(highlight.id, 'badge_color', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer appearance-none"
                        style={{ minHeight: '42px' }}
                      >
                        {badgeColorOptions.map((color) => (
                          <option key={color.value} value={color.value}>
                            {color.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-[38px] flex items-center">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="mt-2">
                        <Badge className={highlight.badge_color}>
                          {highlight.category_he || 'דוגמה'}
                        </Badge>
                      </div>
                    </div>


                    {/* Display Settings */}
                    <div className="space-y-4">
                      {/* Display Order */}
                      <div>
                        <label className="text-sm font-medium block mb-2">
                          סדר תצוגה
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          מספר גבוה יותר = מוצג ראשון
                        </p>
                        <Input
                          type="number"
                          value={highlight.display_order}
                          onChange={(e) => updateLocalHighlight(highlight.id, 'display_order', parseInt(e.target.value) || 0)}
                          min={0}
                          placeholder="100"
                          className="text-base"
                        />
                      </div>

                      {/* Date Range */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Start Date */}
                        <div>
                          <label className="text-sm font-medium block mb-2 flex items-center gap-2">
                            <span className="text-green-600">🟢</span>
                            תאריך התחלה
                          </label>
                          <p className="text-xs text-gray-500 mb-2">
                            ריק = מוצג מיד
                          </p>
                          <Input
                            type="date"
                            value={highlight.start_date ? highlight.start_date.split('T')[0] : ''}
                            onChange={(e) => updateLocalHighlight(highlight.id, 'start_date', e.target.value || null)}
                            className="text-base"
                          />
                        </div>

                        {/* End Date */}
                        <div>
                          <label className="text-sm font-medium block mb-2 flex items-center gap-2">
                            <span className="text-red-600">🔴</span>
                            תאריך סיום
                          </label>
                          <p className="text-xs text-gray-500 mb-2">
                            ריק = מוצג לעולם
                          </p>
                          <Input
                            type="date"
                            value={highlight.end_date ? highlight.end_date.split('T')[0] : ''}
                            onChange={(e) => updateLocalHighlight(highlight.id, 'end_date', e.target.value || null)}
                            className="text-base"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={highlight.is_active}
                        onChange={(e) => updateLocalHighlight(highlight.id, 'is_active', e.target.checked)}
                        id={`active-${highlight.id}`}
                      />
                      <label htmlFor={`active-${highlight.id}`} className="text-sm">
                        הדגשה פעילה
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{highlight.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={highlight.badge_color}>
                            {highlight.category_he}
                          </Badge>
                        </div>
                        <strong className="text-lg">{highlight.icon} {highlight.title_he}</strong>
                        {highlight.title_ru && (
                          <div className="text-sm text-muted-foreground">({highlight.title_ru})</div>
                        )}
                        {highlight.description_he && (
                          <p className="text-sm mt-2">{highlight.description_he}</p>
                        )}
                        {highlight.cta_text_he && (
                          <div className="mt-2">
                            <Badge variant="outline">
                              {highlight.cta_text_he}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {highlights.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">אין הדגשות. לחץ על "הוסף הדגשה חדשה" להתחיל.</p>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>הערה:</strong> ההדגשות יוצגו בקרוסלה בדף הבית לפי סדר התצוגה. הדגשות פעילות בלבד יוצגו למשתמשים.
        </p>
      </div>
    </div>
  )
}
