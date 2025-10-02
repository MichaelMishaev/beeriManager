import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get('upcoming') === 'true'
    const limit = parseInt(searchParams.get('limit') || '100')
    const academicYear = searchParams.get('academic_year')

    const supabase = createClient()
    let query = supabase
      .from('holidays')
      .select('*')
      .order('start_date', { ascending: true })

    // Filter by academic year if provided
    if (academicYear) {
      query = query.eq('academic_year', academicYear)
    }

    // Filter upcoming holidays only
    if (upcoming) {
      const today = new Date().toISOString().split('T')[0]
      query = query.gte('end_date', today)
    }

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: 'שגיאה בטעינת לוח חגים'
          }
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('Error fetching holidays:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'שגיאת שרת פנימית'
        }
      },
      { status: 500 }
    )
  }
}
