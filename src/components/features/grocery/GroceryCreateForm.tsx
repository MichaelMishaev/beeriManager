'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  ShoppingCart,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  X,
  Plus
} from 'lucide-react'
import { ALL_EVENT_NAMES, QUICK_EVENT_SUGGESTIONS } from '@/lib/data/event-names'
import { fuzzySearchHebrew } from '@/lib/utils/fuzzy-search'

// Local storage key for remembering creator name
const CREATOR_NAME_KEY = 'grocery_creator_name'

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 }
  }
}

// Date preset helpers
function getDatePresets() {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Find next Saturday (weekend)
  const thisWeekend = new Date(today)
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7
  thisWeekend.setDate(today.getDate() + daysUntilSaturday)

  // Next week (Monday)
  const nextWeek = new Date(today)
  const daysUntilMonday = (1 - today.getDay() + 7) % 7 || 7
  nextWeek.setDate(today.getDate() + daysUntilMonday + 7)

  return {
    today: formatDateValue(today),
    tomorrow: formatDateValue(tomorrow),
    thisWeekend: formatDateValue(thisWeekend),
    nextWeek: formatDateValue(nextWeek)
  }
}

function formatDateValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('he-IL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

// Time presets (24h format)
const TIME_PRESETS = [
  { key: 'timeMorning', value: '09:00', icon: Sun },
  { key: 'timeNoon', value: '12:00', icon: Sun },
  { key: 'timeAfternoon', value: '16:00', icon: Sunset },
  { key: 'timeEvening', value: '18:00', icon: Sunset },
  { key: 'timeNight', value: '20:00', icon: Moon }
] as const

interface GroceryCreateFormProps {
  onSuccess: (token: string) => void
}

export function GroceryCreateForm({ onSuccess }: GroceryCreateFormProps) {
  const t = useTranslations('grocery')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [eventSuggestions, setEventSuggestions] = useState<string[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [creatorPhone, setCreatorPhone] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const eventNameInputRef = useRef<HTMLInputElement | null>(null)
  const suggestionsDropdownRef = useRef<HTMLDivElement>(null)

  // Format phone number as user types
  const formatPhone = (input: string) => {
    const digits = input.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  // Schema with i18n error messages
  const groceryEventSchema = z.object({
    event_name: z.string().min(2, t('eventNameRequired')),
    class_name: z.string().min(2, t('classNameRequired')),
    event_date: z.string().optional(),
    event_time: z.string().optional(),
    event_address: z.string().optional(),
    creator_name: z.string().optional()
  })

  type FormData = z.infer<typeof groceryEventSchema>

  // Get saved creator name from localStorage
  const getSavedCreatorName = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CREATOR_NAME_KEY) || ''
    }
    return ''
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, dirtyFields }
  } = useForm<FormData>({
    resolver: zodResolver(groceryEventSchema),
    mode: 'onChange',
    defaultValues: {
      event_name: '',
      class_name: '',
      event_date: '',
      event_time: '',
      event_address: '',
      creator_name: ''
    }
  })

  // Load saved creator name on mount
  useEffect(() => {
    const savedName = getSavedCreatorName()
    if (savedName) {
      setValue('creator_name', savedName)
    }
  }, [getSavedCreatorName, setValue])

  // Watch form fields
  const eventName = watch('event_name')
  const eventDate = watch('event_date')
  const eventTime = watch('event_time')

  // Date presets (memoized to prevent recalculation)
  const datePresets = useMemo(() => getDatePresets(), [])

  // State for showing manual date/time inputs
  const [showManualDate, setShowManualDate] = useState(false)
  const [showManualTime, setShowManualTime] = useState(false)

  // Update event name suggestions based on input
  const updateEventSuggestions = useCallback((value: string) => {
    if (!value.trim()) {
      setEventSuggestions([])
      return
    }

    const matches = fuzzySearchHebrew(value, ALL_EVENT_NAMES, 6)
    setEventSuggestions(matches)
    setSelectedSuggestionIndex(-1)
  }, [])

  // Handle event name input change
  const handleEventNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setValue('event_name', value, { shouldValidate: true })
    updateEventSuggestions(value)
    setShowSuggestions(true)
  }, [setValue, updateEventSuggestions])

  // Handle keyboard navigation in suggestions
  const handleEventNameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || eventSuggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev =>
          prev < eventSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault()
          selectSuggestion(eventSuggestions[selectedSuggestionIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }, [showSuggestions, eventSuggestions, selectedSuggestionIndex])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsDropdownRef.current &&
        !suggestionsDropdownRef.current.contains(event.target as Node) &&
        eventNameInputRef.current &&
        !eventNameInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // State for keyboard visibility
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  // Handle keyboard visibility for mobile
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return
    }

    const handleResize = () => {
      const viewport = window.visualViewport
      if (!viewport) return

      const keyboardHeight = window.innerHeight - viewport.height
      // Keyboard is considered open if more than 150px is hidden
      setIsKeyboardOpen(keyboardHeight > 150)
    }

    window.visualViewport.addEventListener('resize', handleResize)
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)
    setPhoneError(null)

    // Validate phone number (mandatory)
    const phoneDigits = creatorPhone.replace(/\D/g, '')
    if (!phoneDigits || !/^05\d{8}$/.test(phoneDigits)) {
      setPhoneError(t('invalidPhone'))
      setIsSubmitting(false)
      return
    }

    // Save creator name to localStorage for future use
    if (data.creator_name && typeof window !== 'undefined') {
      localStorage.setItem(CREATOR_NAME_KEY, data.creator_name)
    }

    try {
      const response = await fetch('/api/grocery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          creator_phone: phoneDigits
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || t('errorCreating'))
      }

      onSuccess(result.data.share_token)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorCreating'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectSuggestion = (suggestion: string) => {
    // Update form value
    setValue('event_name', suggestion, { shouldValidate: true })
    // Also update the DOM input directly (needed for uncontrolled inputs)
    if (eventNameInputRef.current) {
      eventNameInputRef.current.value = suggestion
    }
    setShowSuggestions(false)
    setEventSuggestions([])
    setSelectedSuggestionIndex(-1)
    // Focus on next input after selection
    const classNameInput = document.querySelector('input[name="class_name"]') as HTMLInputElement
    if (classNameInput) {
      setTimeout(() => classNameInput.focus(), 100)
    }
  }

  // Date/Time preset selection handlers
  const selectDatePreset = (dateValue: string) => {
    setValue('event_date', dateValue, { shouldValidate: true, shouldDirty: true })
    setShowManualDate(false)
  }

  const selectTimePreset = (timeValue: string) => {
    setValue('event_time', timeValue, { shouldValidate: true, shouldDirty: true })
    setShowManualTime(false)
  }

  const clearDate = () => {
    setValue('event_date', '', { shouldValidate: true })
  }

  const clearTime = () => {
    setValue('event_time', '', { shouldValidate: true })
  }

  // Calculate form completion percentage
  const completedFields = Object.keys(dirtyFields).filter(
    key => dirtyFields[key as keyof typeof dirtyFields]
  ).length
  const totalRequiredFields = 2 // event_name and class_name
  const progress = Math.min((completedFields / totalRequiredFields) * 100, 100)

  return (
    <motion.form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className="font-[family-name:var(--font-jakarta)]"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Progress Indicator */}
      <motion.div
        className="px-4 pt-4"
        variants={fadeInUp}
      >
        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#13ec80] to-[#0d98ba] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Event Details Section Header */}
      <motion.div
        className="px-4 pt-6"
        variants={fadeInUp}
      >
        <h3 className="text-[#0d1b14] dark:text-white tracking-tight text-2xl font-bold leading-tight">
          {t('eventDetails')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {t('eventDetailsSubtitle')}
        </p>
      </motion.div>

      {/* Basic Info Section */}
      <motion.div
        className="mt-4 space-y-2"
        variants={staggerContainer}
      >
        {/* Event Name with Suggestions */}
        <motion.div
          className="flex flex-col px-4 py-3"
          variants={fadeInUp}
        >
          <label className="flex flex-col w-full">
            <p className="text-[#0d1b14] dark:text-white text-sm font-semibold leading-normal pb-2 flex items-center gap-1">
              {t('eventName')}
              <span className="text-red-500" aria-hidden="true">*</span>
              <span className="sr-only">{t('requiredFields')}</span>
            </p>
            <div className="relative flex items-center">
              <CalendarDays className="absolute right-4 text-gray-400 h-5 w-5 pointer-events-none" aria-hidden="true" />
              <input
                {...register('event_name', {
                  onChange: handleEventNameChange
                })}
                ref={(e) => {
                  // Combine refs: register's ref and our local ref
                  register('event_name').ref(e)
                  eventNameInputRef.current = e
                }}
                onKeyDown={handleEventNameKeyDown}
                onFocus={() => {
                  setShowSuggestions(true)
                  if (eventName) {
                    updateEventSuggestions(eventName)
                  }
                }}
                aria-invalid={!!errors.event_name}
                aria-describedby={errors.event_name ? 'event-name-error' : undefined}
                className="form-input flex w-full rounded-xl text-[#0d1b14] dark:text-white
                  focus:outline-none focus:ring-4 focus:ring-[#13ec80]/40 focus:border-[#13ec80]
                  border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                  h-14 placeholder:text-gray-400 pr-12 pl-4 text-base font-normal leading-normal
                  transition-all duration-200
                  aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/40"
                placeholder={t('eventNamePlaceholder')}
                autoComplete="off"
                role="combobox"
                aria-expanded={showSuggestions && eventSuggestions.length > 0}
                aria-autocomplete="list"
                aria-controls="event-name-suggestions"
              />
            </div>
          </label>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showSuggestions && eventSuggestions.length > 0 && (
              <motion.div
                ref={suggestionsDropdownRef}
                id="event-name-suggestions"
                role="listbox"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="mt-2 bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
              >
                {eventSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    type="button"
                    role="option"
                    aria-selected={selectedSuggestionIndex === index}
                    onClick={() => selectSuggestion(suggestion)}
                    className={`w-full px-4 py-3 text-right flex items-center gap-3 transition-colors
                      ${selectedSuggestionIndex === index
                        ? 'bg-[#13ec80]/20 text-[#0d1b14] dark:text-white'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-[#0d1b14] dark:text-white'
                      }
                      ${index < eventSuggestions.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}
                    `}
                  >
                    <Plus className="h-4 w-4 text-[#13ec80] shrink-0" />
                    <span className="text-base font-medium">{suggestion}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Suggestions (show when input is empty) */}
          <AnimatePresence>
            {showSuggestions && !eventName && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 flex flex-wrap gap-2"
              >
                {QUICK_EVENT_SUGGESTIONS.map((suggestion) => (
                  <motion.button
                    key={suggestion}
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#13ec80]/10 hover:bg-[#13ec80]/20
                      text-[#0d1b14] dark:text-white text-sm rounded-full border border-[#13ec80]/20
                      transition-colors cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#13ec80]" />
                    {suggestion}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {errors.event_name && (
              <motion.p
                id="event-name-error"
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-500 mt-1 flex items-center gap-1"
              >
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.event_name.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Class Name */}
        <motion.div
          className="flex flex-col px-4 py-3"
          variants={fadeInUp}
        >
          <label className="flex flex-col w-full">
            <p className="text-[#0d1b14] dark:text-white text-sm font-semibold leading-normal pb-2 flex items-center gap-1">
              {t('className')}
              <span className="text-red-500" aria-hidden="true">*</span>
              <span className="sr-only">{t('requiredFields')}</span>
            </p>
            <div className="relative flex items-center">
              <GraduationCap className="absolute right-4 text-gray-400 h-5 w-5 pointer-events-none" aria-hidden="true" />
              <input
                {...register('class_name')}
                aria-invalid={!!errors.class_name}
                aria-describedby={errors.class_name ? 'class-name-error' : undefined}
                className="form-input flex w-full rounded-xl text-[#0d1b14] dark:text-white
                  focus:outline-none focus:ring-4 focus:ring-[#13ec80]/40 focus:border-[#13ec80]
                  border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                  h-14 placeholder:text-gray-400 pr-12 pl-4 text-base font-normal leading-normal
                  transition-all duration-200
                  aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/40"
                placeholder={t('classNamePlaceholder')}
              />
            </div>
          </label>
          <AnimatePresence mode="wait">
            {errors.class_name && (
              <motion.p
                id="class-name-error"
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-500 mt-1 flex items-center gap-1"
              >
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {errors.class_name.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Schedule & Location Section Header */}
      <motion.div
        className="pt-6"
        variants={fadeInUp}
      >
        <h3 className="text-[#0d1b14] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4">
          {t('dateAndLocation')}
        </h3>
      </motion.div>

      {/* Date Selection - Quick Presets */}
      <motion.div
        className="px-4 mt-4"
        variants={fadeInUp}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[#0d1b14] dark:text-white text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#13ec80]" aria-hidden="true" />
            {t('quickDateSelect')}
          </p>
          {eventDate && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={clearDate}
              className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <X className="h-3 w-3" />
              {t('clearSelection')}
            </motion.button>
          )}
        </div>

        {/* Selected Date Display */}
        <AnimatePresence mode="wait">
          {eventDate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-3 px-4 py-3 bg-[#13ec80]/10 border border-[#13ec80]/30 rounded-xl flex items-center justify-between"
            >
              <span className="text-[#0d1b14] dark:text-white font-semibold">
                {formatDateDisplay(eventDate)}
              </span>
              <span className="text-xs text-[#4c9a73] bg-[#13ec80]/20 px-2 py-1 rounded-full">
                {t('selectedDate')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Date Preset Chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'dateToday', value: datePresets.today },
            { key: 'dateTomorrow', value: datePresets.tomorrow },
            { key: 'dateThisWeekend', value: datePresets.thisWeekend },
            { key: 'dateNextWeek', value: datePresets.nextWeek }
          ].map((preset) => {
            const isSelected = eventDate === preset.value
            return (
              <motion.button
                key={preset.key}
                type="button"
                onClick={() => selectDatePreset(preset.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
                  transition-all duration-200 border-2
                  focus:outline-none focus:ring-4 focus:ring-[#13ec80]/30
                  ${isSelected
                    ? 'bg-[#13ec80] border-[#13ec80] text-[#0d1b14] shadow-md shadow-[#13ec80]/20'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-[#0d1b14] dark:text-white hover:border-[#13ec80]/50'
                  }`}
              >
                <Calendar className={`h-4 w-4 ${isSelected ? 'text-[#0d1b14]' : 'text-[#13ec80]'}`} />
                {t(preset.key)}
              </motion.button>
            )
          })}
        </div>

        {/* Manual Date Input Toggle */}
        <motion.button
          type="button"
          onClick={() => setShowManualDate(!showManualDate)}
          className="mt-3 text-xs text-[#4c9a73] hover:text-[#13ec80] transition-colors underline underline-offset-2"
        >
          {t('orSelectManually')}
        </motion.button>

        {/* Manual Date Input */}
        <AnimatePresence>
          {showManualDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <input
                type="date"
                {...register('event_date')}
                className="form-input w-full rounded-xl text-[#0d1b14] dark:text-white
                  border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                  h-14 px-4 text-base
                  focus:outline-none focus:ring-4 focus:ring-[#13ec80]/40 focus:border-[#13ec80]
                  transition-all duration-200"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Time Selection - Quick Presets */}
      <motion.div
        className="px-4 mt-6"
        variants={fadeInUp}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[#0d1b14] dark:text-white text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#13ec80]" aria-hidden="true" />
            {t('quickTimeSelect')}
          </p>
          {eventTime && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={clearTime}
              className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <X className="h-3 w-3" />
              {t('clearSelection')}
            </motion.button>
          )}
        </div>

        {/* Selected Time Display */}
        <AnimatePresence mode="wait">
          {eventTime && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-3 px-4 py-3 bg-[#13ec80]/10 border border-[#13ec80]/30 rounded-xl flex items-center justify-between"
            >
              <span className="text-[#0d1b14] dark:text-white font-semibold text-lg">
                {eventTime}
              </span>
              <span className="text-xs text-[#4c9a73] bg-[#13ec80]/20 px-2 py-1 rounded-full">
                {t('selectedTime')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Time Preset Chips */}
        <div className="flex flex-wrap gap-2">
          {TIME_PRESETS.map((preset) => {
            const isSelected = eventTime === preset.value
            const Icon = preset.icon
            return (
              <motion.button
                key={preset.key}
                type="button"
                onClick={() => selectTimePreset(preset.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
                  transition-all duration-200 border-2
                  focus:outline-none focus:ring-4 focus:ring-[#13ec80]/30
                  ${isSelected
                    ? 'bg-[#13ec80] border-[#13ec80] text-[#0d1b14] shadow-md shadow-[#13ec80]/20'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-[#0d1b14] dark:text-white hover:border-[#13ec80]/50'
                  }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-[#0d1b14]' : 'text-amber-500'}`} />
                <span>{t(preset.key)}</span>
                <span className={`text-xs ${isSelected ? 'text-[#0d1b14]/70' : 'text-gray-400'}`}>
                  {preset.value}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Manual Time Input Toggle */}
        <motion.button
          type="button"
          onClick={() => setShowManualTime(!showManualTime)}
          className="mt-3 text-xs text-[#4c9a73] hover:text-[#13ec80] transition-colors underline underline-offset-2"
        >
          {t('orSelectManually')}
        </motion.button>

        {/* Manual Time Input */}
        <AnimatePresence>
          {showManualTime && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <input
                type="time"
                {...register('event_time')}
                className="form-input w-full rounded-xl text-[#0d1b14] dark:text-white
                  border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                  h-14 px-4 text-base
                  focus:outline-none focus:ring-4 focus:ring-[#13ec80]/40 focus:border-[#13ec80]
                  transition-all duration-200"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Physical Address */}
      <motion.div
        className="flex flex-col px-4 py-4 mt-2"
        variants={fadeInUp}
      >
        <label className="flex flex-col w-full">
          <p className="text-[#0d1b14] dark:text-white text-sm font-semibold leading-normal pb-2">
            {t('eventAddress')}
          </p>
          <div className="relative flex items-center">
            <MapPin className="absolute right-4 text-gray-400 h-5 w-5 pointer-events-none" aria-hidden="true" />
            <input
              {...register('event_address')}
              className="form-input flex w-full rounded-xl text-[#0d1b14] dark:text-white
                focus:outline-none focus:ring-4 focus:ring-[#13ec80]/40 focus:border-[#13ec80]
                border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                h-14 placeholder:text-gray-400 pr-12 pl-4 text-base font-normal leading-normal
                transition-all duration-200"
              placeholder={t('eventAddressPlaceholder')}
            />
          </div>
        </label>
      </motion.div>

      {/* Creator Name (Optional) */}
      <motion.div
        className="flex flex-col px-4 py-3"
        variants={fadeInUp}
      >
        <label className="flex flex-col w-full">
          <p className="text-[#0d1b14] dark:text-white text-sm font-semibold leading-normal pb-2">
            {t('creatorName')}
          </p>
          <div className="relative flex items-center">
            <User className="absolute right-4 text-gray-400 h-5 w-5 pointer-events-none" aria-hidden="true" />
            <input
              {...register('creator_name')}
              className="form-input flex w-full rounded-xl text-[#0d1b14] dark:text-white
                focus:outline-none focus:ring-4 focus:ring-[#13ec80]/40 focus:border-[#13ec80]
                border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                h-14 placeholder:text-gray-400 pr-12 pl-4 text-base font-normal leading-normal
                transition-all duration-200"
              placeholder={t('creatorNamePlaceholder')}
            />
          </div>
        </label>
      </motion.div>

      {/* Phone Input for My Lists */}
      <motion.div
        className="flex flex-col px-4 py-3"
        variants={fadeInUp}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-[#0d1b14] dark:text-white flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#13ec80]" />
              {t('phoneNumber')}
              <span className="text-red-500">*</span>
            </label>
          </div>
          <input
            type="tel"
            inputMode="numeric"
            dir="ltr"
            placeholder="050-000-0000"
            value={creatorPhone}
            onChange={(e) => {
              setCreatorPhone(formatPhone(e.target.value))
              setPhoneError(null)
            }}
            className={`w-full px-4 py-3 text-lg text-center tracking-wide border-2 rounded-xl
              bg-white dark:bg-gray-900 text-[#0d1b14] dark:text-white
              focus:outline-none focus:ring-4 focus:ring-[#13ec80]/40 focus:border-[#13ec80] transition-all
              ${phoneError
                ? 'border-red-500 ring-2 ring-red-500/20'
                : creatorPhone && /^05\d-\d{3}-\d{4}$/.test(creatorPhone)
                  ? 'border-[#13ec80] bg-[#13ec80]/5'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
          />
          {phoneError ? (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span> {phoneError}
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('phoneNumberHint')}
            </p>
          )}
        </div>
      </motion.div>

      {/* Grocery Link Info */}
      <motion.div
        className="mx-4 mt-8 p-4 rounded-xl bg-[#13ec80]/10 border border-[#13ec80]/20 flex items-start gap-3"
        variants={scaleIn}
      >
        <ShoppingCart className="text-[#13ec80] h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h4 className="text-sm font-bold text-[#0d1b14] dark:text-white">
            {t('addItemsInfo')}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {t('addItemsInfoDescription')}
          </p>
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3"
            role="alert"
          >
            <AlertCircle className="text-red-500 h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed footer - only show when keyboard is closed */}
      

      {/* Inline submit button - shows when keyboard is open for better mobile UX */}
      {isKeyboardOpen && (
        <motion.div
          className="px-4 py-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            type="submit"
            disabled={isSubmitting || !isValid}
            whileTap={{ scale: isValid && !isSubmitting ? 0.98 : 1 }}
            className="w-full bg-[#13ec80] hover:bg-[#10d970] text-[#102219] font-bold py-4 rounded-xl
              shadow-lg shadow-[#13ec80]/20 transition-all flex items-center justify-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
              focus:outline-none focus:ring-4 focus:ring-[#13ec80]/40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" aria-hidden="true" />
                <span>{t('creating')}</span>
              </>
            ) : (
              <>
                <span>{t('createList')}</span>
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Bottom Primary Button - Fixed footer, hidden when keyboard is open */}
      {!isKeyboardOpen && (
        <footer
          data-grocery-footer
          className="max-w-[430px] mx-auto p-4 pb-6 bg-[#f6f8f7] dark:bg-[#102219] border-t border-gray-200 dark:border-gray-800"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          <motion.button
            type="submit"
            disabled={isSubmitting || !isValid}
            whileHover={{ scale: isValid && !isSubmitting ? 1.02 : 1 }}
            whileTap={{ scale: isValid && !isSubmitting ? 0.98 : 1 }}
            className="w-full bg-[#13ec80] hover:bg-[#10d970] text-[#102219] font-bold py-4 rounded-xl
              shadow-lg shadow-[#13ec80]/20 transition-all flex items-center justify-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
              focus:outline-none focus:ring-4 focus:ring-[#13ec80]/40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" aria-hidden="true" />
                <span>{t('creating')}</span>
              </>
            ) : (
              <>
                <span>{t('createList')}</span>
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </>
            )}
          </motion.button>
        </footer>
      )}
    </motion.form>
  )
}
