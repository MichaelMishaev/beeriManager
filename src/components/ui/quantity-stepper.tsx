'use client'

import { motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
  label?: string
  showQuickSelect?: boolean // Show quick select chips for small quantities
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  className,
  label,
  showQuickSelect = true
}: QuantityStepperProps) {
  const isAtMin = value <= min
  const isAtMax = max !== undefined && value >= max

  const handleDecrement = () => {
    if (!disabled && !isAtMin) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (!disabled && !isAtMax) {
      onChange(value + 1)
    }
  }

  const handleQuickSelect = (newValue: number) => {
    if (!disabled && newValue >= min && (max === undefined || newValue <= max)) {
      onChange(newValue)
    }
  }

  // Show quick select chips only for small quantities (max <= 5)
  const shouldShowQuickSelect = showQuickSelect && max !== undefined && max <= 5

  // Generate quick select options
  const quickSelectOptions = shouldShowQuickSelect
    ? Array.from({ length: max! - min + 1 }, (_, i) => min + i)
    : []

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 font-[var(--font-jakarta)]',
        className
      )}
      role="group"
      aria-label={label || 'בחירת כמות'}
    >
      {/* Quick Select Chips - for small quantities */}
      {shouldShowQuickSelect && (
        <div className="flex items-center gap-2 mb-1" role="radiogroup" aria-label="בחירה מהירה">
          {quickSelectOptions.map((num) => (
            <motion.button
              key={num}
              type="button"
              onClick={() => handleQuickSelect(num)}
              disabled={disabled}
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              role="radio"
              aria-checked={value === num}
              className={cn(
                'flex items-center justify-center rounded-full',
                'min-h-[48px] min-w-[48px] h-12 w-12',
                'text-lg font-bold tabular-nums',
                'border-2 transition-all duration-200',
                'focus:outline-none focus:ring-4 focus:ring-[#13ec80]/30',
                // Selected state
                value === num && [
                  'bg-[#13ec80] dark:bg-[#13ec80]',
                  'border-[#13ec80] dark:border-[#13ec80]',
                  'text-[#0d1b14]',
                  'shadow-lg shadow-[#13ec80]/30',
                  'scale-110'
                ],
                // Unselected state
                value !== num && !disabled && [
                  'bg-white dark:bg-[#152a1f]',
                  'border-[#cfe7db] dark:border-[#1e3a2c]',
                  'text-[#4c9a73] dark:text-[#4c9a73]',
                  'hover:border-[#13ec80]/50 hover:bg-[#13ec80]/5'
                ],
                // Disabled state
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {num}
            </motion.button>
          ))}
        </div>
      )}

      {/* Stepper Controls - for larger quantities or as backup */}
      {!shouldShowQuickSelect && (
        <div className="flex items-center gap-3 flex-row-reverse">
          {/* RTL: + button on RIGHT (rendered first in flex-row-reverse) */}
          {/* Increment Button */}
          <motion.button
            type="button"
            onClick={handleIncrement}
            disabled={disabled || isAtMax}
            whileHover={!disabled && !isAtMax ? { scale: 1.05 } : {}}
            whileTap={!disabled && !isAtMax ? { scale: 0.95 } : {}}
            className={cn(
              'flex items-center justify-center rounded-full',
              'min-h-[48px] min-w-[48px] h-12 w-12',
              'border-2 transition-all duration-200',
              'focus:outline-none focus:ring-4',
              // Active state
              !disabled && !isAtMax && [
                'bg-[#13ec80] dark:bg-[#13ec80]',
                'border-[#13ec80] dark:border-[#13ec80]',
                'text-[#0d1b14]',
                'hover:bg-[#10d970] dark:hover:bg-[#10d970]',
                'focus:ring-[#13ec80]/40',
                'shadow-md shadow-[#13ec80]/20'
              ],
              // Disabled state
              (disabled || isAtMax) && [
                'bg-gray-50 dark:bg-[#102219]',
                'border-gray-200 dark:border-white/10',
                'text-gray-300 dark:text-white/20',
                'cursor-not-allowed opacity-50'
              ]
            )}
            aria-label="הגדל כמות"
            aria-disabled={disabled || isAtMax}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </motion.button>

          {/* Value Display */}
          <motion.div
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 20
            }}
            className={cn(
              'flex items-center justify-center',
              'min-w-[64px] h-14 px-5',
              'rounded-xl',
              'bg-[#13ec80]/10 dark:bg-[#13ec80]/5',
              'border-2 border-[#13ec80]/30 dark:border-[#13ec80]/20',
              'text-[#0d1b14] dark:text-white',
              'text-2xl font-bold tabular-nums',
              disabled && 'opacity-50'
            )}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {value}
          </motion.div>

          {/* Decrement Button */}
          <motion.button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || isAtMin}
            whileHover={!disabled && !isAtMin ? { scale: 1.05 } : {}}
            whileTap={!disabled && !isAtMin ? { scale: 0.95 } : {}}
            className={cn(
              'flex items-center justify-center rounded-full',
              'min-h-[48px] min-w-[48px] h-12 w-12',
              'border-2 transition-all duration-200',
              'focus:outline-none focus:ring-4',
              // Active state
              !disabled && !isAtMin && [
                'bg-white dark:bg-[#152a1f]',
                'border-[#13ec80] dark:border-[#13ec80]',
                'text-[#13ec80]',
                'hover:bg-[#13ec80]/5 dark:hover:bg-[#13ec80]/10',
                'focus:ring-[#13ec80]/40',
                'shadow-sm shadow-[#13ec80]/10'
              ],
              // Disabled state
              (disabled || isAtMin) && [
                'bg-gray-50 dark:bg-[#102219]',
                'border-gray-200 dark:border-white/10',
                'text-gray-300 dark:text-white/20',
                'cursor-not-allowed opacity-50'
              ]
            )}
            aria-label="הקטן כמות"
            aria-disabled={disabled || isAtMin}
          >
            <Minus className="h-5 w-5" aria-hidden="true" />
          </motion.button>
        </div>
      )}
    </div>
  )
}
