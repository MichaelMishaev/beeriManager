// Error analysis and smart suggestions for AI assistant failures
// Provides specific, actionable guidance when AI fails to understand user input

import {
  hasDatePattern,
  hasTimePattern,
  hasEventWords,
} from './input-validator'

export type FailureType =
  | 'extraction_failed'
  | 'validation_failed'
  | 'missing_required_field'
  | 'unclear_format'
  | 'network_error'
  | 'unknown'

export interface ErrorAnalysis {
  message: string // Hebrew error message
  suggestions: string[] // Actionable suggestions
  examples: string[] // Relevant examples
  failureType: FailureType
}

/**
 * Analyzes why AI failed and provides specific guidance
 */
export function analyzeFailure(
  userInput: string,
  failureType: FailureType,
  validationErrors?: string[]
): ErrorAnalysis {
  const hasEvent = hasEventWords(userInput)
  const hasDate = hasDatePattern(userInput)

  // Missing event name
  if (hasDate && !hasEvent) {
    return {
      message: '❌ חסר שם לאירוע\n\nמה שם האירוע?',
      suggestions: [
        '💡 הוסף שם: "מסיבת פורים ב-15/03/2025"',
        '💡 או: "מבחן מתמטיקה ביום רביעי"',
      ],
      examples: [
        'מסיבת פורים ב-15/03/2025 בשעה 17:00',
        'מבחן מתמטיקה ביום רביעי בשעה 10:00',
      ],
      failureType,
    }
  }

  // Missing date
  if (hasEvent && !hasDate) {
    return {
      message: '❌ חסר תאריך\n\nמתי האירוע?',
      suggestions: [
        '💡 הוסף תאריך: "מסיבת פורים ב-15/03/2025"',
        '💡 או: "מבחן ביום רביעי הבא"',
        '💡 או: "טיול בעוד 5 ימים"',
      ],
      examples: [
        'מסיבת פורים ב-15/03/2025',
        'מבחן מתמטיקה ביום רביעי',
        'טיול שנתי ב-20 במאי',
      ],
      failureType,
    }
  }

  // Unclear format - has neither event nor date
  if (!hasEvent && !hasDate) {
    return {
      message: '❌ לא הבנתי את הפורמט\n\nנסה לכתוב כך:',
      suggestions: [
        '💡 "[שם האירוע] ב-[תאריך]"',
        '💡 דוגמה: "מסיבת פורים ב-15/03/2025"',
      ],
      examples: [
        'מסיבת פורים ב-15/03/2025 בשעה 17:00 באולם',
        'מבחן מתמטיקה ביום רביעי בשעה 10:00',
        'טיול שנתי ב-5 ביוני',
      ],
      failureType,
    }
  }

  // Validation errors from backend
  if (validationErrors && validationErrors.length > 0) {
    return {
      message: `❌ בעיה באימות הנתונים:\n\n${validationErrors.join('\n')}`,
      suggestions: [
        '💡 ודא שהתאריך בפורמט נכון (DD/MM/YYYY)',
        '💡 ודא ששדות חובה קיימים (שם, תאריך)',
      ],
      examples: [
        'מסיבת פורים ב-15/03/2025',
        'מבחן מתמטיקה ביום רביעי 20/02',
      ],
      failureType: 'validation_failed',
    }
  }

  // Generic extraction failure
  if (failureType === 'extraction_failed') {
    return {
      message: '❌ לא הצלחתי להבין את הפרטים\n\nנסה לכתוב בפשטות:',
      suggestions: [
        '💡 "[שם האירוע] ב-[תאריך] בשעה [שעה]"',
        '💡 דוגמה: "מסיבת פורים ב-15/03/2025 בשעה 17:00"',
      ],
      examples: [
        'מסיבת פורים ב-15/03/2025 בשעה 17:00 באולם בית הספר',
        'מבחן מתמטיקה ביום רביעי בשעה 10:00',
        'יום הורים ב-20/04/2025 בשעה 16:00 בכיתה',
      ],
      failureType,
    }
  }

  // Network error
  if (failureType === 'network_error') {
    return {
      message: '❌ שגיאת תקשורת\n\nבדוק את החיבור לאינטרנט ונסה שוב',
      suggestions: ['💡 ודא שיש לך חיבור לאינטרנט', '💡 נסה שוב בעוד רגע'],
      examples: [],
      failureType,
    }
  }

  // Unknown error - generic guidance
  return {
    message: '❌ משהו השתבש\n\nנסה לכתוב את הפרטים מחדש',
    suggestions: [
      '💡 כתוב בפשטות: "[שם] ב-[תאריך]"',
      '💡 דוגמה: "מסיבת פורים ב-15/03/2025"',
    ],
    examples: [
      'מסיבת פורים ב-15/03/2025 בשעה 17:00',
      'מבחן מתמטיקה ביום רביעי',
    ],
    failureType: 'unknown',
  }
}

/**
 * Generates smart suggestions based on what user tried
 */
export function generateSmartSuggestions(
  userInput: string,
  failureCount: number
): string[] {
  const suggestions: string[] = []

  const hasEvent = hasEventWords(userInput)
  const hasDate = hasDatePattern(userInput)
  const hasTime = hasTimePattern(userInput)

  // First failure - gentle hints
  if (failureCount === 1) {
    if (!hasDate) {
      suggestions.push('הוסף תאריך: "ב-15/03/2025" או "ביום רביעי"')
    }
    if (!hasEvent) {
      suggestions.push('הוסף שם לאירוע: "מסיבת פורים"')
    }
    if (!hasTime) {
      suggestions.push('שעה אופציונלית: "בשעה 17:00"')
    }
  }

  // Second failure - more explicit
  if (failureCount === 2) {
    suggestions.push('נסה פורמט זה: "[שם האירוע] ב-[DD/MM/YYYY]"')
    suggestions.push('דוגמה: "מסיבת פורים ב-15/03/2025"')
  }

  // Third failure - offer examples
  if (failureCount >= 3) {
    suggestions.push('בחר דוגמה למטה או מלא טופס ידני')
  }

  return suggestions
}

/**
 * Formats error message with suggestions and examples
 */
export function formatErrorMessage(analysis: ErrorAnalysis): string {
  let message = analysis.message

  if (analysis.suggestions.length > 0) {
    message += '\n\n' + analysis.suggestions.join('\n')
  }

  return message
}
