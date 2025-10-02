-- ================================================
-- Migration: 008_add_russian_holiday_translations
-- Description: Add Russian translations to holiday names
-- Date: 2025-10-02
-- ================================================

BEGIN;

-- Set session variables for audit_log trigger
SELECT set_config('app.current_user', 'system_migration', false);
SELECT set_config('app.current_role', 'admin', false);

-- Update holidays with Russian translations
UPDATE holidays SET hebrew_name_i18n = hebrew_name_i18n || jsonb_build_object('ru', 'Рош Ха-Шана') WHERE hebrew_name = 'ראש השנה';
UPDATE holidays SET hebrew_name_i18n = hebrew_name_i18n || jsonb_build_object('ru', 'Йом Кипур') WHERE hebrew_name = 'יום כיפור';
UPDATE holidays SET hebrew_name_i18n = hebrew_name_i18n || jsonb_build_object('ru', 'Суккот') WHERE hebrew_name = 'סוכות';
UPDATE holidays SET hebrew_name_i18n = hebrew_name_i18n || jsonb_build_object('ru', 'Шмини Ацерет') WHERE hebrew_name = 'שמחת תורה';
UPDATE holidays SET hebrew_name_i18n = hebrew_name_i18n || jsonb_build_object('ru', 'Ханука') WHERE hebrew_name = 'חנוכה';
UPDATE holidays SET hebrew_name_i18n = hebrew_name_i18n || jsonb_build_object('ru', 'Ту би-Шват') WHERE hebrew_name = 'ט״ו בשבט';
UPDATE holidays SET hebrew_name_i18n = hebrew_name_i18n || jsonb_build_object('ru', 'Пурим') WHERE hebrew_name = 'פורים';
UPDATE holidays SET hebrew_name_i18n = hebrew_name_i18n || jsonb_build_object('ru', 'Песах') WHERE hebrew_name = 'פסח';
UPDATE holidays SET hebrew_name_i18n = hebrew_name_i18n || jsonb_build_object('ru', 'День Памяти') WHERE hebrew_name = 'יום הזיכרון';
UPDATE holidays SET hebrew_name_i18n = hebrew_name_i18n || jsonb_build_object('ru', 'День Независимости') WHERE hebrew_name = 'יום העצמאות';
UPDATE holidays SET hebrew_name_i18n = hebrew_name_i18n || jsonb_build_object('ru', 'Лаг ба-Омер') WHERE hebrew_name = 'ל״ג בעומר';
UPDATE holidays SET hebrew_name_i18n = hebrew_name_i18n || jsonb_build_object('ru', 'Шавуот') WHERE hebrew_name = 'שבועות';
UPDATE holidays SET hebrew_name_i18n = hebrew_name_i18n || jsonb_build_object('ru', 'Летние каникулы') WHERE hebrew_name = 'חופש קיץ';

-- Verify updates
SELECT id, hebrew_name, hebrew_name_i18n->>'he' as name_he, hebrew_name_i18n->>'ru' as name_ru
FROM holidays
ORDER BY start_date
LIMIT 5;

COMMIT;
