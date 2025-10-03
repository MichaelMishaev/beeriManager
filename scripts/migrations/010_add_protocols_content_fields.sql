-- Migration: Add missing content fields to protocols table
-- Description: Add agenda, decisions, action_items columns
-- Date: 2025-10-03

-- Add missing content columns
ALTER TABLE protocols
ADD COLUMN IF NOT EXISTS agenda TEXT,
ADD COLUMN IF NOT EXISTS decisions TEXT,
ADD COLUMN IF NOT EXISTS action_items TEXT,
ADD COLUMN IF NOT EXISTS document_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_urls TEXT[] DEFAULT '{}';

-- Add comments
COMMENT ON COLUMN protocols.agenda IS 'Meeting agenda items';
COMMENT ON COLUMN protocols.decisions IS 'Decisions made during the meeting';
COMMENT ON COLUMN protocols.action_items IS 'Action items and tasks from the meeting';
COMMENT ON COLUMN protocols.document_url IS 'Main protocol document filename';
COMMENT ON COLUMN protocols.attachment_urls IS 'Additional attachment filenames';
