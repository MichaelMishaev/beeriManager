import { useState, useEffect } from 'react'

interface DraftMetadata {
  timestamp: string
  formType: 'protocol' | 'task'
  action: 'new' | 'edit'
  entityId?: string
}

interface Draft<T> {
  formData: T
  metadata: DraftMetadata
}

interface UseFormDraftOptions {
  formType: 'protocol' | 'task'
  action: 'new' | 'edit'
  entityId?: string
}

export function useFormDraft<T extends Record<string, any>>(options: UseFormDraftOptions) {
  const { formType, action, entityId } = options

  // Generate unique key for this form
  const getDraftKey = () => {
    if (action === 'new') {
      return `draft_${formType}_new`
    }
    return `draft_${formType}_edit_${entityId}`
  }

  const [hasDraft, setHasDraft] = useState(false)
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null)

  // Check if draft exists on mount
  useEffect(() => {
    const draft = getDraft()
    setHasDraft(!!draft)
    setDraftTimestamp(draft?.metadata.timestamp || null)
  }, [])

  /**
   * Save form data to localStorage
   */
  const saveDraft = (formData: T): void => {
    try {
      const draft: Draft<T> = {
        formData,
        metadata: {
          timestamp: new Date().toISOString(),
          formType,
          action,
          entityId
        }
      }
      localStorage.setItem(getDraftKey(), JSON.stringify(draft))
      setHasDraft(true)
      setDraftTimestamp(draft.metadata.timestamp)
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
  }

  /**
   * Get draft from localStorage
   */
  const getDraft = (): Draft<T> | null => {
    try {
      const draftStr = localStorage.getItem(getDraftKey())
      if (!draftStr) return null
      return JSON.parse(draftStr) as Draft<T>
    } catch (error) {
      console.error('Failed to get draft:', error)
      return null
    }
  }

  /**
   * Restore draft data
   */
  const restoreDraft = (): T | null => {
    const draft = getDraft()
    return draft?.formData || null
  }

  /**
   * Clear draft from localStorage
   */
  const clearDraft = (): void => {
    try {
      localStorage.removeItem(getDraftKey())
      setHasDraft(false)
      setDraftTimestamp(null)
    } catch (error) {
      console.error('Failed to clear draft:', error)
    }
  }

  return {
    saveDraft,
    restoreDraft,
    clearDraft,
    hasDraft,
    draftTimestamp
  }
}
