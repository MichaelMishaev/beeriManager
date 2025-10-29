-- Enhance feedback system with new status options and task linking
-- Add new status values: done, in_progress, other
-- Add status_comment for custom status text
-- Add task_id to link feedback to tasks

-- First, let's check if the table has the old status constraint and drop it
DO $$
BEGIN
  -- Drop existing check constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'anonymous_feedback_status_check'
  ) THEN
    ALTER TABLE anonymous_feedback DROP CONSTRAINT anonymous_feedback_status_check;
  END IF;
END $$;

-- Add status_comment column for custom status text (when status = 'other')
ALTER TABLE anonymous_feedback
ADD COLUMN IF NOT EXISTS status_comment TEXT;

-- Add task_id column to link feedback to tasks
ALTER TABLE anonymous_feedback
ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;

-- Add updated status type with new values
-- We need to do this by altering the column type
ALTER TABLE anonymous_feedback
ALTER COLUMN status TYPE TEXT;

-- Add a new check constraint with all status values
ALTER TABLE anonymous_feedback
ADD CONSTRAINT anonymous_feedback_status_check
CHECK (status IN ('new', 'read', 'responded', 'done', 'in_progress', 'other'));

-- Create index on task_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_feedback_task_id ON anonymous_feedback(task_id);

-- Add comment to document the new fields
COMMENT ON COLUMN anonymous_feedback.status_comment IS 'Custom status description when status is "other"';
COMMENT ON COLUMN anonymous_feedback.task_id IS 'Reference to task created from this feedback';
