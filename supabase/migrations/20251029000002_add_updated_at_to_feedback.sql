-- Add updated_at column to anonymous_feedback if missing
-- This is needed because there's a trigger that tries to set this field

ALTER TABLE anonymous_feedback
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows to have updated_at
UPDATE anonymous_feedback
SET updated_at = created_at
WHERE updated_at IS NULL;

COMMENT ON COLUMN anonymous_feedback.updated_at IS 'Timestamp of last update';
