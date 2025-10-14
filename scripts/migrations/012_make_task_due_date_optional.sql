-- Migration 012: Make task due_date optional
-- Reason: Allow flexible task creation for ongoing/long-term tasks without specific deadlines

BEGIN;

-- Remove NOT NULL constraint from due_date
ALTER TABLE tasks
  ALTER COLUMN due_date DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN tasks.due_date IS 'Optional target date for task completion. NULL for ongoing/open-ended tasks';

COMMIT;
