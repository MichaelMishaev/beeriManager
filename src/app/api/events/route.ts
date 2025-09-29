import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Event validation schema
const EventSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  description: z.string().optional(),
  start_datetime: z.string().datetime('תאריך ושעה לא תקינים'),
  end_datetime: z.string().datetime('תאריך ושעה לא תקינים').optional(),
  location: z.string().optional(),
  event_type: z.enum(['general', 'meeting', 'fundraiser', 'trip', 'workshop']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  registration_enabled: z.boolean().default(false),
  max_attendees: z.number().min(1).optional(),
  requires_payment: z.boolean().default(false),
  payment_amount: z.number().min(0).optional(),
  budget_allocated: z.number().min(0).optional(),
  notes: z.string().optional(),
  status: z.enum(['draft', 'published', 'ongoing', 'completed', 'cancelled']).default('draft')
})

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)

    // Query parameters
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const upcoming = searchParams.get('upcoming') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    let query = supabase
      .from('events')
      .select('*')
      .eq('visibility', 'public') // Only public events for non-admin users

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    } else {
      // Default to published events for public access
      query = query.eq('status', 'published')
    }

    if (type && type !== 'all') {
      query = query.eq('event_type', type)
    }

    if (upcoming) {
      query = query
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply limit
    query = query.limit(Math.min(limit, 100)) // Max 100 events

    const { data, error } = await query

    if (error) {
      console.error('Events query error:', error)
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
    console.error('Events GET error:', error)
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
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = EventSchema.safeParse(body)

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

    const supabase = createClient()

    // Create event
    const { data, error } = await supabase
      .from('events')
      .insert([{
        ...validation.data,
        created_by: 'admin', // In a full system, this would come from JWT
        visibility: 'public',
        current_attendees: 0,
        budget_spent: 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Event creation error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה ביצירת האירוע' },
        { status: 500 }
      )
    }

    // TODO: Generate QR code for registration (implement later)
    // const qrCodeUrl = await generateQRCode(`${process.env.NEXT_PUBLIC_APP_URL}/events/${data.id}/register`)

    return NextResponse.json({
      success: true,
      data,
      message: 'האירוע נוצר בהצלחה'
    })

  } catch (error) {
    console.error('Events POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה ביצירת האירוע' },
      { status: 500 }
    )
  }
}