-- ================================================
-- Migration: 006_add_i18n_support
-- Description: Add JSONB columns for bilingual content (Hebrew + Russian)
-- Date: 2024-10-02
-- Safety: Non-destructive (keeps existing columns)
-- ================================================

-- ==================== UP ====================

-- 1. EVENTS TABLE
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS title_i18n JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description_i18n JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS location_i18n JSONB DEFAULT '{}';

COMMENT ON COLUMN public.events.title_i18n IS 'Localized event title: {"he": "...", "ru": "..."}';
COMMENT ON COLUMN public.events.description_i18n IS 'Localized event description: {"he": "...", "ru": "..."}';
COMMENT ON COLUMN public.events.location_i18n IS 'Localized event location: {"he": "...", "ru": "..."}';

-- 2. TASKS TABLE
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS title_i18n JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description_i18n JSONB DEFAULT '{}';

COMMENT ON COLUMN public.tasks.title_i18n IS 'Localized task title: {"he": "...", "ru": "..."}';
COMMENT ON COLUMN public.tasks.description_i18n IS 'Localized task description: {"he": "...", "ru": "..."}';

-- 3. ISSUES TABLE
ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS title_i18n JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description_i18n JSONB DEFAULT '{}';

COMMENT ON COLUMN public.issues.title_i18n IS 'Localized issue title: {"he": "...", "ru": "..."}';
COMMENT ON COLUMN public.issues.description_i18n IS 'Localized issue description: {"he": "...", "ru": "..."}';

-- 4. PROTOCOLS TABLE
ALTER TABLE public.protocols
  ADD COLUMN IF NOT EXISTS title_i18n JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description_i18n JSONB DEFAULT '{}';

COMMENT ON COLUMN public.protocols.title_i18n IS 'Localized protocol title: {"he": "...", "ru": "..."}';
COMMENT ON COLUMN public.protocols.description_i18n IS 'Localized protocol description: {"he": "...", "ru": "..."}';

-- 5. HOLIDAYS TABLE
ALTER TABLE public.holidays
  ADD COLUMN IF NOT EXISTS name_i18n JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description_i18n JSONB DEFAULT '{}';

COMMENT ON COLUMN public.holidays.name_i18n IS 'Localized holiday name: {"he": "...", "ru": "..."}';
COMMENT ON COLUMN public.holidays.description_i18n IS 'Localized holiday description: {"he": "...", "ru": "..."}';

-- 6. COMMITTEES TABLE
ALTER TABLE public.committees
  ADD COLUMN IF NOT EXISTS name_i18n JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description_i18n JSONB DEFAULT '{}';

COMMENT ON COLUMN public.committees.name_i18n IS 'Localized committee name: {"he": "...", "ru": "..."}';
COMMENT ON COLUMN public.committees.description_i18n IS 'Localized committee description: {"he": "...", "ru": "..."}';

-- 7. ANONYMOUS_FEEDBACK TABLE - Add locale tracking
ALTER TABLE public.anonymous_feedback
  ADD COLUMN IF NOT EXISTS submission_locale VARCHAR(5) DEFAULT 'he';

COMMENT ON COLUMN public.anonymous_feedback.submission_locale IS 'Language used when submitting feedback (he/ru)';

-- 8. Create indexes for performance (JSONB GIN indexes)
CREATE INDEX IF NOT EXISTS idx_events_title_i18n_gin ON public.events USING gin(title_i18n);
CREATE INDEX IF NOT EXISTS idx_events_description_i18n_gin ON public.events USING gin(description_i18n);

CREATE INDEX IF NOT EXISTS idx_tasks_title_i18n_gin ON public.tasks USING gin(title_i18n);
CREATE INDEX IF NOT EXISTS idx_tasks_description_i18n_gin ON public.tasks USING gin(description_i18n);

CREATE INDEX IF NOT EXISTS idx_issues_title_i18n_gin ON public.issues USING gin(title_i18n);
CREATE INDEX IF NOT EXISTS idx_issues_description_i18n_gin ON public.issues USING gin(description_i18n);

CREATE INDEX IF NOT EXISTS idx_protocols_title_i18n_gin ON public.protocols USING gin(title_i18n);
CREATE INDEX IF NOT EXISTS idx_protocols_description_i18n_gin ON public.protocols USING gin(description_i18n);

CREATE INDEX IF NOT EXISTS idx_holidays_name_i18n_gin ON public.holidays USING gin(name_i18n);
CREATE INDEX IF NOT EXISTS idx_holidays_description_i18n_gin ON public.holidays USING gin(description_i18n);

CREATE INDEX IF NOT EXISTS idx_committees_name_i18n_gin ON public.committees USING gin(name_i18n);
CREATE INDEX IF NOT EXISTS idx_committees_description_i18n_gin ON public.committees USING gin(description_i18n);

CREATE INDEX IF NOT EXISTS idx_feedback_submission_locale ON public.anonymous_feedback(submission_locale);

-- 9. Helper function for easy querying
CREATE OR REPLACE FUNCTION get_localized_text(
  json_column JSONB,
  locale TEXT DEFAULT 'he',
  fallback_locale TEXT DEFAULT 'he'
) RETURNS TEXT AS $$
BEGIN
  -- Return locale-specific text, fallback to Hebrew, then first available
  RETURN COALESCE(
    json_column->>locale,
    json_column->>fallback_locale,
    (SELECT value FROM jsonb_each_text(json_column) LIMIT 1),
    ''
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_localized_text IS 'Get localized text from JSONB column with fallback support';

-- 10. Example usage view (optional - for testing)
-- CREATE OR REPLACE VIEW events_localized AS
-- SELECT
--   id,
--   get_localized_text(title_i18n, 'he') as title_he,
--   get_localized_text(title_i18n, 'ru') as title_ru,
--   get_localized_text(description_i18n, 'he') as description_he,
--   get_localized_text(description_i18n, 'ru') as description_ru,
--   start_datetime,
--   end_datetime,
--   created_at
-- FROM events;

-- ==================== DOWN (Rollback) ====================
-- Uncomment and run to rollback this migration:

-- DROP FUNCTION IF EXISTS get_localized_text;
--
-- ALTER TABLE public.events
--   DROP COLUMN IF EXISTS title_i18n,
--   DROP COLUMN IF EXISTS description_i18n,
--   DROP COLUMN IF EXISTS location_i18n;
--
-- ALTER TABLE public.tasks
--   DROP COLUMN IF EXISTS title_i18n,
--   DROP COLUMN IF EXISTS description_i18n;
--
-- ALTER TABLE public.issues
--   DROP COLUMN IF EXISTS title_i18n,
--   DROP COLUMN IF EXISTS description_i18n;
--
-- ALTER TABLE public.protocols
--   DROP COLUMN IF EXISTS title_i18n,
--   DROP COLUMN IF EXISTS description_i18n;
--
-- ALTER TABLE public.holidays
--   DROP COLUMN IF EXISTS name_i18n,
--   DROP COLUMN IF EXISTS description_i18n;
--
-- ALTER TABLE public.committees
--   DROP COLUMN IF EXISTS name_i18n,
--   DROP COLUMN IF EXISTS description_i18n;
--
-- ALTER TABLE public.anonymous_feedback
--   DROP COLUMN IF EXISTS submission_locale;

-- ==================== VERIFICATION ====================
-- Run these queries to verify the migration:

-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'events' AND column_name LIKE '%_i18n';

-- SELECT title, title_i18n FROM events LIMIT 5;
