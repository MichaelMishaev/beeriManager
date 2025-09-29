-- Extended Features Migration (Phase 2)
-- This migration adds additional tables for advanced features

BEGIN;

-- Event Registrations table
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Registration Data
  registrant_name VARCHAR(100) NOT NULL,
  registrant_phone VARCHAR(20),
  registrant_email VARCHAR(255),
  form_data JSONB DEFAULT '{}', -- All form responses

  -- Check-in
  qr_checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  checked_in_by VARCHAR(100),

  -- RSVP Status
  rsvp_status VARCHAR(10), -- yes, no, maybe

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(event_id, registrant_phone),
  UNIQUE(event_id, registrant_email)
);

-- Event Reminders table
CREATE TABLE event_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Timing
  remind_at TIMESTAMPTZ NOT NULL,
  reminder_type VARCHAR(30) NOT NULL, -- day_before, hour_before, week_before, custom

  -- Delivery
  reminder_method VARCHAR(20)[] DEFAULT ARRAY['push']::VARCHAR[], -- push, email, sms

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
  sent_at TIMESTAMPTZ,
  failure_reason TEXT,

  -- Recipients
  recipient_count INTEGER,

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Protocols table
CREATE TABLE protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Document Info
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  full_text TEXT, -- Searchable content

  -- Categorization
  year INTEGER NOT NULL,
  academic_year VARCHAR(20), -- e.g., "2024-2025"
  categories TEXT[] DEFAULT ARRAY[]::TEXT[], -- Can have multiple categories
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- External Documents
  document_urls JSONB DEFAULT '[]', -- [{title, url, type, uploaded_at}]

  -- Metadata
  protocol_date DATE,
  protocol_number VARCHAR(50), -- Official numbering
  is_public BOOLEAN DEFAULT TRUE,

  -- Search
  search_vector tsvector,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(100),
  version INTEGER DEFAULT 1
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Request Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50), -- supplies, food, transportation, equipment, services, other

  -- Requester
  requester_name VARCHAR(100) NOT NULL,
  requester_phone VARCHAR(20),
  request_date DATE DEFAULT CURRENT_DATE,
  needed_by_date DATE,

  -- Approval Workflow
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, paid, reimbursed
  approver_name VARCHAR(100),
  approval_date TIMESTAMPTZ,
  approval_notes TEXT,
  rejection_reason TEXT,

  -- Payment
  payment_method VARCHAR(50), -- cash, transfer, credit_card, check
  payment_date DATE,
  payment_reference VARCHAR(100),

  -- Documents
  receipt_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  invoice_url TEXT,
  approval_document_url TEXT, -- Signed approval in Google Drive

  -- Budget Tracking
  budget_category VARCHAR(50),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- Vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- catering, entertainment, transportation, supplies, services
  description TEXT,

  -- Contact
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  website TEXT,
  address TEXT,

  -- Business Details
  business_number VARCHAR(50), -- מס' עסק
  tax_invoice BOOLEAN DEFAULT FALSE, -- מעודכן במע"מ

  -- Pricing
  pricing_info TEXT,
  typical_cost_range VARCHAR(50), -- e.g., "1000-5000"
  payment_terms TEXT,

  -- Performance
  rating DECIMAL(2,1), -- 1.0 to 5.0
  total_events INTEGER DEFAULT 0,
  last_used_date DATE,

  -- Preferences
  is_preferred BOOLEAN DEFAULT FALSE,
  is_kosher BOOLEAN DEFAULT FALSE,
  notes TEXT,

  -- Contracts
  contract_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  insurance_expiry DATE,

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, blacklisted
  blacklist_reason TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(100),
  version INTEGER DEFAULT 1
);

-- Vendor Reviews table
CREATE TABLE vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,

  -- Review
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  reviewer_name VARCHAR(100) NOT NULL,

  -- Specific Ratings
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  price_rating INTEGER CHECK (price_rating >= 1 AND price_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),

  -- Recommendation
  would_recommend BOOLEAN,

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for Phase 2 tables
CREATE INDEX idx_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_registrations_phone ON event_registrations(registrant_phone);

CREATE INDEX idx_reminders_pending ON event_reminders(remind_at)
WHERE status = 'pending';

-- Full-text search index
CREATE INDEX idx_protocols_search ON protocols USING gin(search_vector);
CREATE INDEX idx_protocols_year ON protocols(year);
CREATE INDEX idx_protocols_categories ON protocols USING gin(categories);

CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_requester ON expenses(requester_name);
CREATE INDEX idx_expenses_event ON expenses(event_id);
CREATE INDEX idx_expenses_date ON expenses(request_date);

CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_preferred ON vendors(is_preferred) WHERE status = 'active';
CREATE INDEX idx_vendors_rating ON vendors(rating DESC) WHERE status = 'active';

CREATE INDEX idx_vendor_reviews_vendor ON vendor_reviews(vendor_id);

-- Trigger to update search vector for protocols
CREATE OR REPLACE FUNCTION update_protocols_search()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', COALESCE(NEW.title, '') || ' ' ||
                                            COALESCE(NEW.summary, '') || ' ' ||
                                            COALESCE(NEW.full_text, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_protocols_search_trigger
  BEFORE INSERT OR UPDATE ON protocols
  FOR EACH ROW EXECUTE FUNCTION update_protocols_search();

-- Enable RLS for new tables
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Public can view registrations" ON event_registrations
  FOR SELECT
  USING (true);

CREATE POLICY "Public can view protocols" ON protocols
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Public can view expenses" ON expenses
  FOR SELECT
  USING (true);

CREATE POLICY "Public can view vendors" ON vendors
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Public can view vendor reviews" ON vendor_reviews
  FOR SELECT
  USING (true);

-- Admin policies (temporary for development)
CREATE POLICY "Allow all for development" ON event_registrations FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON event_reminders FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON protocols FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON expenses FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON vendors FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON vendor_reviews FOR ALL USING (true);

COMMIT;