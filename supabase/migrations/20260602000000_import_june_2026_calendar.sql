-- Import June 2026 Calendar Events (סיוון–תמוז)
-- Migration created: 2026-06-02
-- Source: לוח אירועים בית ספרי סיוון-תמוז, יוני 2026

-- June 1 (Monday) – יום הוקרה לצוות בית הספר
INSERT INTO events (title, description, start_datetime, event_type, status, visibility, priority, created_by) VALUES
(
  'יום הוקרה לצוות בית הספר',
  NULL,
  '2026-06-01T00:00:00Z',
  'general',
  'published',
  'public',
  'normal',
  'admin'
);

-- June 3 (Wednesday) – מפגש סיום פרלמנט עירוני + הצגה א׳-ב׳
INSERT INTO events (title, description, start_datetime, event_type, status, visibility, priority, created_by) VALUES
(
  'מפגש סיום - פרלמנט עירוני',
  NULL,
  '2026-06-03T00:00:00Z',
  'meeting',
  'published',
  'public',
  'normal',
  'admin'
),
(
  'הצגה לכיתות א''-ב'': "מעשה בשלושה אגוזים"',
  NULL,
  '2026-06-03T00:00:00Z',
  'general',
  'published',
  'public',
  'normal',
  'admin'
);

-- June 8 (Monday) – הפנינג (לא ודאי)
INSERT INTO events (title, description, start_datetime, event_type, status, visibility, priority, created_by) VALUES
(
  'הפנינג "על המחנך ערך הדרך"',
  'בהתאם לאישור',
  '2026-06-08T00:00:00Z',
  'general',
  'published',
  'public',
  'normal',
  'admin'
);

-- June 9 (Tuesday) – יום האחדות
INSERT INTO events (title, description, start_datetime, event_type, status, visibility, priority, created_by) VALUES
(
  'יום האחדות',
  NULL,
  '2026-06-09T00:00:00Z',
  'general',
  'published',
  'public',
  'high',
  'admin'
);

-- June 11 (Thursday) – גמר בוטראפיק + הצגה ה׳-ו׳ (לא ודאי)
INSERT INTO events (title, description, start_datetime, event_type, status, visibility, priority, created_by) VALUES
(
  'גמר תחרות "בוטראפיק" לטכניון',
  'בהתאם לאישור',
  '2026-06-11T00:00:00Z',
  'general',
  'published',
  'public',
  'normal',
  'admin'
),
(
  'הצגה לכיתות ה''-ו'': "מעבר לאופק"',
  'בהתאם לאישור',
  '2026-06-11T00:00:00Z',
  'general',
  'published',
  'public',
  'normal',
  'admin'
);

-- June 15 (Monday) – אולימפיאדה + צילומים
INSERT INTO events (title, description, start_datetime, event_type, status, visibility, priority, created_by) VALUES
(
  'אולימפיאדה במתמטיקה לתלמידי כיתות ה''-ו''',
  NULL,
  '2026-06-15T00:00:00Z',
  'general',
  'published',
  'public',
  'normal',
  'admin'
),
(
  'צילום תמונות כיתתיות בשכבות א''-ה''',
  NULL,
  '2026-06-15T00:00:00Z',
  'general',
  'published',
  'public',
  'normal',
  'admin'
);

-- June 19 (Friday) – מסיבת סיום א׳-ד׳
INSERT INTO events (title, description, start_datetime, event_type, status, visibility, priority, created_by) VALUES
(
  'מסיבת סיום שנה כיתות א''-ד''',
  NULL,
  '2026-06-19T00:00:00Z',
  'general',
  'published',
  'public',
  'high',
  'admin'
);

-- June 21 (Sunday) – מפגש סיכום מתנדבים
INSERT INTO events (title, description, start_datetime, event_type, status, visibility, priority, created_by) VALUES
(
  'מפגש סיכום שנה למתנדבים',
  NULL,
  '2026-06-21T00:00:00Z',
  'meeting',
  'published',
  'public',
  'normal',
  'admin'
);

-- June 23 (Tuesday) – מסיבת סיום ו׳
INSERT INTO events (title, description, start_datetime, event_type, status, visibility, priority, created_by) VALUES
(
  'מסיבת סיום לתלמידי כיתות ו''',
  NULL,
  '2026-06-23T00:00:00Z',
  'general',
  'published',
  'public',
  'high',
  'admin'
);

-- June 26 (Friday) – נשף כיתות רוקדות
INSERT INTO events (title, description, start_datetime, event_type, status, visibility, priority, created_by) VALUES
(
  'נשף "כיתות רוקדות" לתלמידי כיתות ה''',
  NULL,
  '2026-06-26T00:00:00Z',
  'general',
  'published',
  'public',
  'high',
  'admin'
);

-- June 28 (Sunday) – מפגש הנהגת הורים + שיר של יום (לא ודאי)
INSERT INTO events (title, description, start_datetime, event_type, status, visibility, priority, created_by) VALUES
(
  'מפגש סיכום שנה - הנהגת הורים',
  'בהתאם לאישור',
  '2026-06-28T00:00:00Z',
  'meeting',
  'published',
  'public',
  'normal',
  'admin'
),
(
  'שיר של יום: אמן למילים / צליל אלוני',
  'בהתאם לאישור',
  '2026-06-28T00:00:00Z',
  'general',
  'published',
  'public',
  'normal',
  'admin'
);

-- June 29 (Monday) – סיום שנת הלימודים + חלוקת תעודות
INSERT INTO events (title, description, start_datetime, event_type, status, visibility, priority, created_by) VALUES
(
  'סיום שנת הלימודים',
  NULL,
  '2026-06-29T00:00:00Z',
  'general',
  'published',
  'public',
  'high',
  'admin'
),
(
  'חלוקת תעודות',
  NULL,
  '2026-06-29T00:00:00Z',
  'general',
  'published',
  'public',
  'high',
  'admin'
);
