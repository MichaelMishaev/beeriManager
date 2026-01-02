#!/usr/bin/env node

/**
 * Simple script to import January 2026 calendar events
 * Parses the SQL migration and executes each INSERT via Supabase client
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// Parse SQL INSERT statement to extract event data
function parseInsert(sql) {
  const titleMatch = sql.match(/title[,\s]+.*?VALUES[^(]*\([^']*'([^']+)'/s);
  const descMatch = sql.match(/description[,\s]+.*?VALUES[^(]*\([^']*'[^']*'[,\s]+(?:'([^']*)'|NULL)/s);
  const dateMatch = sql.match(/start_datetime[,\s]+.*?VALUES[^(]*\([^']*'[^']*'[^']*(?:'[^']*'|NULL)[,\s]+'([^']+)'/s);
  const typeMatch = sql.match(/event_type[,\s]+.*?VALUES[^(]*\([^']*(?:'[^']*'[,\s]+){5}'([^']+)'/s);
  const priorityMatch = sql.match(/priority[,\s]+.*?VALUES[^(]*\([^']*(?:'[^']*'[,\s]+){7}'([^']+)'/s);

  return {
    title: titleMatch ? titleMatch[1] : 'Unknown Event',
    description: descMatch ? (descMatch[1] || null) : null,
    start_datetime: dateMatch ? dateMatch[1] : new Date().toISOString(),
    event_type: typeMatch ? typeMatch[1] : 'general',
    status: 'published',
    visibility: 'public',
    priority: priorityMatch ? priorityMatch[1] : 'normal',
    created_by: 'admin'
  };
}

async function importEvents() {
  console.log('🚀 Importing January 2026 calendar events...\n');

  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20260104000000_import_january_2026_calendar.sql');
  const sqlContent = readFileSync(migrationPath, 'utf8');

  // Split into individual INSERT statements
  const inserts = sqlContent
    .split(/(?=INSERT INTO events)/g)
    .filter(stmt => stmt.trim().startsWith('INSERT'));

  console.log(`📋 Found ${inserts.length} events to import\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < inserts.length; i++) {
    const insert = inserts[i];
    const event = parseInsert(insert);

    try {
      const { error } = await supabase
        .from('events')
        .insert([event]);

      if (error) {
        throw error;
      }

      console.log(`✅ [${i + 1}/${inserts.length}] ${event.title.substring(0, 50)}...`);
      successCount++;
    } catch (err) {
      console.error(`❌ [${i + 1}/${inserts.length}] Failed: ${event.title.substring(0, 50)}...`);
      errorCount++;
      errors.push({ event: event.title, error: err.message });
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`📊 Import Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📝 Total: ${inserts.length}`);
  console.log('='.repeat(70));

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ event, error }) => {
      console.log(`   - ${event}: ${error}`);
    });
  }

  if (errorCount === 0) {
    console.log('\n🎉 All events imported successfully!');
    console.log('💡 Refresh your app at http://localhost:4500/he/events to see them\n');
  } else {
    console.log('\n⚠️  Some events failed. This may be because they already exist in the database.');
    console.log('💡 Check the errors above for details\n');
  }
}

importEvents().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
