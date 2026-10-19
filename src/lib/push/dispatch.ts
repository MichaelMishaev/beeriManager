import webpush from 'web-push'

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
  tag?: string
  requireInteraction?: boolean
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

export interface PushSubscriptionRow {
  endpoint: string
  // Missing on rows read before the platform migration is applied; treated as 'web'
  platform?: string | null
  subscription_data: any
  token: string | null
}

/**
 * Fills the defaults the send route has always applied (icon, badge, tag...), so the
 * serialized payload a web-push client receives is identical to before the refactor.
 */
export function buildNotificationPayload(payload: NotificationPayload): NotificationPayload {
  return {
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/icon-96x96.png',
    data: payload.data || {},
    tag: payload.tag || 'notification',
    requireInteraction: payload.requireInteraction || false,
    actions: payload.actions || [],
  }
}

export type WebPushSender = (subscription: any, serializedPayload: string) => Promise<any>

const defaultWebPushSender: WebPushSender = (subscription, serializedPayload) =>
  webpush.sendNotification(subscription, serializedPayload)

/**
 * Sends one notification to one subscription, branching by platform.
 * The 'web' branch preserves the exact behavior the send route had before
 * this module existed. 'ios'/'android' are typed extension points - no
 * subscription with those platforms exists yet, since nothing creates them
 * until the native wrapper work lands.
 */
export async function dispatchNotification(
  sub: PushSubscriptionRow,
  payload: NotificationPayload,
  sendWebPush: WebPushSender = defaultWebPushSender
): Promise<void> {
  const serialized = JSON.stringify(payload)
  // Rows predating the platform column (migration not applied yet) are web subscriptions
  const platform = sub.platform ?? 'web'

  switch (platform) {
    case 'web':
      await sendWebPush(sub.subscription_data, serialized)
      return
    case 'ios':
      throw new Error(`Native iOS push not yet implemented (endpoint: ${sub.endpoint})`)
    case 'android':
      throw new Error(`Native Android push not yet implemented (endpoint: ${sub.endpoint})`)
    default:
      throw new Error(`Unknown push platform "${platform}" (endpoint: ${sub.endpoint})`)
  }
}
