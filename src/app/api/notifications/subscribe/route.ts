import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { subscription } = await req.json()

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription data required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Store subscription in database
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        created_at: new Date().toISOString()
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