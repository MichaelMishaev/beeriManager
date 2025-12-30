-- Add other_specialty column to parent_skill_responses table
-- This column stores the specific skill/specialty when "other" is selected

ALTER TABLE parent_skill_responses
ADD COLUMN other_specialty TEXT;

-- Add comment for documentation
COMMENT ON COLUMN parent_skill_responses.other_specialty IS 'Specific skill/specialty description when "other" category is selected (required if "other" is in skills array)';

-- Update the full-text search index to include other_specialty
DROP INDEX IF EXISTS idx_parent_skills_search;

CREATE INDEX idx_parent_skills_search ON parent_skill_responses USING GIN (
  to_tsvector('simple',
    COALESCE(parent_name, '') || ' ' ||
    COALESCE(additional_notes, '') || ' ' ||
    COALESCE(other_specialty, '')
  )
);
