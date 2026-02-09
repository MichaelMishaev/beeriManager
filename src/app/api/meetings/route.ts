import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

const MeetingSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים').max(200),
  meeting_date: z.string(),
  description: z.string().optional(),
  status: z.enum(['draft', 'open', 'closed', 'completed']).default('open'),
  is_open: z.boolean().default(true)
})

export async function GET(req: NextRequest) {
  try {
    // Admin only
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const { searchParams } = new URL(req.url)

    // Query parameters
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    let query = supabase
      .from('meetings')
      .select('*')

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Order by date
    query = query
      .order('meeting_date', { ascending: false })
      .limit(Math.min(limit, 100))

    const { data, error } = await query

    if (error) {
      console.error('Meetings query error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת הפגישות' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Meetings GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הפגישות' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Admin only
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = MeetingSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'נתונים לא תקינים',
          details: validation.error.errors.map(err => err.message)
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('meetings')
      .insert([validation.data])
      .select()
      .single()

    if (error) {
      console.error('Meeting creation error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה ביצירת הפגישה' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'הפגישה נוצרה בהצלחה'
    })
  } catch (error) {
    console.error('Meeting POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה ביצירת הפגישה' },
      { status: 500 }
    )
  }
}
