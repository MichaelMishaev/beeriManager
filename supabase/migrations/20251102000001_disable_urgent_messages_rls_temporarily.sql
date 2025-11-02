-- Temporarily disable RLS on urgent_messages for debugging
-- This will allow us to determine if RLS is the issue

ALTER TABLE public.urgent_messages DISABLE ROW LEVEL SECURITY;

-- Add comment
COMMENT ON TABLE public.urgent_messages IS 'Urgent notifications - RLS temporarily disabled for debugging';
