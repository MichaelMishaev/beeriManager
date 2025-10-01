-- Add sixth grade graduation event with photos
-- This event is in the PAST so it will show up in the "עם תמונות" (with photos) tab

INSERT INTO events (
  title,
  description,
  event_type,
  priority,
  status,
  visibility,
  location,
  start_datetime,
  end_datetime,
  registration_enabled,
  max_attendees,
  current_attendees,
  requires_payment,
  payment_amount,
  budget_allocated,
  budget_spent,
  registration_deadline,
  created_by,
  photos_url
) VALUES (
  'מסיבת סיום כיתות ו׳ 2024',
  E'מסיבת סיום מרגשת לכיתות ו׳!\n\nבתכנית:\n🎓 טקס סיום והענקת תעודות\n🎭 מופע של התלמידים\n🎵 שירה ומחול\n📸 צילומים קבוצתיים\n🍰 מסיבת פיצה וקינוחים\n\nהיה אירוע מרגש ומצליח!\nהתמונות מהאירוע זמינות בקישור למטה.',
  'general',
  'normal',
  'published',
  'public',
  'אולם האירועים - בית הספר',
  '2024-06-20T17:00:00+03:00',  -- Past date: June 20, 2024
  '2024-06-20T21:00:00+03:00',
  false,  -- Registration no longer needed (past event)
  250,
  215,
  false,
  NULL,
  12000,
  11500,
  NULL,
  'admin',
  'https://drive.google.com/drive/folders/1TlwKxDvwySmWSMgDGlxf7mC5Ts5Q1WHL?usp=sharing'
);
