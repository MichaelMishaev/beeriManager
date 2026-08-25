import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

test.describe('push_subscriptions platform migration', () => {
  let supabase: ReturnType<typeof createClient>

  test.beforeAll(() => {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Missing Supabase env vars. NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required.')
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  })

  test('platform column exists with correct defaults and constraints', async () => {
    const testEndpoint = `https://test.push.example.com/test-platform-${Date.now()}`

    const { data, error } = await supabase
      .from('push_subscriptions')
      .insert([{
        endpoint: testEndpoint,
        keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
        subscription_data: {}
      }])
      .select('platform')
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
    expect(data!.platform).toBe('web')

    await supabase.from('push_subscriptions').delete().eq('endpoint', testEndpoint)
  })

  test('token column exists and is nullable', async () => {
    const testEndpoint = `https://test.push.example.com/test-token-${Date.now()}`

    const { data, error } = await supabase
      .from('push_subscriptions')
      .insert([{
        endpoint: testEndpoint,
        keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
        subscription_data: {},
        token: null
      }])
      .select('token, platform')
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
    expect(data!.token).toBeNull()
    expect(data!.platform).toBe('web')

    await supabase.from('push_subscriptions').delete().eq('endpoint', testEndpoint)
  })

  test('existing subscribe endpoint still creates a row defaulted to platform=web', async ({ request }) => {
    const testEndpoint = `https://test.push.example.com/test-subscribe-${Date.now()}`

    const response = await request.post('/api/notifications/subscribe', {
      data: {
        subscription: {
          endpoint: testEndpoint,
          keys: { p256dh: 'test-p256dh', auth: 'test-auth' }
        }
      }
    })

    expect(response.ok()).toBe(true)

    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('platform')
      .eq('endpoint', testEndpoint)
      .single()

    expect(error).toBeNull()
    expect(data!.platform).toBe('web')

    await supabase.from('push_subscriptions').delete().eq('endpoint', testEndpoint)
  })
})
