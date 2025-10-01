-- ================================================
-- Seed Script: Jewish Holidays 2024-2025 (תשפ״ה)
-- Description: Insert school holidays for academic year 2024-2025
-- Date: 2025-10-02
-- ================================================

-- Clear existing holidays for this academic year
DELETE FROM public.holidays WHERE academic_year = 'תשפ״ה';

-- Insert holidays based on the school calendar
INSERT INTO public.holidays (hebrew_name, name, start_date, end_date, hebrew_date, holiday_type, is_school_closed, icon_emoji, color, academic_year) VALUES

-- ראש השנה (Rosh Hashanah)
('ראש השנה', 'Rosh Hashanah', '2024-10-03', '2024-10-04', 'ד׳ באייר - כ״א באפריל', 'religious', true, '🍎', '#FF8200', 'תשפ״ה'),

-- יום כיפור (Yom Kippur)
('יום כיפור', 'Yom Kippur', '2024-10-12', '2024-10-13', 'י״ג-ט״ו באייר', 'religious', true, '🕊️', '#0D98BA', 'תשפ״ה'),

-- סוכות (Sukkot)
('סוכות', 'Sukkot', '2024-10-17', '2024-10-18', 'י״ח באייר', 'religious', true, '🏡', '#FFBA00', 'תשפ״ה'),

-- שמחת תורה (Simchat Torah)
('שמחת תורה', 'Simchat Torah', '2024-10-25', '2024-10-25', 'כ״ו באייר', 'religious', true, '📜', '#003153', 'תשפ״ה'),

-- חנוכה (Chanukah) - תלמידים יתחדשו ביום חמישי ג׳ בכסלו
('חנוכה', 'Chanukah', '2024-12-26', '2025-01-02', 'כ״ו בכסלו - ג׳ בטבת', 'religious', true, '🕎', '#0D98BA', 'תשפ״ה'),

-- ט״ו בשבט (Tu BiShvat)
('ט״ו בשבט', 'Tu BiShvat', '2025-02-13', '2025-02-13', 'ט״ו בשבט', 'religious', false, '🌳', '#87CEEB', 'תשפ״ה'),

-- פורים (Purim)
('פורים', 'Purim', '2025-03-14', '2025-03-14', 'י״ד באדר', 'religious', true, '🤡', '#FF8200', 'תשפ״ה'),

-- פסח (Passover) - ימים שלישי ורביעי ה׳-ו׳ בניסן
('פסח', 'Passover', '2025-04-13', '2025-04-21', 'ה׳ בניסן - י״ג בניסן', 'religious', true, '🍷', '#FFBA00', 'תשפ״ה'),

-- יום הזיכרון (Memorial Day)
('יום הזיכרון', 'Yom HaZikaron', '2025-05-05', '2025-05-05', 'ז׳ באייר', 'national', true, '🕯️', '#003153', 'תשפ״ה'),

-- יום העצמאות (Independence Day)
('יום העצמאות', 'Independence Day', '2025-05-06', '2025-05-06', 'ח׳ באייר', 'national', true, '🇮🇱', '#0D98BA', 'תשפ״ה'),

-- ל״ג בעומר (Lag BaOmer)
('ל״ג בעומר', 'Lag BaOmer', '2025-05-16', '2025-05-16', 'י״ח באייר', 'religious', false, '🔥', '#FF8200', 'תשפ״ה'),

-- שבועות (Shavuot)
('שבועות', 'Shavuot', '2025-06-02', '2025-06-03', 'ו׳-ז׳ בסיון', 'religious', true, '🌾', '#87CEEB', 'תשפ״ה'),

-- חופשת קיץ (Summer Break)
('חופשת הקיץ', 'Summer Vacation', '2025-07-01', '2025-08-31', 'ו׳ בתמוז - ז׳ באלול', 'school_break', true, '☀️', '#FFBA00', 'תשפ״ה');

-- Update timestamps
UPDATE public.holidays SET updated_at = NOW() WHERE academic_year = 'תשפ״ה';

-- Show inserted holidays
SELECT
  hebrew_name,
  name,
  start_date,
  end_date,
  is_school_closed,
  icon_emoji
FROM public.holidays
WHERE academic_year = 'תשפ״ה'
ORDER BY start_date;
