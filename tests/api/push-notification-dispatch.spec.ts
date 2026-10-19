import { test, expect } from '@playwright/test'
import { buildNotificationPayload, dispatchNotification } from '../../src/lib/push/dispatch'

const payload = { title: 'Test', body: 'Test body' }

test.describe('dispatchNotification', () => {
  test('web platform calls the injected web-push sender with the subscription data', async () => {
    let calledWith: any = null
    const fakeSender = async (subscription: any, serializedPayload: string) => {
      calledWith = { subscription, serializedPayload }
    }

    await dispatchNotification(
      { endpoint: 'https://example.com/ep', platform: 'web', subscription_data: { endpoint: 'https://example.com/ep' }, token: null },
      payload,
      fakeSender
    )

    expect(calledWith).toBeTruthy()
    expect(calledWith.subscription).toEqual({ endpoint: 'https://example.com/ep' })
    expect(JSON.parse(calledWith.serializedPayload)).toEqual(payload)
  })

  test('web platform propagates a rejection from the sender (existing error-handling path)', async () => {
    const failingSender = async () => { throw Object.assign(new Error('Gone'), { statusCode: 410 }) }

    await expect(
      dispatchNotification(
        { endpoint: 'https://example.com/ep', platform: 'web', subscription_data: {}, token: null },
        payload,
        failingSender
      )
    ).rejects.toThrow('Gone')
  })

  test('ios platform rejects as not yet implemented, without calling the web-push sender', async () => {
    let senderCalled = false
    const fakeSender = async () => { senderCalled = true }

    await expect(
      dispatchNotification(
        { endpoint: 'ios-token-endpoint', platform: 'ios', subscription_data: null, token: 'fake-apns-token' },
        payload,
        fakeSender
      )
    ).rejects.toThrow(/not yet implemented/)

    expect(senderCalled).toBe(false)
  })

  test('android platform rejects as not yet implemented', async () => {
    await expect(
      dispatchNotification(
        { endpoint: 'android-token-endpoint', platform: 'android', subscription_data: null, token: 'fake-fcm-token' },
        payload
      )
    ).rejects.toThrow(/not yet implemented/)
  })

  test('unknown platform rejects clearly instead of silently defaulting to web', async () => {
    let senderCalled = false
    const fakeSender = async () => { senderCalled = true }

    await expect(
      dispatchNotification(
        { endpoint: 'weird', platform: 'smartwatch', subscription_data: {}, token: null },
        payload,
        fakeSender
      )
    ).rejects.toThrow(/Unknown push platform/)

    expect(senderCalled).toBe(false)
  })

  test('a row without a platform (migration not applied yet) is delivered as web, not rejected', async () => {
    let calledWith: any = null
    const fakeSender = async (subscription: any, serializedPayload: string) => {
      calledWith = { subscription, serializedPayload }
    }

    // select('*') on a database that does not have the platform column returns no platform key
    await dispatchNotification(
      { endpoint: 'https://example.com/ep', subscription_data: { endpoint: 'https://example.com/ep' } } as any,
      payload,
      fakeSender
    )
    await dispatchNotification(
      { endpoint: 'https://example.com/ep2', platform: null, subscription_data: { endpoint: 'https://example.com/ep2' }, token: null },
      payload,
      fakeSender
    )

    expect(calledWith).toBeTruthy()
  })
})

test.describe('buildNotificationPayload', () => {
  test('applies the defaults the send route had before the refactor', () => {
    expect(buildNotificationPayload({ title: 'T', body: 'B' })).toEqual({
      title: 'T',
      body: 'B',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      data: {},
      tag: 'notification',
      requireInteraction: false,
      actions: [],
    })
  })

  test('keeps values the caller provided', () => {
    const built = buildNotificationPayload({
      title: 'T',
      body: 'B',
      icon: '/x.png',
      tag: 'urgent',
      requireInteraction: true,
      data: { url: '/he/events' },
      actions: [{ action: 'open', title: 'Open' }],
    })
    expect(built.icon).toBe('/x.png')
    expect(built.tag).toBe('urgent')
    expect(built.requireInteraction).toBe(true)
    expect(built.data).toEqual({ url: '/he/events' })
    expect(built.actions).toEqual([{ action: 'open', title: 'Open' }])
    expect(built.badge).toBe('/icons/icon-96x96.png')
  })
})
