-- Apply feedback enhancement migration
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Step 1: Drop existing constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'anonymous_feedback_status_check'
  ) THEN
    ALTER TABLE anonymous_feedback DROP CONSTRAINT anonymous_feedback_status_check;
  END IF;
END $$;

-- Step 2: Add status_comment column for custom status text
ALTER TABLE anonymous_feedback
ADD COLUMN IF NOT EXISTS status_comment TEXT;

-- Step 3: Add task_id column to link feedback to tasks
ALTER TABLE anonymous_feedback
ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;

-- Step 4: Alter status column type
ALTER TABLE anonymous_feedback
ALTER COLUMN status TYPE TEXT;

-- Step 5: Add new check constraint with all status values
ALTER TABLE anonymous_feedback
ADD CONSTRAINT anonymous_feedback_status_check
CHECK (status IN ('new', 'read', 'responded', 'done', 'in_progress', 'other'));

-- Step 6: Create index on task_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_feedback_task_id ON anonymous_feedback(task_id);

-- Step 7: Add comments to document the new fields
COMMENT ON COLUMN anonymous_feedback.status_comment IS 'Custom status description when status is "other"';
COMMENT ON COLUMN anonymous_feedback.task_id IS 'Reference to task created from this feedback';

-- Verify the changes
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'anonymous_feedback'
  AND column_name IN ('task_id', 'status_comment', 'status')
ORDER BY column_name;
