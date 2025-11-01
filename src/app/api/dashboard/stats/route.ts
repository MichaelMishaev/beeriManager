import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get dashboard statistics in parallel
    const [
      upcomingEventsResult,
      pendingTasksResult,
      activeIssuesResult,
      recentProtocolsResult
    ] = await Promise.all([
      // Upcoming events
      supabase
        .from('events')
        .select('id', { count: 'exact' })
        .eq('status', 'published')
        .gte('start_datetime', new Date().toISOString())
        .limit(1),

      // Pending tasks
      supabase
        .from('tasks')
        .select('id', { count: 'exact' })
        .in('status', ['pending', 'in_progress'])
        .limit(1),

      // Active issues
      supabase
        .from('issues')
        .select('id', { count: 'exact' })
        .in('status', ['open', 'in_progress'])
        .limit(1),

      // Recent protocols (last 6 months)
      supabase
        .from('protocols')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1)
    ])

    // Check for errors
    const errors = [
      upcomingEventsResult.error,
      pendingTasksResult.error,
      activeIssuesResult.error,
      recentProtocolsResult.error
    ].filter(Boolean)

    if (errors.length > 0) {
      console.error('Dashboard stats errors:', errors)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת נתוני הלוח' },
        { status: 500 }
      )
    }

    // Calculate stats
    const stats = {
      upcomingEvents: upcomingEventsResult.count || 0,
      pendingTasks: pendingTasksResult.count || 0,
      activeIssues: activeIssuesResult.count || 0,
      recentProtocols: recentProtocolsResult.count || 0,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת נתוני הלוח' },
      { status: 500 }
    )
  }
}