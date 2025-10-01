#!/usr/bin/env tsx
/**
 * Test inserting with message column only
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testMessageOnly() {
  console.log('\n========================================');
  console.log('Testing with message column');
  console.log('========================================\n');

  console.log('Attempting insert with only message...\n');
  const { data, error } = await supabase
    .from('anonymous_feedback')
    .insert([{ message: 'Test complaint from discovery script' }])
    .select();

  if (error) {
    console.error('❌ Error:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Success! Inserted record:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\nColumn names:', Object.keys(data[0]));
  }

  console.log('\n========================================\n');
}

testMessageOnly().catch(console.error);
