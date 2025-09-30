-- Committees table for managing responsibility groups (וועדות)
-- Run this SQL in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6', -- hex color for visual indicator
  responsibilities TEXT[] DEFAULT '{}', -- array of responsibility keywords
  members TEXT[] DEFAULT '{}', -- array of member names

  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  version INTEGER DEFAULT 1
);

-- Create index for name search
CREATE INDEX IF NOT EXISTS idx_committees_name ON committees(name);

-- Create index for created_at for ordering
CREATE INDEX IF NOT EXISTS idx_committees_created_at ON committees(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view committees (public read)
CREATE POLICY "Public can view committees"
  ON committees
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can manage committees"
  ON committees
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_committees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER committees_updated_at
  BEFORE UPDATE ON committees
  FOR EACH ROW
  EXECUTE FUNCTION update_committees_updated_at();

-- Insert sample data (optional)
INSERT INTO committees (name, description, color, responsibilities, members) VALUES
  ('ועדת חינוך', 'וועדה לניהול תכניות חינוך והשתלמויות', '#FF8200', ARRAY['ארגון הרצאות', 'סדנאות הורים', 'קריאה עם ההורים'], ARRAY['שרה לוי', 'דוד כהן', 'מיכל אברהם']),
  ('ועדת תרבות', 'וועדה לתכנון אירועי תרבות ובידור', '#0D98BA', ARRAY['ארגון ימי כיף', 'מסיבות חגים', 'פעילויות קיץ'], ARRAY['רחל שפירא', 'יוסי כץ']),
  ('ועדת כספים', 'וועדה לניהול תקציב וגיוס כספים', '#003153', ARRAY['ניהול תקציב', 'גיוס כספים', 'אישור הוצאות'], ARRAY['אבי גולן', 'נורית ברק']);