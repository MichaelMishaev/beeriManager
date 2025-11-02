import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get ALL rows without any filters
    const { data: allData, error: allError } = await supabase
      .from('urgent_messages')
      .select('*')

    // Get count
    const { count, error: countError } = await supabase
      .from('urgent_messages')
      .select('*', { count: 'exact', head: true })

    // Check today's date
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    // Get filtered data (like the real API does)
    const { data: filteredData, error: filteredError } = await supabase
      .from('urgent_messages')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', today)
      .gte('end_date', today)

    return NextResponse.json({
      timestamp: now.toISOString(),
      today,
      timezoneOffset: now.getTimezoneOffset(),
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      allData: {
        count: allData?.length || 0,
        error: allError,
        rows: allData || []
      },
      totalCount: {
        count,
        error: countError
      },
      filteredData: {
        count: filteredData?.length || 0,
        error: filteredError,
        rows: filteredData || []
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
