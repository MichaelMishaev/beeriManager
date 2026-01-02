#!/usr/bin/env node

/**
 * Archive old/incorrect January 2026 events that are NOT in the PDF
 * Only keeps events that exactly match the PDF booklet
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

// EXACT events from PDF - source of truth (36 events)
const pdfEventTitles = [
  'מפגש "גלגלי מתמטיקה" – כיתות ו\'',
  'שיר של יום – נח/מתי כספי',
  'ביקור כיתות ו\'',
  'סדנא לילדי כיתות ה\' בנושא "פעילים צעירים - אזרחים משפיעים"',
  'תכנית STEM – כיתות ה\'',
  'מפגש "גלגלי מתמטיקה" – כיתות ה\'',
  'הצגה – "ג\'ינג\'י" – כיתות ג\'-ד\'',
  'מפגש עירוני – "פרלמנט הילדים"',
  'מפגש "גלגלי מתמטיקה" – כיתות ו\'',
  'הצגה – "ים של חברים" – כיתות ה\'-ו\'',
  'שיר של יום – אליעזר בן יהודה/מתי כספי',
  'מארחים את ילדי גן גפן',
  'יום הורים – כיתות א\'-ו\'',
  'חיסונים – כיתות א\'',
  'מארחים את ילדי גן אגמון',
  'שיר של יום – זה מתחיל בצעד/עדי אברהמי',
  'צילומים לספר מחזור – כיתות ו\'',
  'שבוע ההגנות ומניעת פגיעה מינית בילדים ונוער',
  'חידון וירטואלי "גלגלי מתמטיקה" – כיתות ה\'',
  'חידון וירטואלי "גלגלי מתמטיקה" – כיתות ה\'-ו\'',
  'חידון וירטואלי "גלגלי מתמטיקה" – כיתות ו\'',
  '"יום פתוח" – מפגש היכרות עם בית הספר',
  'שיר של יום – חלק בעולם/רחל שפירא',
  'שבוע החלל הישראלי',
  'סדנה – "בקשר אלייך" – כיתות ו\'',
  'חיסונים – כיתות א\' – המשך',
  'סיור – מועצה ירוקה',
  'מפגש "גלגלי מתמטיקה" – שכבת ו\'',
  'מסיבת יום המאה – שכבת א\'',
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

// Create normalized PDF titles set
const pdfNormalized = new Set(pdfEventTitles.map(normalizeTitle));

async function cleanup() {
  console.log('🧹 Cleaning up old/incorrect January 2026 events...\n');
  console.log(`📋 PDF has ${pdfEventTitles.length} events\n`);

  // Get all non-archived January 2026 events
  const { data: dbEvents, error } = await supabase
    .from('events')
    .select('*')
    .gte('start_datetime', '2026-01-01T00:00:00Z')
    .lt('start_datetime', '2026-02-01T00:00:00Z')
    .is('archived_at', null);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Database has ${dbEvents.length} non-archived events\n`);

  let archived = 0;
  let kept = 0;

  for (const event of dbEvents) {
    const normalized = normalizeTitle(event.title);

    if (pdfNormalized.has(normalized)) {
      console.log(`✅ Keep: ${event.title.substring(0, 60)}`);
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
        console.log(`📦 Archived: ${event.title.substring(0, 60)}`);
        archived++;
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 Cleanup Summary:');
  console.log(`   ✅ Kept (matches PDF): ${kept}`);
  console.log(`   📦 Archived (not in PDF): ${archived}`);
  console.log('='.repeat(70));

  if (kept === pdfEventTitles.length) {
    console.log('\n🎉 Perfect! Database now has exactly the same events as PDF!');
  } else {
    console.log(`\n⚠️  Warning: Expected ${pdfEventTitles.length} events, but kept ${kept}`);
    console.log('   Some events might be missing or have different titles');
  }

  console.log('\n💡 Refresh your app to see the clean data\n');
}

cleanup();
