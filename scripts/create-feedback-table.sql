-- Create anonymous_feedback table with correct schema
-- This matches the TypeScript interface in admin/feedback/page.tsx

CREATE TABLE IF NOT EXISTS public.anonymous_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('general', 'event', 'task', 'suggestion', 'complaint', 'other')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  parent_name TEXT,
  contact_email TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
  response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_category ON public.anonymous_feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.anonymous_feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.anonymous_feedback(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.anonymous_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert feedback (anonymous submission)
CREATE POLICY "Anyone can insert feedback"
  ON public.anonymous_feedback
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only authenticated users (admins) can read feedback
CREATE POLICY "Admins can read all feedback"
  ON public.anonymous_feedback
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users (admins) can update feedback
CREATE POLICY "Admins can update feedback"
  ON public.anonymous_feedback
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON public.anonymous_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
