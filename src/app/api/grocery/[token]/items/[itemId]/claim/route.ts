import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ token: string; itemId: string }>
}

// Validation schema for claiming an item
const ClaimItemSchema = z.object({
  claimer_name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  quantity: z.number().int().positive().optional() // For partial claiming
})

/**
 * POST /api/grocery/[token]/items/[itemId]/claim
 * Claim an item (public)
 */
export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { token, itemId } = await params
    const body = await req.json()
    const validation = ClaimItemSchema.safeParse(body)

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
      .select('id, status')
      .eq('share_token', token)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'רשימת הקניות לא נמצאה' },
        { status: 404 }
      )
    }

    // Check if event is still active
    if (event.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'רשימת הקניות כבר נסגרה' },
        { status: 400 }
      )
    }

    // Check if item exists and is not already claimed
    const { data: existingItem, error: checkError } = await supabase
      .from('grocery_items')
      .select('id, claimed_by, quantity, item_name, notes, display_order')
      .eq('id', itemId)
      .eq('grocery_event_id', event.id)
      .single()

    if (checkError || !existingItem) {
      return NextResponse.json(
        { success: false, error: 'הפריט לא נמצא' },
        { status: 404 }
      )
    }

    if (existingItem.claimed_by) {
      return NextResponse.json(
        { success: false, error: 'הפריט כבר נתפס על ידי מישהו אחר' },
        { status: 400 }
      )
    }

    const claimQuantity = validation.data.quantity || existingItem.quantity
    const isPartialClaim = claimQuantity < existingItem.quantity

    if (claimQuantity > existingItem.quantity) {
      return NextResponse.json(
        { success: false, error: 'לא ניתן לתפוס יותר פריטים מהכמות הזמינה' },
        { status: 400 }
      )
    }

    if (isPartialClaim) {
      // Partial claim: Update original item quantity and create a new claimed item
      const remainingQuantity = existingItem.quantity - claimQuantity

      // Update the original item to reduce its quantity
      const { error: updateError } = await supabase
        .from('grocery_items')
        .update({ quantity: remainingQuantity })
        .eq('id', itemId)
        .eq('grocery_event_id', event.id)

      if (updateError) {
        console.error('Item update error:', updateError)
        return NextResponse.json(
          { success: false, error: 'שגיאה בעדכון הפריט' },
          { status: 500 }
        )
      }

      // Create a new claimed item with the claimed quantity
      // Use display_order + 1 to place it after the original item
      // Track parent_item_id for merging back on unclaim
      const insertData = {
        grocery_event_id: event.id,
        item_name: existingItem.item_name,
        quantity: claimQuantity,
        notes: existingItem.notes || null,
        claimed_by: validation.data.claimer_name,
        claimed_at: new Date().toISOString(),
        display_order: (existingItem.display_order ?? 0) + 1,
        parent_item_id: itemId // Track the parent for merge-back on unclaim
      }

      const { data: newClaimedItem, error: insertError } = await supabase
        .from('grocery_items')
        .insert([insertData])  // Use array syntax for consistency
        .select()
        .single()

      if (insertError) {
        console.error('Item insert error:', JSON.stringify(insertError, null, 2))
        console.error('Insert data was:', insertData)
        // Rollback: restore original quantity
        await supabase
          .from('grocery_items')
          .update({ quantity: existingItem.quantity })
          .eq('id', itemId)
          .eq('grocery_event_id', event.id)

        return NextResponse.json(
          { success: false, error: 'שגיאה ביצירת פריט חדש' },
          { status: 500 }
        )
      }

      // Log activity for partial claim
      await supabase
        .from('grocery_activity_log')
        .insert({
          grocery_event_id: event.id,
          item_id: newClaimedItem.id,
          action: 'claimed',
          item_name: existingItem.item_name,
          quantity: claimQuantity,
          user_name: validation.data.claimer_name
        })

      return NextResponse.json({
        success: true,
        data: newClaimedItem,
        message: `נתפסו ${claimQuantity} פריטים בהצלחה!`
      })
    }

    // Full claim: Claim the entire item
    const { data, error } = await supabase
      .from('grocery_items')
      .update({
        claimed_by: validation.data.claimer_name,
        claimed_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .eq('grocery_event_id', event.id)
      .select()
      .single()

    if (error) {
      console.error('Item claim error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בתפיסת הפריט' },
        { status: 500 }
      )
    }

    // Log activity for full claim
    await supabase
      .from('grocery_activity_log')
      .insert({
        grocery_event_id: event.id,
        item_id: itemId,
        action: 'claimed',
        item_name: existingItem.item_name,
        quantity: existingItem.quantity,
        user_name: validation.data.claimer_name
      })

    return NextResponse.json({
      success: true,
      data,
      message: 'הפריט נתפס בהצלחה!'
    })
  } catch (error) {
    console.error('Item claim POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בתפיסת הפריט' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/grocery/[token]/items/[itemId]/claim
 * Unclaim an item (public)
 * If item was a partial claim (has parent_item_id), merge quantity back to parent
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
      .select('id, status')
      .eq('share_token', token)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'רשימת הקניות לא נמצאה' },
        { status: 404 }
      )
    }

    // Check if event is still active
    if (event.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'רשימת הקניות כבר נסגרה' },
        { status: 400 }
      )
    }

    // Get item with parent reference
    const { data: item, error: itemError } = await supabase
      .from('grocery_items')
      .select('id, quantity, parent_item_id, claimed_by, item_name')
      .eq('id', itemId)
      .eq('grocery_event_id', event.id)
      .single()

    if (itemError || !item) {
      return NextResponse.json(
        { success: false, error: 'הפריט לא נמצא' },
        { status: 404 }
      )
    }

    // If this was a partial claim (has parent), merge quantity back
    if (item.parent_item_id) {
      // Get parent item
      const { data: parent, error: parentError } = await supabase
        .from('grocery_items')
        .select('id, quantity')
        .eq('id', item.parent_item_id)
        .single()

      if (!parentError && parent) {
        // Merge quantity back to parent
        const { error: updateError } = await supabase
          .from('grocery_items')
          .update({ quantity: parent.quantity + item.quantity })
          .eq('id', item.parent_item_id)

        if (updateError) {
          console.error('Parent quantity update error:', updateError)
          return NextResponse.json(
            { success: false, error: 'שגיאה בעדכון הכמות' },
            { status: 500 }
          )
        }

        // Log unclaim activity BEFORE deleting (to avoid foreign key error)
        const { error: logError } = await supabase
          .from('grocery_activity_log')
          .insert({
            grocery_event_id: event.id,
            item_id: itemId,
            action: 'unclaimed',
            item_name: item.item_name,
            quantity: item.quantity,
            user_name: item.claimed_by
          })

        if (logError) {
          console.error('Activity log insert error (partial unclaim):', logError)
        }

        // Delete the split item entirely
        const { error: deleteError } = await supabase
          .from('grocery_items')
          .delete()
          .eq('id', itemId)

        if (deleteError) {
          console.error('Item delete error:', deleteError)
          return NextResponse.json(
            { success: false, error: 'שגיאה במחיקת הפריט' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          merged: true,
          message: 'quantityMergedBack'
        })
      }
      // If parent was deleted, fall through to normal unclaim
    }

    // Normal unclaim (no parent or parent was deleted) - just clear claimed_by
    const { data, error } = await supabase
      .from('grocery_items')
      .update({
        claimed_by: null,
        claimed_at: null
      })
      .eq('id', itemId)
      .eq('grocery_event_id', event.id)
      .select()
      .single()

    if (error) {
      console.error('Item unclaim error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בביטול התפיסה' },
        { status: 500 }
      )
    }

    // Log unclaim activity
    const { error: logError2 } = await supabase
      .from('grocery_activity_log')
      .insert({
        grocery_event_id: event.id,
        item_id: itemId,
        action: 'unclaimed',
        item_name: item.item_name,
        quantity: item.quantity,
        user_name: item.claimed_by
      })

    if (logError2) {
      console.error('Activity log insert error (normal unclaim):', logError2)
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'התפיסה בוטלה בהצלחה'
    })
  } catch (error) {
    console.error('Item unclaim DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בביטול התפיסה' },
      { status: 500 }
    )
  }
}
