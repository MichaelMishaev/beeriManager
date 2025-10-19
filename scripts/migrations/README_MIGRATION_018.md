# Migration 018: Create Urgent Messages Table

**Date:** 2025-10-20
**Migration File:** `018_create_urgent_messages.sql`

## Purpose

Creates a database table for urgent messages and notifications shown to parents on the homepage. This replaces the JSON file-based storage to work properly in serverless environments like Vercel.

## What This Migration Does

1. **Creates `urgent_messages` table** with:
   - Bilingual content (Hebrew and Russian)
   - Message types: white_shirt, urgent, info, warning
   - Date range for displaying messages
   - Custom share text for WhatsApp sharing
   - Active/inactive status

2. **Adds indexes** for:
   - Active status
   - Date range queries
   - Message type filtering

3. **Configures Row Level Security (RLS)**:
   - Public users can view active messages within date range
   - Admins can manage all messages

4. **Sets up automatic `updated_at` trigger**

## How to Run

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `018_create_urgent_messages.sql`
4. Paste and run the migration

### Option 2: Supabase CLI
```bash
# Make sure you're in the project root
cd /path/to/beeriManager

# Run the migration
supabase db push --file scripts/migrations/018_create_urgent_messages.sql
```

## Data Migration

If you have existing urgent messages in `/src/data/urgent-messages.json`, you need to migrate them to the database:

```sql
-- Example: Insert existing messages (modify as needed)
INSERT INTO public.urgent_messages (
  type,
  title_he,
  title_ru,
  description_he,
  description_ru,
  share_text_he,
  share_text_ru,
  icon,
  color,
  is_active,
  start_date,
  end_date
) VALUES
(
  'white_shirt',
  'תזכורת: חולצה לבנה!',
  'Напоминание: белая рубашка!',
  'כל תלמידי בית הספר',
  'Для всех учеников школы',
  '👕 תזכורת: חולצה לבנה!\n\nכל תלמידי בית הספר בארי 💙',
  '👕 Напоминание: белая рубашка!\n\nДля всех учеников школы Беэри 💙',
  '👕',
  'bg-yellow-50',
  true,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '7 days'
);
```

## Verification

After running the migration:

```sql
-- Check table structure
\d public.urgent_messages

-- View policies
SELECT * FROM pg_policies WHERE tablename = 'urgent_messages';

-- Test query (should return active messages)
SELECT * FROM public.urgent_messages
WHERE is_active = true
  AND CURRENT_DATE >= start_date
  AND CURRENT_DATE <= end_date;
```

## Impact

- ✅ Urgent messages will now persist in the database
- ✅ Works in serverless environments (Vercel)
- ✅ Better performance with indexed queries
- ✅ RLS ensures proper access control
- ⚠️ Admin interface will now save to database instead of JSON file

## Files Changed

- `src/app/api/urgent-messages/route.ts` - Updated to use Supabase
- `src/app/api/urgent-messages/save/route.ts` - Updated to use Supabase
- `src/data/urgent-messages.json` - No longer used (can be removed after migration)

## Rollback

If you need to rollback this migration:

```sql
-- Drop the table (WARNING: This deletes all data!)
DROP TABLE IF EXISTS public.urgent_messages CASCADE;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_urgent_messages_updated_at() CASCADE;
```

## Notes

- The `color` field stores Tailwind CSS classes for styling
- The `icon` field typically stores emoji characters
- Date ranges are inclusive (start_date and end_date both included)
- RLS policies ensure public users only see active messages within the date range
