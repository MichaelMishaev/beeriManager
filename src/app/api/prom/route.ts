import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Prom event validation schema
const PromEventSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  title_ru: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  description_ru: z.string().optional().nullable(),
  event_date: z.string().optional().nullable(),
  event_time: z.string().optional().nullable(),
  venue_name: z.string().optional().nullable(),
  venue_address: z.string().optional().nullable(),
  total_budget: z.number().min(0).default(0),
  student_count: z.number().min(0).default(0),
  status: z.enum(['planning', 'voting', 'confirmed', 'completed', 'cancelled']).default('planning'),
  voting_enabled: z.boolean().default(false),
  voting_start_date: z.string().optional().nullable(),
  voting_end_date: z.string().optional().nullable()
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)

    // Query parameters
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100

    let query = supabase
      .from('prom_events')
      .select('*')

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Order by event date descending
    query = query
      .order('event_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100))

    const { data, error } = await query

    if (error) {
      console.error('Prom events query error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת האירועים' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Prom events GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת האירועים' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Clean up empty strings to null
    const cleanedBody = {
      ...body,
      title_ru: body.title_ru === '' ? null : body.title_ru,
      description: body.description === '' ? null : body.description,
      description_ru: body.description_ru === '' ? null : body.description_ru,
      event_date: body.event_date === '' ? null : body.event_date,
      event_time: body.event_time === '' ? null : body.event_time,
      venue_name: body.venue_name === '' ? null : body.venue_name,
      venue_address: body.venue_address === '' ? null : body.venue_address,
      total_budget: body.total_budget ? parseFloat(body.total_budget) : 0,
      student_count: body.student_count ? parseInt(body.student_count) : 0,
      voting_start_date: body.voting_start_date === '' ? null : body.voting_start_date,
      voting_end_date: body.voting_end_date === '' ? null : body.voting_end_date
    }

    const validation = PromEventSchema.safeParse(cleanedBody)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'נתונים לא תקינים',
          details: validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create prom event
    const { data, error } = await supabase
      .from('prom_events')
      .insert([validation.data])
      .select()
      .single()

    if (error) {
      console.error('Prom event creation error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה ביצירת האירוע' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'האירוע נוצר בהצלחה'
    })

  } catch (error) {
    console.error('Prom events POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה ביצירת האירוע' },
      { status: 500 }
    )
  }
}

