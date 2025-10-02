-- ================================================
-- Migration: 007_migrate_i18n_data_with_audit
-- Description: Migrate existing Hebrew content to i18n columns
--              with audit_log trigger compatibility
-- Date: 2025-10-02
-- ================================================

-- Wrap everything in a transaction and set session variables
BEGIN;

-- Set session variables for audit_log trigger
SELECT set_config('app.current_user', 'system_migration', false);
SELECT set_config('app.current_role', 'admin', false);

-- ==================== EVENTS MIGRATION ====================

UPDATE events
SET
  title_i18n = jsonb_build_object('he', 'ישיבת ועד חודשית - דצמבר 2024'),
  description_i18n = jsonb_build_object('he', 'ישיבת ועד הורים חודשית לחודש דצמבר.

נושאים לדיון:
- סיכום פעילות נובמבר
- תכנון אירועי חנוכה
- אישור תקציב לפעילות חורף
- עדכון על פרויקט חידוש חצר בית הספר
- הצעות להרצאות הורים

כולם מוזמנים להשתתף ולהשמיע את דעתם!'),
  location_i18n = jsonb_build_object('he', 'חדר המורים, בית ספר יסודי')
WHERE id = 'c8478ab0-9e89-46e8-9238-b778aeb2b638';

UPDATE events
SET
  title_i18n = jsonb_build_object('he', 'מסיבת חנוכה לכל המשפחה'),
  description_i18n = jsonb_build_object('he', 'חגיגת חנוכה מיוחדת לכל תלמידי בית הספר והוריהם!

בתכנית:
🕯️ הדלקת נרות משותפת
🍩 דוכני סופגניות ולביבות
🎭 הצגת חנוכה של כיתות ד׳
🎵 שירה בציבור
🎁 שוק חנוכה - יריד יצירות תלמידים

הכניסה חופשית!
יש להביא צלחות וכלים רב פעמיים.'),
  location_i18n = jsonb_build_object('he', 'אולם הספורט של בית הספר')
WHERE id = '9d50cf39-4f30-4285-84ed-092832994b9b';

UPDATE events
SET
  title_i18n = jsonb_build_object('he', 'הרצאת הורים: "גבולות בעידן הדיגיטלי"'),
  description_i18n = jsonb_build_object('he', 'הרצאה מרתקת להורים בנושא הצבת גבולות לילדים בעולם הדיגיטלי.

המרצה: ד"ר יעל כהן, פסיכולוגית קלינית ומומחית להתמכרויות דיגיטליות

נושאי ההרצאה:
• זמן מסך מומלץ לפי גילאים
• סימני אזהרה להתמכרות
• כלים מעשיים להצבת גבולות
• יצירת הסכם משפחתי לשימוש במסכים
• מענה לשאלות הורים

ההרצאה מיועדת להורי תלמידים בכל הגילאים.
כיבוד קל יוגש בהפסקה.'),
  location_i18n = jsonb_build_object('he', 'אולם הכנסים, קומה 2')
WHERE id = '7b1e6436-d1f9-42cb-bbbf-915c3b7457b7';

UPDATE events
SET
  title_i18n = jsonb_build_object('he', 'טיול משפחות לירושלים'),
  description_i18n = jsonb_build_object('he', 'טיול משפחות מאורגן לירושלים!

מסלול הטיול:
🚌 07:00 - יציאה מבית הספר
🏛️ 09:00 - סיור מודרך במוזיאון ישראל
🍔 12:00 - ארוחת צהריים (עצמאית)
🎨 14:00 - סדנת יצירה לילדים במוזיאון
🛍️ 16:00 - זמן חופשי בשוק מחנה יהודה
🚌 18:00 - חזרה הביתה

המחיר כולל: הסעה, כניסה למוזיאון וסדנה.
המחיר אינו כולל: ארוחת צהריים.

מספר המקומות מוגבל!'),
  location_i18n = jsonb_build_object('he', 'נקודת איסוף: חניית בית הספר')
WHERE id = 'adeeaaae-b855-4e14-b699-9ea78797a154';

UPDATE events
SET
  title_i18n = jsonb_build_object('he', 'יום ספורט בית ספרי'),
  description_i18n = jsonb_build_object('he', 'יום ספורט וכיף לכל תלמידי בית הספר!

לו"ז היום:
08:30 - התכנסות וחלוקה לבתים
09:00 - טקס פתיחה
09:30 - תחרויות ספורט לפי שכבות
11:00 - הפסקת פירות
11:30 - משחקי בתים
13:00 - טקס סיום וחלוקת גביעים

תלמידים נדרשים להגיע עם:
- בגדי ספורט ונעלי ספורט
- כובע
- בקבוק מים
- ארוחת בוקר

ועד ההורים ידאג לפירות ושתייה קרה במהלך היום.'),
  location_i18n = jsonb_build_object('he', 'מגרש הספורט של בית הספר')
WHERE id = '8906aa16-a0f2-4ca7-9e32-2d3a00df5916';

UPDATE events
SET
  title_i18n = jsonb_build_object('he', 'ערב גיוס כספים - מכירת עוגות'),
  description_i18n = jsonb_build_object('he', 'ערב גיוס כספים למען שיפוץ ספריית בית הספר.

מה בתכנית:
🍰 מכירת עוגות בית - תרומת ההורים
☕ בית קפה זמני
🎶 מוזיקה חיה - תלמידי המגמה המוזיקלית
🎯 דוכני משחקים לילדים
🎁 הגרלה - פרס ראשון: סופ"ש בצימר!

כל ההכנסות קודש לשיפוץ הספרייה!

הורים המעוניינים לתרום עוגות מתבקשים להירשם מראש.'),
  location_i18n = jsonb_build_object('he', 'חצר בית הספר')
WHERE id = 'fa646906-06af-4879-88ad-7a09e092f786';

-- ==================== TASKS MIGRATION ====================

UPDATE tasks
SET
  title_i18n = jsonb_build_object('he', 'הזמנת כיבוד לישיבת הועד'),
  description_i18n = jsonb_build_object('he', 'להזמין כיבוד קל לישיבת הועד החודשית - עוגיות, פירות, שתייה חמה וקרה')
WHERE id = 'dc70dce2-549f-495a-95ca-9392778a8925';

UPDATE tasks
SET
  title_i18n = jsonb_build_object('he', 'תיאום הסעות לטיול לירושלים'),
  description_i18n = jsonb_build_object('he', 'ליצור קשר עם חברת ההסעות, לקבל הצעות מחיר ולסגור הזמנה ל-2 אוטובוסים')
WHERE id = 'a740c76d-7b4d-453a-a31e-a817b2fb9c80';

UPDATE tasks
SET
  title_i18n = jsonb_build_object('he', 'הכנת מצגת לישיבת ההורים'),
  description_i18n = jsonb_build_object('he', 'להכין מצגת עם סיכום פעילות הועד לרבעון האחרון')
WHERE id = '5b668f7a-db78-4208-a13b-d077fa06e076';

UPDATE tasks
SET
  title_i18n = jsonb_build_object('he', 'פרסום אירוע חנוכה ברשתות החברתיות'),
  description_i18n = jsonb_build_object('he', 'להכין פוסט מעוצב ולפרסם בקבוצות הווטסאפ ובפייסבוק של ההורים')
WHERE id = '2995f11b-c836-4eba-8b47-222c7cf80f9a';

UPDATE tasks
SET
  title_i18n = jsonb_build_object('he', 'רכישת פרסים להגרלה'),
  description_i18n = jsonb_build_object('he', 'לרכוש פרסים להגרלה בערב גיוס הכספים - תקציב 2000 ש"ח')
WHERE id = '7e63a138-aaa0-44eb-84a0-1602a1e7011a';

-- ==================== VERIFICATION ====================
-- Check migration results

SELECT
  'events' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN title_i18n->>'he' IS NOT NULL THEN 1 END) as migrated
FROM events;

SELECT
  'tasks' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN title_i18n->>'he' IS NOT NULL THEN 1 END) as migrated
FROM tasks;

-- Show sample migrated data
SELECT id, title, title_i18n->>'he' as title_he FROM events LIMIT 3;
SELECT id, title, title_i18n->>'he' as title_he FROM tasks LIMIT 3;

-- Commit the transaction
COMMIT;
