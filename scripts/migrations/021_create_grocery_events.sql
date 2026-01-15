-- Migration 021: Create Grocery Events System (Items Pickup)
-- Purpose: Allow parents to create grocery lists for events and share via WhatsApp
-- Date: 2025-01-15
-- Risk: Medium (new tables, public access, no auth changes)

BEGIN;

-- ============================================================================
-- 1. Create grocery_events table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.grocery_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Share token for public access (URL-friendly, 8 chars)
  share_token VARCHAR(12) NOT NULL UNIQUE,

  -- Event details
  class_name VARCHAR(100) NOT NULL,           -- e.g., "כיתה ג'2"
  event_name VARCHAR(200) NOT NULL,           -- e.g., "מסיבת סוף שנה"
  event_date DATE,                            -- Optional date
  event_time TIME,                            -- Optional time
  event_address TEXT,                         -- Optional address/location

  -- Creator info (optional, for contact)
  creator_name VARCHAR(100),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active',  -- 'active', 'completed', 'archived'

  -- Stats (denormalized for performance)
  total_items INTEGER DEFAULT 0,
  claimed_items INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT grocery_events_valid_status CHECK (status IN ('active', 'completed', 'archived'))
);

-- Create indexes
CREATE INDEX idx_grocery_events_share_token ON public.grocery_events(share_token);
CREATE INDEX idx_grocery_events_status ON public.grocery_events(status);
CREATE INDEX idx_grocery_events_created_at ON public.grocery_events(created_at DESC);
CREATE INDEX idx_grocery_events_event_date ON public.grocery_events(event_date);

-- Add comments
COMMENT ON TABLE public.grocery_events IS 'Grocery list events for class/school events - public sharing via WhatsApp';
COMMENT ON COLUMN public.grocery_events.share_token IS 'Short URL-friendly token for public sharing (8 chars)';
COMMENT ON COLUMN public.grocery_events.class_name IS 'Class name in Hebrew, e.g., כיתה ג2';
COMMENT ON COLUMN public.grocery_events.event_name IS 'Event name in Hebrew, e.g., מסיבת סוף שנה';
COMMENT ON COLUMN public.grocery_events.total_items IS 'Denormalized count of total items';
COMMENT ON COLUMN public.grocery_events.claimed_items IS 'Denormalized count of claimed items';

-- ============================================================================
-- 2. Create grocery_items table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent reference
  grocery_event_id UUID NOT NULL REFERENCES public.grocery_events(id) ON DELETE CASCADE,

  -- Item details
  item_name VARCHAR(200) NOT NULL,            -- e.g., "חלב"
  quantity INTEGER NOT NULL DEFAULT 1,        -- e.g., 3
  notes TEXT,                                 -- Optional notes

  -- Claiming
  claimed_by VARCHAR(100),                    -- Name of person who claimed
  claimed_at TIMESTAMPTZ,

  -- Display order
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_grocery_items_event_id ON public.grocery_items(grocery_event_id);
CREATE INDEX idx_grocery_items_claimed ON public.grocery_items(claimed_by) WHERE claimed_by IS NOT NULL;
CREATE INDEX idx_grocery_items_display_order ON public.grocery_items(grocery_event_id, display_order);

-- Add comments
COMMENT ON TABLE public.grocery_items IS 'Individual items in a grocery list event';
COMMENT ON COLUMN public.grocery_items.item_name IS 'Item name in Hebrew';
COMMENT ON COLUMN public.grocery_items.claimed_by IS 'Name of person who claimed to bring this item';

-- ============================================================================
-- 3. Enable Row Level Security (Public access - no auth required)
-- ============================================================================
ALTER TABLE public.grocery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view grocery events
CREATE POLICY "Public can view grocery events"
  ON public.grocery_events FOR SELECT USING (true);

-- Policy: Anyone can create grocery events
CREATE POLICY "Public can create grocery events"
  ON public.grocery_events FOR INSERT WITH CHECK (true);

-- Policy: Anyone can update grocery events (for status changes)
CREATE POLICY "Public can update grocery events"
  ON public.grocery_events FOR UPDATE USING (true);

-- Policy: Anyone can view grocery items
CREATE POLICY "Public can view grocery items"
  ON public.grocery_items FOR SELECT USING (true);

-- Policy: Anyone can create grocery items
CREATE POLICY "Public can create grocery items"
  ON public.grocery_items FOR INSERT WITH CHECK (true);

-- Policy: Anyone can update grocery items (for claiming)
CREATE POLICY "Public can update grocery items"
  ON public.grocery_items FOR UPDATE USING (true);

-- Policy: Anyone can delete grocery items
CREATE POLICY "Public can delete grocery items"
  ON public.grocery_items FOR DELETE USING (true);

-- ============================================================================
-- 4. Create trigger for updated_at on grocery_events
-- ============================================================================
CREATE OR REPLACE FUNCTION update_grocery_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_grocery_events_updated_at
  BEFORE UPDATE ON public.grocery_events
  FOR EACH ROW
  EXECUTE FUNCTION update_grocery_events_updated_at();

-- ============================================================================
-- 5. Create trigger for updated_at on grocery_items
-- ============================================================================
CREATE OR REPLACE FUNCTION update_grocery_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_grocery_items_updated_at
  BEFORE UPDATE ON public.grocery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_grocery_items_updated_at();

-- ============================================================================
-- 6. Create trigger to update event stats when items change
-- ============================================================================
CREATE OR REPLACE FUNCTION update_grocery_event_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_event_id UUID;
  v_total INTEGER;
  v_claimed INTEGER;
BEGIN
  -- Determine which event to update
  IF TG_OP = 'DELETE' THEN
    v_event_id := OLD.grocery_event_id;
  ELSE
    v_event_id := NEW.grocery_event_id;
  END IF;

  -- Calculate stats
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE claimed_by IS NOT NULL)
  INTO v_total, v_claimed
  FROM public.grocery_items
  WHERE grocery_event_id = v_event_id;

  -- Update event stats
  UPDATE public.grocery_events
  SET
    total_items = v_total,
    claimed_items = v_claimed,
    updated_at = NOW()
  WHERE id = v_event_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_grocery_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.grocery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_grocery_event_stats();

-- ============================================================================
-- 7. Create function to generate share token
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_grocery_share_token()
RETURNS VARCHAR(12) AS $$
DECLARE
  -- Exclude confusing chars (0, O, 1, l, I)
  chars VARCHAR := 'abcdefghjkmnpqrstuvwxyz23456789';
  result VARCHAR(8) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. Create trigger to auto-generate share_token on insert
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_generate_grocery_share_token()
RETURNS TRIGGER AS $$
DECLARE
  new_token VARCHAR(12);
  max_attempts INTEGER := 10;
  attempt INTEGER := 0;
BEGIN
  -- Only generate if not already set
  IF NEW.share_token IS NULL OR NEW.share_token = '' THEN
    LOOP
      attempt := attempt + 1;
      new_token := generate_grocery_share_token();

      -- Check if token is unique
      IF NOT EXISTS (SELECT 1 FROM public.grocery_events WHERE share_token = new_token) THEN
        NEW.share_token := new_token;
        EXIT;
      END IF;

      -- Safety exit after max attempts
      IF attempt >= max_attempts THEN
        RAISE EXCEPTION 'Could not generate unique share_token after % attempts', max_attempts;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_share_token
  BEFORE INSERT ON public.grocery_events
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_grocery_share_token();

-- ============================================================================
-- 9. Create helper function to get event with items
-- ============================================================================
CREATE OR REPLACE FUNCTION get_grocery_event_with_items(p_share_token VARCHAR)
RETURNS TABLE (
  event_id UUID,
  share_token VARCHAR,
  class_name VARCHAR,
  event_name VARCHAR,
  event_date DATE,
  event_time TIME,
  event_address TEXT,
  creator_name VARCHAR,
  status VARCHAR,
  total_items INTEGER,
  claimed_items INTEGER,
  created_at TIMESTAMPTZ,
  item_id UUID,
  item_name VARCHAR,
  quantity INTEGER,
  notes TEXT,
  claimed_by VARCHAR,
  claimed_at TIMESTAMPTZ,
  display_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id AS event_id,
    e.share_token,
    e.class_name,
    e.event_name,
    e.event_date,
    e.event_time,
    e.event_address,
    e.creator_name,
    e.status,
    e.total_items,
    e.claimed_items,
    e.created_at,
    i.id AS item_id,
    i.item_name,
    i.quantity,
    i.notes,
    i.claimed_by,
    i.claimed_at,
    i.display_order
  FROM public.grocery_events e
  LEFT JOIN public.grocery_items i ON e.id = i.grocery_event_id
  WHERE e.share_token = p_share_token
  ORDER BY i.display_order, i.created_at;
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- ============================================================================
-- Rollback instructions (save for reference, do not execute)
-- ============================================================================
-- To rollback this migration:
-- BEGIN;
-- DROP TRIGGER IF EXISTS trigger_auto_generate_share_token ON public.grocery_events;
-- DROP TRIGGER IF EXISTS trigger_update_grocery_stats ON public.grocery_items;
-- DROP TRIGGER IF EXISTS trigger_grocery_items_updated_at ON public.grocery_items;
-- DROP TRIGGER IF EXISTS trigger_grocery_events_updated_at ON public.grocery_events;
-- DROP FUNCTION IF EXISTS auto_generate_grocery_share_token();
-- DROP FUNCTION IF EXISTS generate_grocery_share_token();
-- DROP FUNCTION IF EXISTS update_grocery_event_stats();
-- DROP FUNCTION IF EXISTS update_grocery_items_updated_at();
-- DROP FUNCTION IF EXISTS update_grocery_events_updated_at();
-- DROP FUNCTION IF EXISTS get_grocery_event_with_items(VARCHAR);
-- DROP TABLE IF EXISTS public.grocery_items;
-- DROP TABLE IF EXISTS public.grocery_events;
-- COMMIT;
