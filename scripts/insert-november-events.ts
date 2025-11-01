/**
 * Script to insert November 2025 events into Supabase
 * Run with: npx tsx scripts/insert-november-events.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const novemberEvents = [
  // Event 1: November 2, 2025
  {
    title: '🎵 "שיר תקווה" – שיר של יום (מיכאל וקנין) + הדרכה לחינוך לבריאות (כיתות ו\')',
    title_ru: '🎵 «Песня надежды» – песня дня (Михаэль Вакин) + Урок по здоровому образу жизни (6-е классы)',
    start_datetime: '2025-11-02T00:00:00',
    end_datetime: null,
    location: null,
    location_ru: null,
    event_type: 'general',
    status: 'published',
    visibility: 'public',
    priority: 'normal',
    registration_enabled: false,
    current_attendees: 0,
    rsvp_yes_count: 0,
    rsvp_no_count: 0,
    rsvp_maybe_count: 0,
    budget_spent: 0,
    requires_payment: false,
    version: 1
  },
  // Event 2: November 3, 2025
  {
    title: '🕯️ יום הזיכרון ליצחק רבין + מעגלי שיח על אחריות ומעורבות אישית',
    title_ru: '🕯️ День памяти Ицхака Рабина + Круглые столы на тему ответственности и личного участия',
    start_datetime: '2025-11-03T00:00:00',
    end_datetime: null,
    location: null,
    location_ru: null,
    event_type: 'general',
    status: 'published',
    visibility: 'public',
    priority: 'normal',
    registration_enabled: false,
    current_attendees: 0,
    rsvp_yes_count: 0,
    rsvp_no_count: 0,
    rsvp_maybe_count: 0,
    budget_spent: 0,
    requires_payment: false,
    version: 1
  },
  // Event 3: November 5, 2025
  {
    title: '👥 פתיחת מפגש פרלמנט הילדים העירוני',
    title_ru: '👥 Открытие встречи городского детского парламента',
    start_datetime: '2025-11-05T00:00:00',
    end_datetime: null,
    location: null,
    location_ru: null,
    event_type: 'meeting',
    status: 'published',
    visibility: 'public',
    priority: 'normal',
    registration_enabled: false,
    current_attendees: 0,
    rsvp_yes_count: 0,
    rsvp_no_count: 0,
    rsvp_maybe_count: 0,
    budget_spent: 0,
    requires_payment: false,
    version: 1
  },
  // Event 4: November 6, 2025
  {
    title: '🚌 סיור "מסע נתנייתי" כיתות ד1, ד2 + 🏀 טורניר כדורסל בנים בבית ספר אילן רמון + הדרכה לבריאות (כיתות ה\')',
    title_ru: '🚌 Экскурсия «Путешествие по Нетании» (4А, 4Б) + 🏀 Турнир по баскетболу среди мальчиков в школе «Илан Рамон» + Урок по здоровью (5-е классы)',
    start_datetime: '2025-11-06T00:00:00',
    end_datetime: null,
    location: 'בית ספר אילן רמון',
    location_ru: 'Школа «Илан Рамон»',
    event_type: 'trip',
    status: 'published',
    visibility: 'public',
    priority: 'normal',
    registration_enabled: false,
    current_attendees: 0,
    rsvp_yes_count: 0,
    rsvp_no_count: 0,
    rsvp_maybe_count: 0,
    budget_spent: 0,
    requires_payment: false,
    version: 1
  },
  // Event 5: November 7, 2025
  {
    title: '📖 מסיבת קבלת ספר תורה – כיתות ב\'',
    title_ru: '📖 Праздник получения Торы – 2-е классы',
    start_datetime: '2025-11-07T00:00:00',
    end_datetime: null,
    location: null,
    location_ru: null,
    event_type: 'general',
    status: 'published',
    visibility: 'public',
    priority: 'normal',
    registration_enabled: false,
    current_attendees: 0,
    rsvp_yes_count: 0,
    rsvp_no_count: 0,
    rsvp_maybe_count: 0,
    budget_spent: 0,
    requires_payment: false,
    version: 1
  },
  // Event 6: November 9, 2025
  {
    title: '🎵 "זה מתחיל בצעד" – שיר של יום + שבוע לבטיחות בדרכים + מפגש עם מתנדבים',
    title_ru: '🎵 «Это начинается с шага» – песня дня + Неделя безопасности дорожного движения + Встреча с волонтёрами',
    start_datetime: '2025-11-09T00:00:00',
    end_datetime: null,
    location: null,
    location_ru: null,
    event_type: 'general',
    status: 'published',
    visibility: 'public',
    priority: 'normal',
    registration_enabled: false,
    current_attendees: 0,
    rsvp_yes_count: 0,
    rsvp_no_count: 0,
    rsvp_maybe_count: 0,
    budget_spent: 0,
    requires_payment: false,
    version: 1
  },
  // Event 7: November 13, 2025
  {
    title: '🎭 הצגה "הדמיון ואוצרות טרומולו" (כיתות ב\') + 🚌 סיור נתנייתי כיתות ד3, ד4',
    title_ru: '🎭 Спектакль «Воображение и сокровища Тромоло» (2-е классы) + 🚌 Экскурсия по Нетании (4В, 4Г)',
    start_datetime: '2025-11-13T00:00:00',
    end_datetime: null,
    location: null,
    location_ru: null,
    event_type: 'workshop',
    status: 'published',
    visibility: 'public',
    priority: 'normal',
    registration_enabled: false,
    current_attendees: 0,
    rsvp_yes_count: 0,
    rsvp_no_count: 0,
    rsvp_maybe_count: 0,
    budget_spent: 0,
    requires_payment: false,
    version: 1
  },
  // Event 8: November 14, 2025
  {
    title: '🎉 מסיבת סיום כיתות ו\' + מפגש הורים עם ועד',
    title_ru: '🎉 Выпускной вечер 6-х классов + Встреча родителей с комитетом',
    start_datetime: '2025-11-14T00:00:00',
    end_datetime: null,
    location: null,
    location_ru: null,
    event_type: 'meeting',
    status: 'published',
    visibility: 'public',
    priority: 'normal',
    registration_enabled: false,
    current_attendees: 0,
    rsvp_yes_count: 0,
    rsvp_no_count: 0,
    rsvp_maybe_count: 0,
    budget_spent: 0,
    requires_payment: false,
    version: 1
  },
  // Event 9: November 16, 2025
  {
    title: '🎵 "שיר לאהבה" – שיר של יום (איילת ציוני) + 🌈 שבוע זכויות הילד + 🩺 בדיקות גדילה (כיתות א\') + 🚌 סיור "מרכז מאיה" (ב1, ב4)',
    title_ru: '🎵 «Песня о любви» – песня дня (Аелет Циони) + 🌈 Неделя прав ребёнка + 🩺 Проверка роста (1-е классы) + 🚌 Экскурсия в центр «Майя» (2А, 2Д)',
    start_datetime: '2025-11-16T00:00:00',
    end_datetime: null,
    location: 'מרכז מאיה',
    location_ru: 'Центр «Майя»',
    event_type: 'trip',
    status: 'published',
    visibility: 'public',
    priority: 'normal',
    registration_enabled: false,
    current_attendees: 0,
    rsvp_yes_count: 0,
    rsvp_no_count: 0,
    rsvp_maybe_count: 0,
    budget_spent: 0,
    requires_payment: false,
    version: 1
  },
  // Event 10: November 18, 2025
  {
    title: '🚌 סיור "מרכז מאיה" (א1, א3) + סיור נתנייתי (א2, א4)',
    title_ru: '🚌 Экскурсия в центр «Майя» (1А, 1В) + Экскурсия по Нетании (1Б, 1Г)',
    start_datetime: '2025-11-18T00:00:00',
    end_datetime: null,
    location: 'מרכז מאיה',
    location_ru: 'Центр «Майя»',
    event_type: 'trip',
    status: 'published',
    visibility: 'public',
    priority: 'normal',
    registration_enabled: false,
    current_attendees: 0,
    rsvp_yes_count: 0,
    rsvp_no_count: 0,
    rsvp_maybe_count: 0,
    budget_spent: 0,
    requires_payment: false,
    version: 1
  },
  // Event 11: November 19, 2025
  {
    title: '🚌 סיור "מרכז מאיה" (ב2, ב3) + 🌿 הפסקה פעילה לחג הסיגד',
    title_ru: '🚌 Экскурсия в центр «Майя» (2Б, 2В) + 🌿 Активная перемена в честь праздника Сигд',
    start_datetime: '2025-11-19T00:00:00',
    end_datetime: null,
    location: 'מרכז מאיה',
    location_ru: 'Центр «Майя»',
    event_type: 'trip',
    status: 'published',
    visibility: 'public',
    priority: 'normal',
    registration_enabled: false,
    current_attendees: 0,
    rsvp_yes_count: 0,
    rsvp_no_count: 0,
    rsvp_maybe_count: 0,
    budget_spent: 0,
    requires_payment: false,
    version: 1
  },
  // Event 12: November 20, 2025
  {
    title: '🎉 חג הסיגד בבית הספר + 🚌 סיור "מרכז מאיה" (א1, א2, ד2)',
    title_ru: '🎉 Праздник Сигд в школе + 🚌 Экскурсия в центр «Майя» (1А, 1Б, 4Б)',
    start_datetime: '2025-11-20T00:00:00',
    end_datetime: null,
    location: 'מרכז מאיה',
    location_ru: 'Центр «Майя»',
    event_type: 'general',
    status: 'published',
    visibility: 'public',
    priority: 'normal',
    registration_enabled: false,
    current_attendees: 0,
    rsvp_yes_count: 0,
    rsvp_no_count: 0,
    rsvp_maybe_count: 0,
    budget_spent: 0,
    requires_payment: false,
    version: 1
  },
  // Event 13: November 21, 2025
  {
    title: '🗳️ בחירות למועצת תלמידים + הפנינג בחירות',
    title_ru: '🗳️ Выборы в школьный совет + Праздничная ярмарка выборов',
    start_datetime: '2025-11-21T00:00:00',
    end_datetime: null,
    location: null,
    location_ru: null,
    event_type: 'general',
    status: 'published',
    visibility: 'public',
    priority: 'normal',
    registration_enabled: false,
    current_attendees: 0,
    rsvp_yes_count: 0,
    rsvp_no_count: 0,
    rsvp_maybe_count: 0,
    budget_spent: 0,
    requires_payment: false,
    version: 1
  },
  // Event 14: November 23, 2025
  {
    title: '🎵 "שיר השיירה" – שיר של יום (על מוהרי) + 🇮🇱 פתיחת שבוע ישראלי',
    title_ru: '🎵 «Песня каравана» – песня дня (Аль Мохари) + 🇮🇱 Открытие Израильской недели',
    start_datetime: '2025-11-23T00:00:00',
    end_datetime: null,
    location: null,
    location_ru: null,
    event_type: 'general',
    status: 'published',
    visibility: 'public',
    priority: 'normal',
    registration_enabled: false,
    current_attendees: 0,
    rsvp_yes_count: 0,
    rsvp_no_count: 0,
    rsvp_maybe_count: 0,
    budget_spent: 0,
    requires_payment: false,
    version: 1
  },
  // Event 15: November 26, 2025
  {
    title: '🕯️ יום הזיכרון לדוד בן גוריון + 🚌 סיור "מסע נתנייתי" (ב3, ב4)',
    title_ru: '🕯️ День памяти Давида Бен-Гуриона + 🚌 Экскурсия «Путешествие по Нетании» (2В, 2Г)',
    start_datetime: '2025-11-26T00:00:00',
    end_datetime: null,
    location: null,
    location_ru: null,
    event_type: 'general',
    status: 'published',
    visibility: 'public',
    priority: 'normal',
    registration_enabled: false,
    current_attendees: 0,
    rsvp_yes_count: 0,
    rsvp_no_count: 0,
    rsvp_maybe_count: 0,
    budget_spent: 0,
    requires_payment: false,
    version: 1
  },
  // Event 16: November 30, 2025
  {
    title: '🎵 "תודה" – שיר של יום (עוזי חיטמן) + 💉 חיסוני שפעת (א\'-ב\', ד2, ו3)',
    title_ru: '🎵 «Спасибо» – песня дня (Узи Хитман) + 💉 Прививки от гриппа (1–2, 4Б, 6В классы)',
    start_datetime: '2025-11-30T00:00:00',
    end_datetime: null,
    location: null,
    location_ru: null,
    event_type: 'general',
    status: 'published',
    visibility: 'public',
    priority: 'normal',
    registration_enabled: false,
    current_attendees: 0,
    rsvp_yes_count: 0,
    rsvp_no_count: 0,
    rsvp_maybe_count: 0,
    budget_spent: 0,
    requires_payment: false,
    version: 1
  }
]

async function insertEvents() {
  console.log('🚀 Starting November 2025 events insertion...')
  console.log(`📊 Total events to insert: ${novemberEvents.length}`)

  try {
    const { data, error } = await supabase
      .from('events')
      .insert(novemberEvents)
      .select()

    if (error) {
      console.error('❌ Error inserting events:', error)
      throw error
    }

    console.log(`✅ Successfully inserted ${data?.length || 0} events!`)
    console.log('📅 Events inserted:', data?.map(e => ({
      date: e.start_datetime,
      title: e.title
    })))

    return data
  } catch (error) {
    console.error('❌ Failed to insert events:', error)
    throw error
  }
}

// Run the script
insertEvents()
  .then(() => {
    console.log('✨ All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
