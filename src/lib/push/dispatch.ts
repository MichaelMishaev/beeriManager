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
  platform: string
  subscription_data: any
  token: string | null
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

  switch (sub.platform) {
    case 'web':
      await sendWebPush(sub.subscription_data, serialized)
      return
    case 'ios':
      throw new Error(`Native iOS push not yet implemented (endpoint: ${sub.endpoint})`)
    case 'android':
      throw new Error(`Native Android push not yet implemented (endpoint: ${sub.endpoint})`)
    default:
      throw new Error(`Unknown push platform "${sub.platform}" (endpoint: ${sub.endpoint})`)
  }
}
