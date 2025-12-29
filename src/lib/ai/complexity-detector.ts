/**
 * Complexity Detector for AI Assistant
 * Determines if a message needs multi-round processing or can be handled in a single round
 */

/**
 * Detects if a message is complex and requires multi-round AI processing
 *
 * @param text - The user's message text
 * @returns true if message is complex and needs understanding confirmation, false otherwise
 *
 * Complex messages typically include:
 * - Long messages (> 100 characters)
 * - Formal greetings ("הורים יקרים", "שלום רב")
 * - Multiple lines (> 3 lines)
 * - Multiple clauses (> 2 commas)
 * - Both date and substantial description
 */
export function isComplexMessage(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false
  }

  const trimmedText = text.trim()

  // Length check - long messages likely need understanding confirmation
  if (trimmedText.length > 100) {
    return true
  }

  // Formal greetings - indicates forwarded parent message
  const hasGreeting =
    trimmedText.includes('הורים יקרים') ||
    trimmedText.includes('שלום רב') ||
    trimmedText.includes('בברכה') ||
    trimmedText.includes('בכבוד רב')

  if (hasGreeting) {
    return true
  }

  // Multiple lines - indicates structured message
  const lineCount = trimmedText.split('\n').length
  if (lineCount > 3) {
    return true
  }

  // Multiple clauses (commas) - indicates complex information
  const commaCount = (trimmedText.match(/,/g) || []).length
  if (commaCount > 2) {
    return true
  }

  // Contains both date pattern and substantial description
  const hasDatePattern = /\d{1,2}\.\d{1,2}\.\d{2,4}/.test(trimmedText)
  const hasSubstantialDescription = trimmedText.length > 50

  if (hasDatePattern && hasSubstantialDescription) {
    return true
  }

  // Default: simple message
  return false
}

/**
 * Determines if a user response is a confirmation
 * Used in understanding_check phase to detect user approval
 *
 * @param text - The user's response
 * @returns true if user is confirming understanding, false otherwise
 */
export function isConfirmation(text: string): boolean {
  if (!text) return false

  const normalized = text.trim().toLowerCase()

  const confirmations = [
    'כן',
    'נכון',
    'בדיוק',
    'מצוין',
    'טוב',
    'אוקי',
    'ok',
    'yes',
    'כ',
    '✓',
    '👍'
  ]

  return confirmations.some(conf => normalized.includes(conf))
}

/**
 * Determines if a user response is a correction/negation
 * Used in understanding_check phase to detect user corrections
 *
 * @param text - The user's response
 * @returns true if user is correcting understanding, false otherwise
 */
export function isCorrection(text: string): boolean {
  if (!text) return false

  const normalized = text.trim().toLowerCase()

  const corrections = [
    'לא',
    'לא נכון',
    'תקן',
    'שגוי',
    'טעות',
    'no',
    'לא בדיוק',
    'כמעט'
  ]

  return corrections.some(corr => normalized.includes(corr))
}
