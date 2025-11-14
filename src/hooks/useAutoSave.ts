import { useEffect, useRef, useCallback, useState } from 'react'

interface UseAutoSaveOptions<T> {
  data: T
  onSave: (data: T) => void
  delay?: number // milliseconds
  enabled?: boolean
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 3000, // 3 seconds default
  enabled = true
}: UseAutoSaveOptions<T>) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousDataRef = useRef<T>(data)

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (!enabled) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      // Check if data actually changed
      if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
        setIsSaving(true)
        onSave(data)
        previousDataRef.current = data
        setLastSaved(new Date())
        setIsSaving(false)
      }
    }, delay)
  }, [data, onSave, delay, enabled])

  // Trigger debounced save when data changes
  useEffect(() => {
    debouncedSave()

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [debouncedSave])

  // Manual save function (bypasses debounce)
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    onSave(data)
    previousDataRef.current = data
    setLastSaved(new Date())
  }, [data, onSave])

  return {
    lastSaved,
    isSaving,
    saveNow
  }
}
