#!/usr/bin/env node

/**
 * Fix duplicate events by comparing exact date+title combinations
 * Archives events that don't match the exact PDF date+title pairs
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

// EXACT events from PDF with dates - source of truth (36 events)
const pdfEvents = [
  // January 1
  { date: '2026-01-01', title: 'מפגש "גלגלי מתמטיקה" – כיתות ו\'' },

  // January 4
  { date: '2026-01-04', title: 'שיר של יום – נח/מתי כספי' },
  { date: '2026-01-04', title: 'ביקור כיתות ו\'' },

  // January 5
  { date: '2026-01-05', title: 'סדנא לילדי כיתות ה\' בנושא "פעילים צעירים - אזרחים משפיעים"' },

  // January 6
  { date: '2026-01-06', title: 'תכנית STEM – כיתות ה\'' },
  { date: '2026-01-06', title: 'מפגש "גלגלי מתמטיקה" – כיתות ה\'' },
  { date: '2026-01-06', title: 'הצגה – "ג\'ינג\'י" – כיתות ג\'-ד\'' },

  // January 7
  { date: '2026-01-07', title: 'מפגש "גלגלי מתמטיקה" – כיתות ה\'' },

  // January 8
  { date: '2026-01-08', title: 'מפגש עירוני – "פרלמנט הילדים"' },

  // January 9
  { date: '2026-01-09', title: 'מפגש "גלגלי מתמטיקה" – כיתות ו\'' },
  { date: '2026-01-09', title: 'הצגה – "ים של חברים" – כיתות ה\'-ו\'' },

  // January 11
  { date: '2026-01-11', title: 'שיר של יום – אליעזר בן יהודה/מתי כספי' },
  { date: '2026-01-11', title: 'מארחים את ילדי גן גפן' },

  // January 12
  { date: '2026-01-12', title: 'יום הורים – כיתות א\'-ו\'' },

  // January 13
  { date: '2026-01-13', title: 'תכנית STEM – כיתות ה\'' },
  { date: '2026-01-13', title: 'מפגש "גלגלי מתמטיקה" – כיתות ה\'' },
  { date: '2026-01-13', title: 'חיסונים – כיתות א\'' },

  // January 14
  { date: '2026-01-14', title: 'מארחים את ילדי גן אגמון' },

  // January 15
  { date: '2026-01-15', title: 'מפגש "גלגלי מתמטיקה" – כיתות ו\'' },

  // January 18
  { date: '2026-01-18', title: 'שיר של יום – זה מתחיל בצעד/עדי אברהמי' },
  { date: '2026-01-18', title: 'צילומים לספר מחזור – כיתות ו\'' },

  // January 19
  { date: '2026-01-19', title: 'שבוע ההגנות ומניעת פגיעה מינית בילדים ונוער' },

  // January 20
  { date: '2026-01-20', title: 'תכנית STEM – כיתות ה\'' },
  { date: '2026-01-20', title: 'חידון וירטואלי "גלגלי מתמטיקה" – כיתות ה\'' },

  // January 21
  { date: '2026-01-21', title: 'מפגש עירוני – "פרלמנט הילדים"' },
  { date: '2026-01-21', title: 'חידון וירטואלי "גלגלי מתמטיקה" – כיתות ה\'-ו\'' },

  // January 22
  { date: '2026-01-22', title: 'חידון וירטואלי "גלגלי מתמטיקה" – כיתות ו\'' },

  // January 23
  { date: '2026-01-23', title: '"יום פתוח" – מפגש היכרות עם בית הספר' },

  // January 25
  { date: '2026-01-25', title: 'שיר של יום – חלק בעולם/רחל שפירא' },
  { date: '2026-01-25', title: 'שבוע החלל הישראלי' },
  { date: '2026-01-25', title: 'סדנה – "בקשר אלייך" – כיתות ו\'' },

  // January 27
  { date: '2026-01-27', title: 'חיסונים – כיתות א\' – המשך' },
  { date: '2026-01-27', title: 'מפגש "גלגלי מתמטיקה" – כיתות ה\'' },

  // January 28
  { date: '2026-01-28', title: 'סיור – מועצה ירוקה' },

  // January 29
  { date: '2026-01-29', title: 'מפגש "גלגלי מתמטיקה" – שכבת ו\'' },

  // January 30
  { date: '2026-01-30', title: 'מסיבת יום המאה – שכבת א\'' },
];

function normalizeTitle(title) {
  return title
    .replace(/\s+/g, ' ')
    .replace(/[״"]/g, '"')
    .replace(/[׳']/g, '\'')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .trim()
    .toLowerCase();
}

// Create normalized PDF date+title set
const pdfKeys = new Set(
  pdfEvents.map(e => `${e.date}::${normalizeTitle(e.title)}`)
);

async function fixDuplicates() {
  console.log('🔧 Fixing duplicate events by exact date+title match...\n');
  console.log(`📋 PDF has ${pdfEvents.length} events\n`);

  // Get all non-archived January 2026 events
  const { data: dbEvents, error } = await supabase
    .from('events')
    .select('*')
    .gte('start_datetime', '2026-01-01T00:00:00Z')
    .lt('start_datetime', '2026-02-01T00:00:00Z')
    .is('archived_at', null)
    .order('start_datetime', { ascending: true });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Database has ${dbEvents.length} non-archived events\n`);

  let archived = 0;
  let kept = 0;

  for (const event of dbEvents) {
    const date = event.start_datetime.split('T')[0];
    const key = `${date}::${normalizeTitle(event.title)}`;

    if (pdfKeys.has(key)) {
      console.log(`✅ Keep: ${date} - ${event.title.substring(0, 50)}`);
      kept++;
    } else {
      // Archive this event (soft delete)
      const { error: archiveError } = await supabase
        .from('events')
        .update({
          archived_at: new Date().toISOString(),
          status: 'cancelled'
        })
        .eq('id', event.id);

      if (archiveError) {
        console.error(`❌ Failed to archive: ${event.title}`);
      } else {
        console.log(`📦 Archived: ${date} - ${event.title.substring(0, 50)}`);
        archived++;
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 Final Summary:');
  console.log(`   ✅ Kept (exact PDF match): ${kept}`);
  console.log(`   📦 Archived (not in PDF or wrong date): ${archived}`);
  console.log('='.repeat(70));

  if (kept === pdfEvents.length) {
    console.log('\n🎉 Perfect! Database now has exactly ${pdfEvents.length} events matching PDF!');
  } else {
    console.log(`\n⚠️  Warning: Expected ${pdfEvents.length} events, but kept ${kept}`);
    console.log('   Some events might be missing or have different titles');
  }

  console.log('\n💡 Refresh your app to see the clean data\n');
}

fixDuplicates();
