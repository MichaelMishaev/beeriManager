# Migration 012 - Make Task due_date Optional

## Overview
This migration removes the NOT NULL constraint from the `due_date` column in the `tasks` table, allowing tasks to be created without a specific deadline.

## How to Apply

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `012_make_task_due_date_optional.sql`
5. Click **Run**

### Option 2: Via psql (if you have direct DB access)
```bash
psql -h [YOUR_SUPABASE_HOST] -U postgres -d postgres < scripts/migrations/012_make_task_due_date_optional.sql
```

## Migration SQL
```sql
BEGIN;

ALTER TABLE tasks
  ALTER COLUMN due_date DROP NOT NULL;

COMMENT ON COLUMN tasks.due_date IS 'Optional target date for task completion. NULL for ongoing/open-ended tasks';

COMMIT;
```

## Verification
After running the migration, verify it was successful:

```sql
-- Check the column is now nullable
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'tasks' AND column_name = 'due_date';

-- Expected result: is_nullable should be 'YES'
```

## Impact
- ✅ **Breaking Change**: NO - existing tasks with due_dates are unaffected
- ✅ **Data Loss**: NO - no data is modified
- ✅ **Rollback Safe**: YES - can easily revert by adding NOT NULL back
- ⚠️ **Application Code**: Already updated to handle optional due_date

## Rollback (if needed)
If you need to revert this change:

```sql
BEGIN;

-- First, set a default date for any NULL values
UPDATE tasks SET due_date = CURRENT_DATE WHERE due_date IS NULL;

-- Then add back the NOT NULL constraint
ALTER TABLE tasks
  ALTER COLUMN due_date SET NOT NULL;

COMMIT;
```

## Files Changed
- ✅ Database migration: `scripts/migrations/012_make_task_due_date_optional.sql`
- ✅ TypeScript types: `src/types/index.ts` (Task.due_date now optional)
- ✅ Form validation: Both new and edit task pages updated
- ✅ UI Components: Smart date picker component added
- ✅ User feedback: "Coming soon" badges for reminder functionality

## Testing Checklist
After applying the migration:

- [ ] Create a new task WITHOUT a due date
- [ ] Create a new task WITH a due date
- [ ] Edit an existing task and remove its due date
- [ ] Edit an existing task and add a due date
- [ ] Verify task list displays correctly for tasks with/without due dates
- [ ] Check that task filtering and sorting still works

---

**Status**: Ready to apply
**Date Created**: 2025-10-07
**Applied**: ❌ Not yet
