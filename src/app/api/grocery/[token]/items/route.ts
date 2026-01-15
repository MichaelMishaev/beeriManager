import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ token: string }>
}

// Validation schema for creating grocery item
const CreateGroceryItemSchema = z.object({
  item_name: z.string().min(1, 'שם הפריט חייב להכיל לפחות תו אחד'),
  quantity: z.number().int().min(1, 'כמות חייבת להיות לפחות 1').default(1),
  notes: z.string().optional().nullable()
})

// Validation schema for bulk adding items
const BulkCreateGroceryItemsSchema = z.object({
  items: z.array(CreateGroceryItemSchema).min(1, 'יש להוסיף לפחות פריט אחד')
})

/**
 * GET /api/grocery/[token]/items
 * Get all items for a grocery event (public)
 */
export async function GET(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { token } = await params
    const supabase = await createClient()

    // First get the event by token
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

    // Get items for this event
    const { data: items, error: itemsError } = await supabase
      .from('grocery_items')
      .select('*')
      .eq('grocery_event_id', event.id)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (itemsError) {
      console.error('Grocery items query error:', itemsError)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת הפריטים' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: items || [],
      count: items?.length || 0
    })
  } catch (error) {
    console.error('Grocery items GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הפריטים' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/grocery/[token]/items
 * Add item(s) to a grocery event (public)
 */
export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { token } = await params
    const body = await req.json()

    // Check if this is a bulk operation or single item
    const isBulk = Array.isArray(body.items)
    let itemsToInsert: Array<{ item_name: string; quantity: number; notes?: string | null }>

    if (isBulk) {
      const validation = BulkCreateGroceryItemsSchema.safeParse(body)
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
      itemsToInsert = validation.data.items
    } else {
      const validation = CreateGroceryItemSchema.safeParse(body)
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
      itemsToInsert = [validation.data]
    }

    const supabase = await createClient()

    // Get the event by token
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

    // Get current max display_order
    const { data: maxOrderResult } = await supabase
      .from('grocery_items')
      .select('display_order')
      .eq('grocery_event_id', event.id)
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const startOrder = (maxOrderResult?.display_order || 0) + 1

    // Insert items with incremental display_order
    const itemsWithOrder = itemsToInsert.map((item, index) => ({
      grocery_event_id: event.id,
      item_name: item.item_name,
      quantity: item.quantity,
      notes: item.notes || null,
      display_order: startOrder + index
    }))

    const { data, error } = await supabase
      .from('grocery_items')
      .insert(itemsWithOrder)
      .select()

    if (error) {
      console.error('Grocery item creation error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בהוספת הפריטים' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: isBulk ? data : data?.[0],
      message: isBulk ? `${data?.length || 0} פריטים נוספו בהצלחה` : 'הפריט נוסף בהצלחה'
    })
  } catch (error) {
    console.error('Grocery items POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בהוספת הפריטים' },
      { status: 500 }
    )
  }
}
