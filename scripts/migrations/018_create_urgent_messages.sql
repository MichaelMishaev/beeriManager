-- Migration 018: Create urgent_messages table for admin urgent notifications
-- Date: 2025-10-20

-- Create urgent_messages table
CREATE TABLE IF NOT EXISTS public.urgent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Message type
  type TEXT NOT NULL DEFAULT 'info', -- 'white_shirt', 'urgent', 'info', 'warning'

  -- Bilingual content
  title_he TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  description_he TEXT,
  description_ru TEXT,

  -- Bilingual share text (optional custom share text)
  share_text_he TEXT,
  share_text_ru TEXT,

  -- Display settings
  icon TEXT, -- emoji icon
  color TEXT DEFAULT 'bg-blue-50', -- CSS color class

  -- Status and dates
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT DEFAULT 'admin',

  -- Constraints
  CONSTRAINT valid_message_type CHECK (type IN ('white_shirt', 'urgent', 'info', 'warning')),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create indexes for efficient queries
CREATE INDEX idx_urgent_messages_active ON public.urgent_messages(is_active);
CREATE INDEX idx_urgent_messages_dates ON public.urgent_messages(start_date, end_date);
CREATE INDEX idx_urgent_messages_type ON public.urgent_messages(type);

-- Enable Row Level Security
ALTER TABLE public.urgent_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active messages within date range
CREATE POLICY "Public can view active urgent messages"
  ON public.urgent_messages
  FOR SELECT
  USING (is_active = true AND CURRENT_DATE >= start_date AND CURRENT_DATE <= end_date);

-- Policy: Authenticated admins can do everything
CREATE POLICY "Admins can manage urgent messages"
  ON public.urgent_messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_urgent_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_urgent_messages_updated_at
  BEFORE UPDATE ON public.urgent_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_urgent_messages_updated_at();

-- Add comment
COMMENT ON TABLE public.urgent_messages IS 'Urgent notifications and messages for parents (white shirt reminders, urgent notices, etc.)';
