import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Hebrew date formatting utility
 */
export function formatHebrewDate(date: Date | null | undefined): string {
  if (!date) return ''

  const hebrewMonths = [
    'בינואר', 'בפברואר', 'במרץ', 'באפריל', 'במאי', 'ביוני',
    'ביולי', 'באוגוסט', 'בספטמבר', 'באוקטובר', 'בנובמבר', 'בדצמבר'
  ]

  const day = date.getDate()
  const month = hebrewMonths[date.getMonth()]
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
}

/**
 * Hebrew time formatting utility
 */
export function formatHebrewTime(date: Date | null | undefined): string {
  if (!date) return ''

  return date.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jerusalem'
  })
}

/**
 * Hebrew datetime formatting utility
 */
export function formatHebrewDateTime(date: Date | null | undefined): string {
  if (!date) return ''

  return `${formatHebrewDate(date)} בשעה ${formatHebrewTime(date)}`
}

/**
 * RTL-aware text truncation
 */
export function truncateRTL(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Validate Hebrew phone number
 */
export function validateHebrewPhone(phone: string): boolean {
  // Israeli phone format: 05XXXXXXXX or +972-5X-XXXXXXX
  const israeliPhoneRegex = /^(05\d{8}|\+972-5\d-\d{7})$/
  return israeliPhoneRegex.test(phone.replace(/[\s-]/g, ''))
}

/**
 * Format phone number for display
 */
export function formatHebrewPhone(phone: string): string {
  // Format as: 050-123-4567
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10 && cleaned.startsWith('05')) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}