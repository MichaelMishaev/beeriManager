# App Store Submission Design

**Date**: 2026-08-25
**Status**: Approved (design phase) — pending implementation plan

## Goal

Ship BeeriManager as a native app on the Apple App Store and Google Play, while making **zero regressions** to the existing web PWA (`beeri.online`) — every current browser and "Add to Home Screen" user must keep working exactly as they do today.

## Current architecture (verified)

- **PWA**: `@ducanh2912/next-pwa` in `next.config.js` — auto-generated service worker in `public/`, `register: true`, `skipWaiting: true`. No native wrapper exists anywhere in the repo (`ios/`, `android/`, Capacitor/Cordova configs all absent).
- **Manifest** (`public/manifest.json`): Hebrew name, `dir: rtl`, `display: standalone`, full icon set, shortcuts, `screenshots` array already present.
- **Push notifications** (`src/lib/notifications.ts`): Web Push only, via VAPID — `PushManager.subscribe()` → `/api/notifications/subscribe`. Web Push does not work inside a `WKWebView`/native Android shell, so this is the one subsystem that needs new code for native, not just a wrapper.
- **Auth** (`src/middleware.ts`): single JWT cookie (`auth-token`) gates `/admin`, `/tasks`, `/finances`, `/issues`. Everything else is public. No per-user accounts.

## Decisions (confirmed with user)

1. **Native push**: build real APNs (iOS) + FCM (Android) push, not just ship without it.
2. **Reviewer access**: give App Store / Play reviewers the real admin password in review notes — no separate demo account.
3. **Platforms**: iOS and Android both, from the start (`cap add ios` and `cap add android` together).

## Architecture

### 1. Native shell — Capacitor, remote-URL mode

Add Capacitor as a wrapper layer only. `capacitor.config.ts` sets `server.url` to `https://beeri.online`, so both native shells load the live deployed site — no static export, no bundled snapshot. This generates new `ios/` and `android/` native project directories (committed to git, per Capacitor convention, since they hold signing/native config not regeneratable from `package.json`).

**Nothing under `src/` changes for this part.** The Next.js app, middleware, and web PWA behavior are identical before and after.

### 2. Push notifications — multi-provider dispatch

This is the only subsystem that needs new application code.

- **iOS**: APNs via `@capacitor/push-notifications` (client) + `node-apn` or equivalent (server). Requires an Apple Push key (`.p8`), Team ID, Key ID from the Apple Developer account.
- **Android**: FCM via the same Capacitor plugin (client) + `firebase-admin` (server). Requires a Firebase project.
- **Schema**: extend the existing `push_subscriptions` table (Supabase, read/written by `src/app/api/notifications/subscribe`, `unsubscribe`, and `send`) with `platform` (`'web' | 'ios' | 'android'`, **default `'web'`**, nullable-safe) and a generalized `token` field for APNs/FCM string tokens (distinct from the JSON `PushSubscription` object web push uses).
- **Client** (`lib/notifications.ts`): branch on `Capacitor.isNativePlatform()`.
  - `true` → **dynamically import** (`await import(...)`) the native push plugin and use it. Dynamic import is required, not optional — a static import would bundle Capacitor's JS into the regular web build for every browser user, which is itself a regression (bundle size, and risk of code touching `navigator`/`window` in ways a normal browser tab doesn't expect).
  - `false`, or anything uncertain about the check → fall through to the existing, unmodified Web Push path. The check must fail closed to current behavior, never to a broken/throwing path.
- **Server dispatch**: one function reads each subscription's `platform` column and calls the matching provider (existing web-push lib / node-apn / firebase-admin). Existing `/api/notifications/subscribe` and `/api/notifications/unsubscribe` routes require **no changes** to keep working for web subscribers — the new column defaults safely.

### 3. Store assets & release mechanics

- Native app icons generated from the existing `public/icons/icon-512x512.png` (e.g. via `@capacitor/assets`) — separate size set from PWA icons.
- **iOS**: Apple Developer Program enrollment, Xcode + Mac for build/sign/archive, App Store Connect listing, Hebrew (+ English fallback) metadata, privacy policy URL, review notes with admin password.
- **Android**: Google Play Console enrollment ($25 one-time), signed AAB, Play listing, same privacy policy URL and review notes.

### 4. What explicitly does NOT change

Web app code, all API routes (aside from the additive push-token columns), Supabase RLS policies, i18n, Vercel deploy pipeline, and the experience of every current browser/home-screen-PWA user.

## Regression Safety (hard requirements, not suggestions)

1. **Dynamic import only** for any Capacitor/native-push package inside web-served code — never a static top-level import in `lib/notifications.ts` or anywhere else reachable by the browser bundle.
2. **Additive-only migration** — new columns nullable / defaulted, zero required changes to existing read/write paths for web push.
3. **Fail-closed feature detection** — `Capacitor.isNativePlatform()` uncertain or absent → existing Web Push path runs unmodified.
4. **Phased rollout, each phase gated on regression tests before the next starts:**
   - Phase 1: DB migration only (additive columns) → run full Playwright suite, confirm zero diff in web push behavior.
   - Phase 2: server dispatch-function refactor (web-push-only in practice, since no native tokens exist yet) → same gate.
   - Phase 3: Capacitor wrapper added (`ios/`, `android/` dirs, remote URL config) → verify `beeri.online` web app is byte-for-byte unaffected.
   - Phase 4: native push wiring (APNs/FCM) → new code only; existing web notification tests must still pass unchanged.
5. **Explicit test gate per phase**: `npm run type-check`, `npm run lint`, full Playwright suite (including mobile viewport tests), plus a manual check that subscribe/unsubscribe still works on a real mobile browser — matching the project's existing pre-commit checklist, applied per phase rather than once at the end.

## Open items / prerequisites (not design decisions, just logistics)

- Apple Developer Program account ($99/yr) and Google Play Console account ($25 one-time) — must be enrolled by the project owner.
- A Mac + Xcode for iOS builds/signing.
- Firebase project creation for FCM.
- Store listing content: Hebrew (+ English) screenshots and descriptions, privacy policy page.
