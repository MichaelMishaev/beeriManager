/**
 * PWA Push Notifications Service
 * Handles push notification registration and sending
 */

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
  tag?: string
  requireInteraction?: boolean
}

class NotificationService {
  private vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' &&
           'Notification' in window &&
           'serviceWorker' in navigator &&
           'PushManager' in window
  }

  /**
   * Get current notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied'
    return Notification.permission
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported')
      return 'denied'
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported()) {
      console.warn('Push notifications not supported')
      return null
    }

    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        // Convert VAPID key
        const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey)

        // Subscribe to push
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        })
      }

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)

      return subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.isSupported()) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        await this.removeSubscriptionFromServer(subscription)
        return true
      }

      return false
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }

  /**
   * Show local notification (doesn't require push)
   */
  async showLocalNotification(payload: NotificationPayload): Promise<void> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported')
      return
    }

    const permission = await this.requestPermission()
    if (permission !== 'granted') {
      console.warn('Notification permission denied')
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready

      await registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/icon-72x72.png',
        data: payload.data,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction || false,
        vibrate: [200, 100, 200],
        dir: 'rtl',
        lang: 'he'
      })
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      })
    } catch (error) {
      console.error('Failed to send subscription to server:', error)
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      })
    } catch (error) {
      console.error('Failed to remove subscription from server:', error)
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }
}

export const notificationService = new NotificationService()

/**
 * Notification templates for common events
 */
export const NotificationTemplates = {
  newEvent: (eventTitle: string) => ({
    title: 'אירוע חדש נוסף',
    body: `נוסף אירוע חדש: ${eventTitle}`,
    tag: 'new-event',
    data: { type: 'event' }
  }),

  eventReminder: (eventTitle: string, timeUntil: string) => ({
    title: 'תזכורת אירוע',
    body: `${eventTitle} יתחיל בעוד ${timeUntil}`,
    tag: 'event-reminder',
    requireInteraction: true,
    data: { type: 'event-reminder' }
  }),

  taskAssigned: (taskTitle: string) => ({
    title: 'משימה חדשה הוקצתה לך',
    body: taskTitle,
    tag: 'task-assigned',
    data: { type: 'task' }
  }),

  taskDue: (taskTitle: string) => ({
    title: 'משימה לביצוע היום',
    body: taskTitle,
    tag: 'task-due',
    requireInteraction: true,
    data: { type: 'task-due' }
  }),

  issueUpdate: (issueTitle: string, status: string) => ({
    title: 'עדכון בבעיה',
    body: `${issueTitle} - סטטוס: ${status}`,
    tag: 'issue-update',
    data: { type: 'issue' }
  }),

  expenseApproved: (expenseTitle: string, amount: number) => ({
    title: 'הוצאה אושרה',
    body: `${expenseTitle} - ₪${amount}`,
    tag: 'expense-approved',
    data: { type: 'expense' }
  }),

  newFeedback: () => ({
    title: 'משוב חדש התקבל',
    body: 'התקבל משוב חדש מהורה',
    tag: 'new-feedback',
    data: { type: 'feedback' }
  })
}