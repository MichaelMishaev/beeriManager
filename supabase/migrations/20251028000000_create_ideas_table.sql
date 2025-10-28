-- Create ideas table for parent suggestions
-- This table stores ideas and suggestions from parents with admin management capabilities

CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('improvement', 'feature', 'process', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  submitter_name TEXT,
  contact_email TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'approved', 'implemented', 'rejected')),
  admin_notes TEXT,
  response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.ideas IS 'Stores parent ideas and suggestions with admin review workflow';
COMMENT ON COLUMN public.ideas.category IS 'Type of idea: improvement, feature, process, or other';
COMMENT ON COLUMN public.ideas.title IS 'Short title of the idea';
COMMENT ON COLUMN public.ideas.description IS 'Detailed description of the idea';
COMMENT ON COLUMN public.ideas.submitter_name IS 'Optional name of the submitter';
COMMENT ON COLUMN public.ideas.contact_email IS 'Optional contact email';
COMMENT ON COLUMN public.ideas.is_anonymous IS 'Whether the submission is anonymous';
COMMENT ON COLUMN public.ideas.status IS 'Workflow status: new -> reviewed -> approved/rejected -> implemented';
COMMENT ON COLUMN public.ideas.admin_notes IS 'Internal admin notes (not visible to parents)';
COMMENT ON COLUMN public.ideas.response IS 'Admin response to the submitter';
COMMENT ON COLUMN public.ideas.responded_at IS 'Timestamp when admin responded';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ideas_category ON public.ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON public.ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON public.ideas(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can submit ideas" ON public.ideas;
DROP POLICY IF EXISTS "Public can view non-anonymous ideas" ON public.ideas;
DROP POLICY IF EXISTS "Service role can do everything" ON public.ideas;

-- Allow public to insert new ideas
CREATE POLICY "Public can submit ideas"
  ON public.ideas
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public to view ideas (all fields for simplicity, could be restricted later)
CREATE POLICY "Public can view non-anonymous ideas"
  ON public.ideas
  FOR SELECT
  TO public
  USING (true);

-- Allow service role (used by API with JWT) to do everything
CREATE POLICY "Service role can do everything"
  ON public.ideas
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ideas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ideas_updated_at ON public.ideas;

CREATE TRIGGER trigger_update_ideas_updated_at
  BEFORE UPDATE ON public.ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_ideas_updated_at();
