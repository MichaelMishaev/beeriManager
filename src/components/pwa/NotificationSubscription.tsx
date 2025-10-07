'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { useToast } from '@/hooks/use-toast'
import { logger } from '@/lib/logger'

export function NotificationSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('notifications')
  const { toast } = useToast()

  useEffect(() => {
    checkNotificationSupport()
    checkSubscriptionStatus()
  }, [])

  async function checkNotificationSupport() {
    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window

    setIsSupported(supported)

    if (!supported) {
      logger.warn('Push notifications not supported')
    }
  }

  async function checkSubscriptionStatus() {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Failed to check subscription status:', error)
    }
  }

  async function subscribeToNotifications() {
    try {
      setIsLoading(true)

      // Request notification permission
      const permission = await Notification.requestPermission()

      if (permission !== 'granted') {
        toast({
          title: t('permissionDenied') || 'הרשאה נדחתה',
          description: t('permissionDeniedDescription') || 'יש לאפשר התראות בהגדרות הדפדפן',
          variant: 'destructive',
        })
        return
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ) as BufferSource,
      })

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }

      setIsSubscribed(true)
      logger.userAction('Subscribed to notifications')

      toast({
        title: t('subscribed') || 'נרשמת בהצלחה',
        description: t('subscribedDescription') || 'תקבל התראות על אירועים חדשים',
      })
    } catch (error) {
      console.error('Subscription error:', error)
      logger.error('Notification subscription failed', { error })

      toast({
        title: t('subscriptionFailed') || 'הרישום נכשל',
        description: t('subscriptionFailedDescription') || 'אנא נסה שנית מאוחר יותר',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribeFromNotifications() {
    try {
      setIsLoading(true)

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from push notifications
        await subscription.unsubscribe()

        // Remove subscription from server
        await fetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        setIsSubscribed(false)
        logger.userAction('Unsubscribed from notifications')

        toast({
          title: t('unsubscribed') || 'בוטל הרישום',
          description: t('unsubscribedDescription') || 'לא תקבל עוד התראות',
        })
      }
    } catch (error) {
      console.error('Unsubscribe error:', error)
      logger.error('Notification unsubscribe failed', { error })

      toast({
        title: t('unsubscribeFailed') || 'ביטול הרישום נכשל',
        description: t('unsubscribeFailedDescription') || 'אנא נסה שנית מאוחר יותר',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }

  if (!isSupported) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {isSubscribed ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={unsubscribeFromNotifications}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <BellOff className="h-4 w-4" />
          <span className="hidden sm:inline">
            {t('unsubscribe') || 'בטל התראות'}
          </span>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={subscribeToNotifications}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">
            {t('subscribe') || 'קבל התראות'}
          </span>
        </Button>
      )}
    </div>
  )
}
