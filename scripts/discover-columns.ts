#!/usr/bin/env tsx
/**
 * Discover table columns by analyzing API responses
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function discoverColumns() {
  console.log('\n========================================');
  console.log('Discovering Table Columns');
  console.log('========================================\n');

  // Strategy: Try inserting with empty object to see what's required
  console.log('Test 1: Insert empty object to discover required fields...\n');
  const { data: emptyTest, error: emptyError } = await supabase
    .from('anonymous_feedback')
    .insert([{}])
    .select();

  console.log('Empty insert result:');
  console.log('Error:', JSON.stringify(emptyError, null, 2));
  console.log('Data:', JSON.stringify(emptyTest, null, 2));

  // Try with just an id
  console.log('\n\nTest 2: Insert with generated ID...\n');
  const { data: idTest, error: idError } = await supabase
    .from('anonymous_feedback')
    .insert([{ id: crypto.randomUUID() }])
    .select();

  console.log('ID-only insert result:');
  console.log('Error:', JSON.stringify(idError, null, 2));
  console.log('Data:', JSON.stringify(idTest, null, 2));

  // Try common column names
  const testColumns = [
    { title: 'Test' },
    { content: 'Test' },
    { text: 'Test' },
    { feedback: 'Test' },
    { type: 'complaint' },
    { complaint_text: 'Test' },
  ];

  for (const testData of testColumns) {
    const columnName = Object.keys(testData)[0];
    console.log(`\n\nTest: Trying column "${columnName}"...`);
    const { data, error } = await supabase
      .from('anonymous_feedback')
      .insert([testData])
      .select();

    if (error) {
      console.log(`❌ ${columnName}:`, error.message);
    } else {
      console.log(`✅ ${columnName} worked!`, JSON.stringify(data, null, 2));
      break;
    }
  }

  console.log('\n\n========================================');
  console.log('Discovery Complete');
  console.log('========================================\n');
}

discoverColumns().catch(console.error);
