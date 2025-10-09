import { ZodError } from 'zod'

/**
 * Standardized API error response structure
 */
export interface ApiErrorResponse {
  success: false
  error: string
  code: string
  fieldErrors?: Record<string, string>
  action?: {
    label: string
    href?: string
    onClick?: 'retry' | 'reload' | 'go_back'
  }
}

/**
 * Standardized API success response structure
 */
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  options?: {
    code?: string
    fieldErrors?: Record<string, string>
    action?: ApiErrorResponse['action']
  }
): ApiErrorResponse {
  return {
    success: false,
    error: message,
    code: options?.code || 'UNKNOWN_ERROR',
    fieldErrors: options?.fieldErrors,
    action: options?.action
  }
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    message
  }
}

/**
 * Convert Zod validation errors to Hebrew user-friendly messages
 */
export function zodErrorsToHebrew(zodError: ZodError): Record<string, string> {
  const errors: Record<string, string> = {}

  zodError.errors.forEach(err => {
    const field = err.path.join('.')
    const code = err.code

    // Task fields
    if (field === 'title') {
      if (code === 'too_small') {
        errors[field] = 'כותרת קצרה מדי - נדרשים לפחות 2 תווים'
      } else if (code === 'too_big') {
        errors[field] = 'כותרת ארוכה מדי - מקסימום 100 תווים'
      } else {
        errors[field] = 'כותרת לא תקינה'
      }
    }
    else if (field === 'description') {
      if (code === 'too_big') {
        errors[field] = 'תיאור ארוך מדי - מקסימום 500 תווים'
      }
    }
    else if (field === 'owner_name') {
      if (code === 'too_small') {
        errors[field] = 'שם האחראי נדרש - לפחות 2 תווים'
      } else {
        errors[field] = 'שם האחראי לא תקין'
      }
    }
    else if (field === 'owner_phone') {
      errors[field] = 'מספר טלפון לא תקין. פורמט: 0501234567 (10 ספרות)'
    }
    else if (field === 'due_date') {
      errors[field] = 'תאריך יעד לא תקין'
    }
    else if (field === 'priority') {
      errors[field] = 'רמת עדיפות לא תקינה'
    }
    else if (field === 'status') {
      errors[field] = 'סטטוס לא תקין'
    }
    // Event fields
    else if (field === 'start_datetime') {
      errors[field] = 'תאריך התחלה לא תקין'
    }
    else if (field === 'end_datetime') {
      errors[field] = 'תאריך סיום לא תקין'
    }
    else if (field === 'location') {
      errors[field] = 'מיקום לא תקין'
    }
    // Generic fallback
    else {
      errors[field] = err.message
    }
  })

  return errors
}

/**
 * HTTP status code to Hebrew error message
 */
export function httpStatusToHebrew(status: number): string {
  switch (status) {
    case 400:
      return 'נתונים שגויים נשלחו לשרת'
    case 401:
      return 'אין הרשאה. נדרשת התחברות מחדש'
    case 403:
      return 'אין לך הרשאה לבצע פעולה זו'
    case 404:
      return 'הפריט המבוקש לא נמצא'
    case 409:
      return 'קיים התנגשות עם נתונים קיימים'
    case 422:
      return 'הנתונים שנשלחו לא תקינים'
    case 429:
      return 'יותר מדי בקשות. נסה שוב בעוד רגע'
    case 500:
      return 'שגיאת שרת פנימית'
    case 502:
      return 'השרת אינו זמין כרגע'
    case 503:
      return 'השירות אינו זמין זמנית'
    case 504:
      return 'הבקשה ארכה זמן רב מדי'
    default:
      if (status >= 500) {
        return 'שגיאת שרת. נסה שוב בעוד רגע'
      }
      return 'שגיאה לא צפויה'
  }
}

/**
 * Get user-friendly error message for common errors
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'אין חיבור לאינטרנט. בדוק את החיבור ונסה שוב'
  }

  if (error instanceof SyntaxError) {
    return 'התקבל מידע שגוי מהשרת. נסה לרענן את הדף'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'שגיאה לא צפויה'
}
