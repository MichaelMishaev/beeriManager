'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { Undo2, X } from 'lucide-react'

interface UndoToastProps {
  message: string
  onUndo: () => void
  onDismiss: () => void
  duration?: number
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right' | 'top-left'
}

export function UndoToast({
  message,
  onUndo,
  onDismiss,
  duration = 5000,
  position = 'bottom-center'
}: UndoToastProps) {
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 50))
        if (newProgress <= 0) {
          onDismiss()
          return 0
        }
        return newProgress
      })
    }, 50)

    return () => clearInterval(interval)
  }, [duration, onDismiss, isPaused])

  const handleUndo = useCallback(() => {
    onUndo()
    onDismiss()
  }, [onUndo, onDismiss])

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // Swipe down or up to dismiss (depending on position)
      const threshold = 50
      if (Math.abs(info.offset.y) > threshold) {
        onDismiss()
      }
    },
    [onDismiss]
  )

  // Position classes for RTL support
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 left-auto',
    'bottom-left': 'bottom-4 left-4 right-auto',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4 left-auto',
    'top-left': 'top-4 left-4 right-auto'
  }

  const slideDirection = position.includes('bottom') ? 100 : -100

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: slideDirection, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: slideDirection, scale: 0.9 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onHoverStart={() => setIsPaused(true)}
        onHoverEnd={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className={`fixed ${positionClasses[position]} z-50 w-[calc(100%-2rem)] max-w-md`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="relative bg-slate-900 dark:bg-slate-800 text-white rounded-xl shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <motion.div
            className="absolute top-0 left-0 h-1 bg-emerald-400"
            style={{ width: `${progress}%` }}
            initial={{ width: '100%' }}
            transition={{ duration: 0.05, ease: 'linear' }}
          />

          <div className="flex items-center gap-3 p-4 pr-12">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 dark:bg-slate-700 flex items-center justify-center">
              <Undo2 className="h-5 w-5 text-emerald-400" />
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{message}</p>
            </div>

            {/* Undo button */}
            <motion.button
              onClick={handleUndo}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded-lg transition-colors
                focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
              aria-label="בטל מחיקה"
            >
              ביטול
            </motion.button>

            {/* Close button */}
            <motion.button
              onClick={onDismiss}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-2 left-2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors
                focus:outline-none focus:ring-2 focus:ring-slate-500"
              aria-label="סגור"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Swipe indicator */}
          <div className="h-1 w-12 mx-auto mb-2 rounded-full bg-slate-600" />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Hook for managing toast state
export function useUndoToast() {
  const [toast, setToast] = useState<{
    message: string
    onUndo: () => void
  } | null>(null)

  const showToast = useCallback((message: string, onUndo: () => void) => {
    setToast({ message, onUndo })
  }, [])

  const dismissToast = useCallback(() => {
    setToast(null)
  }, [])

  return { toast, showToast, dismissToast }
}
