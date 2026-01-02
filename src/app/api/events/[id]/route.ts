import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Event update schema (all fields optional)
const EventUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  title_ru: z.string().nullable().optional(),
  description: z.string().optional(),
  description_ru: z.string().nullable().optional(),
  start_datetime: z.string().datetime().optional(),
  end_datetime: z.string().datetime().nullable().optional(),
  location: z.string().optional(),
  location_ru: z.string().nullable().optional(),
  event_type: z.enum(['general', 'meeting', 'fundraiser', 'trip', 'workshop']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  status: z.enum(['draft', 'published', 'ongoing', 'completed', 'cancelled']).optional(),
  registration_enabled: z.boolean().optional(),
  max_attendees: z.number().min(1).nullable().optional(),
  requires_payment: z.boolean().optional(),
  payment_amount: z.number().min(0).nullable().optional(),
  budget_allocated: z.number().min(0).nullable().optional(),
  budget_spent: z.number().min(0).nullable().optional(),
  notes: z.string().optional(),
  registration_deadline: z.string().datetime().nullable().optional()
})

// GET /api/events/[id] - Get single event
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .is('archived_at', null) // ✅ Archived events return 404
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'האירוע לא נמצא' },
        { status: 404 }
      )
    }

    // Add attendance percentage if max_attendees exists
    if (data.max_attendees) {
      data.attendance_percentage = Math.round((data.current_attendees / data.max_attendees) * 100)
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Event GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת האירוע' },
      { status: 500 }
    )
  }
}

// PUT /api/events/[id] - Update event
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
    const validation = EventUpdateSchema.safeParse(body)

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

    // Update event
    const { data, error } = await supabase
      .from('events')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Event update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון האירוע' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'האירוע לא נמצא' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'האירוע עודכן בהצלחה'
    })

  } catch (error) {
    console.error('Event PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון האירוע' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id] - Delete event (soft delete)
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

    const supabase = await createClient()

    // Soft delete by setting archived_at
    const { data, error } = await supabase
      .from('events')
      .update({
        archived_at: new Date().toISOString(),
        status: 'cancelled'
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Event delete error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת האירוע' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'האירוע לא נמצא' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'האירוע נמחק בהצלחה'
    })

  } catch (error) {
    console.error('Event DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת האירוע' },
      { status: 500 }
    )
  }
}