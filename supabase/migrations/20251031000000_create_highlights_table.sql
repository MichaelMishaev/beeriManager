-- Create highlights table for school achievements, events, and news
-- This table stores carousel highlights shown on the homepage

CREATE TABLE IF NOT EXISTS public.highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('achievement', 'sports', 'award', 'event', 'announcement')),
  icon TEXT NOT NULL, -- Emoji icon

  -- Bilingual content
  title_he TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  description_he TEXT NOT NULL,
  description_ru TEXT NOT NULL,
  category_he TEXT NOT NULL,
  category_ru TEXT NOT NULL,

  -- Optional fields
  event_date DATE, -- For future events or past achievements
  image_url TEXT, -- Optional image URL (future feature)
  image_placeholder TEXT, -- Emoji or icon as placeholder

  -- Call-to-action
  cta_text_he TEXT,
  cta_text_ru TEXT,
  cta_link TEXT,

  -- Badge styling
  badge_color TEXT NOT NULL DEFAULT 'bg-gradient-to-r from-blue-400 to-blue-500 text-blue-900',

  -- Display settings
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0, -- Lower numbers appear first
  start_date TIMESTAMPTZ, -- When to start showing (optional)
  end_date TIMESTAMPTZ, -- When to stop showing (optional)

  -- Share settings
  share_text_he TEXT,
  share_text_ru TEXT,

  -- Metadata
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.highlights IS 'Stores school highlights, achievements, and announcements for homepage carousel';
COMMENT ON COLUMN public.highlights.type IS 'Type of highlight: achievement, sports, award, event, or announcement';
COMMENT ON COLUMN public.highlights.icon IS 'Emoji icon to display (e.g., 🏆, ⚽, 🎖️)';
COMMENT ON COLUMN public.highlights.title_he IS 'Hebrew title of the highlight';
COMMENT ON COLUMN public.highlights.title_ru IS 'Russian title of the highlight';
COMMENT ON COLUMN public.highlights.description_he IS 'Hebrew description';
COMMENT ON COLUMN public.highlights.description_ru IS 'Russian description';
COMMENT ON COLUMN public.highlights.category_he IS 'Hebrew category label (e.g., הישגים, ספורט)';
COMMENT ON COLUMN public.highlights.category_ru IS 'Russian category label (e.g., Достижения, Спорт)';
COMMENT ON COLUMN public.highlights.event_date IS 'Date of the event or achievement';
COMMENT ON COLUMN public.highlights.image_url IS 'Optional image URL for the highlight';
COMMENT ON COLUMN public.highlights.image_placeholder IS 'Emoji/icon placeholder when no image';
COMMENT ON COLUMN public.highlights.cta_text_he IS 'Hebrew call-to-action button text';
COMMENT ON COLUMN public.highlights.cta_text_ru IS 'Russian call-to-action button text';
COMMENT ON COLUMN public.highlights.cta_link IS 'URL for the call-to-action button';
COMMENT ON COLUMN public.highlights.badge_color IS 'Tailwind CSS classes for badge styling';
COMMENT ON COLUMN public.highlights.is_active IS 'Whether the highlight is currently active';
COMMENT ON COLUMN public.highlights.display_order IS 'Order in which highlights appear (lower = first)';
COMMENT ON COLUMN public.highlights.start_date IS 'Optional start date for displaying highlight';
COMMENT ON COLUMN public.highlights.end_date IS 'Optional end date for displaying highlight';
COMMENT ON COLUMN public.highlights.share_text_he IS 'Custom Hebrew share text';
COMMENT ON COLUMN public.highlights.share_text_ru IS 'Custom Russian share text';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_highlights_type ON public.highlights(type);
CREATE INDEX IF NOT EXISTS idx_highlights_is_active ON public.highlights(is_active);
CREATE INDEX IF NOT EXISTS idx_highlights_display_order ON public.highlights(display_order);
CREATE INDEX IF NOT EXISTS idx_highlights_event_date ON public.highlights(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_highlights_dates ON public.highlights(start_date, end_date) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active highlights" ON public.highlights;
DROP POLICY IF EXISTS "Service role can do everything" ON public.highlights;

-- Allow public to view active highlights within date range
CREATE POLICY "Public can view active highlights"
  ON public.highlights
  FOR SELECT
  TO public
  USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- Allow service role (used by API with JWT) to do everything
CREATE POLICY "Service role can do everything"
  ON public.highlights
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_highlights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_highlights_updated_at ON public.highlights;

CREATE TRIGGER trigger_update_highlights_updated_at
  BEFORE UPDATE ON public.highlights
  FOR EACH ROW
  EXECUTE FUNCTION update_highlights_updated_at();

-- Insert sample data (the 5 mock highlights we created)
INSERT INTO public.highlights (
  type, icon, title_he, title_ru, description_he, description_ru,
  category_he, category_ru, event_date, image_placeholder,
  cta_text_he, cta_text_ru, badge_color, display_order
) VALUES
(
  'achievement',
  '🏆',
  'הישג מדהים בתחרות המתמטיקה הארצית!',
  'Потрясающее достижение на национальном конкурсе по математике!',
  'תלמידי כיתה ו'' זכו במקום הראשון בתחרות המתמטיקה הארצית. מזל טוב!',
  'Ученики 6 класса заняли первое место на национальном конкурсе по математике. Поздравляем!',
  'הישגים',
  'Достижения',
  '2025-10-25',
  '🎓',
  'קרא עוד',
  'Читать далее',
  'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900',
  1
),
(
  'sports',
  '⚽',
  'גמר כדורגל בין-כיתתי הקרוב!',
  'Скоро финал межклассного футбола!',
  'הגמר הגדול בין כיתה ה'' לכיתה ו'' יתקיים ביום רביעי הקרוב. בואו לעודד!',
  'Большой финал между 5 и 6 классами состоится в следующую среду. Приходите поддержать!',
  'ספורט',
  'Спорт',
  '2025-11-05',
  '⚽',
  'פרטים נוספים',
  'Подробнее',
  'bg-gradient-to-r from-green-400 to-green-500 text-green-900',
  2
),
(
  'award',
  '🎖️',
  'מורה מצטיינת - גב'' רחל כהן',
  'Выдающийся учитель - г-жа Рахель Коэн',
  'גב'' רחל כהן זכתה בפרס המורה המצטיינת של משרד החינוך. גאים בך!',
  'Г-жа Рахель Коэн получила награду выдающегося учителя от Министерства образования. Гордимся вами!',
  'פרסים',
  'Награды',
  '2025-10-20',
  '👩‍🏫',
  NULL,
  NULL,
  'bg-gradient-to-r from-purple-400 to-purple-500 text-purple-900',
  3
),
(
  'sports',
  '🏀',
  'אליפות כדורסל אזורית - נבחרת בית הספר',
  'Региональный чемпионат по баскетболу - школьная команда',
  'נבחרת הכדורסל שלנו עלתה לחצי גמר האליפות האזורית! המשחק הבא: 15 בנובמבר',
  'Наша баскетбольная команда вышла в полуфинал регионального чемпионата! Следующая игра: 15 ноября',
  'ספורט',
  'Спорт',
  '2025-11-15',
  '🏀',
  'לוח משחקים',
  'Расписание игр',
  'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900',
  4
),
(
  'event',
  '🎉',
  'יום משפחות - 22 בנובמבר',
  'День семьи - 22 ноября',
  'הצטרפו אלינו ליום משפחות מיוחד! פעילויות, הופעות, אוכל טעים ועוד הפתעות.',
  'Присоединяйтесь к нам на особенный День семьи! Мероприятия, выступления, вкусная еда и другие сюрпризы.',
  'אירועים',
  'События',
  '2025-11-22',
  '👨‍👩‍👧‍👦',
  'הרשמה',
  'Регистрация',
  'bg-gradient-to-r from-pink-400 to-pink-500 text-pink-900',
  5
);
