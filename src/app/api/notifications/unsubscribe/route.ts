import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { subscription } = await req.json()

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { success: false, error: 'Subscription endpoint required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Remove subscription from database
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', subscription.endpoint)

    if (error) {
      console.error('Failed to remove subscription:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to remove subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unsubscription error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}