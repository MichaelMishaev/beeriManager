-- Add student_grade column to parent_skill_responses table
ALTER TABLE parent_skill_responses
ADD COLUMN student_grade TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN parent_skill_responses.student_grade IS 'Grade/class of the parent''s child at time of submission (e.g., "א", "ב", "יב")';

-- Create index for filtering by grade
CREATE INDEX idx_parent_skill_responses_grade ON parent_skill_responses(student_grade);

-- Note: created_at timestamp already exists and will be used to track submission year
