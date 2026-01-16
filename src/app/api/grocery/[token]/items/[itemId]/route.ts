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
 *
 * IMPORTANT: When increasing quantity on a CLAIMED item,
 * we must NOT increase the claimer's quantity automatically.
 * Instead, create a new unclaimed item for the additional quantity.
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

    // Get the current item to check if it's claimed
    const { data: currentItem, error: fetchError } = await supabase
      .from('grocery_items')
      .select('*')
      .eq('id', itemId)
      .eq('grocery_event_id', event.id)
      .single()

    if (fetchError || !currentItem) {
      return NextResponse.json(
        { success: false, error: 'הפריט לא נמצא' },
        { status: 404 }
      )
    }

    // Check if this is a quantity increase on a CLAIMED item
    const newQuantity = validation.data.quantity
    const isClaimedItem = !!currentItem.claimed_by
    const isQuantityIncrease = newQuantity && newQuantity > currentItem.quantity

    if (isClaimedItem && isQuantityIncrease) {
      // SPECIAL CASE: Admin is increasing quantity on a claimed item
      // We must NOT increase what the claimer is bringing!
      // Instead, create a new unclaimed item for the additional quantity

      const additionalQuantity = newQuantity - currentItem.quantity

      // Check if there's already an unclaimed item with the same name (parent or sibling)
      // that we can add the quantity to
      const { data: existingUnclaimed } = await supabase
        .from('grocery_items')
        .select('*')
        .eq('grocery_event_id', event.id)
        .eq('item_name', currentItem.item_name)
        .is('claimed_by', null)
        .neq('id', itemId)
        .single()

      if (existingUnclaimed) {
        // Add to the existing unclaimed item's quantity
        const { error: updateError } = await supabase
          .from('grocery_items')
          .update({ quantity: existingUnclaimed.quantity + additionalQuantity })
          .eq('id', existingUnclaimed.id)

        if (updateError) {
          console.error('Error updating existing unclaimed item:', updateError)
          return NextResponse.json(
            { success: false, error: 'שגיאה בעדכון הפריט' },
            { status: 500 }
          )
        }
      } else {
        // Create a new unclaimed item for the additional quantity
        const { error: insertError } = await supabase
          .from('grocery_items')
          .insert({
            grocery_event_id: event.id,
            item_name: currentItem.item_name,
            quantity: additionalQuantity,
            notes: currentItem.notes || null,
            display_order: (currentItem.display_order ?? 0) + 1,
            // No claimed_by - this is unclaimed
          })

        if (insertError) {
          console.error('Error creating new unclaimed item:', insertError)
          return NextResponse.json(
            { success: false, error: 'שגיאה ביצירת פריט חדש' },
            { status: 500 }
          )
        }
      }

      // Return the original item unchanged (claimer's quantity stays the same)
      return NextResponse.json({
        success: true,
        data: currentItem,
        additionalItemCreated: true,
        message: 'נוספה כמות חדשה לפריט - הכמות הנוספת זמינה לתפיסה'
      })
    }

    // Normal update (not a quantity increase on claimed item)
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
 * Note: Cannot delete items that are claimed - must unclaim first
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

    // Check if item exists and if it's claimed
    const { data: item, error: itemError } = await supabase
      .from('grocery_items')
      .select('id, claimed_by')
      .eq('id', itemId)
      .eq('grocery_event_id', event.id)
      .single()

    if (itemError || !item) {
      return NextResponse.json(
        { success: false, error: 'הפריט לא נמצא' },
        { status: 404 }
      )
    }

    // Block deletion of claimed items
    if (item.claimed_by) {
      return NextResponse.json(
        { success: false, error: 'cannotDeleteClaimedItem' },
        { status: 400 }
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
