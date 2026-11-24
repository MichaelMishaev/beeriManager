-- Import November 2026 Calendar Events (חשוון–כסלו תשפ"ז)
-- Migration created: 2026-11-03
-- Source: לוח אירועים בית ספרי נובמבר 2026 (נושא החודש: שונות)
-- All events are all-day (no times given).
-- INCOMPLETE: the pasted source was corrupted between Nov 9 and Nov 12.
--   * Nov 9: only the first event was readable; the second ("פעילות חווייתית באמצעות סימולטור
--     בנושא זה"ב לכיתות ה'-ו'") was cut off mid-line, so it is NOT included.
--   * Nov 10, 11, 12: missing from the paste entirely (Nov 12 had no events listed in the readable fragment).
--   Add these in a follow-up migration once the full source is available.

INSERT INTO events (title, description, start_datetime, event_type, status, visibility, priority, created_by) VALUES
-- November 2 (Monday)
('מפגש של סופר סת"ם עם תלמידי שכבת ב''', NULL, '2026-11-02T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- November 3 (Tuesday)
('חיסונים לשכבת ב''', NULL, '2026-11-03T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
('טורניר כדורסל בנים', NULL, '2026-11-03T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- November 6 (Friday)
('הפנינג בחירות למועצת התלמידים', NULL, '2026-11-06T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- November 8 (Sunday)
('שבוע בטיחות בדרכים', NULL, '2026-11-08T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- November 9 (Monday) -- second event cut off in source, omitted
('הפסקה פעילה לכבוד חג הסיגד', NULL, '2026-11-09T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- November 13 (Friday)
('מסיבת קבלת ספר תורה לכיתות ב''', NULL, '2026-11-13T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
('חונכות תלמידי כיתות א'' ותלמידי כיתות ו'' בנושא זהירות בדרכים', NULL, '2026-11-13T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- November 16 (Monday)
('יום הזיכרון לדוד בן-גוריון', NULL, '2026-11-16T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
('בחירות למועצת התלמידים', NULL, '2026-11-16T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- November 20 (Friday)
('יום זכויות הילד הבינלאומי', NULL, '2026-11-20T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- November 24 (Tuesday)
('טורניר כדורסל בנות', NULL, '2026-11-24T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- November 27 (Friday)
('יום הוקרה לפצועי צה"ל ומערכות ישראל', NULL, '2026-11-27T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
('הכנת שי ביחד עם ברכות לבית לוינשטיין', NULL, '2026-11-27T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- November 29 (Sunday)
('כ"ט בנובמבר', NULL, '2026-11-29T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
('שבוע יהודי-ישראלי', NULL, '2026-11-29T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
('פעילות "ישראל בחלל" בפלנתניה לכיתות ה''-ו''', NULL, '2026-11-29T00:00:00Z', 'trip', 'published', 'public', 'normal', 'admin'),
-- November 30 (Monday)
('הצגה בהיכל התרבות לכיתות ג''-ד''', NULL, '2026-11-30T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin');
