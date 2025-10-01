-- ================================================
-- App Settings Table
-- ================================================
-- Stores global application settings and configuration

CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- General Settings
  committee_name VARCHAR(255) DEFAULT 'ועד הורים',
  school_name VARCHAR(255) DEFAULT 'בית ספר יסודי',
  academic_year VARCHAR(50) DEFAULT '2024-2025',
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),

  -- Feature Flags
  enable_google_calendar BOOLEAN DEFAULT true,
  enable_anonymous_feedback BOOLEAN DEFAULT true,
  enable_event_registrations BOOLEAN DEFAULT true,
  enable_whatsapp_share BOOLEAN DEFAULT true,
  require_approval_for_events BOOLEAN DEFAULT false,
  require_approval_for_tasks BOOLEAN DEFAULT false,

  -- Notification Settings
  email_notifications BOOLEAN DEFAULT false,
  whatsapp_notifications BOOLEAN DEFAULT false,
  notification_email VARCHAR(255),

  -- Google Calendar Integration
  google_calendar_id VARCHAR(500),
  google_calendar_sync_interval INTEGER DEFAULT 15, -- minutes

  -- UI/UX Settings
  theme_color VARCHAR(20) DEFAULT '#0D98BA',
  enable_dark_mode BOOLEAN DEFAULT false,
  items_per_page INTEGER DEFAULT 20,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings if none exist
INSERT INTO public.app_settings (
  committee_name,
  school_name,
  academic_year,
  contact_email,
  contact_phone
)
SELECT
  'ועד הורים',
  'בית ספר יסודי',
  '2024-2025',
  'committee@school.org',
  '050-1234567'
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read settings
CREATE POLICY "Anyone can view settings"
  ON public.app_settings
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can update settings (handled by API with password)
CREATE POLICY "Authenticated users can update settings"
  ON public.app_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_app_settings_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_app_settings_updated_at ON public.app_settings(updated_at);

-- Comments
COMMENT ON TABLE public.app_settings IS 'Global application settings and configuration';
COMMENT ON COLUMN public.app_settings.committee_name IS 'Name of the parent committee';
COMMENT ON COLUMN public.app_settings.enable_google_calendar IS 'Enable Google Calendar sync';
COMMENT ON COLUMN public.app_settings.google_calendar_sync_interval IS 'Calendar sync interval in minutes';
