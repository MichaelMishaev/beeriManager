import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt-edge'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Only admins can view notification counts
    const token = req.cookies.get('auth-token')
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const payload = await verifyJWT(token.value)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const { searchParams } = new URL(req.url)

    // Get last viewed timestamp from query param (ISO string)
    const lastViewedParam = searchParams.get('lastViewed')
    const lastViewed = lastViewedParam ? new Date(lastViewedParam) : null

    // Count new tasks (pending or in_progress status)
    const tasksQuery = supabase
      .from('tasks')
      .select('id, created_at', { count: 'exact', head: false })
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1)

    if (lastViewed) {
      tasksQuery.gt('created_at', lastViewed.toISOString())
    }

    const { data: tasksData, count: tasksCount, error: tasksError } = await tasksQuery

    if (tasksError) {
      console.error('Tasks count error:', tasksError)
    }

    // Count new ideas (status = new)
    const ideasQuery = supabase
      .from('ideas')
      .select('id, created_at', { count: 'exact', head: false })
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(1)

    if (lastViewed) {
      ideasQuery.gt('created_at', lastViewed.toISOString())
    }

    const { data: ideasData, count: ideasCount, error: ideasError } = await ideasQuery

    if (ideasError) {
      console.error('Ideas count error:', ideasError)
    }

    // Count new feedback (status = new)
    const feedbackQuery = supabase
      .from('anonymous_feedback')
      .select('id, created_at', { count: 'exact', head: false })
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(1)

    if (lastViewed) {
      feedbackQuery.gt('created_at', lastViewed.toISOString())
    }

    const { data: feedbackData, count: feedbackCount, error: feedbackError } = await feedbackQuery

    if (feedbackError) {
      console.error('Feedback count error:', feedbackError)
    }

    // Calculate total
    const total = (tasksCount || 0) + (ideasCount || 0) + (feedbackCount || 0)

    // Get latest item timestamp for each category
    const latestTask = tasksData && tasksData.length > 0 ? tasksData[0].created_at : null
    const latestIdea = ideasData && ideasData.length > 0 ? ideasData[0].created_at : null
    const latestFeedback = feedbackData && feedbackData.length > 0 ? feedbackData[0].created_at : null

    return NextResponse.json({
      success: true,
      data: {
        total,
        tasks: tasksCount || 0,
        ideas: ideasCount || 0,
        feedback: feedbackCount || 0,
        latestTimestamps: {
          task: latestTask,
          idea: latestIdea,
          feedback: latestFeedback
        }
      }
    })

  } catch (error) {
    console.error('Notification counts error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת התראות' },
      { status: 500 }
    )
  }
}
