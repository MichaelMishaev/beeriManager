# Feedback-Task Bidirectional Linking Migration

## Quick Setup (Required before using new feedback-task features)

The feedback and task systems have been enhanced with bidirectional linking, but require database migrations.

### Option 1: Run via Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor:**
   - Go to: https://app.supabase.com/project/wkfxwnayexznjhcktwwu/sql
   - Or navigate to: Your Project → SQL Editor → New Query

2. **Copy and paste BOTH migrations:**

#### Migration 1: Enhance Feedback Table

```sql
-- Drop existing constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'anonymous_feedback_status_check'
  ) THEN
    ALTER TABLE anonymous_feedback DROP CONSTRAINT anonymous_feedback_status_check;
  END IF;
END $$;

-- Add new columns
ALTER TABLE anonymous_feedback ADD COLUMN IF NOT EXISTS status_comment TEXT;
ALTER TABLE anonymous_feedback ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;

-- Alter status type
ALTER TABLE anonymous_feedback ALTER COLUMN status TYPE TEXT;

-- Add new constraint
ALTER TABLE anonymous_feedback
ADD CONSTRAINT anonymous_feedback_status_check
CHECK (status IN ('new', 'read', 'responded', 'done', 'in_progress', 'other'));

-- Create index
CREATE INDEX IF NOT EXISTS idx_feedback_task_id ON anonymous_feedback(task_id);

-- Add comments
COMMENT ON COLUMN anonymous_feedback.status_comment IS 'Custom status description when status is "other"';
COMMENT ON COLUMN anonymous_feedback.task_id IS 'Reference to task created from this feedback';
```

#### Migration 2: Add Feedback Link to Tasks

```sql
-- Add feedback_id to tasks table for bidirectional linking
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS feedback_id UUID REFERENCES anonymous_feedback(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_feedback_id ON tasks(feedback_id);

-- Add comment to document the field
COMMENT ON COLUMN tasks.feedback_id IS 'Reference to feedback that this task was created from';
```

3. **Click "Run" button**

4. **Verify the migration:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'anonymous_feedback'
  AND column_name IN ('task_id', 'status_comment', 'status')
ORDER BY column_name;
```

You should see:
- `status` - text - YES
- `status_comment` - text - YES
- `task_id` - uuid - YES

### Option 2: Use Migration File

The same SQL is available in:
- `supabase/migrations/20251029000000_enhance_feedback_system.sql`
- `scripts/apply-feedback-migration.sql`

### What This Migration Adds:

1. **New Status Options:**
   - `done` (בוצע) - Feedback has been resolved
   - `in_progress` (בטיפול) - Being worked on
   - `other` (אחר) - Custom status with comment

2. **Task Linking:**
   - `task_id` - Link feedback to tasks
   - Allows creating tasks directly from feedback

3. **Custom Status Comments:**
   - `status_comment` - Custom text for "other" status

### After Migration:

1. Restart your development server
2. The feedback page will now show:
   - Delete button for each feedback
   - Status dropdown with new options
   - "Create Task" button
   - Linked task details (if exists)

### Troubleshooting:

If you get an error about the constraint already existing, run just this:
```sql
ALTER TABLE anonymous_feedback DROP CONSTRAINT IF EXISTS anonymous_feedback_status_check;
```

Then run the full migration again.
