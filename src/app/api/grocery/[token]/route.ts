import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ token: string }>
}

// Validation schema for updating grocery event
const UpdateGroceryEventSchema = z.object({
  status: z.enum(['active', 'completed', 'archived']).optional(),
  class_name: z.string().min(2).optional(),
  event_name: z.string().min(2).optional(),
  event_date: z.string().optional().nullable(),
  event_time: z.string().optional().nullable(),
  event_address: z.string().optional().nullable(),
  creator_name: z.string().optional().nullable()
})

/**
 * GET /api/grocery/[token]
 * Get a grocery event by share token (public)
 */
export async function GET(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { token } = await params
    const supabase = await createClient()

    // Get the grocery event with its items
    const { data: event, error: eventError } = await supabase
      .from('grocery_events')
      .select('*')
      .eq('share_token', token)
      .single()

    if (eventError || !event) {
      console.error('Grocery event not found:', eventError)
      return NextResponse.json(
        { success: false, error: 'רשימת הקניות לא נמצאה' },
        { status: 404 }
      )
    }

    // Get items for this event
    const { data: items, error: itemsError } = await supabase
      .from('grocery_items')
      .select('*')
      .eq('grocery_event_id', event.id)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (itemsError) {
      console.error('Grocery items query error:', itemsError)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...event,
        items: items || []
      }
    })
  } catch (error) {
    console.error('Grocery event GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת רשימת הקניות' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/grocery/[token]
 * Update a grocery event (public - for status changes)
 */
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { token } = await params
    const body = await req.json()
    const validation = UpdateGroceryEventSchema.safeParse(body)

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

    const { data, error } = await supabase
      .from('grocery_events')
      .update(validation.data)
      .eq('share_token', token)
      .select()
      .single()

    if (error) {
      console.error('Grocery event update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון רשימת הקניות' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'רשימת הקניות עודכנה בהצלחה'
    })
  } catch (error) {
    console.error('Grocery event PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון רשימת הקניות' },
      { status: 500 }
    )
  }
}
