-- Add attendees column to protocols table
-- This column stores the list of meeting attendees as a JSON array

ALTER TABLE protocols
ADD COLUMN IF NOT EXISTS attendees jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN protocols.attendees IS 'List of meeting attendees (names)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_protocols_attendees ON protocols USING gin(attendees);
