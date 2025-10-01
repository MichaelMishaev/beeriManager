-- ================================================
-- Vendors Management System
-- ================================================
-- Table for managing vendors/suppliers for the parent committee
-- Includes contact info, categories, pricing, transactions, and reviews

-- Main vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- catering, supplies, entertainment, transportation, etc.

  -- Contact Information
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),
  address TEXT,

  -- Business Details
  business_number VARCHAR(100), -- מספר עוסק מורשה
  license_number VARCHAR(100),

  -- Pricing Information
  price_range VARCHAR(50), -- 'budget', 'mid-range', 'premium'
  currency VARCHAR(10) DEFAULT 'ILS',
  payment_terms TEXT, -- Net 30, upfront, etc.

  -- Status & Rating
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, blacklisted
  overall_rating DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 5.00
  total_reviews INTEGER DEFAULT 0,

  -- Additional Information
  services_offered TEXT[], -- Array of services
  notes TEXT,
  tags TEXT[], -- Array of tags for filtering

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

-- Vendor transactions/history table
CREATE TABLE IF NOT EXISTS public.vendor_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,

  -- Transaction Details
  transaction_date DATE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL, -- Optional link to event
  description TEXT NOT NULL,

  -- Financial Information
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'ILS',
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, overdue, cancelled
  payment_method VARCHAR(100), -- cash, transfer, credit card, etc.
  invoice_number VARCHAR(100),

  -- Additional Details
  quantity INTEGER,
  unit_price DECIMAL(10,2),
  notes TEXT,
  attachments JSONB, -- Array of file URLs/references

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255)
);

-- Vendor reviews/ratings table
CREATE TABLE IF NOT EXISTS public.vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,

  -- Review Information
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT,

  -- Specific Ratings (optional detailed breakdown)
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),

  -- Review Metadata
  reviewer_name VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  would_recommend BOOLEAN,

  -- Associated Transaction
  transaction_id UUID REFERENCES public.vendor_transactions(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- Indexes for Performance
-- ================================================

-- Vendors indexes
CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_rating ON public.vendors(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON public.vendors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendors_name ON public.vendors(name);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_vendor_transactions_vendor_id ON public.vendor_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_transactions_date ON public.vendor_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_transactions_status ON public.vendor_transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_vendor_transactions_event_id ON public.vendor_transactions(event_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor_id ON public.vendor_reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_rating ON public.vendor_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_created_at ON public.vendor_reviews(created_at DESC);

-- ================================================
-- Triggers for Auto-Update Timestamps
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for vendors table
DROP TRIGGER IF EXISTS update_vendors_updated_at ON public.vendors;
CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers for transactions table
DROP TRIGGER IF EXISTS update_vendor_transactions_updated_at ON public.vendor_transactions;
CREATE TRIGGER update_vendor_transactions_updated_at
    BEFORE UPDATE ON public.vendor_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers for reviews table
DROP TRIGGER IF EXISTS update_vendor_reviews_updated_at ON public.vendor_reviews;
CREATE TRIGGER update_vendor_reviews_updated_at
    BEFORE UPDATE ON public.vendor_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- Trigger to Auto-Update Vendor Overall Rating
-- ================================================

-- Function to recalculate vendor overall rating
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_vendor_id UUID;
    v_avg_rating DECIMAL(3,2);
    v_review_count INTEGER;
BEGIN
    -- Get the vendor_id from NEW or OLD
    v_vendor_id := COALESCE(NEW.vendor_id, OLD.vendor_id);

    -- Skip if vendor_id is NULL
    IF v_vendor_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Calculate average rating and count
    SELECT
        COALESCE(AVG(rating)::DECIMAL(3,2), 0.00),
        COUNT(*)
    INTO v_avg_rating, v_review_count
    FROM public.vendor_reviews
    WHERE vendor_id = v_vendor_id;

    -- Update the vendor's overall rating and review count
    UPDATE public.vendors
    SET
        overall_rating = v_avg_rating,
        total_reviews = v_review_count
    WHERE id = v_vendor_id;

    RETURN COALESCE(NEW, OLD);
EXCEPTION
    WHEN OTHERS THEN
        -- If any error occurs, just return without failing
        RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update vendor rating when review is added/updated/deleted
DROP TRIGGER IF EXISTS update_vendor_rating_on_review ON public.vendor_reviews;
CREATE TRIGGER update_vendor_rating_on_review
    AFTER INSERT OR UPDATE OR DELETE ON public.vendor_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_rating();

-- ================================================
-- Row Level Security (RLS) Policies
-- ================================================

-- Enable RLS on all tables
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY;

-- Public read access for vendors (anyone can view)
CREATE POLICY "Public vendors are viewable by everyone"
    ON public.vendors FOR SELECT
    USING (true);

-- Admin write access for vendors
CREATE POLICY "Admins can insert vendors"
    ON public.vendors FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can update vendors"
    ON public.vendors FOR UPDATE
    USING (true);

CREATE POLICY "Admins can delete vendors"
    ON public.vendors FOR DELETE
    USING (true);

-- Public read access for transactions
CREATE POLICY "Public vendor transactions are viewable by everyone"
    ON public.vendor_transactions FOR SELECT
    USING (true);

-- Admin write access for transactions
CREATE POLICY "Admins can insert vendor transactions"
    ON public.vendor_transactions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can update vendor transactions"
    ON public.vendor_transactions FOR UPDATE
    USING (true);

CREATE POLICY "Admins can delete vendor transactions"
    ON public.vendor_transactions FOR DELETE
    USING (true);

-- Public read access for reviews
CREATE POLICY "Public vendor reviews are viewable by everyone"
    ON public.vendor_reviews FOR SELECT
    USING (true);

-- Anyone can submit reviews
CREATE POLICY "Anyone can insert vendor reviews"
    ON public.vendor_reviews FOR INSERT
    WITH CHECK (true);

-- Admin access for review moderation
CREATE POLICY "Admins can update vendor reviews"
    ON public.vendor_reviews FOR UPDATE
    USING (true);

CREATE POLICY "Admins can delete vendor reviews"
    ON public.vendor_reviews FOR DELETE
    USING (true);

-- ================================================
-- Sample Data (Optional - for testing)
-- ================================================

-- Uncomment to insert sample vendors
/*
INSERT INTO public.vendors (name, description, category, contact_person, phone, email, price_range, services_offered, tags)
VALUES
(
    'קייטרינג דליס',
    'שירותי קייטרינג מקצועי לאירועים',
    'catering',
    'משה כהן',
    '050-1234567',
    'info@deliscatering.co.il',
    'mid-range',
    ARRAY['ארוחות', 'כיבוד', 'שתייה'],
    ARRAY['כשר', 'מומלץ']
),
(
    'ציוד למסיבות בע"מ',
    'השכרת ציוד לאירועים ומסיבות',
    'supplies',
    'שרה לוי',
    '052-9876543',
    'info@partyequip.co.il',
    'budget',
    ARRAY['כסאות', 'שולחנות', 'קישוטים'],
    ARRAY['משלוחים', 'זמין']
);
*/

-- ================================================
-- Comments for Documentation
-- ================================================

COMMENT ON TABLE public.vendors IS 'ספקים ונותני שירותים לועד ההורים';
COMMENT ON TABLE public.vendor_transactions IS 'היסטוריית עסקאות עם ספקים';
COMMENT ON TABLE public.vendor_reviews IS 'ביקורות ודירוגים של ספקים';

COMMENT ON COLUMN public.vendors.price_range IS 'טווח מחירים: budget, mid-range, premium';
COMMENT ON COLUMN public.vendors.overall_rating IS 'דירוג ממוצע (0.00 עד 5.00)';
COMMENT ON COLUMN public.vendor_transactions.payment_status IS 'סטטוס תשלום: pending, paid, overdue, cancelled';
COMMENT ON COLUMN public.vendor_reviews.rating IS 'דירוג כללי (1-5 כוכבים)';
