-- Migration 015: Add 'finished' status to tickets
-- Date: 2025-10-09
-- Purpose: Add "finished" status for games/events that are over
--          Finished tickets should NOT be shown to parents on the main page

-- Drop the old constraint
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS valid_status;

-- Add new constraint with 'finished' status
ALTER TABLE public.tickets
  ADD CONSTRAINT valid_status
  CHECK (status IN ('active', 'sold_out', 'expired', 'draft', 'finished'));

-- Update RLS policy to exclude 'finished' from public view
-- Drop old policy
DROP POLICY IF EXISTS "Public can view active tickets" ON public.tickets;

-- Create new policy: Only active and sold_out are visible to public (NOT finished)
CREATE POLICY "Public can view active tickets"
  ON public.tickets
  FOR SELECT
  USING (status IN ('active', 'sold_out'));

-- Add comment explaining the finished status
COMMENT ON COLUMN public.tickets.status IS 'Ticket status: active, sold_out, expired, draft, finished. Note: finished tickets are NOT shown to parents.';
