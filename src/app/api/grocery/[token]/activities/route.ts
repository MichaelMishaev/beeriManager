import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ token: string }>
}

/**
 * GET /api/grocery/[token]/activities
 * Fetch activity history for a grocery list
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { token } = await params
    const supabase = await createClient()

    // First verify the event exists
    const { data: event, error: eventError } = await supabase
      .from('grocery_events')
      .select('id')
      .eq('share_token', token)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'רשימת הקניות לא נמצאה' },
        { status: 404 }
      )
    }

    // Get limit from query params (default 20)
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '20', 10)

    // Fetch activities
    const { data: activities, error } = await supabase
      .from('grocery_activity_log')
      .select('*')
      .eq('grocery_event_id', event.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Activities fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת היסטוריית הפעילות' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: activities || []
    })
  } catch (error) {
    console.error('Activities GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת היסטוריית הפעילות' },
      { status: 500 }
    )
  }
}
