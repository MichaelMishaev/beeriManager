#!/usr/bin/env node

/**
 * Import January 2026 calendar events from migration file
 * This script reads and executes the SQL migration
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importEvents() {
  console.log('🚀 Starting import of January 2026 calendar events...\n');

  // Read the migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260104000000_import_january_2026_calendar.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(migrationPath, 'utf8');

  // Split by INSERT statements and filter out comments
  const insertStatements = sqlContent
    .split('INSERT INTO events')
    .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'))
    .map(stmt => 'INSERT INTO events' + stmt);

  console.log(`📋 Found ${insertStatements.length} INSERT statements\n`);

  let successCount = 0;
  let errorCount = 0;

  // Execute each INSERT statement
  for (let i = 0; i < insertStatements.length; i++) {
    const stmt = insertStatements[i];

    try {
      // Extract title for logging
      const titleMatch = stmt.match(/title,[\s\S]*?\('([^']+)'/);
      const title = titleMatch ? titleMatch[1] : `Event ${i + 1}`;

      // Execute via Supabase RPC or direct SQL
      const { error } = await supabase.rpc('exec_sql', { sql: stmt }).catch(async () => {
        // Fallback: Parse and insert via Supabase client
        // This is a simplified approach - the SQL should work directly
        return { error: new Error('RPC not available - using fallback') };
      });

      if (error) {
        // Try alternative: execute raw SQL via postgrest
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ query: stmt })
        });

        if (!response.ok) {
          console.error(`❌ Failed to import: ${title.substring(0, 50)}...`);
          errorCount++;
        } else {
          console.log(`✅ Imported: ${title.substring(0, 50)}...`);
          successCount++;
        }
      } else {
        console.log(`✅ Imported: ${title.substring(0, 50)}...`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Error importing event ${i + 1}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Import Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📝 Total: ${insertStatements.length}`);
  console.log('='.repeat(60));

  if (errorCount === 0) {
    console.log('\n🎉 All events imported successfully!');
  } else {
    console.log('\n⚠️  Some events failed to import. Check errors above.');
  }
}

importEvents().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
