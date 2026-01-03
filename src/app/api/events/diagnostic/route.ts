import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'

/**
 * Diagnostic endpoint to analyze events database
 * Returns comprehensive statistics about events
 * Admin-only endpoint for debugging
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            he: 'נדרשת הרשאת מנהל',
            ru: 'Требуется авторизация администратора',
            en: 'Admin authorization required'
          }
        },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Get total count
    const { count: totalCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })

    // Get count by status
    const { data: statusData } = await supabase
      .from('events')
      .select('status')

    const statusCounts = statusData?.reduce((acc, { status }) => {
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Get count by visibility
    const { data: visibilityData } = await supabase
      .from('events')
      .select('visibility')

    const visibilityCounts = visibilityData?.reduce((acc, { visibility }) => {
      acc[visibility] = (acc[visibility] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Get archived count
    const { count: archivedCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .not('archived_at', 'is', null)

    const { count: nonArchivedCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .is('archived_at', null)

    // Get date range
    const { data: dateRangeData } = await supabase
      .from('events')
      .select('start_datetime')
      .order('start_datetime', { ascending: true })
      .limit(1)

    const { data: dateRangeEndData } = await supabase
      .from('events')
      .select('start_datetime')
      .order('start_datetime', { ascending: false })
      .limit(1)

    const earliestEvent = dateRangeData?.[0]?.start_datetime
    const latestEvent = dateRangeEndData?.[0]?.start_datetime

    // Get sample of recent events (first 10)
    const { data: sampleEvents } = await supabase
      .from('events')
      .select('id, title, start_datetime, status, visibility, archived_at')
      .order('created_at', { ascending: false })
      .limit(10)

    // Get count of events that would be shown with new filters
    const { count: visibleWithNewFilters } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('visibility', 'public')
      .is('archived_at', null)
      .in('status', ['published', 'ongoing', 'completed'])

    // Get count with old filters (for comparison)
    const { count: visibleWithOldFilters } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('visibility', 'public')
      .eq('status', 'published')

    return NextResponse.json({
      success: true,
      diagnostic: {
        summary: {
          total: totalCount || 0,
          nonArchived: nonArchivedCount || 0,
          archived: archivedCount || 0
        },
        byStatus: statusCounts,
        byVisibility: visibilityCounts,
        dateRange: {
          earliest: earliestEvent || 'N/A',
          latest: latestEvent || 'N/A'
        },
        filtering: {
          visibleWithNewFilters: visibleWithNewFilters || 0,
          visibleWithOldFilters: visibleWithOldFilters || 0,
          improvement: ((visibleWithNewFilters || 0) - (visibleWithOldFilters || 0))
        },
        sampleEvents: sampleEvents || []
      },
      message: {
        he: 'דוח אבחון נוצר בהצלחה',
        ru: 'Диагностический отчет успешно создан',
        en: 'Diagnostic report generated successfully'
      }
    })

  } catch (error) {
    console.error('Diagnostic error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          he: 'שגיאה ביצירת דוח אבחון',
          ru: 'Ошибка при создании диагностического отчета',
          en: 'Error generating diagnostic report'
        }
      },
      { status: 500 }
    )
  }
}
