// Seed holidays for 2025-2026 via Supabase API
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const holidays2025 = [
  // ראש השנה (Rosh Hashanah) - September 22-24, 2025
  {
    hebrew_name: 'ראש השנה',
    name: 'Rosh Hashanah',
    start_date: '2025-09-22',
    end_date: '2025-09-24',
    hebrew_date: 'ב׳-ד׳ בתשרי',
    holiday_type: 'religious',
    is_school_closed: true,
    icon_emoji: '🍎',
    color: '#FF8200',
    academic_year: 'תשפ״ו'
  },
  // יום כיפורים וסוכות (Yom Kippur & Sukkot) - October 1-14, 2025
  {
    hebrew_name: 'יום כיפורים וסוכות',
    name: 'Yom Kippur & Sukkot',
    start_date: '2025-10-01',
    end_date: '2025-10-14',
    hebrew_date: 'י״ב-כ״ב בתשרי',
    holiday_type: 'religious',
    is_school_closed: true,
    icon_emoji: '🕊️',
    color: '#0D98BA',
    academic_year: 'תשפ״ו'
  },
  // חנוכה (Chanukah) - December 16-22, 2025
  {
    hebrew_name: 'חנוכה',
    name: 'Chanukah',
    start_date: '2025-12-16',
    end_date: '2025-12-22',
    hebrew_date: 'כ״ה בכסלו-ב׳ בטבת',
    holiday_type: 'religious',
    is_school_closed: true,
    icon_emoji: '🕎',
    color: '#FFBA00',
    academic_year: 'תשפ״ו'
  },
  // פורים (Purim) - March 3-4, 2026
  {
    hebrew_name: 'פורים',
    name: 'Purim',
    start_date: '2026-03-03',
    end_date: '2026-03-04',
    hebrew_date: 'י״ד-ט״ו באדר',
    holiday_type: 'religious',
    is_school_closed: true,
    icon_emoji: '🤡',
    color: '#FF8200',
    academic_year: 'תשפ״ו'
  },
  // פסח (Passover) - March 24 - April 8, 2026
  {
    hebrew_name: 'פסח',
    name: 'Passover',
    start_date: '2026-03-24',
    end_date: '2026-04-08',
    hebrew_date: 'י׳-כ״א בניסן',
    holiday_type: 'religious',
    is_school_closed: true,
    icon_emoji: '🍷',
    color: '#FFBA00',
    academic_year: 'תשפ״ו'
  },
  // יום הזיכרון (Memorial Day) - April 21, 2026 (no school closure)
  {
    hebrew_name: 'יום הזיכרון',
    name: 'Memorial Day',
    start_date: '2026-04-21',
    end_date: '2026-04-21',
    hebrew_date: 'ד׳ באייר',
    holiday_type: 'national',
    is_school_closed: false,
    icon_emoji: '🕯️',
    color: '#003153',
    academic_year: 'תשפ״ו'
  },
  // יום העצמאות (Independence Day) - April 22, 2026
  {
    hebrew_name: 'יום העצמאות',
    name: 'Independence Day',
    start_date: '2026-04-22',
    end_date: '2026-04-22',
    hebrew_date: 'ה׳ באייר',
    holiday_type: 'national',
    is_school_closed: true,
    icon_emoji: '🇮🇱',
    color: '#0D98BA',
    academic_year: 'תשפ״ו'
  },
  // ל״ג בעומר (Lag BaOmer) - May 5, 2026
  {
    hebrew_name: 'ל״ג בעומר',
    name: 'Lag BaOmer',
    start_date: '2026-05-05',
    end_date: '2026-05-05',
    hebrew_date: 'י״ח באייר',
    holiday_type: 'religious',
    is_school_closed: true,
    icon_emoji: '🔥',
    color: '#FF8200',
    academic_year: 'תשפ״ו'
  },
  // שבועות (Shavuot) - May 21-22, 2026
  {
    hebrew_name: 'שבועות',
    name: 'Shavuot',
    start_date: '2026-05-21',
    end_date: '2026-05-22',
    hebrew_date: 'ה׳-ו׳ בסיון',
    holiday_type: 'religious',
    is_school_closed: true,
    icon_emoji: '🌾',
    color: '#87CEEB',
    academic_year: 'תשפ״ו'
  },
  // חופשת קיץ (Summer Break) - June 30 - August 31, 2026
  {
    hebrew_name: 'חופשת הקיץ',
    name: 'Summer Vacation',
    start_date: '2026-06-30',
    end_date: '2026-08-31',
    hebrew_date: 'ט״ו בתמוז - ז׳ באלול',
    holiday_type: 'school_break',
    is_school_closed: true,
    icon_emoji: '☀️',
    color: '#FFBA00',
    academic_year: 'תשפ״ו'
  }
]

async function seedHolidays() {
  console.log('🗑️  Deleting existing holidays for תשפ״ו...')

  const { error: deleteError } = await supabase
    .from('holidays')
    .delete()
    .eq('academic_year', 'תשפ״ו')

  if (deleteError) {
    console.error('Error deleting existing holidays:', deleteError)
  } else {
    console.log('✅ Deleted existing holidays')
  }

  console.log('\n📅 Inserting new holidays for 2025-2026 (תשפ״ו)...\n')

  for (const holiday of holidays2025) {
    const { data, error } = await supabase
      .from('holidays')
      .insert([holiday])
      .select()

    if (error) {
      console.error(`❌ Error inserting ${holiday.hebrew_name}:`, error)
    } else {
      console.log(`✅ Inserted: ${holiday.hebrew_name} (${holiday.start_date} to ${holiday.end_date})`)
    }
  }

  console.log('\n✨ Seeding complete!')

  // Verify
  const { data: allHolidays, error: fetchError } = await supabase
    .from('holidays')
    .select('hebrew_name, start_date, end_date, is_school_closed')
    .eq('academic_year', 'תשפ״ו')
    .order('start_date')

  if (fetchError) {
    console.error('Error fetching holidays:', fetchError)
  } else {
    console.log('\n📋 Holidays in database:')
    console.table(allHolidays)
  }
}

seedHolidays()
