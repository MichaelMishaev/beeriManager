#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function updateHolidayDates() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔄 Updating holiday dates from 2024-2025 to 2025-2026...\n');

  try {
    // Fetch current holidays
    const { data: beforeData, error: fetchError } = await supabase
      .from('holidays')
      .select('id, hebrew_name, start_date, end_date')
      .order('start_date');

    if (fetchError) throw fetchError;

    console.log(`Found ${beforeData.length} holidays\n`);
    console.log('Before update:');
    beforeData.slice(0, 5).forEach(h => {
      console.log(`  - ${h.hebrew_name}: ${h.start_date} → ${h.end_date}`);
    });

    // Update dates by adding 1 year
    for (const holiday of beforeData) {
      const startDate = new Date(holiday.start_date);
      const endDate = new Date(holiday.end_date);

      startDate.setFullYear(startDate.getFullYear() + 1);
      endDate.setFullYear(endDate.getFullYear() + 1);

      const { error: updateError } = await supabase
        .from('holidays')
        .update({
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', holiday.id);

      if (updateError) {
        console.error(`❌ Failed to update ${holiday.hebrew_name}:`, updateError);
      }
    }

    // Verify updates
    const { data: afterData, error: verifyError } = await supabase
      .from('holidays')
      .select('id, hebrew_name, start_date, end_date')
      .order('start_date');

    if (verifyError) throw verifyError;

    console.log('\n✅ Update complete!\n');
    console.log('After update:');
    afterData.slice(0, 5).forEach(h => {
      console.log(`  - ${h.hebrew_name}: ${h.start_date} → ${h.end_date}`);
    });

    console.log(`\n✅ Successfully updated ${afterData.length} holidays`);

  } catch (error) {
    console.error('❌ Error updating holidays:', error.message);
    process.exit(1);
  }
}

updateHolidayDates();
