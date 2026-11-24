-- Import November 2026 Calendar Events, part 2 (events missing from the corrupted first paste)
-- Migration created: 2026-11-03
-- Source: לוח אירועים בית ספרי נובמבר 2026
-- Complements 20261103000000_import_november_2026_calendar.sql. Nov 11 and 12 have no events.
-- Idempotent: each row is skipped if an event with the same title and date already exists.

INSERT INTO events (title, description, start_datetime, event_type, status, visibility, priority, created_by)
SELECT v.title, NULL, v.start_datetime::timestamptz, v.event_type, 'published', 'public', 'normal', 'admin'
FROM (VALUES
  ('פעילות חווייתית באמצעות סימולטור בנושא זה"ב לכיתות ה''-ו''', '2026-11-09T00:00:00Z', 'general'),
  ('חיסוני שפעת לכיתות ב''-ד''', '2026-11-10T00:00:00Z', 'general'),
  ('הרצאת שוטר בנושא רכיבה בטוחה לכיתות ד''', '2026-11-10T00:00:00Z', 'general')
) AS v(title, start_datetime, event_type)
WHERE NOT EXISTS (
  SELECT 1 FROM events e
  WHERE e.title = v.title AND e.start_datetime = v.start_datetime::timestamptz
);
