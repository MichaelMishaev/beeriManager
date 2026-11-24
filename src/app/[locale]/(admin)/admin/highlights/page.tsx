'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { Sparkles, Plus, Trash2, Edit2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  AdminEmptyState,
  AdminGroup,
  AdminPageHeader,
  AdminRow,
  StatusPill,
} from '@/components/features/admin'
import { HighlightEditor, type HighlightPatch } from '@/components/features/admin/highlights/HighlightEditor'
import {
  highlightTypes,
  validateHighlight,
  type RequiredField,
} from '@/components/features/admin/highlights/options'
import { Button } from '@/components/ui/button'
import type { Highlight } from '@/types'
import { logger } from '@/lib/logger'
import { trackAdminAction, trackPageView, EventAction } from '@/lib/analytics'

export default function AdminHighlightsPage() {
  const t = useTranslations('admin.highlights')
  const tc = useTranslations('admin.common')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function translateToRussian(highlightId: string) {
    const highlight = highlights.find(h => h.id === highlightId)
    if (!highlight) return

    // Check if there's Hebrew content to translate
    if (!highlight.title_he && !highlight.description_he && !highlight.category_he) {
      toast.error(t('toasts.noHebrewContent'))
      return
    }

    setIsTranslating(highlightId)
    trackAdminAction(EventAction.CLICK, 'Translate highlight to Russian', 'AdminHighlightsPage', { highlightId })
    try {
      const textsToTranslate = [
        { key: 'title_ru', value: highlight.title_he || '' },
        { key: 'description_ru', value: highlight.description_he || '' },
        { key: 'category_ru', value: highlight.category_he || '' },
      ].filter(item => item.value.trim().length > 0)

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
        toast.success(t('toasts.translated'))
        trackAdminAction('translate_success', 'Highlight translated successfully', 'AdminHighlightsPage', { highlightId })
      } else {
        toast.error(data.error || t('toasts.translateError'))
        trackAdminAction('translate_error', 'Highlight translation failed', 'AdminHighlightsPage', { highlightId, error: data.error })
      }
    } catch (error) {
      console.error('Translation error:', error)
      toast.error(t('toasts.translateError'))
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
      toast.error(t('toasts.loadError'))
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
        toast.success(t('toasts.created'))
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
          toast.error(data.error || t('toasts.createError'))
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
        toast.success(t('toasts.updated'))
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
          toast.error(data.error || t('toasts.updateError'))
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
      // Stored default values of the call-to-action text (data, not UI text)
      cta_text_he: 'קרא עוד',
      cta_text_ru: 'Читать далее',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    // Add new highlight at the beginning of the list
    setHighlights([newHighlight, ...highlights])
    setEditingId(newHighlight.id)
  }

  function patchLocalHighlight(id: string, patch: HighlightPatch) {
    // A null date is intentional: it is sent to the API to clear the date.
    setHighlights(highlights.map(h =>
      h.id === id ? ({ ...h, ...patch } as Highlight) : h
    ))
  }

  // Scroll to and flag the first missing field
  function scrollToMissingField(fieldName: RequiredField) {
    const fieldLabels: Record<RequiredField, string> = {
      icon: t('fields.icon'),
      title_he: t('fields.titleHe'),
      description_he: t('fields.descriptionHe'),
      category_he: t('fields.categoryHe'),
    }

    toast.error(t('toasts.fillField', { field: fieldLabels[fieldName] }))

    setTimeout(() => {
      const target = document.querySelector<HTMLElement>(`[data-field="${fieldName}"]`)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        target.focus()
        target.classList.add('ring-2', 'ring-red-500')
        setTimeout(() => {
          target.classList.remove('ring-2', 'ring-red-500')
        }, 2000)
      }
    }, 100)
  }

  async function saveHighlight(highlight: Highlight) {
    const { id, created_at, updated_at, ...data } = highlight
    void created_at
    void updated_at
    if (id.startsWith('temp-')) {
      // New highlight - create it
      await createHighlight(data)
    } else {
      // Existing highlight - update it
      await updateHighlight(id, data)
    }
  }

  async function deleteHighlight(id: string) {
    console.log('[Delete] Starting delete for id:', id)
    trackAdminAction(EventAction.DELETE, 'Delete highlight initiated', 'AdminHighlightsPage', { id })
    if (confirm(t('confirmDelete'))) {
      console.log('[Delete] User confirmed')

      // If it's a temporary highlight, just remove it from state
      if (id.startsWith('temp-')) {
        setHighlights(highlights.filter(h => h.id !== id))
        toast.success(t('toasts.removedTemp'))
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
          toast.success(t('toasts.deleted'))
          logger.success('Highlight deleted', { id })
          trackAdminAction('delete_success', 'Highlight deleted successfully', 'AdminHighlightsPage', { id })
          console.log('[Delete] Reloading highlights...')
          await loadHighlights()
          console.log('[Delete] Delete complete')
        } else {
          trackAdminAction('delete_error', 'Highlight deletion failed', 'AdminHighlightsPage', { id, error: data.error })
          throw new Error(data.error)
        }
      } catch (error) {
        console.error('[Delete] Error:', error)
        logger.error('Failed to delete highlight', { error })
        toast.error(t('toasts.deleteError'))
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
      <div className="py-8 text-center text-gray-500">{tc('loading')}</div>
    )
  }

  // Consecutive non-editing items share one grouped card; the item being edited breaks out.
  const blocks: ReactNode[] = []
  let pendingRows: ReactNode[] = []
  const flushRows = (key: string) => {
    if (pendingRows.length > 0) {
      blocks.push(<AdminGroup key={key}>{pendingRows}</AdminGroup>)
      pendingRows = []
    }
  }

  highlights.forEach((highlight) => {
    if (editingId === highlight.id) {
      flushRows(`group-before-${highlight.id}`)
      const validation = validateHighlight(highlight)
      blocks.push(
        <HighlightEditor
          key={highlight.id}
          highlight={highlight}
          canSave={validation.isValid}
          isSaving={isSaving}
          isTranslating={isTranslating === highlight.id}
          onPatch={(patch) => patchLocalHighlight(highlight.id, patch)}
          onSave={() => {
            if (validation.isValid) {
              // Find the current highlight from state to ensure we have the latest changes
              const currentHighlight = highlights.find(h => h.id === highlight.id)
              if (currentHighlight) {
                saveHighlight(currentHighlight)
              }
            } else {
              scrollToMissingField(validation.missingField)
            }
          }}
          onCancel={() => {
            if (highlight.id.startsWith('temp-')) {
              setHighlights(highlights.filter(h => h.id !== highlight.id))
            } else {
              loadHighlights()
            }
            setEditingId(null)
          }}
          onDelete={() => deleteHighlight(highlight.id)}
          onTranslate={() => translateToRussian(highlight.id)}
        />
      )
      return
    }

    const typeInfo = highlightTypes.find(ty => ty.value === highlight.type)
    const subtitle = [
      typeInfo ? t(`types.${typeInfo.value}`) : null,
      highlight.category_he,
      t('row.order', { order: highlight.display_order }),
    ]
      .filter(Boolean)
      .join(' · ')

    pendingRows.push(
      <div key={highlight.id} data-testid="highlight-card">
        <AdminRow
          leading={
            <span
              className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] bg-[#eef0f2] text-2xl"
              aria-hidden="true"
            >
              {highlight.icon}
            </span>
          }
          title={highlight.title_he}
          subtitle={subtitle}
          trailing={
            <>
              <StatusPill tone={highlight.is_active ? 'success' : 'neutral'}>
                {highlight.is_active ? t('status.active') : t('status.hidden')}
              </StatusPill>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingId(highlight.id)}
                aria-label={t('editor.editAria')}
                className="h-11 w-11 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteHighlight(highlight.id)}
                aria-label={t('editor.deleteAria')}
                className="h-11 w-11 p-0 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </>
          }
        />
      </div>
    )
  })
  flushRows('group-end')

  return (
    <div className="space-y-4">
      <AdminPageHeader title={t('pageTitle')} />

      <Button onClick={addHighlight} className="min-h-[44px] w-full gap-2">
        <Plus className="h-5 w-5" />
        {t('addNew')}
      </Button>

      {blocks}

      {highlights.length === 0 && (
        <AdminEmptyState icon={Sparkles} title={t('empty.title')} />
      )}

      <div className="rounded-2xl bg-[#87CEEB]/20 p-4">
        <p className="text-sm text-[#003153]">
          {t.rich('note', { strong: (chunks) => <strong>{chunks}</strong> })}
        </p>
      </div>
    </div>
  )
}
