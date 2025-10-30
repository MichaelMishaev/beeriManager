import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)

    // Check if admin wants all messages (for admin panel)
    const showAll = searchParams.get('all') === 'true'

    let query = supabase
      .from('urgent_messages')
      .select('*')

    if (!showAll) {
      // Filter only active messages within date range (for public view)
      const today = new Date().toISOString().split('T')[0]

      query = query
        .eq('is_active', true)
        .lte('start_date', today)
        .gte('end_date', today)
    }

    // Add ordering - must be after filters
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('[Urgent GET] ❌ Failed to load urgent messages', error)
      return NextResponse.json(
        { success: false, error: 'Failed to load urgent messages' },
        { status: 500 }
      )
    }

    console.log('[Urgent GET] ✅ Returning', data?.length || 0, 'messages')
    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('[Urgent GET] ❌ Exception:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load urgent messages' },
      { status: 500 }
    )
  }
}
