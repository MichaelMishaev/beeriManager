-- Import October 2026 Calendar Events (תשרי–חשוון תשפ"ז)
-- Migration created: 2026-10-16
-- Source: לוח אירועים בית ספרי אוקטובר 2026
-- All events are all-day (no times given). Oct 12 (logo only, "שיתוף והשתתפות") intentionally skipped.

INSERT INTO events (title, description, start_datetime, event_type, status, visibility, priority, created_by) VALUES
-- October 1 (Thursday)
('ה'' חול המועד סוכות', NULL, '2026-10-01T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- October 2 (Friday)
('הושענא רבה', NULL, '2026-10-02T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- October 3 (Saturday)
('שמחת תורה', NULL, '2026-10-03T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- October 4 (Sunday)
('אסרו חג', NULL, '2026-10-04T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- October 5 (Monday)
('יום הזיכרון הלאומי לאירועי שבעה באוקטובר', 'טקס בהובלת אנה וחברי המועצה', '2026-10-05T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- October 6 (Tuesday)
('חיסונים לכיתות א''1, א''2, א''3', NULL, '2026-10-06T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- October 11 (Sunday)
('המשך חיסונים לכיתות א''', NULL, '2026-10-11T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- October 18 (Sunday)
('שבוע יהודי-ישראלי | שבוע עליות', NULL, '2026-10-18T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
('פעילות "ישראל בחלל" בפלנתניה לכיתות ה''-ו''', NULL, '2026-10-18T00:00:00Z', 'trip', 'published', 'public', 'normal', 'admin'),
('מפגש עם הורי שכבה ו''', NULL, '2026-10-18T00:00:00Z', 'meeting', 'published', 'public', 'normal', 'admin'),
('מפגש הנהגת הורים', NULL, '2026-10-18T00:00:00Z', 'meeting', 'published', 'public', 'normal', 'admin'),
-- October 19 (Monday)
('פעילות "שרים ביחד - מנצחים ביחד"', 'במתנ"ס קריית השרון', '2026-10-19T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- October 22 (Thursday)
('יום הזיכרון ליצחק רבין', 'מעגלי שיח בנושא סובלנות ודמוקרטיה', '2026-10-22T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- October 24 (Saturday)
('מעבר לשעון חורף', NULL, '2026-10-24T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- October 25 (Sunday)
('בדרך לבחירות', 'לומדים על זכויות וחובות, משפיעים ומובילים', '2026-10-25T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- October 27 (Tuesday)
('יום חופש - בחירות', NULL, '2026-10-27T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin'),
-- October 30 (Friday)
('יום ההליכה הבינלאומי', NULL, '2026-10-30T00:00:00Z', 'general', 'published', 'public', 'normal', 'admin');
