#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Correct 2025-2026 Jewish holiday dates
const correctDates = {
  'ראש השנה': { start: '2025-09-23', end: '2025-09-24' },
  'יום כיפור': { start: '2025-10-02', end: '2025-10-02' },
  'סוכות': { start: '2025-10-07', end: '2025-10-13' },
  'שמחת תורה': { start: '2025-10-15', end: '2025-10-15' },
  'חנוכה': { start: '2025-12-15', end: '2025-12-22' },
  'ט״ו בשבט': { start: '2026-02-03', end: '2026-02-03' },
  'פורים': { start: '2026-03-03', end: '2026-03-03' },
  'פסח': { start: '2026-04-01', end: '2026-04-08' },
  'יום הזיכרון': { start: '2026-04-21', end: '2026-04-21' },
  'יום העצמאות': { start: '2026-04-22', end: '2026-04-22' },
  'ל״ג בעומר': { start: '2026-05-06', end: '2026-05-06' },
  'שבועות': { start: '2026-05-22', end: '2026-05-23' },
  'חופשת הקיץ': { start: '2026-07-01', end: '2026-08-31' }
};

async function setCorrectDates() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('📅 Setting holidays to correct 2025-2026 dates...\n');

  try {
    const { data: holidays, error: fetchError } = await supabase
      .from('holidays')
      .select('id, hebrew_name, start_date, end_date');

    if (fetchError) throw fetchError;

    let updated = 0;
    for (const holiday of holidays) {
      const correctDate = correctDates[holiday.hebrew_name];

      if (correctDate) {
        const { error: updateError } = await supabase
          .from('holidays')
          .update({
            start_date: correctDate.start,
            end_date: correctDate.end,
            updated_at: new Date().toISOString()
          })
          .eq('id', holiday.id);

        if (updateError) {
          console.error(`❌ Failed to update ${holiday.hebrew_name}:`, updateError);
        } else {
          console.log(`✅ ${holiday.hebrew_name}: ${correctDate.start} → ${correctDate.end}`);
          updated++;
        }
      }
    }

    console.log(`\n✅ Successfully updated ${updated} holidays to 2025-2026 dates`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setCorrectDates();
