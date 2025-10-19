import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)

    // Query parameters
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    let query = supabase
      .from('contacts')
      .select('*')
      .eq('is_public', true) // Only show public contacts

    // Apply category filter
    if (category) {
      query = query.eq('category', category)
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,role.ilike.%${search}%`)
    }

    // Order by sort_order and name
    query = query
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
      .limit(Math.min(limit, 100))

    const { data, error } = await query

    if (error) {
      logger.error('Contacts query error', { component: 'Contacts', error })
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת אנשי הקשר' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    logger.error('Contacts GET error', { component: 'Contacts', error })
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת אנשי הקשר' },
      { status: 500 }
    )
  }
}
