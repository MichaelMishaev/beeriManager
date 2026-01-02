// AI Assistant Rate Limiting
// Daily limit: 20 requests
// Character limit: 1500 characters per message (expanded for detailed highlights)
// Excludes development environment

import { supabase } from '@/lib/supabase/client'

export const RATE_LIMITS = {
  DAILY_REQUESTS: 20,
  MAX_MESSAGE_LENGTH: 1500,
} as const

export interface UsageStats {
  currentCount: number
  dailyLimit: number
  remaining: number
  limitReached: boolean
}

/**
 * Check if rate limiting should be applied
 * Returns false in development environment
 */
export function shouldApplyRateLimit(): boolean {
  return process.env.NODE_ENV !== 'development'
}

/**
 * Get current AI usage stats for today
 */
export async function getAiUsageStats(): Promise<UsageStats> {
  // Skip in development
  if (!shouldApplyRateLimit()) {
    return {
      currentCount: 0,
      dailyLimit: RATE_LIMITS.DAILY_REQUESTS,
      remaining: RATE_LIMITS.DAILY_REQUESTS,
      limitReached: false,
    }
  }

  try {
    const { data, error } = await supabase.rpc('get_ai_usage')

    if (error) {
      console.error('Error fetching AI usage:', error)
      // On error, allow the request (fail open)
      return {
        currentCount: 0,
        dailyLimit: RATE_LIMITS.DAILY_REQUESTS,
        remaining: RATE_LIMITS.DAILY_REQUESTS,
        limitReached: false,
      }
    }

    const stats = data?.[0] || { current_count: 0, daily_limit: 20, remaining: 20 }

    return {
      currentCount: stats.current_count || 0,
      dailyLimit: stats.daily_limit || RATE_LIMITS.DAILY_REQUESTS,
      remaining: stats.remaining || RATE_LIMITS.DAILY_REQUESTS,
      limitReached: stats.current_count >= RATE_LIMITS.DAILY_REQUESTS,
    }
  } catch (error) {
    console.error('Error in getAiUsageStats:', error)
    // On error, allow the request (fail open)
    return {
      currentCount: 0,
      dailyLimit: RATE_LIMITS.DAILY_REQUESTS,
      remaining: RATE_LIMITS.DAILY_REQUESTS,
      limitReached: false,
    }
  }
}

/**
 * Increment AI usage counter
 * Returns updated stats
 */
export async function incrementAiUsage(): Promise<{
  success: boolean
  stats: UsageStats
  error?: string
}> {
  // Skip in development
  if (!shouldApplyRateLimit()) {
    return {
      success: true,
      stats: {
        currentCount: 0,
        dailyLimit: RATE_LIMITS.DAILY_REQUESTS,
        remaining: RATE_LIMITS.DAILY_REQUESTS,
        limitReached: false,
      },
    }
  }

  try {
    const { data, error } = await supabase.rpc('increment_ai_usage')

    if (error) {
      console.error('Error incrementing AI usage:', error)
      return {
        success: false,
        stats: {
          currentCount: 0,
          dailyLimit: RATE_LIMITS.DAILY_REQUESTS,
          remaining: 0,
          limitReached: true,
        },
        error: error.message,
      }
    }

    const result = data?.[0] || { current_count: 0, limit_reached: false }

    const stats: UsageStats = {
      currentCount: result.current_count || 0,
      dailyLimit: RATE_LIMITS.DAILY_REQUESTS,
      remaining: Math.max(0, RATE_LIMITS.DAILY_REQUESTS - (result.current_count || 0)),
      limitReached: result.limit_reached || false,
    }

    return {
      success: !stats.limitReached,
      stats,
    }
  } catch (error) {
    console.error('Error in incrementAiUsage:', error)
    return {
      success: false,
      stats: {
        currentCount: 0,
        dailyLimit: RATE_LIMITS.DAILY_REQUESTS,
        remaining: 0,
        limitReached: true,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

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
