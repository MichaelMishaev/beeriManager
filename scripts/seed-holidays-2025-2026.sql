-- ================================================
-- Seed Script: Jewish Holidays 2025-2026 (תשפ״ו)
-- Description: Insert school holidays for academic year 2025-2026
-- Based on school calendar document
-- Date: 2025-10-02
-- ================================================

-- Clear existing holidays for this academic year
DELETE FROM public.holidays WHERE academic_year = 'תשפ״ו';

-- Insert holidays based on the school calendar document
INSERT INTO public.holidays (hebrew_name, name, start_date, end_date, hebrew_date, holiday_type, is_school_closed, icon_emoji, color, academic_year) VALUES

-- ראש השנה (Rosh Hashanah) - ימים שני עד רביעי ב׳-ד׳ בתשרי
-- התלמודים יתחדשו ביום חמישי ג׳ בתשרי 25 בספטמבר
('ראש השנה', 'Rosh Hashanah', '2025-09-22', '2025-09-24', 'ב׳-ד׳ בתשרי', 'religious', true, '🍎', '#FF8200', 'תשפ״ו'),

-- יום כיפורים וסוכות (Yom Kippur & Sukkot) - מיום רביעי עד שלישי י״ב-כ״ב בתשרי
-- התלמודים יתחדשו ביום רביעי כ״ג בתשרי 15 באוקטובר
('יום כיפורים וסוכות', 'Yom Kippur & Sukkot', '2025-10-01', '2025-10-14', 'י״ב-כ״ב בתשרי', 'religious', true, '🕊️', '#0D98BA', 'תשפ״ו'),

-- חנוכה (Chanukah) - מיום שלישי עד יום שני כ״ה בכסלו-ב׳ בטבת
-- התלמודים יתחדשו ביום שלישי ג׳ בטבת 23 בדצמבר
('חנוכה', 'Chanukah', '2025-12-16', '2025-12-22', 'כ״ה בכסלו-ב׳ בטבת', 'religious', true, '🕎', '#FFBA00', 'תשפ״ו'),

-- פורים (Purim) - ימים שלישי ורביעי י״ד-ט״ו באדר
-- התלמודים יתחדשו ביום חמישי ט״ז באדר 5 במרץ
('פורים', 'Purim', '2026-03-03', '2026-03-04', 'י״ד-ט״ו באדר', 'religious', true, '🤡', '#FF8200', 'תשפ״ו'),

-- פסח (Passover) - מיום שלישי עד יום רביעי א׳-י״א בניסן
-- התלמודים יתחדשו ביום חמישי כ״ב בניסן 9 באפריל
('פסח', 'Passover', '2026-03-24', '2026-04-08', 'י׳-כ״א בניסן', 'religious', true, '🍷', '#FFBA00', 'תשפ״ו'),

-- אין חופש - יום הזיכרון - ימים רביעי ד׳ באייר בשעה 12:00
-- (No school closure - memorial at 12:00)
('יום הזיכרון', 'Memorial Day', '2026-04-21', '2026-04-21', 'ד׳ באייר', 'national', false, '🕯️', '#003153', 'תשפ״ו'),

-- יום העצמאות (Independence Day) - יום רביעי ה׳ באייר
-- התלמודים יתחדשו ביום חמישי ו׳ באייר 23 באפריל
('יום העצמאות', 'Independence Day', '2026-04-22', '2026-04-22', 'ה׳ באייר', 'national', true, '🇮🇱', '#0D98BA', 'תשפ״ו'),

-- ל״ג בעומר (Lag BaOmer) - יום שלישי י״ח באייר
-- התלמודים יתחדשו ביום רביעי י״ט באייר 6 במאי
('ל״ג בעומר', 'Lag BaOmer', '2026-05-05', '2026-05-05', 'י״ח באייר', 'religious', true, '🔥', '#FF8200', 'תשפ״ו'),

-- שבועות (Shavuot) - ימים חמישי ושישי ה׳-ו׳ בסיון
-- התלמודים יתחדשו ביום ראשון ז׳ בסיון 24 במאי
('שבועות', 'Shavuot', '2026-05-21', '2026-05-22', 'ה׳-ו׳ בסיון', 'religious', true, '🌾', '#87CEEB', 'תשפ״ו'),

-- חופשת קיץ (Summer Break) - היום האחרון של שנת הלמודים
-- אי״ה ביום שלישי ט״ו בתמוז 30 ביוני
('חופשת הקיץ', 'Summer Vacation', '2026-06-30', '2026-08-31', 'ט״ו בתמוז - ז׳ באלול', 'school_break', true, '☀️', '#FFBA00', 'תשפ״ו');

-- Update timestamps
UPDATE public.holidays SET updated_at = NOW() WHERE academic_year = 'תשפ״ו';

-- Show inserted holidays
SELECT
  hebrew_name,
  name,
  start_date,
  end_date,
  is_school_closed,
  icon_emoji
FROM public.holidays
WHERE academic_year = 'תשפ״ו'
ORDER BY start_date;
