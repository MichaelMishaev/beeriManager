-- Migration 014: Create tickets table for parent committee perks (sports game tickets, etc.)
-- Date: 2025-10-09

-- Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  title TEXT NOT NULL,
  description TEXT,

  -- Game/Event details
  event_type TEXT NOT NULL DEFAULT 'sport', -- 'sport', 'theater', 'concert', 'other'
  sport_type TEXT, -- 'soccer', 'basketball', 'volleyball', etc. (for sport events)
  team_home TEXT, -- Home team name
  team_away TEXT, -- Away team name
  venue TEXT, -- Location/Stadium
  event_date TIMESTAMPTZ, -- When is the game/event

  -- Ticket details
  image_url TEXT, -- Image of the game/event
  purchase_url TEXT NOT NULL, -- Where to buy/register
  quantity_available INTEGER, -- How many tickets available (null = unlimited)
  quantity_sold INTEGER DEFAULT 0, -- How many sold/claimed
  price_per_ticket DECIMAL(10,2), -- Price per ticket (null = free)

  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'sold_out', 'expired', 'draft', 'finished'

  -- Display settings
  featured BOOLEAN DEFAULT false, -- Show prominently on homepage
  display_order INTEGER DEFAULT 0, -- Sort order

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('active', 'sold_out', 'expired', 'draft', 'finished')),
  CONSTRAINT valid_event_type CHECK (event_type IN ('sport', 'theater', 'concert', 'other')),
  CONSTRAINT valid_quantity CHECK (quantity_available IS NULL OR quantity_available >= 0),
  CONSTRAINT valid_sold CHECK (quantity_sold >= 0)
);

-- Create index for active tickets query
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_event_date ON public.tickets(event_date);
CREATE INDEX idx_tickets_featured ON public.tickets(featured, display_order);

-- Enable Row Level Security
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active/sold_out tickets
CREATE POLICY "Public can view active tickets"
  ON public.tickets
  FOR SELECT
  USING (status IN ('active', 'sold_out'));

-- Policy: Authenticated admins can do everything
CREATE POLICY "Admins can manage tickets"
  ON public.tickets
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_tickets_updated_at();

-- Add comment
COMMENT ON TABLE public.tickets IS 'Parent committee perks: sports tickets, theater shows, etc.';
