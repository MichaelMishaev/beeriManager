import { test, expect } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

test.describe('push_subscriptions platform migration', () => {
  test.describe.configure({ mode: 'serial' })
  let supabase: SupabaseClient<any, 'public', any>

  test.beforeEach(({}, testInfo) => {
    // browserName alone doesn't distinguish 'chromium' from 'Mobile Chrome' (both use
    // the chromium engine), so gate on the project name to run this DB-touching spec
    // on exactly one project.
    test.skip(testInfo.project.name !== 'chromium', 'DB test — chromium project only, avoid concurrent writes across parallel projects')
  })

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

    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .insert([{
          endpoint: testEndpoint,
          keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
          subscription_data: {},
          is_active: false
        }])
        .select('platform')
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.platform).toBe('web')
    } finally {
      await supabase.from('push_subscriptions').delete().eq('endpoint', testEndpoint)
    }
  })

  test('token column exists and is nullable', async () => {
    const testEndpoint = `https://test.push.example.com/test-token-${Date.now()}`

    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .insert([{
          endpoint: testEndpoint,
          keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
          subscription_data: {},
          token: null,
          is_active: false
        }])
        .select('token, platform')
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.token).toBeNull()
      expect(data!.platform).toBe('web')
    } finally {
      await supabase.from('push_subscriptions').delete().eq('endpoint', testEndpoint)
    }
  })

  test('existing subscribe endpoint still creates a row defaulted to platform=web', async ({ request }) => {
    const testEndpoint = `https://test.push.example.com/test-subscribe-${Date.now()}`

    try {
      const response = await request.post('/api/notifications/subscribe', {
        data: {
          subscription: {
            endpoint: testEndpoint,
            keys: { p256dh: 'test-p256dh', auth: 'test-auth' }
          }
        }
      })

      expect(response.ok()).toBe(true)

      // The subscribe endpoint hardcodes is_active: true; immediately deactivate
      // so a leaked row (e.g. if a later assertion throws) never becomes a
      // permanent target of real admin pushes.
      await supabase.from('push_subscriptions').update({ is_active: false }).eq('endpoint', testEndpoint)

      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('platform')
        .eq('endpoint', testEndpoint)
        .single()

      expect(error).toBeNull()
      expect(data!.platform).toBe('web')
    } finally {
      await supabase.from('push_subscriptions').delete().eq('endpoint', testEndpoint)
    }
  })

  test('platform CHECK constraint rejects invalid values', async () => {
    const testEndpoint = `https://test.push.example.com/test-invalid-platform-${Date.now()}`

    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .insert([{
          endpoint: testEndpoint,
          keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
          subscription_data: {},
          platform: 'linux',
          is_active: false
        }])

      expect(error).toBeTruthy()
      expect(error!.message.toLowerCase()).toContain('check')
    } finally {
      await supabase.from('push_subscriptions').delete().eq('endpoint', testEndpoint)
    }
  })

  test('platform NOT NULL constraint rejects null values', async () => {
    const testEndpoint = `https://test.push.example.com/test-null-platform-${Date.now()}`

    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .insert([{
          endpoint: testEndpoint,
          keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
          subscription_data: {},
          platform: null,
          is_active: false
        }])

      expect(error).toBeTruthy()
      expect(error!.message.toLowerCase()).toMatch(/not.null|null/)
    } finally {
      await supabase.from('push_subscriptions').delete().eq('endpoint', testEndpoint)
    }
  })
})
