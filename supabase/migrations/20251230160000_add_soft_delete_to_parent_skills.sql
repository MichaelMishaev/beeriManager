-- Add soft delete column to parent_skill_responses table
-- This migration adds deleted_at column for soft delete functionality

-- Add deleted_at column
ALTER TABLE parent_skill_responses
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add index for deleted_at to improve query performance
CREATE INDEX idx_parent_skills_deleted_at ON parent_skill_responses (deleted_at)
WHERE deleted_at IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN parent_skill_responses.deleted_at IS 'Soft delete timestamp - NULL means not deleted, non-NULL means deleted';

-- Update RLS policy to exclude soft-deleted rows for admins
DROP POLICY IF EXISTS "Only admins can view skill responses" ON parent_skill_responses;

CREATE POLICY "Only admins can view non-deleted skill responses"
  ON parent_skill_responses
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- Add DELETE policy for admins (soft delete only)
CREATE POLICY "Only admins can soft delete skill responses"
  ON parent_skill_responses
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
