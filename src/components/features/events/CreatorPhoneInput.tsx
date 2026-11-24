'use client'

import { useState, useCallback } from 'react'
import { AlertTriangle, Check, Phone, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreatorPhoneInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function CreatorPhoneInput({
  value,
  onChange,
  error
}: CreatorPhoneInputProps) {
  const t = useTranslations('admin.events')
  const [isFocused, setIsFocused] = useState(false)

  // Auto-format Israeli phone: 05X-XXX-XXXX
  const formatPhone = useCallback((input: string) => {
    const digits = input.replace(/\D/g, '')
    const limited = digits.slice(0, 10)

    if (limited.length <= 3) return limited
    if (limited.length <= 6) return `${limited.slice(0, 3)}-${limited.slice(3)}`
    return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    onChange(formatted)
  }

  const isValid = /^05\d-\d{3}-\d{4}$/.test(value)
  const hasValue = value.length > 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor="creator_phone"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Phone className="h-4 w-4 text-[#0D98BA]" />
          <span>{t('phone.label')}</span>
        </Label>

        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {t('phone.optional')}
        </span>
      </div>

      <div className="relative">
        <Input
          id="creator_phone"
          type="tel"
          inputMode="numeric"
          dir="ltr"
          placeholder="050-000-0000"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-describedby="phone-hint phone-error"
          aria-invalid={error ? 'true' : undefined}
          className={`
            text-lg tracking-wide text-center
            transition-all duration-200
            ${isFocused ? 'ring-2 ring-[#0D98BA]/30 border-[#0D98BA]' : ''}
            ${error ? 'border-red-500 ring-2 ring-red-500/20' : ''}
            ${isValid && hasValue ? 'border-[#0D98BA] bg-[#0D98BA]/5' : ''}
          `}
        />

        {isValid && hasValue && (
          <div className="absolute end-3 top-1/2 -translate-y-1/2">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0D98BA]">
              <Check className="w-3 h-3 text-white" strokeWidth={3} aria-hidden="true" />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p id="phone-error" className="text-sm text-red-600 flex items-center gap-1" role="alert">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" /> {error}
        </p>
      )}

      <div
        id="phone-hint"
        className={`
          flex items-start gap-2 p-3 rounded-lg
          transition-colors duration-200
          ${hasValue && isValid
            ? 'bg-[#0D98BA]/10 border border-[#0D98BA]/20'
            : 'bg-muted/50'
          }
        `}
      >
        <Sparkles className={`h-4 w-4 mt-0.5 flex-shrink-0 ${hasValue && isValid ? 'text-[#0D98BA]' : 'text-muted-foreground'}`} />
        <p className={`text-sm ${hasValue && isValid ? 'text-[#0D98BA] font-medium' : 'text-muted-foreground'}`}>
          {hasValue && isValid
            ? t('phone.hintValid')
            : t('phone.hintEmpty')
          }
        </p>
      </div>
    </div>
  )
}
