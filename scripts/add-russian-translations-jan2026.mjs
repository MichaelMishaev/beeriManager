#!/usr/bin/env node

/**
 * Add Russian translations to January 2026 events
 * Maps Hebrew event titles to Russian translations
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Hebrew to Russian translations for January 2026 events
const translations = {
  'מפגש "גלגלי מתמטיקה" – כיתות ו\'': {
    title_ru: 'Встреча "Математические круги" – 6 класс',
    description_ru: null
  },
  'שיר של יום – נח/מתי כספי': {
    title_ru: 'Песня дня – Ноах/Мати Каспи',
    description_ru: null
  },
  'ביקור כיתות ו\'': {
    title_ru: 'Посещение 6 классов',
    description_ru: 'В средней школе "Шарет"'
  },
  'סדנא לילדי כיתות ה\' בנושא "פעילים צעירים - אזרחים משפיעים"': {
    title_ru: 'Мастер-класс для учеников 5 класса на тему "Активные молодые люди - влиятельные граждане"',
    description_ru: null
  },
  'תכנית STEM – כיתות ה\'': {
    title_ru: 'Программа STEM – 5 класс',
    description_ru: null
  },
  'מפגש "גלגלי מתמטיקה" – כיתות ה\'': {
    title_ru: 'Встреча "Математические круги" – 5 класс',
    description_ru: null
  },
  'הצגה – "ג\'ינג\'י" – כיתות ג\'-ד\'': {
    title_ru: 'Спектакль – "Джинджи" – 3-4 классы',
    description_ru: null
  },
  'מפגש עירוני – "פרלמנט הילדים"': {
    title_ru: 'Городская встреча – "Парламент детей"',
    description_ru: 'Экскурсия - Зеленый совет'
  },
  'הצגה – "ים של חברים" – כיתות ה\'-ו\'': {
    title_ru: 'Спектакль – "Море друзей" – 5-6 классы',
    description_ru: null
  },
  'שיר של יום – אליעזר בן יהודה/מתי כספי': {
    title_ru: 'Песня дня – Элиэзер Бен-Иегуда/Мати Каспи',
    description_ru: 'Неделя иврита'
  },
  'מארחים את ילדי גן גפן': {
    title_ru: 'Принимаем детей из садика Гефен',
    description_ru: null
  },
  'יום הורים – כיתות א\'-ו\'': {
    title_ru: 'День родителей – 1-6 классы',
    description_ru: null
  },
  'חיסונים – כיתות א\'': {
    title_ru: 'Прививки – 1 класс',
    description_ru: null
  },
  'מארחים את ילדי גן אגמון': {
    title_ru: 'Принимаем детей из садика Агмон',
    description_ru: null
  },
  'שיר של יום – זה מתחיל בצעד/עדי אברהמי': {
    title_ru: 'Песня дня – Это начинается с шага/Ади Авраами',
    description_ru: null
  },
  'צילומים לספר מחזור – כיתות ו\'': {
    title_ru: 'Фотографии для выпускного альбома – 6 класс',
    description_ru: null
  },
  'שבוע ההגנות ומניעת פגיעה מינית בילדים ונוער': {
    title_ru: 'Неделя защиты и предотвращения сексуального насилия над детьми и подростками',
    description_ru: null
  },
  'חידון וירטואלי "גלגלי מתמטיקה" – כיתות ה\'': {
    title_ru: 'Виртуальная викторина "Математические круги" – 5 класс',
    description_ru: null
  },
  'חידון וירטואלי "גלגלי מתמטיקה" – כיתות ה\'-ו\'': {
    title_ru: 'Виртуальная викторина "Математические круги" – 5-6 классы',
    description_ru: null
  },
  'חידון וירטואלי "גלגלי מתמטיקה" – כיתות ו\'': {
    title_ru: 'Виртуальная викторина "Математические круги" – 6 класс',
    description_ru: null
  },
  '"יום פתוח" – מפגש היכרות עם בית הספר': {
    title_ru: '"День открытых дверей" – встреча со школой',
    description_ru: 'К регистрации в 1 класс'
  },
  'שיר של יום – חלק בעולם/רחל שפירא': {
    title_ru: 'Песня дня – Часть мира/Рахель Шапира',
    description_ru: null
  },
  'שבוע החלל הישראלי': {
    title_ru: 'Израильская космическая неделя',
    description_ru: null
  },
  'סדנה – "בקשר אלייך" – כיתות ו\'': {
    title_ru: 'Мастер-класс – "На связи с тобой" – 6 класс',
    description_ru: null
  },
  'חיסונים – כיתות א\' – המשך': {
    title_ru: 'Прививки – 1 класс – продолжение',
    description_ru: null
  },
  'סיור – מועצה ירוקה': {
    title_ru: 'Экскурсия – Зеленый совет',
    description_ru: null
  },
  'מפגש "גלגלי מתמטיקה" – שכבת ו\'': {
    title_ru: 'Встреча "Математические круги" – параллель 6 класса',
    description_ru: null
  },
  'מסיבת יום המאה – שכבת א\'': {
    title_ru: 'Праздник сотого дня – параллель 1 класса',
    description_ru: null
  }
};

async function addTranslations() {
  console.log('🌍 Adding Russian translations to January 2026 events...\n');

  // Get all non-archived January 2026 events
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .gte('start_datetime', '2026-01-01T00:00:00Z')
    .lt('start_datetime', '2026-02-01T00:00:00Z')
    .is('archived_at', null);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Found ${events.length} events\n`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const event of events) {
    const translation = translations[event.title];

    if (!translation) {
      console.log(`⚠️  No translation: ${event.title}`);
      notFound++;
      continue;
    }

    if (event.title_ru) {
      console.log(`⏭️  Already translated: ${event.title}`);
      skipped++;
      continue;
    }

    // Update with Russian translation
    const { error: updateError } = await supabase
      .from('events')
      .update({
        title_ru: translation.title_ru,
        description_ru: translation.description_ru || event.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', event.id);

    if (updateError) {
      console.error(`❌ Failed: ${event.title}`, updateError.message);
    } else {
      console.log(`✅ Translated: ${event.title} → ${translation.title_ru}`);
      updated++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 Translation Summary:');
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ⏭️  Already translated: ${skipped}`);
  console.log(`   ⚠️  No translation found: ${notFound}`);
  console.log('='.repeat(70));
  console.log('\n🎉 Russian translations added successfully!');
  console.log('💡 Refresh your app to see events in Russian\n');
}

addTranslations();
