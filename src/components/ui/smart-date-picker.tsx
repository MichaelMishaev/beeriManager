'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from 'lucide-react'
import { useState } from 'react'

interface SmartDatePickerProps {
  label: string
  value?: string
  onChange: (date: string | null) => void
  helperText?: string
  required?: boolean
  comingSoon?: boolean
  relativeTo?: string // For reminder dates relative to due date
}

export function SmartDatePicker({
  label,
  value,
  onChange,
  helperText,
  required = false,
  comingSoon = false,
  relativeTo
}: SmartDatePickerProps) {
  const [manualMode, setManualMode] = useState(!!value)

  const getSmartOptions = () => {
    if (relativeTo) {
      // Options for reminder date (relative to due date)
      return [
        { label: 'יום לפני', days: -1 },
        { label: '3 ימים לפני', days: -3 },
        { label: 'שבוע לפני', days: -7 }
      ]
    } else {
      // Options for due date
      return [
        { label: 'היום', days: 0 },
        { label: 'מחר', days: 1 },
        { label: 'בעוד 3 ימים', days: 3 },
        { label: 'בעוד שבוע', days: 7 },
        { label: 'בעוד שבועיים', days: 14 },
        { label: 'בעוד חודש', days: 30 }
      ]
    }
  }

  const calculateDate = (days: number): string => {
    let baseDate = new Date()

    if (relativeTo) {
      // Calculate relative to the reference date (due date)
      baseDate = new Date(relativeTo)
    }

    const targetDate = new Date(baseDate)
    targetDate.setDate(targetDate.getDate() + days)

    return targetDate.toISOString().split('T')[0]
  }

  const handleQuickSelect = (days: number) => {
    const date = calculateDate(days)
    onChange(date)
    setManualMode(true)
  }

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value || null)
  }

  const handleClear = () => {
    onChange(null)
    setManualMode(false)
  }

  const options = getSmartOptions()
  const isDisabled = comingSoon || (!!relativeTo && !relativeTo)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label>
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </Label>
        {comingSoon && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
            בקרוב 🔔
          </span>
        )}
      </div>

      {/* Quick select buttons */}
      {!isDisabled && (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <Button
              key={option.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(option.days)}
              className="text-sm"
              disabled={!!relativeTo && !relativeTo}
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}

      {/* Manual date input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">או בחר תאריך ידנית:</span>
          {manualMode && value && !required && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 text-xs"
            >
              נקה
            </Button>
          )}
        </div>
        <div className="relative">
          <Input
            type="date"
            value={value || ''}
            onChange={handleManualChange}
            disabled={isDisabled}
            className="pr-10"
          />
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}

      {relativeTo && !relativeTo && (
        <p className="text-sm text-orange-600">
          נא לבחור תאריך יעד תחילה
        </p>
      )}
    </div>
  )
}
