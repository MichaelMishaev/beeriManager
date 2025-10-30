import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth/jwt-edge';

// Configure web-push with VAPID keys (only if keys are available)
function initializeVapid() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@beeri.online';

  if (vapidPublicKey && vapidPrivateKey) {
    try {
      webpush.setVapidDetails(
        vapidSubject,
        vapidPublicKey,
        vapidPrivateKey
      );
    } catch (error) {
      console.error('Failed to initialize VAPID keys:', error);
    }
  }
}

// Initialize VAPID only at runtime, not at build time
if (typeof window === 'undefined' && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  initializeVapid();
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * POST /api/notifications/send
 * Send push notifications to all subscribed users
 * Requires admin authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Ensure VAPID is initialized at runtime
    initializeVapid();

    // Check authentication using JWT token
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');

    if (!token?.value) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token.value);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token or not admin' },
        { status: 401 }
      );
    }

    // Get Supabase client for database operations
    const supabase = await createClient();

    // Check if VAPID keys are configured
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return NextResponse.json(
        { success: false, error: 'Push notifications not configured' },
        { status: 503 }
      );
    }

    const payload: NotificationPayload = await req.json();

    if (!payload.title || !payload.body) {
      return NextResponse.json(
        { success: false, error: 'Title and body required' },
        { status: 400 }
      );
    }

    // Get all active subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Failed to fetch subscriptions:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: 'No active subscriptions'
      });
    }

    // Prepare notification payload
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-96x96.png',
      data: payload.data || {},
      tag: payload.tag || 'notification',
      requireInteraction: payload.requireInteraction || false,
      actions: payload.actions || [],
    });

    // Send notifications
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const subscription = sub.subscription_data;
          await webpush.sendNotification(subscription, notificationPayload);
          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          // Handle expired/invalid subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            // Remove invalid subscription
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
          }
          throw error;
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
