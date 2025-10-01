#!/usr/bin/env tsx
/**
 * Inspect actual database schema using raw SQL queries
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectSchema() {
  console.log('\n========================================');
  console.log('Inspecting Database Schema');
  console.log('========================================\n');

  // Query 1: Check if table exists
  console.log('Query 1: Checking if anonymous_feedback table exists...\n');
  const { error: tableError } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = 'anonymous_feedback'
        ) as exists;
      `
    });

  if (tableError) {
    console.log('Trying direct table check via REST API...');
    await supabase
      .from('anonymous_feedback')
      .select('*')
      .limit(0);
    console.log('✅ Table accessible via REST API\n');
  }

  // Query 2: Get actual column structure
  console.log('Query 2: Fetching actual column structure...\n');

  // Try using pg_attribute to get column names directly
  const { data: columns, error: columnsError } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT
          a.attname as column_name,
          pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
          a.attnotnull as is_not_null,
          pg_catalog.pg_get_expr(d.adbin, d.adrelid) as column_default
        FROM pg_catalog.pg_attribute a
        LEFT JOIN pg_catalog.pg_attrdef d ON (a.attrelid, a.attnum) = (d.adrelid, d.adnum)
        WHERE a.attrelid = 'public.anonymous_feedback'::regclass
          AND a.attnum > 0
          AND NOT a.attisdropped
        ORDER BY a.attnum;
      `
    });

  if (columnsError) {
    console.error('❌ Error querying columns:', columnsError);

    // Fallback: Try information_schema
    console.log('\nTrying information_schema fallback...\n');
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'anonymous_feedback'
          ORDER BY ordinal_position;
        `
      });

    if (schemaError) {
      console.error('❌ Schema query error:', schemaError);
    } else {
      console.log('✅ Column structure from information_schema:');
      console.log(JSON.stringify(schemaData, null, 2));
    }
  } else {
    console.log('✅ Column structure:');
    console.log(JSON.stringify(columns, null, 2));
  }

  // Query 3: Get sample data to infer structure
  console.log('\n\nQuery 3: Attempting to get sample data...\n');
  const { data: sampleData, error: sampleError } = await supabase
    .from('anonymous_feedback')
    .select('*')
    .limit(1);

  if (sampleError) {
    console.error('❌ Sample data error:', sampleError);
  } else {
    if (sampleData && sampleData.length > 0) {
      console.log('✅ Sample record structure:');
      console.log('Keys:', Object.keys(sampleData[0]));
      console.log('Full record:', JSON.stringify(sampleData[0], null, 2));
    } else {
      console.log('⚠️  Table exists but is empty');
    }
  }

  console.log('\n========================================');
  console.log('Inspection Complete');
  console.log('========================================\n');
}

inspectSchema().catch(console.error);
