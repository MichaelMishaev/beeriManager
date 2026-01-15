import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ token: string; itemId: string }>
}

// Validation schema for updating grocery item
const UpdateGroceryItemSchema = z.object({
  item_name: z.string().min(1).optional(),
  quantity: z.number().int().min(1).optional(),
  notes: z.string().optional().nullable(),
  display_order: z.number().int().min(0).optional()
})

/**
 * GET /api/grocery/[token]/items/[itemId]
 * Get a single grocery item (public)
 */
export async function GET(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { token, itemId } = await params
    const supabase = await createClient()

    // First verify the event exists
    const { data: event, error: eventError } = await supabase
      .from('grocery_events')
      .select('id')
      .eq('share_token', token)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'רשימת הקניות לא נמצאה' },
        { status: 404 }
      )
    }

    // Get the item
    const { data: item, error: itemError } = await supabase
      .from('grocery_items')
      .select('*')
      .eq('id', itemId)
      .eq('grocery_event_id', event.id)
      .single()

    if (itemError || !item) {
      return NextResponse.json(
        { success: false, error: 'הפריט לא נמצא' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: item
    })
  } catch (error) {
    console.error('Grocery item GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הפריט' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/grocery/[token]/items/[itemId]
 * Update a grocery item (public)
 */
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { token, itemId } = await params
    const body = await req.json()
    const validation = UpdateGroceryItemSchema.safeParse(body)

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

    // First verify the event exists
    const { data: event, error: eventError } = await supabase
      .from('grocery_events')
      .select('id')
      .eq('share_token', token)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'רשימת הקניות לא נמצאה' },
        { status: 404 }
      )
    }

    // Update the item
    const { data, error } = await supabase
      .from('grocery_items')
      .update(validation.data)
      .eq('id', itemId)
      .eq('grocery_event_id', event.id)
      .select()
      .single()

    if (error) {
      console.error('Grocery item update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון הפריט' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'הפריט עודכן בהצלחה'
    })
  } catch (error) {
    console.error('Grocery item PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון הפריט' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/grocery/[token]/items/[itemId]
 * Delete a grocery item (public)
 */
export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { token, itemId } = await params
    const supabase = await createClient()

    // First verify the event exists
    const { data: event, error: eventError } = await supabase
      .from('grocery_events')
      .select('id')
      .eq('share_token', token)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'רשימת הקניות לא נמצאה' },
        { status: 404 }
      )
    }

    // Delete the item
    const { error } = await supabase
      .from('grocery_items')
      .delete()
      .eq('id', itemId)
      .eq('grocery_event_id', event.id)

    if (error) {
      console.error('Grocery item delete error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת הפריט' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'הפריט נמחק בהצלחה'
    })
  } catch (error) {
    console.error('Grocery item DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת הפריט' },
      { status: 500 }
    )
  }
}
