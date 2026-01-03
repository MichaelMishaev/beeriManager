#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🔄 Applying AI usage limit migration (20 → 50)...\n');

  try {
    // Function 1: increment_ai_usage
    console.log('1️⃣  Updating increment_ai_usage function...');
    const sql1 = `
CREATE OR REPLACE FUNCTION increment_ai_usage()
RETURNS TABLE(current_count INTEGER, limit_reached BOOLEAN) AS $$
DECLARE
  today DATE := CURRENT_DATE;
  current_count INTEGER;
  daily_limit INTEGER := 50;
BEGIN
  INSERT INTO ai_usage_logs (date, request_count, last_request_at)
  VALUES (today, 1, NOW())
  ON CONFLICT (date)
  DO UPDATE SET
    request_count = ai_usage_logs.request_count + 1,
    last_request_at = NOW(),
    updated_at = NOW()
  RETURNING ai_usage_logs.request_count INTO current_count;
  RETURN QUERY SELECT current_count, (current_count > daily_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    const { error: error1 } = await supabase.rpc('exec', { query: sql1 });

    if (error1) {
      console.error('   ❌ Error:', error1.message);
      throw error1;
    }
    console.log('   ✅ increment_ai_usage updated successfully\n');

    // Function 2: get_ai_usage
    console.log('2️⃣  Updating get_ai_usage function...');
    const sql2 = `
CREATE OR REPLACE FUNCTION get_ai_usage()
RETURNS TABLE(current_count INTEGER, daily_limit INTEGER, remaining INTEGER) AS $$
DECLARE
  today DATE := CURRENT_DATE;
  count INTEGER;
  limit_val INTEGER := 50;
BEGIN
  SELECT request_count INTO count
  FROM ai_usage_logs
  WHERE date = today;
  IF count IS NULL THEN
    count := 0;
  END IF;
  RETURN QUERY SELECT count, limit_val, GREATEST(0, limit_val - count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    const { error: error2 } = await supabase.rpc('exec', { query: sql2 });

    if (error2) {
      console.error('   ❌ Error:', error2.message);
      throw error2;
    }
    console.log('   ✅ get_ai_usage updated successfully\n');

    // Verify the changes
    console.log('3️⃣  Verifying changes...');
    const { data: stats, error: verifyError } = await supabase.rpc('get_ai_usage');

    if (verifyError) {
      console.error('   ⚠️  Verification error:', verifyError.message);
    } else if (stats && stats.length > 0) {
      const { current_count, daily_limit, remaining } = stats[0];
      console.log('   ✅ Verification successful!');
      console.log(`   📊 Current usage: ${current_count}/${daily_limit}`);
      console.log(`   📊 Remaining: ${remaining}\n`);

      if (daily_limit === 50) {
        console.log('✅ SUCCESS! Daily limit is now 50 requests per day! 🎉\n');
      } else {
        console.log(`⚠️  Warning: Daily limit shows as ${daily_limit}, expected 50\n`);
      }
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n📝 Manual steps:');
    console.error('   1. Go to: https://supabase.com/dashboard/project/wkfxwnayexznjhcktwwu');
    console.error('   2. Navigate to SQL Editor');
    console.error('   3. Copy and run: scripts/migrations/20250103_increase_ai_usage_limit_to_50.sql');
    process.exit(1);
  }
}

applyMigration();
