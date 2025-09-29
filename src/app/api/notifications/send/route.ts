import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:' + (process.env.ADMIN_EMAIL || 'admin@beerimanager.com'),
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('auth-token')
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, body, data, tag, targetAll = true, targetEndpoint } = await req.json()

    if (!title || !body) {
      return NextResponse.json(
        { success: false, error: 'Title and body required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get subscriptions
    let query = supabase.from('push_subscriptions').select('*')

    if (!targetAll && targetEndpoint) {
      query = query.eq('endpoint', targetEndpoint)
    }

    const { data: subscriptions, error } = await query

    if (error) {
      console.error('Failed to fetch subscriptions:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { success: true, message: 'No subscriptions found', sent: 0 }
      )
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: data || {},
      tag: tag || 'notification',
      dir: 'rtl',
      lang: 'he'
    })

    // Send notifications
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys
            },
            payload
          )
          return { success: true, endpoint: sub.endpoint }
        } catch (error: any) {
          console.error('Failed to send notification:', error)

          // If subscription is invalid (410 Gone), remove it
          if (error.statusCode === 410) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint)
          }

          return { success: false, endpoint: sub.endpoint, error: error.message }
        }
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length
    const failed = results.length - successful

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      total: results.length
    })
  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}