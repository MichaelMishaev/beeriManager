import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ token: string }>
}

// Validation schema for updating event via token (subset of full event schema)
const EventTokenUpdateSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים').optional(),
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
  registration_deadline: z.string().datetime().nullable().optional(),
  max_attendees: z.number().min(1).nullable().optional(),
  requires_payment: z.boolean().optional(),
  payment_amount: z.number().min(0).nullable().optional(),
  budget_allocated: z.number().min(0).nullable().optional(),
  photos_url: z.string().url().nullable().optional(),
  creator_phone: z.string().regex(/^05\d{8}$/, 'מספר טלפון לא תקין').nullable().optional()
})

/**
 * GET /api/events/token/[token]
 * Get an event by its edit token (public access)
 * Pattern: Same as /api/grocery/[token]
 */
export async function GET(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { token } = await params
    const supabase = await createClient()

    // Get the event by edit_token
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('edit_token', token)
      .is('archived_at', null) // Exclude archived events
      .single()

    if (eventError || !event) {
      console.error('Event not found by token:', eventError)
      return NextResponse.json(
        { success: false, error: 'האירוע לא נמצא' },
        { status: 404 }
      )
    }

    // Add attendance percentage if max_attendees exists
    if (event.max_attendees) {
      event.attendance_percentage = Math.round((event.current_attendees / event.max_attendees) * 100)
    }

    return NextResponse.json({
      success: true,
      data: event,
      edit_url: `/events/edit/${token}`
    })
  } catch (error) {
    console.error('Event token GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת האירוע' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/events/token/[token]
 * Update an event by its edit token (public access - token is the auth)
 * Pattern: Same as /api/grocery/[token]
 */
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { token } = await params
    const body = await req.json()
    const validation = EventTokenUpdateSchema.safeParse(body)

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

    // First check if event exists and is not archived
    const { data: existingEvent, error: checkError } = await supabase
      .from('events')
      .select('id, edit_token')
      .eq('edit_token', token)
      .is('archived_at', null)
      .single()

    if (checkError || !existingEvent) {
      return NextResponse.json(
        { success: false, error: 'האירוע לא נמצא' },
        { status: 404 }
      )
    }

    // Update the event
    const { data, error } = await supabase
      .from('events')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('edit_token', token)
      .select()
      .single()

    if (error) {
      console.error('Event token update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון האירוע' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      edit_url: `/events/edit/${token}`,
      message: 'האירוע עודכן בהצלחה'
    })
  } catch (error) {
    console.error('Event token PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון האירוע' },
      { status: 500 }
    )
  }
}
