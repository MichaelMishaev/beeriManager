-- Add completion_comment column to tasks table
-- This field stores an optional comment explaining why a task was completed or cancelled

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS completion_comment text;

COMMENT ON COLUMN tasks.completion_comment IS 'Optional comment explaining why the task was completed or cancelled';

-- Create index for faster queries when filtering by completion comments
CREATE INDEX IF NOT EXISTS idx_tasks_completion_comment ON tasks(completion_comment) WHERE completion_comment IS NOT NULL;
