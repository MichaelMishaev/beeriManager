-- Migration: Add grocery activity log table
-- This table tracks all actions on grocery items (claim, unclaim, add, remove, edit)

CREATE TABLE IF NOT EXISTS grocery_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grocery_event_id UUID NOT NULL REFERENCES grocery_events(id) ON DELETE CASCADE,
  item_id UUID REFERENCES grocery_items(id) ON DELETE SET NULL,

  -- Action details
  action VARCHAR(20) NOT NULL CHECK (action IN ('claimed', 'unclaimed', 'added', 'removed', 'edited')),
  item_name VARCHAR(255) NOT NULL,
  quantity INTEGER DEFAULT 1,

  -- Who performed the action
  user_name VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Index for fast lookups
  CONSTRAINT valid_action CHECK (action IN ('claimed', 'unclaimed', 'added', 'removed', 'edited'))
);

-- Index for fetching activities by grocery event
CREATE INDEX IF NOT EXISTS idx_grocery_activity_log_event_id ON grocery_activity_log(grocery_event_id);
CREATE INDEX IF NOT EXISTS idx_grocery_activity_log_created_at ON grocery_activity_log(created_at DESC);

-- Enable RLS
ALTER TABLE grocery_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read activities (public lists)
CREATE POLICY "Anyone can read grocery activities"
  ON grocery_activity_log
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert activities (for claims/unclaims)
CREATE POLICY "Anyone can insert grocery activities"
  ON grocery_activity_log
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE grocery_activity_log IS 'Tracks all actions on grocery list items';
