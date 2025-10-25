# Attendees Migration Guide

## Problem
The `attendees` column was missing from the `protocols` table in the database. The UI code was trying to read/write attendees, but the database column didn't exist.

Existing protocols had attendees stored as HTML comments in the `extracted_text` field:
```html
<!-- ATTENDEES: מיכאל, יוסי, עמליה, בנימין, נועה -->
```

## Solution

### Step 1: Add Database Column

Run this SQL in Supabase SQL Editor:

```sql
ALTER TABLE protocols
ADD COLUMN IF NOT EXISTS attendees jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN protocols.attendees IS 'List of meeting attendees (names)';

CREATE INDEX IF NOT EXISTS idx_protocols_attendees ON protocols USING gin(attendees);
```

### Step 2: Migrate Existing Data

Extract attendees from HTML comments and populate the new column:

```sql
UPDATE protocols
SET attendees = (
  SELECT jsonb_agg(trim(both ' ' from name))
  FROM unnest(
    string_to_array(
      substring(
        extracted_text
        FROM '<!--\s*ATTENDEES:\s*([^-]+)\s*-->'
      ),
      ','
    )
  ) AS name
  WHERE trim(both ' ' from name) != ''
)
WHERE extracted_text ~ '<!--\s*ATTENDEES:'
  AND (attendees IS NULL OR attendees = '[]'::jsonb);
```

### Step 3: Verify Migration

Check migrated data:

```sql
SELECT
  id,
  title,
  attendees,
  substring(extracted_text FROM '<!--\s*ATTENDEES:[^-]+-->') as html_comment
FROM protocols
WHERE attendees IS NOT NULL AND attendees != '[]'::jsonb;
```

## After Migration

Once the column is added and data migrated:

1. **Edit Page** (`/he/admin/protocols/[id]`):
   - Attendees section will save to the `attendees` column
   - Input field, add/remove functionality works

2. **Detail Page** (`/he/protocols/[id]`):
   - Attendees will display in the sidebar under "פרטים"
   - Listed as bullet points

3. **New Protocols**:
   - Attendees are required (minimum 1)
   - Saved directly to `attendees` column

## Files Modified

- `/src/app/[locale]/(admin)/admin/protocols/[id]/page.tsx` - Edit page with attendees management
- `/src/app/[locale]/(admin)/admin/protocols/new/page.tsx` - New protocol page with attendees
- `/src/app/[locale]/protocols/[id]/page.tsx` - Detail page displays attendees
- `/supabase/migrations/20251026000000_add_attendees_column.sql` - Migration file

## Schema

```typescript
attendees: jsonb // Array of strings, e.g. ["מיכאל", "יוסי", "עמליה"]
```

Example in database:
```json
["מיכאל", "יוסי", "עמליה", "בנימין", "נועה"]
```
