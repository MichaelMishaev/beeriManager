import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering - critical for production to prevent Vercel caching
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(req: NextRequest) {
  try {
    console.log('[Urgent GET] 🔍 Starting request...')
    // Use service role to bypass RLS
    const supabase = await createClient()
    console.log('[Urgent GET] 🔗 Supabase client created (using service role)')

    const { searchParams } = new URL(req.url)

    // Check if admin wants all messages (for admin panel)
    const showAll = searchParams.get('all') === 'true'
    console.log('[Urgent GET] 📋 showAll:', showAll)

    let query = supabase
      .from('urgent_messages')
      .select('*')

    if (!showAll) {
      // Filter only active messages within date range (for public view)
      const now = new Date().toISOString().split('T')[0]
      console.log('[Urgent GET] 📅 Today (date only):', now)

      query = query
        .eq('is_active', true)
        .or(`and(start_date.is.null,end_date.is.null),and(start_date.is.null,end_date.gte.${now}),and(start_date.lte.${now},end_date.is.null),and(start_date.lte.${now},end_date.gte.${now})`)

      console.log('[Urgent GET] 🔍 Filters applied: is_active=true, date range:', now)
    }

    // Add ordering - must be after filters
    query = query.order('created_at', { ascending: false })

    console.log('[Urgent GET] 🚀 Executing query...')
    const { data, error } = await query

    if (error) {
      console.error('[Urgent GET] ❌ Failed to load urgent messages')
      console.error('[Urgent GET] ❌ Error details:', JSON.stringify(error, null, 2))
      console.error('[Urgent GET] ❌ Error message:', error.message)
      console.error('[Urgent GET] ❌ Error code:', error.code)
      console.error('[Urgent GET] ❌ Error hint:', error.hint)
      return NextResponse.json(
        { success: false, error: 'Failed to load urgent messages', details: error.message },
        { status: 500 }
      )
    }

    console.log('[Urgent GET] ✅ Query successful. Rows returned:', data?.length || 0)
    if (data && data.length > 0) {
      console.log('[Urgent GET] 📦 First row:', JSON.stringify(data[0], null, 2))
    } else {
      console.log('[Urgent GET] 📦 No data returned (empty array)')
    }

    // Return with cache-busting headers to prevent stale data
    return NextResponse.json({
      success: true,
      data: data || []
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error('[Urgent GET] ❌ Exception:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load urgent messages' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      }
    )
  }
}
