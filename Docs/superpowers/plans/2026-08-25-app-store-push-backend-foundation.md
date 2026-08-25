# App Store Push Backend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `push_subscriptions` backend platform-aware (web / iOS / android) with zero behavior change for existing web-push users, laying the foundation the later Capacitor wrapper and native APNs/FCM work will build on.

**Architecture:** One additive Supabase migration adds `platform` (default `'web'`) and `token` columns to `push_subscriptions`. The send route's inline `web-push` call is extracted into a small `dispatchNotification()` function in a new `src/lib/push/dispatch.ts` module that branches on `platform` — the `'web'` branch is byte-identical to today's behavior; `'ios'`/`'android'` branches exist as typed extension points that currently reject cleanly (nothing creates those rows yet, since no client wiring exists until a later phase).

**Tech Stack:** Next.js 14 API routes, Supabase (Postgres), `web-push` (existing dependency), Playwright (existing test tool — used here for both a DB-migration verification test and a dependency-injected unit test of the new dispatch module, no new test framework introduced).

**Spec:** `Docs/superpowers/specs/2026-08-25-app-store-submission-design.md`

## Scope note

The spec covers four things: (1) DB schema + dispatch refactor, (2) the Capacitor native wrapper, (3) native APNs/FCM wiring, (4) store submission logistics. Per the spec's own phased rollout, this plan implements **only phases 1–2** (the backend foundation) — the part that is fully codeable and testable without a Mac/Xcode, a Firebase project, or Apple/Google Developer accounts. The Capacitor wrapper and native push wiring depend on that external tooling and are separate follow-up plans, written once this foundation has landed and been regression-tested per the gate below.

## Global Constraints

- **Additive-only migration**: new columns must be nullable or defaulted; zero required changes to existing `push_subscriptions` read/write paths. (Spec: Regression Safety #2)
- **Fail-closed platform handling**: unrecognized/absent platform must never silently succeed as if it were `'web'`, and must never crash the batch send — it must reject that one subscription's send the same way an invalid endpoint already does today (caught per-subscription, doesn't fail the whole request). (Spec: Regression Safety #3, adapted to this task's scope)
- **No real notifications during tests**: the dispatch module's `'web'` branch must be dependency-injectable so tests never call the real `web-push` network path or touch real subscriber rows in a shared dev database. (New constraint, added because the spec's Phase 2 test gate — hitting `/api/notifications/send` — would otherwise push real notifications to any genuinely-active subscriptions in whatever DB the tests run against.)
- **Test gate before this plan is considered done**: `npm run type-check`, `npm run lint`, and the two new Playwright tests below must all pass, with `npm run dev` running on port 4500 for the migration test. (Spec: Regression Safety #5)

---

### Task 1: Additive migration — `platform` and `token` columns on `push_subscriptions`

**Files:**
- Create: `supabase/migrations/20260825000000_add_platform_to_push_subscriptions.sql`
- Test: `tests/api/push-subscriptions-platform-migration.spec.ts`

**Interfaces:**
- Produces: `push_subscriptions.platform` (`varchar(10)`, `NOT NULL DEFAULT 'web'`, `CHECK (platform IN ('web','ios','android'))`) and `push_subscriptions.token` (`text`, nullable) — consumed by Task 2's `dispatchNotification()` and by later (out-of-scope) native subscribe work.

- [ ] **Step 1: Write the failing migration-verification test**

Create `tests/api/push-subscriptions-platform-migration.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

test.describe('push_subscriptions platform migration', () => {
  let supabase: ReturnType<typeof createClient>

  test.beforeAll(() => {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  })

  test('platform column exists, defaults to web, is not nullable', async () => {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, column_default, is_nullable')
      .eq('table_name', 'push_subscriptions')
      .eq('column_name', 'platform')
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
    expect(data!.is_nullable).toBe('NO')
    expect(data!.column_default).toContain('web')
  })

  test('token column exists and is nullable', async () => {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, is_nullable')
      .eq('table_name', 'push_subscriptions')
      .eq('column_name', 'token')
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
    expect(data!.is_nullable).toBe('YES')
  })

  test('existing subscribe endpoint still creates a row defaulted to platform=web', async ({ request }) => {
    const testEndpoint = `https://test.push.example.com/test-${Date.now()}`

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
```

- [ ] **Step 2: Run the test to verify it fails**

With `npm run dev` running on port 4500 in another terminal, run:

`npx playwright test tests/api/push-subscriptions-platform-migration.spec.ts`

Expected: FAIL on the first two tests — `information_schema.columns` returns no row for `platform`/`token` because the columns don't exist yet (`error` is non-null, `.single()` errors on zero rows).

- [ ] **Step 3: Write the migration**

Create `supabase/migrations/20260825000000_add_platform_to_push_subscriptions.sql`:

```sql
-- Migration: Add platform and token columns to push_subscriptions
-- Enables native push delivery (iOS APNs / Android FCM) alongside existing
-- Web Push, as additive-only columns. Every existing row defaults to
-- platform = 'web', so existing subscribe/unsubscribe/send behavior is
-- unaffected.

ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS platform VARCHAR(10)
    NOT NULL DEFAULT 'web'
    CHECK (platform IN ('web', 'ios', 'android'));

ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS token TEXT;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_platform
  ON public.push_subscriptions(platform);
```

- [ ] **Step 4: Run the migration**

Run: `npm run db:migrate`

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx playwright test tests/api/push-subscriptions-platform-migration.spec.ts`

Expected: PASS — all three tests green.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260825000000_add_platform_to_push_subscriptions.sql tests/api/push-subscriptions-platform-migration.spec.ts
git commit -m "feat: add platform/token columns to push_subscriptions (additive)"
```

---

### Task 2: Platform-aware `dispatchNotification()`, wired into the send route

**Files:**
- Create: `src/lib/push/dispatch.ts`
- Modify: `src/app/api/notifications/send/route.ts` (replace the inline `web-push` call and local `NotificationPayload` type with the new module)
- Test: `tests/api/push-notification-dispatch.spec.ts`

**Interfaces:**
- Consumes: `push_subscriptions` row shape from Task 1 (`platform: 'web'|'ios'|'android'`, `subscription_data: any`, `token: string | null`, `endpoint: string`).
- Produces: `dispatchNotification(sub: PushSubscriptionRow, payload: NotificationPayload, sendWebPush?: WebPushSender): Promise<void>` and the `NotificationPayload` type — both imported by `send/route.ts`. `sendWebPush` is an optional injected dependency (defaults to the real `web-push` client) so tests never hit the network or a real subscriber.

- [ ] **Step 1: Write the failing unit test**

Create `tests/api/push-notification-dispatch.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'
import { dispatchNotification } from '../../src/lib/push/dispatch'

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
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/api/push-notification-dispatch.spec.ts`

Expected: FAIL with a module-not-found error — `src/lib/push/dispatch.ts` doesn't exist yet.

- [ ] **Step 3: Write `src/lib/push/dispatch.ts`**

```typescript
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
 * this module existed. 'ios'/'android' are typed extension points — no
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx playwright test tests/api/push-notification-dispatch.spec.ts`

Expected: PASS — all five tests green.

- [ ] **Step 5: Wire `dispatchNotification` into the send route**

In `src/app/api/notifications/send/route.ts`:

Remove the local `NotificationPayload` interface (lines 47–58) and the `import webpush from 'web-push';` line, replacing them with:

```typescript
import { dispatchNotification, NotificationPayload } from '@/lib/push/dispatch';
```

Remove the `notificationPayload` (serialized JSON) construction block — serialization now happens inside `dispatchNotification`.

Replace the inner `try` block of the `subscriptions.map(...)` call:

```typescript
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await dispatchNotification(sub, payload);
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
```

`initializeVapid()` and the rest of the route are unchanged — VAPID configuration is still set on the shared `web-push` module singleton, which `dispatch.ts`'s default sender also uses.

- [ ] **Step 6: Verify the full route still compiles and behaves correctly**

Run: `npm run type-check`

Expected: no new errors.

Run: `npx playwright test tests/api/push-notification-dispatch.spec.ts tests/api/push-subscriptions-platform-migration.spec.ts`

Expected: all 8 tests (5 + 3) still PASS — confirms the refactor didn't regress Task 1's migration test or Task 2's own unit tests.

- [ ] **Step 7: Lint**

Run: `npm run lint`

Expected: no new errors in `src/lib/push/dispatch.ts` or `src/app/api/notifications/send/route.ts`.

- [ ] **Step 8: Manual mobile-browser regression check**

On a real phone (or Chrome mobile-viewport devtools) with `npm run dev` running, open the app, log in as admin, go to the notifications settings UI (`components/pwa/NotificationSubscription.tsx`), and confirm subscribe/unsubscribe still works end-to-end and a test push sent via the admin notifications panel still arrives. This exercises the client → `/api/notifications/subscribe` → `/api/notifications/send` → `dispatchNotification` path exactly as a real user would, which the automated tests don't cover (they call the API directly).

- [ ] **Step 9: Commit**

```bash
git add src/lib/push/dispatch.ts src/app/api/notifications/send/route.ts tests/api/push-notification-dispatch.spec.ts
git commit -m "refactor: extract platform-aware dispatchNotification from send route"
```

---

## What happens after this plan

Once both tasks are merged and the test gate is green, the web push flow is provably unchanged (Task 1's third test proves the subscribe path; Task 2's tests prove the dispatch path) while the schema and dispatch layer are ready for native platforms. The Capacitor wrapper (new `ios/`/`android/` directories, remote-URL config) and the real APNs/FCM implementations behind the `'ios'`/`'android'` branches in `dispatch.ts` are separate follow-up plans — they need a Mac + Xcode, a Firebase project, and Apple/Google Developer accounts that are prerequisites, not something this plan can set up or verify.
