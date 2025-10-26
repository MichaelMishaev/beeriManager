-- Run this SQL in your Supabase SQL Editor to add the completion_comment column
-- Migration: Add completion_comment to tasks table

-- Add completion_comment column to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS completion_comment text;

COMMENT ON COLUMN tasks.completion_comment IS 'Optional comment explaining why the task was completed or cancelled';

-- Create index for faster queries when filtering by completion comments
CREATE INDEX IF NOT EXISTS idx_tasks_completion_comment ON tasks(completion_comment) WHERE completion_comment IS NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks' AND column_name = 'completion_comment';
