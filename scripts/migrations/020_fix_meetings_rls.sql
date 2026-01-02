-- Migration 020: Fix Meetings RLS Policies
-- Purpose: Disable RLS since authentication is handled at API level with JWT
-- Date: 2026-01-02

BEGIN;

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view open meetings" ON public.meetings;
DROP POLICY IF EXISTS "Admins can view all meetings" ON public.meetings;
DROP POLICY IF EXISTS "Admins can create meetings" ON public.meetings;
DROP POLICY IF EXISTS "Admins can update meetings" ON public.meetings;
DROP POLICY IF EXISTS "Admins can delete meetings" ON public.meetings;

DROP POLICY IF EXISTS "Anyone can view ideas for open meetings" ON public.meeting_ideas;
DROP POLICY IF EXISTS "Anyone can submit ideas to open meetings" ON public.meeting_ideas;
DROP POLICY IF EXISTS "Admins can view all ideas" ON public.meeting_ideas;
DROP POLICY IF EXISTS "Admins can delete ideas" ON public.meeting_ideas;

-- Disable RLS (authentication is handled at API level with JWT)
ALTER TABLE public.meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_ideas DISABLE ROW LEVEL SECURITY;

COMMIT;
