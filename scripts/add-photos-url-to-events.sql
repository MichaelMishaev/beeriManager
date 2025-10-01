-- Add photos_url column to events table for Google Photos/Drive integration
-- This allows linking event photo galleries (one folder per event)

ALTER TABLE events ADD COLUMN IF NOT EXISTS photos_url TEXT;

COMMENT ON COLUMN events.photos_url IS 'Google Photos/Drive shared folder URL for event photos';
