#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Correct dates from the school document
const correctDates = {
  'ראש השנה': { start: '2025-09-24', end: '2025-09-25', closed: true },  // כ״ב-כ״ד בספטמבר
  'יום כיפור': { start: '2025-10-02', end: '2025-10-02', closed: true },  // ב׳ באוקטובר - only day 2, not 1-14
  'סוכות': { start: '2025-10-07', end: '2025-10-14', closed: true },  // ז׳-י״ד באוקטובר (מיום רביעי עד שלישי)
  'שמחת תורה': { start: '2025-10-15', end: '2025-10-15', closed: true },  // ט״ו באוקטובר (יום רביעי)
  'חנוכה': { start: '2025-12-22', end: '2025-12-23', closed: true },  // כ״ב-כ״ג בדצמבר (שלישי ורביעי בלבד)
  'פורים': { start: '2026-03-05', end: '2026-03-05', closed: true },  // ה׳ במרץ (יום חמישי)
  'פסח': { start: '2026-04-08', end: '2026-04-09', closed: true },  // ח׳-ט׳ באפריל (רביעי-חמישי בניסן)
  'יום הזיכרון': { start: '2026-04-21', end: '2026-04-21', closed: false },  // NOT closed - יום שלישי
  'יום העצמאות': { start: '2026-04-22', end: '2026-04-22', closed: true },  // כ״ב באפריל (יום רביעי)
  'ל״ג בעומר': { start: '2026-05-06', end: '2026-05-06', closed: true },  // ו׳ במאי (יום רביעי)
  'שבועות': { start: '2026-05-21', end: '2026-05-22', closed: true },  // כ״א-כ״ב במאי (חמישי-שישי)
  'ט״ו בשבט': { start: '2026-02-03', end: '2026-02-03', closed: false },  // NOT in document, not closed
  'חופשת הקיץ': { start: '2026-06-30', end: '2026-08-30', closed: true }  // Last day of studies: ל׳ ביוני (Tuesday)
};

async function updateFromDocument() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('📅 Updating holidays from school document...\n');

  try {
    const { data: holidays, error: fetchError } = await supabase
      .from('holidays')
      .select('id, hebrew_name, start_date, end_date, is_school_closed');

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
            is_school_closed: correctDate.closed,
            updated_at: new Date().toISOString()
          })
          .eq('id', holiday.id);

        if (updateError) {
          console.error(`❌ Failed to update ${holiday.hebrew_name}:`, updateError);
        } else {
          const closedText = correctDate.closed ? '🔴 סגור' : '🟢 פתוח';
          console.log(`✅ ${holiday.hebrew_name}: ${correctDate.start} → ${correctDate.end} ${closedText}`);
          updated++;
        }
      }
    }

    console.log(`\n✅ Successfully updated ${updated} holidays from document`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateFromDocument();
