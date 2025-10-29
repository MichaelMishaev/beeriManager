-- Add feedback_id to tasks table for bidirectional linking
-- This allows tasks to reference the feedback they were created from

-- Add feedback_id column to tasks
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS feedback_id UUID REFERENCES anonymous_feedback(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_feedback_id ON tasks(feedback_id);

-- Add comment to document the field
COMMENT ON COLUMN tasks.feedback_id IS 'Reference to feedback that this task was created from';
