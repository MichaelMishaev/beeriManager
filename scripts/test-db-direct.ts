#!/usr/bin/env ts-node
/**
 * Direct database test to verify table structure
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('Supabase URL:', supabaseUrl);
console.log('Using key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role' : 'Anon');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabase() {
  console.log('\n========================================');
  console.log('Testing Database Connection');
  console.log('========================================\n');

  // Test 1: Check if table exists
  console.log('Test 1: Checking if anonymous_feedback table exists...');
  const { data: tables, error: tablesError } = await supabase
    .from('anonymous_feedback')
    .select('*')
    .limit(1);

  if (tablesError) {
    console.error('❌ Table query error:', tablesError);
    console.log('\nTrying to query table structure directly...\n');

    // Try raw SQL query
    const { data: rawData, error: rawError } = await supabase.rpc('exec_sql', {
      sql: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'anonymous_feedback'"
    });

    if (rawError) {
      console.error('❌ Raw SQL error:', rawError);
    } else {
      console.log('✅ Table structure:', rawData);
    }
  } else {
    console.log('✅ Table exists, current data:', tables);
  }

  // Test 2: Try to insert a test record
  console.log('\nTest 2: Attempting to insert test feedback...');
  const testFeedback = {
    category: 'complaint',
    subject: 'Test from script',
    message: 'This is a test message from the direct DB script'
  };

  const { data: insertData, error: insertError } = await supabase
    .from('anonymous_feedback')
    .insert([testFeedback])
    .select()
    .single();

  if (insertError) {
    console.error('❌ Insert error:', JSON.stringify(insertError, null, 2));
  } else {
    console.log('✅ Insert successful!');
    console.log('Inserted record:', JSON.stringify(insertData, null, 2));
  }

  // Test 3: Query all feedback
  console.log('\nTest 3: Querying all feedback records...');
  const { data: allFeedback, error: queryError } = await supabase
    .from('anonymous_feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (queryError) {
    console.error('❌ Query error:', queryError);
  } else {
    console.log(`✅ Found ${allFeedback?.length || 0} feedback records`);
    if (allFeedback && allFeedback.length > 0) {
      console.log('\nMost recent feedback:');
      allFeedback.forEach((fb, index) => {
        console.log(`\n${index + 1}. [${fb.category}] ${fb.subject}`);
        console.log(`   Created: ${fb.created_at}`);
        console.log(`   Message: ${fb.message.substring(0, 80)}...`);
      });
    }
  }

  console.log('\n========================================');
  console.log('Test Complete');
  console.log('========================================\n');
}

testDatabase().catch(console.error);
