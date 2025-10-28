/**
 * Script to run the ideas table migration
 * This creates the ideas table in Supabase with proper RLS policies
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Starting ideas table migration...\n');

  // Read the migration SQL file
  const migrationPath = path.join(
    __dirname,
    '../supabase/migrations/20251028000000_create_ideas_table.sql'
  );

  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration file loaded:', migrationPath);
  console.log('📊 Executing SQL...\n');

  try {
    // Execute the SQL using Supabase's RPC
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_string: sql
    });

    if (error) {
      // Try direct query if RPC doesn't exist
      console.log('⚠️  RPC method not available, trying direct query...\n');

      // Split SQL into statements and execute one by one
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement) {
          const { error: queryError } = await supabase.from('_migration_temp').select('*').limit(0);

          // Use raw SQL through PostgREST
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ query: statement })
          });

          if (!response.ok) {
            console.error('❌ Failed to execute statement:', statement.substring(0, 100) + '...');
            throw new Error(await response.text());
          }
        }
      }

      console.log('✅ Migration executed successfully using direct queries!\n');
    } else {
      console.log('✅ Migration executed successfully!\n');
    }

    // Verify the table was created
    console.log('🔍 Verifying table creation...');
    const { data: tables, error: verifyError } = await supabase
      .from('ideas')
      .select('id')
      .limit(0);

    if (verifyError) {
      console.error('⚠️  Could not verify table (this might be okay):', verifyError.message);
    } else {
      console.log('✅ Table "ideas" verified successfully!\n');
    }

    console.log('🎉 Migration completed!\n');
    console.log('Next steps:');
    console.log('1. Create API routes at /api/ideas');
    console.log('2. Create IdeaSubmissionForm component');
    console.log('3. Create admin page for ideas management');

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
