-- Create prom planning tables for sixth-grade graduation party planning
-- This module allows comparing vendor quotes, tracking budget, and collecting parent votes

-- ===========================================
-- Table 1: prom_events - Main prom event configuration
-- ===========================================
CREATE TABLE IF NOT EXISTS public.prom_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ru TEXT, -- Russian translation
  description TEXT,
  description_ru TEXT,
  
  -- Event details
  event_date DATE,
  event_time TIME,
  venue_name TEXT,
  venue_address TEXT,
  
  -- Budget and students
  total_budget DECIMAL(10,2) DEFAULT 0,
  student_count INTEGER DEFAULT 0,
  
  -- Status tracking
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'voting', 'confirmed', 'completed', 'cancelled')),
  voting_enabled BOOLEAN DEFAULT false,
  voting_start_date TIMESTAMPTZ,
  voting_end_date TIMESTAMPTZ,
  
  -- Selected vendor (after decision)
  selected_quote_id UUID,
  
  -- Metadata
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.prom_events IS 'Main prom event configuration for sixth-grade graduation party planning';
COMMENT ON COLUMN public.prom_events.title IS 'Hebrew title of the prom event';
COMMENT ON COLUMN public.prom_events.title_ru IS 'Russian title of the prom event';
COMMENT ON COLUMN public.prom_events.total_budget IS 'Total budget allocated for the event';
COMMENT ON COLUMN public.prom_events.student_count IS 'Number of students for per-student cost calculations';
COMMENT ON COLUMN public.prom_events.status IS 'Event status: planning, voting, confirmed, completed, cancelled';
COMMENT ON COLUMN public.prom_events.voting_enabled IS 'Whether parent voting is currently enabled';

-- ===========================================
-- Table 2: prom_vendor_quotes - Vendor quotes for comparison
-- ===========================================
CREATE TABLE IF NOT EXISTS public.prom_vendor_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prom_id UUID NOT NULL REFERENCES public.prom_events(id) ON DELETE CASCADE,
  
  -- Vendor info (can link to existing vendor or manual entry)
  vendor_id UUID, -- Optional link to vendors table
  vendor_name TEXT NOT NULL,
  vendor_contact_name TEXT,
  vendor_phone TEXT,
  vendor_email TEXT,
  
  -- Category
  category TEXT NOT NULL CHECK (category IN ('venue', 'catering', 'dj', 'photography', 'decorations', 'transportation', 'entertainment', 'other')),
  
  -- Pricing
  price_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_per_student DECIMAL(10,2), -- Auto-calculated or manual
  price_notes TEXT, -- Payment terms, what's included in price
  
  -- Services included (stored as JSONB array)
  services_included JSONB DEFAULT '[]'::jsonb,
  
  -- Availability
  availability_status TEXT DEFAULT 'unknown' CHECK (availability_status IN ('available', 'unavailable', 'pending', 'unknown')),
  availability_date DATE,
  availability_notes TEXT,
  
  -- Evaluation
  pros TEXT,
  cons TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  admin_notes TEXT, -- Internal notes not shown to parents
  
  -- Attachments
  attachment_urls JSONB DEFAULT '[]'::jsonb, -- Array of URLs to quotes/documents
  
  -- Selection status
  is_selected BOOLEAN DEFAULT false,
  is_finalist BOOLEAN DEFAULT false, -- Shortlisted for voting
  
  -- Display
  display_order INTEGER DEFAULT 0,
  display_label TEXT, -- e.g., "Option A", "Option B" for voting
  
  -- Metadata
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.prom_vendor_quotes IS 'Vendor quotes for prom event comparison';
COMMENT ON COLUMN public.prom_vendor_quotes.category IS 'Service category: venue, catering, dj, photography, decorations, transportation, entertainment, other';
COMMENT ON COLUMN public.prom_vendor_quotes.services_included IS 'JSONB array of services included in the quote';
COMMENT ON COLUMN public.prom_vendor_quotes.is_finalist IS 'Whether this quote is shortlisted for parent voting';
COMMENT ON COLUMN public.prom_vendor_quotes.display_label IS 'Label shown to parents during voting (e.g., Option A)';

-- ===========================================
-- Table 3: prom_comparison_columns - Custom columns for comparison table
-- ===========================================
CREATE TABLE IF NOT EXISTS public.prom_comparison_columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prom_id UUID NOT NULL REFERENCES public.prom_events(id) ON DELETE CASCADE,
  
  column_name TEXT NOT NULL,
  column_name_ru TEXT, -- Russian translation
  column_type TEXT DEFAULT 'text' CHECK (column_type IN ('text', 'number', 'boolean', 'rating')),
  column_key TEXT NOT NULL, -- Unique key for this column within the prom
  
  display_order INTEGER DEFAULT 0,
  is_visible_in_voting BOOLEAN DEFAULT true, -- Show this column to parents during voting
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.prom_comparison_columns IS 'Custom columns for prom vendor comparison table';
COMMENT ON COLUMN public.prom_comparison_columns.column_type IS 'Data type: text, number, boolean, rating';
COMMENT ON COLUMN public.prom_comparison_columns.column_key IS 'Unique key used to store values in quote custom_data';

-- ===========================================
-- Table 4: prom_quote_custom_values - Custom column values for quotes
-- ===========================================
CREATE TABLE IF NOT EXISTS public.prom_quote_custom_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.prom_vendor_quotes(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES public.prom_comparison_columns(id) ON DELETE CASCADE,
  
  value_text TEXT,
  value_number DECIMAL(10,2),
  value_boolean BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(quote_id, column_id)
);

-- Add comments for documentation
COMMENT ON TABLE public.prom_quote_custom_values IS 'Custom column values for prom vendor quotes';

-- ===========================================
-- Table 5: prom_votes - Parent votes on vendor options
-- ===========================================
CREATE TABLE IF NOT EXISTS public.prom_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prom_id UUID NOT NULL REFERENCES public.prom_events(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL REFERENCES public.prom_vendor_quotes(id) ON DELETE CASCADE,
  
  -- Voter identification (hashed for privacy)
  voter_identifier TEXT NOT NULL, -- Hashed phone number or email
  voter_name TEXT, -- Optional display name
  
  -- Vote
  vote_type TEXT NOT NULL CHECK (vote_type IN ('prefer', 'neutral', 'oppose')),
  comment TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One vote per voter per quote
  UNIQUE(prom_id, quote_id, voter_identifier)
);

-- Add comments for documentation
COMMENT ON TABLE public.prom_votes IS 'Parent votes on prom vendor options';
COMMENT ON COLUMN public.prom_votes.voter_identifier IS 'Hashed identifier for the voter (phone/email)';
COMMENT ON COLUMN public.prom_votes.vote_type IS 'Vote type: prefer, neutral, oppose';

-- ===========================================
-- Table 6: prom_budget_items - Budget category breakdown
-- ===========================================
CREATE TABLE IF NOT EXISTS public.prom_budget_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prom_id UUID NOT NULL REFERENCES public.prom_events(id) ON DELETE CASCADE,
  
  category TEXT NOT NULL CHECK (category IN ('venue', 'catering', 'dj', 'photography', 'decorations', 'transportation', 'entertainment', 'other')),
  allocated_amount DECIMAL(10,2) DEFAULT 0,
  spent_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(prom_id, category)
);

-- Add comments for documentation
COMMENT ON TABLE public.prom_budget_items IS 'Budget allocation per category for prom events';

-- ===========================================
-- Indexes for performance
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_prom_events_status ON public.prom_events(status);
CREATE INDEX IF NOT EXISTS idx_prom_events_event_date ON public.prom_events(event_date);
CREATE INDEX IF NOT EXISTS idx_prom_vendor_quotes_prom_id ON public.prom_vendor_quotes(prom_id);
CREATE INDEX IF NOT EXISTS idx_prom_vendor_quotes_category ON public.prom_vendor_quotes(category);
CREATE INDEX IF NOT EXISTS idx_prom_vendor_quotes_is_finalist ON public.prom_vendor_quotes(is_finalist) WHERE is_finalist = true;
CREATE INDEX IF NOT EXISTS idx_prom_comparison_columns_prom_id ON public.prom_comparison_columns(prom_id);
CREATE INDEX IF NOT EXISTS idx_prom_quote_custom_values_quote_id ON public.prom_quote_custom_values(quote_id);
CREATE INDEX IF NOT EXISTS idx_prom_votes_prom_id ON public.prom_votes(prom_id);
CREATE INDEX IF NOT EXISTS idx_prom_votes_quote_id ON public.prom_votes(quote_id);
CREATE INDEX IF NOT EXISTS idx_prom_budget_items_prom_id ON public.prom_budget_items(prom_id);

-- ===========================================
-- Row Level Security
-- ===========================================
ALTER TABLE public.prom_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prom_vendor_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prom_comparison_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prom_quote_custom_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prom_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prom_budget_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view prom events" ON public.prom_events;
DROP POLICY IF EXISTS "Service role can do everything on prom_events" ON public.prom_events;
DROP POLICY IF EXISTS "Public can view finalist quotes" ON public.prom_vendor_quotes;
DROP POLICY IF EXISTS "Service role can do everything on prom_vendor_quotes" ON public.prom_vendor_quotes;
DROP POLICY IF EXISTS "Public can view visible columns" ON public.prom_comparison_columns;
DROP POLICY IF EXISTS "Service role can do everything on prom_comparison_columns" ON public.prom_comparison_columns;
DROP POLICY IF EXISTS "Service role can do everything on prom_quote_custom_values" ON public.prom_quote_custom_values;
DROP POLICY IF EXISTS "Public can insert votes" ON public.prom_votes;
DROP POLICY IF EXISTS "Service role can do everything on prom_votes" ON public.prom_votes;
DROP POLICY IF EXISTS "Service role can do everything on prom_budget_items" ON public.prom_budget_items;

-- Prom Events policies
CREATE POLICY "Public can view prom events"
  ON public.prom_events
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can do everything on prom_events"
  ON public.prom_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Vendor Quotes policies
CREATE POLICY "Public can view finalist quotes"
  ON public.prom_vendor_quotes
  FOR SELECT
  TO public
  USING (is_finalist = true);

CREATE POLICY "Service role can do everything on prom_vendor_quotes"
  ON public.prom_vendor_quotes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comparison Columns policies
CREATE POLICY "Public can view visible columns"
  ON public.prom_comparison_columns
  FOR SELECT
  TO public
  USING (is_visible_in_voting = true);

CREATE POLICY "Service role can do everything on prom_comparison_columns"
  ON public.prom_comparison_columns
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Quote Custom Values policies
CREATE POLICY "Service role can do everything on prom_quote_custom_values"
  ON public.prom_quote_custom_values
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Votes policies (public can insert their own votes)
CREATE POLICY "Public can insert votes"
  ON public.prom_votes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Service role can do everything on prom_votes"
  ON public.prom_votes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Budget Items policies
CREATE POLICY "Service role can do everything on prom_budget_items"
  ON public.prom_budget_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ===========================================
-- Triggers for updated_at
-- ===========================================
CREATE OR REPLACE FUNCTION update_prom_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_prom_events_updated_at ON public.prom_events;
CREATE TRIGGER trigger_update_prom_events_updated_at
  BEFORE UPDATE ON public.prom_events
  FOR EACH ROW
  EXECUTE FUNCTION update_prom_updated_at();

DROP TRIGGER IF EXISTS trigger_update_prom_vendor_quotes_updated_at ON public.prom_vendor_quotes;
CREATE TRIGGER trigger_update_prom_vendor_quotes_updated_at
  BEFORE UPDATE ON public.prom_vendor_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_prom_updated_at();

DROP TRIGGER IF EXISTS trigger_update_prom_quote_custom_values_updated_at ON public.prom_quote_custom_values;
CREATE TRIGGER trigger_update_prom_quote_custom_values_updated_at
  BEFORE UPDATE ON public.prom_quote_custom_values
  FOR EACH ROW
  EXECUTE FUNCTION update_prom_updated_at();

DROP TRIGGER IF EXISTS trigger_update_prom_votes_updated_at ON public.prom_votes;
CREATE TRIGGER trigger_update_prom_votes_updated_at
  BEFORE UPDATE ON public.prom_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_prom_updated_at();

DROP TRIGGER IF EXISTS trigger_update_prom_budget_items_updated_at ON public.prom_budget_items;
CREATE TRIGGER trigger_update_prom_budget_items_updated_at
  BEFORE UPDATE ON public.prom_budget_items
  FOR EACH ROW
  EXECUTE FUNCTION update_prom_updated_at();

-- ===========================================
-- Function to calculate price per student
-- ===========================================
CREATE OR REPLACE FUNCTION calculate_price_per_student()
RETURNS TRIGGER AS $$
DECLARE
  student_count INTEGER;
BEGIN
  -- Get student count from prom_events
  SELECT pe.student_count INTO student_count
  FROM public.prom_events pe
  WHERE pe.id = NEW.prom_id;
  
  -- Calculate price per student if student_count > 0
  IF student_count > 0 AND NEW.price_total > 0 THEN
    NEW.price_per_student = ROUND(NEW.price_total / student_count, 2);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_price_per_student ON public.prom_vendor_quotes;
CREATE TRIGGER trigger_calculate_price_per_student
  BEFORE INSERT OR UPDATE OF price_total ON public.prom_vendor_quotes
  FOR EACH ROW
  EXECUTE FUNCTION calculate_price_per_student();

