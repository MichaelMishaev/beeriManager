-- Migration: Add discussion_status to meeting_ideas
-- Allows admin to track per-subject discussion progress during meetings

ALTER TABLE public.meeting_ideas
  ADD COLUMN IF NOT EXISTS discussion_status VARCHAR(20)
    NOT NULL DEFAULT 'pending'
    CHECK (discussion_status IN ('pending', 'discussed', 'decided'));

CREATE INDEX IF NOT EXISTS idx_meeting_ideas_discussion_status
  ON public.meeting_ideas(meeting_id, discussion_status);

CREATE POLICY "Admins can update idea status"
  ON public.meeting_ideas
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
