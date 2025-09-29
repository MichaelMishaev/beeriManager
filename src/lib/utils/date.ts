import { format, formatDistanceToNow, parseISO, isValid, startOfDay, endOfDay, isToday, isTomorrow, isYesterday } from 'date-fns'
import { he } from 'date-fns/locale'
import { HEBREW_MONTHS, HEBREW_DAYS } from './constants'

/**
 * Format date in Hebrew
 */
export function formatHebrewDate(date: Date | string | null): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''

  return format(dateObj, 'dd/MM/yyyy', { locale: he })
}

/**
 * Format date with Hebrew month name
 */
export function formatHebrewDateLong(date: Date | string | null): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''

  const day = dateObj.getDate()
  const month = HEBREW_MONTHS[dateObj.getMonth()]
  const year = dateObj.getFullYear()

  return `${day} ב${month} ${year}`
}

/**
 * Format time in 24-hour Hebrew format
 */
export function formatHebrewTime(date: Date | string | null): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''

  return format(dateObj, 'HH:mm')
}

/**
 * Format date and time in Hebrew
 */
export function formatHebrewDateTime(date: Date | string | null): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''

  return `${formatHebrewDate(dateObj)} ${formatHebrewTime(dateObj)}`
}

/**
 * Get relative time in Hebrew
 */
export function getHebrewRelativeTime(date: Date | string | null): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''

  if (isToday(dateObj)) return 'היום'
  if (isTomorrow(dateObj)) return 'מחר'
  if (isYesterday(dateObj)) return 'אתמול'

  try {
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: he
    })
  } catch {
    return formatHebrewDate(dateObj)
  }
}

/**
 * Get Hebrew day of week
 */
export function getHebrewDayOfWeek(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''

  return HEBREW_DAYS[dateObj.getDay()]
}

/**
 * Check if date is in Hebrew calendar holiday
 * This is a basic implementation - can be extended with actual Hebrew calendar
 */
export function isHebrewHoliday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return false

  // Basic implementation - can be extended with proper Hebrew calendar
  // For now, just return false, but this is where you'd check against Hebrew calendar
  return false
}

/**
 * Create date range for queries
 */
export function createDateRange(start: Date, end: Date) {
  return {
    start: startOfDay(start).toISOString(),
    end: endOfDay(end).toISOString()
  }
}

/**
 * Parse date string safely
 */
export function parseDate(dateString: string | null): Date | null {
  if (!dateString) return null

  const parsed = parseISO(dateString)
  return isValid(parsed) ? parsed : null
}

/**
 * Format duration in Hebrew
 */
export function formatHebrewDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} דקות`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return hours === 1 ? 'שעה' : `${hours} שעות`
  }

  const hoursText = hours === 1 ? 'שעה' : `${hours} שעות`
  return `${hoursText} ו-${remainingMinutes} דקות`
}

/**
 * Get academic year string (September to August)
 */
export function getAcademicYear(date: Date = new Date()): string {
  const month = date.getMonth()
  const year = date.getFullYear()

  if (month >= 8) { // September onwards
    return `${year}-${year + 1}`
  } else {
    return `${year - 1}-${year}`
  }
}

/**
 * Format date for input fields
 */
export function formatDateForInput(date: Date | string | null): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''

  return format(dateObj, 'yyyy-MM-dd')
}

/**
 * Format time for input fields
 */
export function formatTimeForInput(date: Date | string | null): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''

  return format(dateObj, 'HH:mm')
}