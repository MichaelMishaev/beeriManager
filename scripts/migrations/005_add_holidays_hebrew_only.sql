-- ================================================
-- Migration: 005_add_holidays (Hebrew Only)
-- Description: Add school holidays system - Hebrew only
-- Date: 2025-10-02
-- ================================================

-- School holidays table (Hebrew only)
CREATE TABLE IF NOT EXISTS public.holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic information (Hebrew only)
  name VARCHAR(255) NOT NULL, -- שם החג בעברית
  description TEXT,

  -- Date information
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Holiday metadata
  holiday_type VARCHAR(50) DEFAULT 'religious', -- religious, national, school_break, other
  is_school_closed BOOLEAN DEFAULT true,

  -- Visual
  icon_emoji VARCHAR(10), -- emoji like 🕎, 🇮🇱, 🎉
  color VARCHAR(7) DEFAULT '#FFBA00', -- hex color for calendar display

  -- Academic year tracking
  academic_year VARCHAR(20) NOT NULL, -- e.g., "תשפ״ה", "2024-2025"
  hebrew_date VARCHAR(100), -- e.g., "כ״ה בכסלו - ב׳ בטבת"

  -- Related event (auto-created calendar event)
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,

  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_holidays_start_date ON public.holidays(start_date);
CREATE INDEX IF NOT EXISTS idx_holidays_end_date ON public.holidays(end_date);
CREATE INDEX IF NOT EXISTS idx_holidays_academic_year ON public.holidays(academic_year);
CREATE INDEX IF NOT EXISTS idx_holidays_is_school_closed ON public.holidays(is_school_closed);
CREATE INDEX IF NOT EXISTS idx_holidays_date_range ON public.holidays(start_date, end_date);

-- RLS Policies (public read, admin write)
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public holidays viewable" ON public.holidays;
CREATE POLICY "Public holidays viewable" ON public.holidays FOR SELECT USING (true);

-- Comments
COMMENT ON TABLE public.holidays IS 'לוח חגים ומועדים בית ספריים';
COMMENT ON COLUMN public.holidays.name IS 'שם החג בעברית';
COMMENT ON COLUMN public.holidays.is_school_closed IS 'האם בית הספר סגור';
COMMENT ON COLUMN public.holidays.academic_year IS 'שנת לימודים';
