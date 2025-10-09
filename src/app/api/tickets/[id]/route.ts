import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Ticket validation schema
const TicketSchema = z.object({
  title: z.string().min(1, 'כותרת היא שדה חובה'),
  description: z.string().optional(),
  event_type: z.enum(['sport', 'theater', 'concert', 'other']),
  sport_type: z.string().optional(),
  team_home: z.string().optional(),
  team_away: z.string().optional(),
  venue: z.string().optional(),
  event_date: z.string().optional(),
  image_url: z.string().url('כתובת תמונה לא תקינה').optional().or(z.literal('')),
  purchase_url: z.string().url('כתובת קניה לא תקינה'),
  quantity_available: z.number().int().min(0).optional().nullable(),
  quantity_sold: z.number().int().min(0).default(0),
  price_per_ticket: z.number().min(0).optional().nullable(),
  status: z.enum(['active', 'sold_out', 'expired', 'draft', 'finished']),
  featured: z.boolean().default(false),
  display_order: z.number().int().default(0)
})

// GET /api/tickets/[id] - Get single ticket
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'הכרטיס לא נמצא' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Ticket GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הכרטיס' },
      { status: 500 }
    )
  }
}

// PUT /api/tickets/[id] - Update ticket (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Update ticket
    const { data, error } = await supabase
      .from('tickets')
      .update(validation.data)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Ticket update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון הכרטיס' },
        { status: 500 }
      )
    }

    // Revalidate relevant pages
    revalidatePath('/')
    revalidatePath('/tickets')
    revalidatePath(`/tickets/${params.id}`)
    revalidatePath('/he')
    revalidatePath('/en')
    revalidatePath('/ru')
    revalidatePath('/he/tickets')
    revalidatePath('/en/tickets')
    revalidatePath('/ru/tickets')
    revalidatePath(`/he/tickets/${params.id}`)
    revalidatePath(`/en/tickets/${params.id}`)
    revalidatePath(`/ru/tickets/${params.id}`)

    return NextResponse.json({
      success: true,
      data,
      message: 'הכרטיס עודכן בהצלחה'
    })

  } catch (error) {
    console.error('Ticket PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון הכרטיס' },
      { status: 500 }
    )
  }
}

// DELETE /api/tickets/[id] - Delete ticket (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Ticket delete error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת הכרטיס' },
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
      message: 'הכרטיס נמחק בהצלחה'
    })

  } catch (error) {
    console.error('Ticket DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת הכרטיס' },
      { status: 500 }
    )
  }
}
