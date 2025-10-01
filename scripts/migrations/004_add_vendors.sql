-- ================================================
-- Migration: 004_add_vendors
-- Description: Add vendors management system with transactions and reviews
-- Date: 2025-10-01
-- ================================================

-- ==================== UP ====================

-- Main vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),
  address TEXT,
  business_number VARCHAR(100),
  license_number VARCHAR(100),
  price_range VARCHAR(50),
  currency VARCHAR(10) DEFAULT 'ILS',
  payment_terms TEXT,
  status VARCHAR(50) DEFAULT 'active',
  overall_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  services_offered TEXT[],
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

-- Vendor transactions table
CREATE TABLE IF NOT EXISTS public.vendor_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'ILS',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(100),
  invoice_number VARCHAR(100),
  quantity INTEGER,
  unit_price DECIMAL(10,2),
  notes TEXT,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255)
);

-- Vendor reviews table
CREATE TABLE IF NOT EXISTS public.vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  reviewer_name VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  would_recommend BOOLEAN,
  transaction_id UUID REFERENCES public.vendor_transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_rating ON public.vendors(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_transactions_vendor_id ON public.vendor_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_transactions_date ON public.vendor_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor_id ON public.vendor_reviews(vendor_id);

-- RLS Policies
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public vendors viewable" ON public.vendors;
CREATE POLICY "Public vendors viewable" ON public.vendors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public transactions viewable" ON public.vendor_transactions;
CREATE POLICY "Public transactions viewable" ON public.vendor_transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public reviews viewable" ON public.vendor_reviews;
CREATE POLICY "Public reviews viewable" ON public.vendor_reviews FOR SELECT USING (true);

-- Comments
COMMENT ON TABLE public.vendors IS 'ספקים ונותני שירותים';
COMMENT ON TABLE public.vendor_transactions IS 'עסקאות עם ספקים';
COMMENT ON TABLE public.vendor_reviews IS 'ביקורות ספקים';

-- ==================== DOWN ====================
-- Rollback instructions (uncomment to revert)

/*
DROP TABLE IF EXISTS public.vendor_reviews CASCADE;
DROP TABLE IF EXISTS public.vendor_transactions CASCADE;
DROP TABLE IF EXISTS public.vendors CASCADE;
*/
