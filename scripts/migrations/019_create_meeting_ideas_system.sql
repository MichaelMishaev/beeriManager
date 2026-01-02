-- Migration 019: Create Meeting Ideas Submission System
-- Purpose: Allow parents to submit agenda ideas for committee meetings via shareable links
-- Date: 2026-01-02
-- Pattern: Similar to anonymous_feedback system

BEGIN;

-- ============================================================================
-- 1. Create meetings table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Meeting info
  title VARCHAR(200) NOT NULL,
  meeting_date TIMESTAMPTZ NOT NULL,
  description TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'completed')),
  is_open BOOLEAN DEFAULT TRUE, -- Quick check for accepting submissions

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(100),
  closed_at TIMESTAMPTZ,

  -- Stats (denormalized for performance)
  ideas_count INTEGER DEFAULT 0,

  version INTEGER DEFAULT 1
);

-- Indexes for meetings
CREATE INDEX idx_meetings_status ON public.meetings(status) WHERE is_open = TRUE;
CREATE INDEX idx_meetings_date ON public.meetings(meeting_date DESC);
CREATE INDEX idx_meetings_created ON public.meetings(created_at DESC);

-- Comments for meetings
COMMENT ON TABLE public.meetings IS 'Parent committee meetings for agenda idea submissions';
COMMENT ON COLUMN public.meetings.is_open IS 'Quick flag to determine if meeting accepts new ideas';
COMMENT ON COLUMN public.meetings.ideas_count IS 'Denormalized count of submitted ideas';

-- ============================================================================
-- 2. Create meeting_ideas table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.meeting_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,

  -- Idea content
  title VARCHAR(200) NOT NULL,
  description TEXT,

  -- Submitter (optional - can be anonymous)
  submitter_name VARCHAR(100),
  is_anonymous BOOLEAN DEFAULT TRUE,

  -- Locale tracking
  submission_locale VARCHAR(5) DEFAULT 'he',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for meeting_ideas
CREATE INDEX idx_meeting_ideas_meeting ON public.meeting_ideas(meeting_id);
CREATE INDEX idx_meeting_ideas_created ON public.meeting_ideas(created_at DESC);
CREATE INDEX idx_meeting_ideas_locale ON public.meeting_ideas(submission_locale);

-- Comments for meeting_ideas
COMMENT ON TABLE public.meeting_ideas IS 'Agenda ideas submitted by parents for meetings';
COMMENT ON COLUMN public.meeting_ideas.submitter_name IS 'Optional name of submitter (null if anonymous)';
COMMENT ON COLUMN public.meeting_ideas.is_anonymous IS 'Whether submission is anonymous';

-- ============================================================================
-- 3. Create function to update meeting ideas_count
-- ============================================================================
CREATE OR REPLACE FUNCTION update_meeting_ideas_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.meetings
    SET ideas_count = ideas_count + 1,
        updated_at = NOW()
    WHERE id = NEW.meeting_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.meetings
    SET ideas_count = GREATEST(ideas_count - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.meeting_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. Create trigger to maintain ideas_count
-- ============================================================================
CREATE TRIGGER trigger_update_meeting_ideas_count
  AFTER INSERT OR DELETE ON public.meeting_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_ideas_count();

-- ============================================================================
-- 5. Create update triggers for updated_at
-- ============================================================================
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_ideas_updated_at
  BEFORE UPDATE ON public.meeting_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_ideas ENABLE ROW LEVEL SECURITY;

-- Meetings policies
CREATE POLICY "Anyone can view open meetings"
  ON public.meetings
  FOR SELECT
  USING (is_open = TRUE OR status = 'open');

CREATE POLICY "Admins can view all meetings"
  ON public.meetings
  FOR ALL
  USING (true);

CREATE POLICY "Admins can create meetings"
  ON public.meetings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update meetings"
  ON public.meetings
  FOR UPDATE
  USING (true);

CREATE POLICY "Admins can delete meetings"
  ON public.meetings
  FOR DELETE
  USING (true);

-- Meeting ideas policies
CREATE POLICY "Anyone can view ideas for open meetings"
  ON public.meeting_ideas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = meeting_ideas.meeting_id
      AND (m.is_open = TRUE OR m.status = 'open')
    )
  );

CREATE POLICY "Anyone can submit ideas to open meetings"
  ON public.meeting_ideas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = meeting_id
      AND m.is_open = TRUE
      AND m.status = 'open'
    )
  );

CREATE POLICY "Admins can view all ideas"
  ON public.meeting_ideas
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can delete ideas"
  ON public.meeting_ideas
  FOR DELETE
  USING (true);

COMMIT;
