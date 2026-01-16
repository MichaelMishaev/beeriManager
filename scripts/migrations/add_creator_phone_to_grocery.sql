-- Add creator_phone column to grocery_events table
ALTER TABLE grocery_events 
ADD COLUMN IF NOT EXISTS creator_phone VARCHAR(10);

-- Add index for phone lookup
CREATE INDEX IF NOT EXISTS idx_grocery_events_creator_phone 
ON grocery_events(creator_phone) 
WHERE creator_phone IS NOT NULL;

-- Comment
COMMENT ON COLUMN grocery_events.creator_phone IS 'Creator phone for My Grocery Lists lookup';
