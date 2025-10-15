# Migration 017: Add Russian Translation Support to Events

## Purpose
Adds Russian translation columns to the events table to support bilingual event content (Hebrew/Russian).

## Changes
- Adds `title_ru` column for Russian event titles
- Adds `description_ru` column for Russian event descriptions
- Adds `location_ru` column for Russian location names
- Creates index on `title_ru` for search performance

## How to Run

### Via Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to SQL Editor
4. Copy and paste the contents of `017_add_russian_to_events.sql`
5. Click "Run"

### Via psql
```bash
psql $DATABASE_URL -f scripts/migrations/017_add_russian_to_events.sql
```

## Rollback
If you need to rollback this migration:

```sql
ALTER TABLE events
DROP COLUMN IF EXISTS title_ru,
DROP COLUMN IF EXISTS description_ru,
DROP COLUMN IF EXISTS location_ru;

DROP INDEX IF EXISTS idx_events_title_ru;
```

## Notes
- Existing events will have NULL values for Russian columns
- Admin panel will allow entering Russian translations
- Display logic will show Russian version when user is on /ru locale
- Falls back to Hebrew if Russian translation is not available

## Testing
After running migration:
```sql
-- Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'events'
AND column_name LIKE '%_ru';

-- Test insert with Russian
INSERT INTO events (title, title_ru, start_datetime, event_type, status)
VALUES ('אירוע בדיקה', 'Тестовое событие', NOW(), 'general', 'published');
```
