import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Ticket validation schema
const TicketSchema = z.object({
  title: z.string().min(1, 'כותרת היא שדה חובה'),
  description: z.string().optional().nullable(),
  event_type: z.enum(['sport', 'theater', 'concert', 'other']),
  sport_type: z.string().optional().nullable(),
  team_home: z.string().optional().nullable(),
  team_away: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  event_date: z.string().optional().nullable(),
  image_url: z.string().url('כתובת תמונה לא תקינה').optional().nullable().or(z.literal('')),
  purchase_url: z.string().url('כתובת קניה לא תקינה'),
  quantity_available: z.number().int().min(0).optional().nullable(),
  price_per_ticket: z.number().min(0).optional().nullable(),
  status: z.enum(['active', 'sold_out', 'expired', 'draft', 'finished']),
  featured: z.boolean().default(false),
  display_order: z.number().int().default(0)
})

// GET /api/tickets - List tickets
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)

    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('tickets')
      .select('*')
      .order('display_order', { ascending: true })
      .order('event_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filter by status
    if (status) {
      if (status === 'all') {
        // Admin: show all statuses
      } else {
        query = query.eq('status', status)
      }
    } else {
      // Default: only active and sold_out for public (NOT finished - games are over)
      query = query.in('status', ['active', 'sold_out'])
    }

    // Filter by featured
    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Tickets GET error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת הכרטיסים' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })

  } catch (error) {
    console.error('Tickets GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הכרטיסים' },
      { status: 500 }
    )
  }
}

// POST /api/tickets - Create ticket (admin only)
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
    const validation = TicketSchema.safeParse(body)

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

    // Create ticket
    const { data, error } = await supabase
      .from('tickets')
      .insert([{
        ...validation.data,
        quantity_sold: 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Ticket creation error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה ביצירת הכרטיס' },
        { status: 500 }
      )
    }

    // Revalidate relevant pages
    revalidatePath('/')
    revalidatePath('/tickets')
    revalidatePath('/he')
    revalidatePath('/en')
    revalidatePath('/ru')
    revalidatePath('/he/tickets')
    revalidatePath('/en/tickets')
    revalidatePath('/ru/tickets')

    return NextResponse.json({
      success: true,
      data,
      message: 'הכרטיס נוצר בהצלחה'
    })

  } catch (error) {
    console.error('Ticket POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה ביצירת הכרטיס' },
      { status: 500 }
    )
  }
}
