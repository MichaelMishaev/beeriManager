'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, User, AlertCircle, Loader2, Check } from 'lucide-react'

// Local storage key for remembering claimer name
const CLAIMER_NAME_KEY = 'grocery_claimer_name'

interface ClaimDialogProps {
  isOpen: boolean
  onClose: () => void
  onClaim: (name: string) => void
  itemName: string
  isLoading?: boolean
}

export function ClaimDialog({
  isOpen,
  onClose,
  onClaim,
  itemName,
  isLoading = false
}: ClaimDialogProps) {
  const t = useTranslations('grocery')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  // Load saved claimer name on mount
  const getSavedClaimerName = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CLAIMER_NAME_KEY) || ''
    }
    return ''
  }, [])

  // Pre-fill name from localStorage when dialog opens
  useEffect(() => {
    if (isOpen) {
      const savedName = getSavedClaimerName()
      if (savedName && !name) {
        setName(savedName)
      }
    }
  }, [isOpen, getSavedClaimerName, name])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError(t('nameRequired'))
      return
    }

    if (name.trim().length < 2) {
      setError(t('nameMinLength'))
      return
    }

    // Save name to localStorage for future use
    if (typeof window !== 'undefined') {
      localStorage.setItem(CLAIMER_NAME_KEY, name.trim())
    }

    onClaim(name.trim())
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl bg-white dark:bg-[#152a1f] border-[#cfe7db] dark:border-[#1e3a2c] font-[var(--font-jakarta)]">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex justify-center mb-2"
          >
            <div className="size-14 rounded-full bg-[#13ec80]/10 flex items-center justify-center">
              <Heart className="text-[#13ec80] h-6 w-6" aria-hidden="true" />
            </div>
          </motion.div>
          <DialogTitle className="text-xl font-bold text-center text-[#0d1b14] dark:text-white">
            {t('claimDialogTitle')}
          </DialogTitle>
          <DialogDescription className="text-center">
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-semibold text-[#0d1b14] dark:text-white"
            >
              {itemName}
            </motion.span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="claimer-name"
              className="text-sm font-semibold text-[#0d1b14] dark:text-white"
            >
              {t('yourName')}
            </Label>
            <div className="relative">
              <User
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4c9a73] h-5 w-5 pointer-events-none"
                aria-hidden="true"
              />
              <Input
                id="claimer-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (error) setError('')
                }}
                placeholder={t('yourNamePlaceholder')}
                aria-invalid={!!error}
                aria-describedby={error ? 'claimer-name-error' : undefined}
                className="h-14 pr-12 rounded-xl border-2 border-[#cfe7db] dark:border-[#1e3a2c]
                  bg-[#f6f8f7] dark:bg-[#102219]
                  focus:border-[#13ec80] focus:ring-4 focus:ring-[#13ec80]/20
                  placeholder:text-[#4c9a73]/60 text-[#0d1b14] dark:text-white
                  transition-all duration-200
                  aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/20"
                autoFocus
                disabled={isLoading}
              />
            </div>
            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  id="claimer-name-error"
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter className="gap-3 sm:gap-3 flex-row-reverse">
            <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full bg-[#13ec80] hover:bg-[#10d970] text-[#0d1b14] font-bold rounded-xl h-12
                  shadow-md shadow-[#13ec80]/20
                  focus:outline-none focus:ring-4 focus:ring-[#13ec80]/40
                  disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !name.trim()}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    {t('saving')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    {t('confirm')}
                  </span>
                )}
              </Button>
            </motion.div>
            <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full rounded-xl h-12 border-[#cfe7db] dark:border-[#1e3a2c]
                  text-[#4c9a73] hover:bg-[#f6f8f7] dark:hover:bg-[#102219]
                  focus:outline-none focus:ring-4 focus:ring-gray-400/20"
                disabled={isLoading}
              >
                {t('cancel')}
              </Button>
            </motion.div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
