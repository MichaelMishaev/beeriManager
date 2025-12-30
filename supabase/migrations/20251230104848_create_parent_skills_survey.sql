-- Parent Skill Directory - Survey System
-- Creates tables and policies for parent skill survey feature

-- Create enum for skill categories
CREATE TYPE skill_category AS ENUM (
  'photography',          -- צילום
  'legal',               -- משפטי
  'medical',             -- רפואי
  'handyman',            -- שיפוצים
  'graphic_design',      -- גרפיקה ועיצוב
  'it_technology',       -- IT וטכנולוגיה
  'arts',                -- אומנות
  'cooking_catering',    -- בישול והסעדה
  'sewing_fashion',      -- תפירה ואופנה
  'translation',         -- תרגום
  'accounting',          -- חשבונאות
  'teaching_tutoring',   -- הוראה ושיעורים
  'driving_transport',   -- נהיגה והסעות
  'event_planning',      -- תכנון אירועים
  'music',               -- מוזיקה
  'video_editing',       -- עריכת וידאו
  'social_media',        -- ניהול רשתות חברתיות
  'writing_editing',     -- כתיבה ועריכה
  'gardening',           -- גינון
  'cleaning',            -- ניקיון
  'other'                -- אחר
);

-- Create enum for contact preferences
CREATE TYPE contact_preference AS ENUM (
  'phone',
  'email',
  'whatsapp',
  'any'  -- כל אמצעי
);

-- Main table for parent skill responses
CREATE TABLE parent_skill_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact Information (all optional except phone_number)
  parent_name TEXT,  -- Optional, allows anonymous responses
  phone_number TEXT NOT NULL,  -- Required contact method
  email TEXT,  -- Optional

  -- Skills (stored as array of enums for multi-select)
  skills skill_category[] NOT NULL DEFAULT '{}',

  -- Contact Preferences
  preferred_contact contact_preference NOT NULL DEFAULT 'any',

  -- Additional Details
  additional_notes TEXT,  -- For "Other" skill details or availability notes

  -- Metadata
  submitted_locale VARCHAR(5) DEFAULT 'he',  -- Track submission language
  ip_address INET,  -- Optional: for duplicate detection
  user_agent TEXT,  -- Optional: for analytics

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_phone CHECK (phone_number IS NOT NULL AND length(trim(phone_number)) > 0),
  CONSTRAINT valid_skills CHECK (array_length(skills, 1) >= 1 AND array_length(skills, 1) <= 10)
);

-- Indexes for performance
CREATE INDEX idx_parent_skills_skills ON parent_skill_responses USING GIN (skills);
CREATE INDEX idx_parent_skills_created_at ON parent_skill_responses (created_at DESC);
CREATE INDEX idx_parent_skills_phone ON parent_skill_responses (phone_number) WHERE phone_number IS NOT NULL;
CREATE INDEX idx_parent_skills_email ON parent_skill_responses (email) WHERE email IS NOT NULL;

-- Full-text search index for parent names and notes
-- Using 'simple' configuration (works with Hebrew, just without stemming)
CREATE INDEX idx_parent_skills_search ON parent_skill_responses USING GIN (
  to_tsvector('simple', COALESCE(parent_name, '') || ' ' || COALESCE(additional_notes, ''))
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_parent_skill_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_parent_skill_responses_updated_at
  BEFORE UPDATE ON parent_skill_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_parent_skill_responses_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE parent_skill_responses ENABLE ROW LEVEL SECURITY;

-- Public can insert (submit form) - no authentication required
CREATE POLICY "Anyone can submit skill survey"
  ON parent_skill_responses
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated users (admins) can read - requires JWT auth
CREATE POLICY "Only admins can view skill responses"
  ON parent_skill_responses
  FOR SELECT
  TO authenticated
  USING (true);

-- No UPDATE or DELETE policies for regular users (one-time submission)
-- Admins can update/delete via direct Supabase access if needed

-- Comments for documentation
COMMENT ON TABLE parent_skill_responses IS 'Parent volunteer skill survey responses - one-time submissions, admin-only viewing';
COMMENT ON COLUMN parent_skill_responses.parent_name IS 'Optional - allows anonymous submissions';
COMMENT ON COLUMN parent_skill_responses.skills IS 'Array of skill categories the parent can offer (min 1, max 10)';
COMMENT ON COLUMN parent_skill_responses.preferred_contact IS 'Preferred method for committee to contact parent';
COMMENT ON COLUMN parent_skill_responses.ip_address IS 'For duplicate detection and spam prevention (optional)';
COMMENT ON COLUMN parent_skill_responses.submitted_locale IS 'Language locale at time of submission (he, ru, ar, en)';
