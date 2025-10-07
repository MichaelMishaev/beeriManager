import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/notifications/subscribe
 * Subscribe to push notifications
 */
export async function POST(req: NextRequest) {
  try {
    const { subscription } = await req.json()

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { success: false, error: 'Subscription data required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Store subscription in database
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        subscription_data: subscription,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      }, {
        onConflict: 'endpoint'
      })

    if (error) {
      console.error('Failed to store subscription:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to store subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/subscribe
 * Unsubscribe from push notifications
 */
export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json()

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'Endpoint required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)

    if (error) {
      console.error('Failed to delete subscription:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to unsubscribe' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}