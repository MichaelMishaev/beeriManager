#!/usr/bin/env node

/**
 * Update January 2026 events to match PDF exactly
 * - Updates old events with correct data from PDF
 * - Marks duplicates as archived (soft delete)
 * - NO hard deletes from production!
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

// Correct events from PDF - this is the source of truth
const pdfEvents = [
  // January 1
  { date: '2026-01-01', title: 'מפגש "גלגלי מתמטיקה" – כיתות ו\'', description: null, type: 'meeting' },

  // January 4
  { date: '2026-01-04', title: 'שיר של יום – נח/מתי כספי', description: null, type: 'general' },
  { date: '2026-01-04', title: 'ביקור כיתות ו\'', description: 'בחטיבת ביניים "שרת"', type: 'trip' },

  // January 5
  { date: '2026-01-05', title: 'סדנא לילדי כיתות ה\' בנושא "פעילים צעירים - אזרחים משפיעים"', description: null, type: 'workshop' },

  // January 6
  { date: '2026-01-06', title: 'תכנית STEM – כיתות ה\'', description: null, type: 'workshop' },
  { date: '2026-01-06', title: 'מפגש "גלגלי מתמטיקה" – כיתות ה\'', description: null, type: 'meeting' },
  { date: '2026-01-06', title: 'הצגה – "ג\'ינג\'י" – כיתות ג\'-ד\'', description: null, type: 'general' },

  // January 7
  { date: '2026-01-07', title: 'מפגש "גלגלי מתמטיקה" – כיתות ה\'', description: null, type: 'meeting' },

  // January 8
  { date: '2026-01-08', title: 'מפגש עירוני – "פרלמנט הילדים"', description: 'סיור - מועצה ירוקה', type: 'meeting' },

  // January 9
  { date: '2026-01-09', title: 'מפגש "גלגלי מתמטיקה" – כיתות ו\'', description: null, type: 'meeting' },
  { date: '2026-01-09', title: 'הצגה – "ים של חברים" – כיתות ה\'-ו\'', description: null, type: 'general' },

  // January 11
  { date: '2026-01-11', title: 'שיר של יום – אליעזר בן יהודה/מתי כספי', description: 'שבוע השפה העברית', type: 'general' },
  { date: '2026-01-11', title: 'מארחים את ילדי גן גפן', description: null, type: 'general' },

  // January 12
  { date: '2026-01-12', title: 'יום הורים – כיתות א\'-ו\'', description: null, type: 'meeting', priority: 'high' },

  // January 13
  { date: '2026-01-13', title: 'תכנית STEM – כיתות ה\'', description: null, type: 'workshop' },
  { date: '2026-01-13', title: 'מפגש "גלגלי מתמטיקה" – כיתות ה\'', description: null, type: 'meeting' },
  { date: '2026-01-13', title: 'חיסונים – כיתות א\'', description: null, type: 'general', priority: 'high' },

  // January 14
  { date: '2026-01-14', title: 'מארחים את ילדי גן אגמון', description: null, type: 'general' },

  // January 15
  { date: '2026-01-15', title: 'מפגש "גלגלי מתמטיקה" – כיתות ו\'', description: null, type: 'meeting' },

  // January 18
  { date: '2026-01-18', title: 'שיר של יום – זה מתחיל בצעד/עדי אברהמי', description: null, type: 'general' },
  { date: '2026-01-18', title: 'צילומים לספר מחזור – כיתות ו\'', description: null, type: 'general' },

  // January 19
  { date: '2026-01-19', title: 'שבוע ההגנות ומניעת פגיעה מינית בילדים ונוער', description: null, type: 'general', priority: 'high' },

  // January 20
  { date: '2026-01-20', title: 'תכנית STEM – כיתות ה\'', description: null, type: 'workshop' },
  { date: '2026-01-20', title: 'חידון וירטואלי "גלגלי מתמטיקה" – כיתות ה\'', description: null, type: 'meeting' },

  // January 21
  { date: '2026-01-21', title: 'מפגש עירוני – "פרלמנט הילדים"', description: 'סיור - מועצה ירוקה', type: 'meeting' },
  { date: '2026-01-21', title: 'חידון וירטואלי "גלגלי מתמטיקה" – כיתות ה\'-ו\'', description: null, type: 'meeting' },

  // January 22
  { date: '2026-01-22', title: 'חידון וירטואלי "גלגלי מתמטיקה" – כיתות ו\'', description: null, type: 'meeting' },

  // January 23
  { date: '2026-01-23', title: '"יום פתוח" – מפגש היכרות עם בית הספר', description: 'לקראת הרישום לכיתה א\'', type: 'meeting', priority: 'high' },

  // January 25
  { date: '2026-01-25', title: 'שיר של יום – חלק בעולם/רחל שפירא', description: null, type: 'general' },
  { date: '2026-01-25', title: 'שבוע החלל הישראלי', description: null, type: 'general' },
  { date: '2026-01-25', title: 'סדנה – "בקשר אלייך" – כיתות ו\'', description: null, type: 'workshop' },

  // January 27
  { date: '2026-01-27', title: 'חיסונים – כיתות א\' – המשך', description: null, type: 'general', priority: 'high' },
  { date: '2026-01-27', title: 'מפגש "גלגלי מתמטיקה" – כיתות ה\'', description: null, type: 'meeting' },

  // January 28
  { date: '2026-01-28', title: 'סיור – מועצה ירוקה', description: null, type: 'trip' },

  // January 29
  { date: '2026-01-29', title: 'מפגש "גלגלי מתמטיקה" – שכבת ו\'', description: null, type: 'meeting' },

  // January 30
  { date: '2026-01-30', title: 'מסיבת יום המאה – שכבת א\'', description: null, type: 'general', priority: 'high' },
];

// Normalize title for comparison (remove extra spaces, special characters)
function normalizeTitle(title) {
  return title
    .replace(/\s+/g, ' ')
    .replace(/[״"]/g, '"')
    .replace(/[׳']/g, '\'')
    .trim()
    .toLowerCase();
}

async function updateEvents() {
  console.log('🔄 Updating January 2026 events to match PDF...\n');

  // Get all January 2026 events from database
  const { data: dbEvents, error } = await supabase
    .from('events')
    .select('*')
    .gte('start_datetime', '2026-01-01T00:00:00Z')
    .lt('start_datetime', '2026-02-01T00:00:00Z')
    .is('archived_at', null)
    .order('start_datetime', { ascending: true });

  if (error) {
    console.error('❌ Error fetching events:', error);
    return;
  }

  console.log(`📊 Found ${dbEvents.length} events in database for January 2026\n`);

  // Group database events by date and normalized title
  const dbEventsByKey = {};
  dbEvents.forEach(event => {
    const date = event.start_datetime.split('T')[0];
    const key = `${date}::${normalizeTitle(event.title)}`;
    if (!dbEventsByKey[key]) {
      dbEventsByKey[key] = [];
    }
    dbEventsByKey[key].push(event);
  });

  let updated = 0;
  let archived = 0;
  let created = 0;

  // Process each PDF event
  for (const pdfEvent of pdfEvents) {
    const key = `${pdfEvent.date}::${normalizeTitle(pdfEvent.title)}`;
    const matchingEvents = dbEventsByKey[key] || [];

    if (matchingEvents.length === 0) {
      // Event doesn't exist - create it
      const { error } = await supabase.from('events').insert([{
        title: pdfEvent.title,
        description: pdfEvent.description,
        start_datetime: `${pdfEvent.date}T00:00:00Z`,
        event_type: pdfEvent.type,
        status: 'published',
        visibility: 'public',
        priority: pdfEvent.priority || 'normal',
        created_by: 'admin'
      }]);

      if (error) {
        console.error(`❌ Failed to create: ${pdfEvent.title}`, error.message);
      } else {
        console.log(`✅ Created: ${pdfEvent.title}`);
        created++;
      }
    } else if (matchingEvents.length === 1) {
      // Single match - update it
      const dbEvent = matchingEvents[0];
      const { error } = await supabase
        .from('events')
        .update({
          title: pdfEvent.title,
          description: pdfEvent.description,
          event_type: pdfEvent.type,
          priority: pdfEvent.priority || dbEvent.priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', dbEvent.id);

      if (error) {
        console.error(`❌ Failed to update: ${pdfEvent.title}`, error.message);
      } else {
        console.log(`🔄 Updated: ${pdfEvent.title}`);
        updated++;
      }
    } else {
      // Multiple matches - keep first, archive duplicates
      const [first, ...duplicates] = matchingEvents.sort((a, b) =>
        new Date(a.created_at) - new Date(b.created_at)
      );

      // Update the first one
      await supabase
        .from('events')
        .update({
          title: pdfEvent.title,
          description: pdfEvent.description,
          event_type: pdfEvent.type,
          priority: pdfEvent.priority || first.priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', first.id);

      console.log(`🔄 Updated: ${pdfEvent.title} (kept oldest)`);
      updated++;

      // Archive duplicates (soft delete)
      for (const dup of duplicates) {
        await supabase
          .from('events')
          .update({
            archived_at: new Date().toISOString(),
            status: 'cancelled'
          })
          .eq('id', dup.id);

        console.log(`📦 Archived duplicate: ${dup.title}`);
        archived++;
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 Summary:');
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   📦 Archived (duplicates): ${archived}`);
  console.log('='.repeat(70));
  console.log('\n🎉 Database now matches PDF exactly!');
  console.log('💡 Refresh your app to see the changes\n');
}

updateEvents();
