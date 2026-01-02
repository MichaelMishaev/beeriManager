#!/usr/bin/env node

/**
 * Import January 2026 Calendar Events
 * Direct import script - executes immediately
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

// All January 2026 events from the calendar
const events = [
  // January 4
  { title: 'שיר של יום – נדה/מותי כספי', start_datetime: '2026-01-04', event_type: 'general' },
  { title: 'ביקור כיתות ו\'', description: 'בהחטיבת בנינים "שרת"', start_datetime: '2026-01-04', event_type: 'trip' },

  // January 5
  { title: 'סדנא לילדי כיתות ה\' בנושא', description: '"פעילים צעירים – אוחזים משפיעים"', start_datetime: '2026-01-05', event_type: 'workshop' },

  // January 6
  { title: 'תכנית STEM – כיתות ה\'', start_datetime: '2026-01-06', event_type: 'workshop' },
  { title: 'מפגש "גלגלי מתמטיקה"– כיתות ה\'', start_datetime: '2026-01-06', event_type: 'meeting' },

  // January 7
  { title: 'הצגה – "גינג\'י" – כיתות ג\'-ד\'', start_datetime: '2026-01-07', event_type: 'general' },
  { title: 'מפגש "גלגלי מתמטיקה"– כיתות ה\'', start_datetime: '2026-01-07', event_type: 'meeting' },

  // January 8
  { title: 'מפגש עירוני – "פרלמנט הילדים"', description: 'סיור – נווספת ירוקה', start_datetime: '2026-01-08', event_type: 'meeting' },

  // January 9
  { title: 'מפגש "גלגלי מתמטיקה" – כיתות ו\'', start_datetime: '2026-01-09', event_type: 'meeting' },
  { title: 'הצגה – "יום של חברים" – כיתות ה\'-ב\'', start_datetime: '2026-01-09', event_type: 'general' },

  // January 11
  { title: 'שיר של יום– אלעזר בן יהודה/מותי כספי', description: 'שבוע השפה העברית', start_datetime: '2026-01-11', event_type: 'general' },
  { title: 'מאחדים את ילדי גן גפן', start_datetime: '2026-01-11', event_type: 'general' },

  // January 12
  { title: 'יום הורים – כיתות א\'-ו\'', start_datetime: '2026-01-12', event_type: 'meeting', priority: 'high' },

  // January 13
  { title: 'תכנית STEM – כיתות ה\'', start_datetime: '2026-01-13', event_type: 'workshop' },
  { title: 'מפגש "גלגלי מתמטיקה"– כיתות ה\'', start_datetime: '2026-01-13', event_type: 'meeting' },
  { title: 'חיסונים – כיתות א\'', start_datetime: '2026-01-13', event_type: 'general', priority: 'high' },

  // January 14
  { title: 'מאחדים את ילדי גן אגמון', start_datetime: '2026-01-14', event_type: 'general' },

  // January 15
  { title: 'מפגש "גלגלי מתמטיקה"– כיתות ו\'', start_datetime: '2026-01-15', event_type: 'meeting' },

  // January 18
  { title: 'שיר של יום– זה מחזיל בצעד/עדי אברהמי', start_datetime: '2026-01-18', event_type: 'general' },
  { title: 'ציילומים לספר מחזור– כיתות ו\'', start_datetime: '2026-01-18', event_type: 'general' },

  // January 19
  { title: 'שבוע ההגנות ומניעת פגיעה מינית בילדים ונוער', start_datetime: '2026-01-19', event_type: 'general', priority: 'high' },

  // January 20
  { title: 'תכנית STEM – כיתות ה\'', start_datetime: '2026-01-20', event_type: 'workshop' },
  { title: 'חידון וירטואלי "גלגלי מתמטיקה" – כיתות ה\'', start_datetime: '2026-01-20', event_type: 'meeting' },

  // January 21
  { title: 'מפגש עירוני – "פרלמנט הילדים"', description: 'סיור – נווספת ירוקה', start_datetime: '2026-01-21', event_type: 'meeting' },
  { title: 'חידון וירטואלי "גלגלי מתמטיקה" – כיתות ה\'-ו\'', start_datetime: '2026-01-21', event_type: 'meeting' },

  // January 22
  { title: 'חידון וירטואלי "גלגלי מתמטיקה" – כיתות ו\'', start_datetime: '2026-01-22', event_type: 'meeting' },

  // January 23
  { title: '"יום פתוח" – מפגש הזכרות עם בית הספר', description: 'לקראת הרישום לכיתה א\'', start_datetime: '2026-01-23', event_type: 'meeting', priority: 'high' },

  // January 25
  { title: 'שיר של יום– חלק בעולם/רחל שפירא', start_datetime: '2026-01-25', event_type: 'general' },
  { title: 'שבוע החלל הישראלי', start_datetime: '2026-01-25', event_type: 'general' },
  { title: 'סדנה – "בקשר אליך" – כיתות ו\'', start_datetime: '2026-01-25', event_type: 'workshop' },

  // January 27
  { title: 'חיסונים – כיתות א\' – המשך', start_datetime: '2026-01-27', event_type: 'general', priority: 'high' },
  { title: 'מפגש "גלגלי מתמטיקה"– כיתות ה\'', start_datetime: '2026-01-27', event_type: 'meeting' },

  // January 28
  { title: 'סיור – נווספת ירוקה', start_datetime: '2026-01-28', event_type: 'trip' },

  // January 29
  { title: 'מפגש "גלגלי מתמטיקה" – שכבת ו\'', start_datetime: '2026-01-29', event_type: 'meeting' },

  // January 30
  { title: 'מסיבת יום המא"ה – שכבת א\'', start_datetime: '2026-01-30', event_type: 'general', priority: 'high' },
];

async function importEvents() {
  console.log('🚀 Importing', events.length, 'events from January 2026 calendar...\n');

  let success = 0;
  let errors = [];

  for (const event of events) {
    const eventData = {
      ...event,
      start_datetime: event.start_datetime + 'T00:00:00Z',
      status: 'published',
      visibility: 'public',
      priority: event.priority || 'normal',
      created_by: 'admin'
    };

    const { error } = await supabase.from('events').insert([eventData]);

    if (error) {
      if (error.code === '23505') { // Duplicate
        console.log(`⚠️  Skipped (duplicate): ${event.title.substring(0, 50)}...`);
      } else {
        console.error(`❌ Failed: ${event.title.substring(0, 50)}...`);
        errors.push({ title: event.title, error: error.message });
      }
    } else {
      console.log(`✅ Imported: ${event.title.substring(0, 50)}...`);
      success++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`📊 Results: ${success} imported, ${errors.length} errors, ${events.length} total`);
  console.log('='.repeat(70));

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ title, error }) => console.log(`   - ${title}: ${error}`));
  }

  if (success > 0) {
    console.log('\n🎉 Successfully imported', success, 'new events!');
    console.log('💡 View them at: http://localhost:4500/he/events\n');
  }
}

importEvents();
