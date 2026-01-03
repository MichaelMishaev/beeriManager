import { NextResponse } from 'next/server'
import { getAiUsageStats } from '@/lib/ai/rate-limiter'
import { aiLogger } from '@/lib/ai/logger'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/ai-assistant/check-limit
 * Check current AI usage and rate limit status
 */
export async function GET() {
  try {
    const stats = await getAiUsageStats()

    return NextResponse.json({
      success: true,
      stats,
      message: stats.limitReached
        ? 'הגעת למגבלה היומית של 50 שימושים. נסה שוב מחר.'
        : `נותרו ${stats.remaining} שימושים היום`,
    })
  } catch (error) {
    aiLogger.logError({
      action: 'extract_data',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      metadata: { context: 'check_limit' },
    })
    return NextResponse.json(
      {
        success: false,
        error: 'שגיאה בבדיקת מגבלת שימוש',
      },
      { status: 500 }
    )
  }
}
