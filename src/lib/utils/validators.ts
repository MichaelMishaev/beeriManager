/**
 * Runtime Validators - BeeriManager
 *
 * Provides runtime guards for critical invariants.
 * These guards catch bugs that slip through tests.
 */

import { logger } from '@/lib/logger'

/**
 * GUARD 2: Required Fields Validation
 *
 * Validates that all required fields are present and non-empty.
 * Throws error if validation fails (fail fast).
 *
 * @example
 * validateRequiredFields(data, ['title', 'owner'], 'Task')
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[],
  entityType: string
): void {
  const missingFields: string[] = []

  for (const field of requiredFields) {
    const value = data[field]
    if (value === null || value === undefined || value === '') {
      missingFields.push(String(field))
    }
  }

  if (missingFields.length > 0) {
    logger.error('INVARIANT VIOLATION: Missing required fields', {
      component: 'Validator',
      action: 'validateRequiredFields',
      data: {
        entityType,
        missingFields,
        receivedData: data
      }
    })

    throw new Error(
      `Missing required fields for ${entityType}: ${missingFields.join(', ')}`
    )
  }
}

/**
 * GUARD 4: Hebrew Text Validation
 *
 * Validates that Hebrew text contains Hebrew characters.
 * Logs warning if no Hebrew detected (doesn't block).
 *
 * @example
 * validateHebrewText(title, 'Task Title')
 */
export function validateHebrewText(text: string, fieldName?: string): boolean {
  if (!text || text.length === 0) {
    return true // Empty text is valid (might be optional field)
  }

  // Check for Hebrew characters (Unicode range U+0590 to U+05FF)
  const hasHebrew = /[\u0590-\u05FF]/.test(text)

  if (!hasHebrew) {
    logger.warn('No Hebrew characters detected in text field', {
      component: 'Validator',
      action: 'validateHebrewText',
      data: {
        fieldName,
        text: text.substring(0, 100), // First 100 chars only
        length: text.length
      }
    })
  }

  return hasHebrew
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate Israeli phone number
 * Accepts formats: 0501234567, 050-1234567, +972501234567
 */
export function validateIsraeliPhone(phone: string): boolean {
  // Remove spaces, dashes, and plus sign
  const cleaned = phone.replace(/[\s\-+]/g, '')

  // Israeli phone patterns:
  // 10 digits starting with 0 (local format)
  // 12 digits starting with 972 (international format without +)
  const isLocal = /^05\d{8}$/.test(cleaned) // Mobile: 05X-XXXXXXX
  const isLandline = /^0[2-4|8-9]\d{7}$/.test(cleaned) // Landline: 02/03/04/08/09-XXXXXXX
  const isInternational = /^972[2-9]\d{8}$/.test(cleaned) // International: 972XXXXXXXXX

  return isLocal || isLandline || isInternational
}

/**
 * Validate URL format
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate date is in the future
 */
export function validateFutureDate(date: string | Date): boolean {
  const inputDate = typeof date === 'string' ? new Date(date) : date
  const now = new Date()

  return inputDate > now
}

/**
 * Validate date is in the past
 */
export function validatePastDate(date: string | Date): boolean {
  const inputDate = typeof date === 'string' ? new Date(date) : date
  const now = new Date()

  return inputDate < now
}
