# Migration 013: Push Notifications Table

## Overview
Creates the `push_subscriptions` table to store PWA push notification subscriptions.

## Changes
- Creates `push_subscriptions` table with fields for endpoint, keys, and subscription data
- Adds indexes for performance
- Enables RLS (Row Level Security)
- Adds automatic `updated_at` trigger

## How to Run
```bash
# Using Supabase CLI
supabase db push

# Or using psql
psql $DATABASE_URL < scripts/migrations/013_create_push_subscriptions.sql
```

## Testing
After running the migration, verify:
```sql
-- Check table exists
SELECT * FROM push_subscriptions LIMIT 1;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'push_subscriptions';
```

## Rollback
```sql
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP FUNCTION IF EXISTS update_push_subscriptions_updated_at();
```

## Dependencies
- Requires `auth.users` table (from Supabase Auth)
- PostgreSQL with UUID extension

## Notes
- The `user_id` field is optional (nullable) to support anonymous subscriptions
- Endpoint must be unique to prevent duplicate subscriptions
- Inactive subscriptions are kept for analytics but not used for sending notifications
