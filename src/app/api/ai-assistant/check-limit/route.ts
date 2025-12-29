import { NextResponse } from 'next/server'
import { getAiUsageStats } from '@/lib/ai/rate-limiter'

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
        ? 'הגעת למגבלה היומית של 20 שימושים. נסה שוב מחר.'
        : `נותרו ${stats.remaining} שימושים היום`,
    })
  } catch (error) {
    console.error('[AI Limit Check] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'שגיאה בבדיקת מגבלת שימוש',
      },
      { status: 500 }
    )
  }
}
