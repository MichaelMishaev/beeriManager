// Input validation for AI assistant
// Language detection and format validation

export type Language = 'hebrew' | 'english' | 'russian' | 'mixed'

export interface ValidationResult {
  valid: boolean
  error?: string
  suggestion?: string
  language?: Language
}

/**
 * Detects the dominant language in a text string
 * Uses Unicode ranges to identify Hebrew, English, and Russian characters
 */
export function detectLanguage(text: string): Language {
  const hebrewChars = (text.match(/[\u0590-\u05FF]/g) || []).length
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length
  const cyrillicChars = (text.match(/[\u0400-\u04FF]/g) || []).length

  const totalChars = hebrewChars + latinChars + cyrillicChars

  // If not enough characters to determine, assume Hebrew
  if (totalChars < 3) return 'hebrew'

  // Calculate percentages
  const hebrewPct = hebrewChars / totalChars
  const latinPct = latinChars / totalChars
  const cyrillicPct = cyrillicChars / totalChars

  // Dominant language logic
  if (hebrewPct > 0.5) return 'hebrew'
  if (latinPct > 0.5) return 'english'
  if (cyrillicPct > 0.5) return 'russian'

  // Mixed if no clear dominance
  if (hebrewPct > 0.2 && latinPct > 0.2) return 'mixed'
  if (hebrewPct > 0.2 && cyrillicPct > 0.2) return 'mixed'

  // Default to Hebrew (app's primary language)
  return 'hebrew'
}

/**
 * Validates user input before sending to AI
 * Checks for:
 * - Correct language (Hebrew or mixed)
 * - Minimum length
 * - Basic format requirements
 */
export function validateInput(text: string): ValidationResult {
  // Empty or too short
  if (!text || text.trim().length === 0) {
    return {
      valid: false,
      error: 'אנא כתוב משהו',
      suggestion: 'תאר את האירוע או ההודעה',
    }
  }

  // Detect language
  const lang = detectLanguage(text)

  // English input - redirect to Hebrew
  if (lang === 'english') {
    return {
      valid: false,
      error: 'I only understand Hebrew 😊\nאני מבין רק עברית',
      suggestion: 'Please write in Hebrew\nאנא כתוב בעברית',
      language: lang,
    }
  }

  // Russian input - redirect to Hebrew
  if (lang === 'russian') {
    return {
      valid: false,
      error: 'Я понимаю только иврит 😊\nאני מבין רק עברית',
      suggestion: 'Пожалуйста, пишите на иврите\nאנא כתוב בעברית',
      language: lang,
    }
  }

  // Mixed is acceptable (Hebrew with English numbers/words)
  // Pure Hebrew is acceptable

  return {
    valid: true,
    language: lang,
  }
}

/**
 * Checks if text contains date-like patterns
 */
export function hasDatePattern(text: string): boolean {
  // DD/MM, DD.MM, DD במרץ, etc.
  const datePatterns = [
    /\d{1,2}[\/\.]\d{1,2}/, // DD/MM or DD.MM
    /\d{1,2}\s*(במרץ|באפריל|במאי|ביוני|ביולי|באוגוסט|בספטמבר|באוקטובר|בנובמבר|בדצמבר|בינואר|בפברואר)/,
    /יום\s+(ראשון|שני|שלישי|רביעי|חמישי|שישי)/,
  ]

  return datePatterns.some((pattern) => pattern.test(text))
}

/**
 * Checks if text contains time-like patterns
 */
export function hasTimePattern(text: string): boolean {
  // 17:00, 5 אחה״צ, חצי 6
  const timePatterns = [/\d{1,2}:\d{2}/, /\d{1,2}\s*אחה״צ/, /חצי\s+\d{1,2}/]

  return timePatterns.some((pattern) => pattern.test(text))
}

/**
 * Checks if text contains event-like words
 */
export function hasEventWords(text: string): boolean {
  const eventWords = [
    'מסיבה',
    'אירוע',
    'מבחן',
    'טיול',
    'פגישה',
    'ישיבה',
    'הצגה',
    'חג',
    'יום',
    'לימוד',
  ]

  return eventWords.some((word) => text.includes(word))
}
