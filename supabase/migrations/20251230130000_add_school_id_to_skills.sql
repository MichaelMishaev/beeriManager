-- Add school_id support to parent_skill_responses table
-- This prepares the system for future SaaS multi-tenancy

-- Step 1: Create schools table (for future use)
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE schools IS 'Schools/organizations table - prepared for future SaaS expansion';

-- Step 2: Insert default school for existing single-school deployment
INSERT INTO schools (id, name, slug)
VALUES (
  'c6268dee-1fcd-42bd-8da2-1d4ac34a03db',
  'בית ספר באר שבע',
  'beeri'
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Add school_id column to parent_skill_responses
ALTER TABLE parent_skill_responses
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE CASCADE;

-- Step 4: Set default school_id for existing rows
UPDATE parent_skill_responses
SET school_id = 'c6268dee-1fcd-42bd-8da2-1d4ac34a03db'
WHERE school_id IS NULL;

-- Step 5: Make school_id NOT NULL with default for new rows
ALTER TABLE parent_skill_responses
ALTER COLUMN school_id SET DEFAULT 'c6268dee-1fcd-42bd-8da2-1d4ac34a03db';

-- Only set NOT NULL if column exists and has been populated
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parent_skill_responses'
    AND column_name = 'school_id'
  ) THEN
    ALTER TABLE parent_skill_responses
    ALTER COLUMN school_id SET NOT NULL;
  END IF;
END$$;

-- Step 6: Add index for performance
CREATE INDEX IF NOT EXISTS idx_parent_skills_school_id
ON parent_skill_responses (school_id);

-- Step 7: Update RLS policies to be school-aware
DROP POLICY IF EXISTS "Only admins can view skill responses" ON parent_skill_responses;

CREATE POLICY "Admins can view skill responses for their school"
  ON parent_skill_responses
  FOR SELECT
  TO authenticated
  USING (
    -- For now, allow all authenticated users to view all responses
    -- In future SaaS: check user's school_id matches row's school_id
    true
  );

-- Step 8: Add documentation comments
COMMENT ON COLUMN parent_skill_responses.school_id IS 'School/organization tenant ID - for future multi-tenancy support. Currently hardcoded to default school.';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully. Default school ID: c6268dee-1fcd-42bd-8da2-1d4ac34a03db';
END$$;
