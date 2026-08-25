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
