-- Migration 017: Add Russian translation columns to events table
-- This migration adds support for Russian translations of event content

-- Add Russian columns to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS title_ru TEXT,
ADD COLUMN IF NOT EXISTS description_ru TEXT,
ADD COLUMN IF NOT EXISTS location_ru TEXT;

-- Create index for Russian title searches
CREATE INDEX IF NOT EXISTS idx_events_title_ru ON events(title_ru);

-- Add comment
COMMENT ON COLUMN events.title_ru IS 'Russian translation of event title';
COMMENT ON COLUMN events.description_ru IS 'Russian translation of event description';
COMMENT ON COLUMN events.location_ru IS 'Russian translation of event location';
