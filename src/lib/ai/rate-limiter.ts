// AI Assistant message limits
// There is no daily usage limit (removed at the owner's request, 2026-11-25); the route is admin-only.
// Character limit: 5000 characters per message (supports long official announcements)

export const RATE_LIMITS = {
  MAX_MESSAGE_LENGTH: 5000,
  SUMMARIZE_THRESHOLD: 1300, // Show summarize button above this length
} as const

/**
 * Validate message length
 */
export function validateMessageLength(message: string): {
  valid: boolean
  length: number
  maxLength: number
  error?: string
} {
  const length = message.trim().length

  if (length === 0) {
    return {
      valid: false,
      length: 0,
      maxLength: RATE_LIMITS.MAX_MESSAGE_LENGTH,
      error: 'ההודעה ריקה',
    }
  }

  if (length > RATE_LIMITS.MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      length,
      maxLength: RATE_LIMITS.MAX_MESSAGE_LENGTH,
      error: `ההודעה ארוכה מדי (${length}/${RATE_LIMITS.MAX_MESSAGE_LENGTH} תווים)`,
    }
  }

  return {
    valid: true,
    length,
    maxLength: RATE_LIMITS.MAX_MESSAGE_LENGTH,
  }
}
