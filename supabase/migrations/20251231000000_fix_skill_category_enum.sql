-- Fix skill_category enum and add missing other_specialty column
-- This fixes the "fundraising" error and adds other missing school support skills
-- Also adds other_specialty column that the form expects but was missing from database

-- BUG FIX #1: Add missing enum values to skill_category
-- Note: PostgreSQL doesn't support removing enum values, only adding
ALTER TYPE skill_category ADD VALUE IF NOT EXISTS 'language_tutoring';  -- שיעורי שפות
ALTER TYPE skill_category ADD VALUE IF NOT EXISTS 'science_stem';       -- מדע וטכנולוגיה STEM
ALTER TYPE skill_category ADD VALUE IF NOT EXISTS 'library_support';    -- סיוע בספרייה
ALTER TYPE skill_category ADD VALUE IF NOT EXISTS 'sports_coaching';    -- אימון ספורט
ALTER TYPE skill_category ADD VALUE IF NOT EXISTS 'childcare';          -- שמרטפות
ALTER TYPE skill_category ADD VALUE IF NOT EXISTS 'fundraising';        -- גיוס כספים (MAIN FIX)
ALTER TYPE skill_category ADD VALUE IF NOT EXISTS 'office_admin';       -- מזכירות וניהול

-- Note: 'cleaning' exists in DB but not in TypeScript - keeping it for backwards compatibility
-- If any responses used it, we don't want to break them

COMMENT ON TYPE skill_category IS 'Parent volunteer skill categories - updated 2025-12-31 to match TypeScript types';

-- BUG FIX #2: Add missing other_specialty column
-- The form and API expect this column but it was never created in the original migration
ALTER TABLE parent_skill_responses
ADD COLUMN IF NOT EXISTS other_specialty TEXT;

COMMENT ON COLUMN parent_skill_responses.other_specialty IS 'Custom specialty details when "other" skill category is selected';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Added 7 missing skill categories and other_specialty column';
END$$;
