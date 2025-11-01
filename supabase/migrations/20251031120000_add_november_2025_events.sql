-- Migration: Add November 2025 School Events
-- Description: Insert Hebrew/Russian bilingual events for November 2025 school calendar

-- Insert November 2025 events
INSERT INTO events (
  title,
  title_ru,
  start_datetime,
  end_datetime,
  location,
  location_ru,
  event_type,
  status,
  visibility,
  priority,
  registration_enabled,
  current_attendees,
  rsvp_yes_count,
  rsvp_no_count,
  rsvp_maybe_count,
  budget_spent,
  requires_payment,
  version
) VALUES

-- Event 1: November 2, 2025 - Song of the day + Health education
(
  '🎵 "שיר תקווה" – שיר של יום (מיכאל וקנין) + הדרכה לחינוך לבריאות (כיתות ו'')',
  '🎵 «Песня надежды» – песня дня (Михаэль Вакин) + Урок по здоровому образу жизни (6-е классы)',
  '2025-11-02T00:00:00',
  NULL,
  NULL,
  NULL,
  'general',
  'published',
  'public',
  'normal',
  false,
  0,
  0,
  0,
  0,
  0,
  false,
  1
),

-- Event 2: November 3, 2025 - Yitzhak Rabin Memorial Day
(
  '🕯️ יום הזיכרון ליצחק רבין + מעגלי שיח על אחריות ומעורבות אישית',
  '🕯️ День памяти Ицхака Рабина + Круглые столы на тему ответственности и личного участия',
  '2025-11-03T00:00:00',
  NULL,
  NULL,
  NULL,
  'general',
  'published',
  'public',
  'normal',
  false,
  0,
  0,
  0,
  0,
  0,
  false,
  1
),

-- Event 3: November 5, 2025 - Children's Parliament Opening
(
  '👥 פתיחת מפגש פרלמנט הילדים העירוני',
  '👥 Открытие встречи городского детского парламента',
  '2025-11-05T00:00:00',
  NULL,
  NULL,
  NULL,
  'meeting',
  'published',
  'public',
  'normal',
  false,
  0,
  0,
  0,
  0,
  0,
  false,
  1
),

-- Event 4: November 6, 2025 - Netanya tour + Basketball tournament + Health education
(
  '🚌 סיור "מסע נתנייתי" כיתות ד1, ד2 + 🏀 טורניר כדורסל בנים בבית ספר אילן רמון + הדרכה לבריאות (כיתות ה'')',
  '🚌 Экскурсия «Путешествие по Нетании» (4А, 4Б) + 🏀 Турнир по баскетболу среди мальчиков в школе «Илан Рамон» + Урок по здоровью (5-е классы)',
  '2025-11-06T00:00:00',
  NULL,
  'בית ספר אילן רמון',
  'Школа «Илан Рамон»',
  'trip',
  'published',
  'public',
  'normal',
  false,
  0,
  0,
  0,
  0,
  0,
  false,
  1
),

-- Event 5: November 7, 2025 - Torah reception ceremony
(
  '📖 מסיבת קבלת ספר תורה – כיתות ב''',
  '📖 Праздник получения Торы – 2-е классы',
  '2025-11-07T00:00:00',
  NULL,
  NULL,
  NULL,
  'general',
  'published',
  'public',
  'normal',
  false,
  0,
  0,
  0,
  0,
  0,
  false,
  1
),

-- Event 6: November 9, 2025 - Song of the day + Road safety week + Volunteer meeting
(
  '🎵 "זה מתחיל בצעד" – שיר של יום + שבוע לבטיחות בדרכים + מפגש עם מתנדבים',
  '🎵 «Это начинается с шага» – песня дня + Неделя безопасности дорожного движения + Встреча с волонтёрами',
  '2025-11-09T00:00:00',
  NULL,
  NULL,
  NULL,
  'general',
  'published',
  'public',
  'normal',
  false,
  0,
  0,
  0,
  0,
  0,
  false,
  1
),

-- Event 7: November 13, 2025 - Theater performance + Netanya tour
(
  '🎭 הצגה "הדמיון ואוצרות טרומולו" (כיתות ב'') + 🚌 סיור נתנייתי כיתות ד3, ד4',
  '🎭 Спектакль «Воображение и сокровища Тромоло» (2-е классы) + 🚌 Экскурсия по Нетании (4В, 4Г)',
  '2025-11-13T00:00:00',
  NULL,
  NULL,
  NULL,
  'workshop',
  'published',
  'public',
  'normal',
  false,
  0,
  0,
  0,
  0,
  0,
  false,
  1
),

-- Event 8: November 14, 2025 - 6th grade graduation party + Parent committee meeting
(
  '🎉 מסיבת סיום כיתות ו'' + מפגש הורים עם ועד',
  '🎉 Выпускной вечер 6-х классов + Встреча родителей с комитетом',
  '2025-11-14T00:00:00',
  NULL,
  NULL,
  NULL,
  'meeting',
  'published',
  'public',
  'normal',
  false,
  0,
  0,
  0,
  0,
  0,
  false,
  1
),

-- Event 9: November 16, 2025 - Song of the day + Children's Rights Week + Growth checkups + Maya Center tour
(
  '🎵 "שיר לאהבה" – שיר של יום (איילת ציוני) + 🌈 שבוע זכויות הילד + 🩺 בדיקות גדילה (כיתות א'') + 🚌 סיור "מרכז מאיה" (ב1, ב4)',
  '🎵 «Песня о любви» – песня дня (Аелет Циони) + 🌈 Неделя прав ребёнка + 🩺 Проверка роста (1-е классы) + 🚌 Экскурсия в центр «Майя» (2А, 2Д)',
  '2025-11-16T00:00:00',
  NULL,
  'מרכז מאיה',
  'Центр «Майя»',
  'trip',
  'published',
  'public',
  'normal',
  false,
  0,
  0,
  0,
  0,
  0,
  false,
  1
),

-- Event 10: November 18, 2025 - Maya Center tour + Netanya tour
(
  '🚌 סיור "מרכז מאיה" (א1, א3) + סיור נתנייתי (א2, א4)',
  '🚌 Экскурсия в центр «Майя» (1А, 1В) + Экскурсия по Нетании (1Б, 1Г)',
  '2025-11-18T00:00:00',
  NULL,
  'מרכז מאיה',
  'Центр «Майя»',
  'trip',
  'published',
  'public',
  'normal',
  false,
  0,
  0,
  0,
  0,
  0,
  false,
  1
),

-- Event 11: November 19, 2025 - Maya Center tour + Active break for Sigd
(
  '🚌 סיור "מרכז מאיה" (ב2, ב3) + 🌿 הפסקה פעילה לחג הסיגד',
  '🚌 Экскурсия в центр «Майя» (2Б, 2В) + 🌿 Активная перемена в честь праздника Сигд',
  '2025-11-19T00:00:00',
  NULL,
  'מרכז מאיה',
  'Центр «Майя»',
  'trip',
  'published',
  'public',
  'normal',
  false,
  0,
  0,
  0,
  0,
  0,
  false,
  1
),

-- Event 12: November 20, 2025 - Sigd holiday celebration + Maya Center tour
(
  '🎉 חג הסיגד בבית הספר + 🚌 סיור "מרכז מאיה" (א1, א2, ד2)',
  '🎉 Праздник Сигд в школе + 🚌 Экскурсия в центр «Майя» (1А, 1Б, 4Б)',
  '2025-11-20T00:00:00',
  NULL,
  'מרכז מאיה',
  'Центр «Майя»',
  'general',
  'published',
  'public',
  'normal',
  false,
  0,
  0,
  0,
  0,
  0,
  false,
  1
),

-- Event 13: November 21, 2025 - Student council elections + Elections fair
(
  '🗳️ בחירות למועצת תלמידים + הפנינג בחירות',
  '🗳️ Выборы в школьный совет + Праздничная ярмарка выборов',
  '2025-11-21T00:00:00',
  NULL,
  NULL,
  NULL,
  'general',
  'published',
  'public',
  'normal',
  false,
  0,
  0,
  0,
  0,
  0,
  false,
  1
),

-- Event 14: November 23, 2025 - Song of the day + Israeli week opening
(
  '🎵 "שיר השיירה" – שיר של יום (על מוהרי) + 🇮🇱 פתיחת שבוע ישראלי',
  '🎵 «Песня каравана» – песня дня (Аль Мохари) + 🇮🇱 Открытие Израильской недели',
  '2025-11-23T00:00:00',
  NULL,
  NULL,
  NULL,
  'general',
  'published',
  'public',
  'normal',
  false,
  0,
  0,
  0,
  0,
  0,
  false,
  1
),

-- Event 15: November 26, 2025 - David Ben-Gurion Memorial Day + Netanya tour
(
  '🕯️ יום הזיכרון לדוד בן גוריון + 🚌 סיור "מסע נתנייתי" (ב3, ב4)',
  '🕯️ День памяти Давида Бен-Гуриона + 🚌 Экскурсия «Путешествие по Нетании» (2В, 2Г)',
  '2025-11-26T00:00:00',
  NULL,
  NULL,
  NULL,
  'general',
  'published',
  'public',
  'normal',
  false,
  0,
  0,
  0,
  0,
  0,
  false,
  1
),

-- Event 16: November 30, 2025 - Song of the day + Flu vaccinations
(
  '🎵 "תודה" – שיר של יום (עוזי חיטמן) + 💉 חיסוני שפעת (א''-ב'', ד2, ו3)',
  '🎵 «Спасибо» – песня дня (Узи Хитман) + 💉 Прививки от гриппа (1–2, 4Б, 6В классы)',
  '2025-11-30T00:00:00',
  NULL,
  NULL,
  NULL,
  'general',
  'published',
  'public',
  'normal',
  false,
  0,
  0,
  0,
  0,
  0,
  false,
  1
);

-- Add comment
COMMENT ON TABLE events IS 'November 2025 events added - 16 bilingual school events';
