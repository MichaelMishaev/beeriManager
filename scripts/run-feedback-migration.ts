/**
 * Script to apply feedback enhancement migration
 * Run with: npx tsx scripts/run-feedback-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Read environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('🚀 Starting feedback enhancement migration...\n')

  try {
    // Step 1: Drop existing constraint
    console.log('📝 Step 1: Dropping old status constraint...')
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'anonymous_feedback_status_check'
          ) THEN
            ALTER TABLE anonymous_feedback DROP CONSTRAINT anonymous_feedback_status_check;
          END IF;
        END $$;
      `
    })
    if (dropError) {
      console.error('⚠️  Warning dropping constraint:', dropError.message)
    } else {
      console.log('✅ Old constraint dropped\n')
    }

    // Step 2: Add status_comment column
    console.log('📝 Step 2: Adding status_comment column...')
    const { error: commentError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE anonymous_feedback ADD COLUMN IF NOT EXISTS status_comment TEXT;`
    })
    if (commentError) {
      console.error('❌ Error adding status_comment:', commentError.message)
    } else {
      console.log('✅ status_comment column added\n')
    }

    // Step 3: Add task_id column
    console.log('📝 Step 3: Adding task_id column...')
    const { error: taskIdError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE anonymous_feedback ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;`
    })
    if (taskIdError) {
      console.error('❌ Error adding task_id:', taskIdError.message)
    } else {
      console.log('✅ task_id column added\n')
    }

    // Step 4: Alter status column
    console.log('📝 Step 4: Altering status column type...')
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE anonymous_feedback ALTER COLUMN status TYPE TEXT;`
    })
    if (alterError) {
      console.error('⚠️  Warning altering status:', alterError.message)
    } else {
      console.log('✅ Status column type updated\n')
    }

    // Step 5: Add new constraint
    console.log('📝 Step 5: Adding new status constraint...')
    const { error: constraintError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE anonymous_feedback
        ADD CONSTRAINT anonymous_feedback_status_check
        CHECK (status IN ('new', 'read', 'responded', 'done', 'in_progress', 'other'));
      `
    })
    if (constraintError) {
      console.error('❌ Error adding constraint:', constraintError.message)
    } else {
      console.log('✅ New status constraint added\n')
    }

    // Step 6: Create index
    console.log('📝 Step 6: Creating index on task_id...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_feedback_task_id ON anonymous_feedback(task_id);`
    })
    if (indexError) {
      console.error('❌ Error creating index:', indexError.message)
    } else {
      console.log('✅ Index created\n')
    }

    console.log('✅ Migration completed successfully!')
    console.log('\n📊 Verifying changes...')

    // Verify the schema
    const { data: columns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'anonymous_feedback')
      .in('column_name', ['task_id', 'status_comment', 'status'])

    if (verifyError) {
      console.error('⚠️  Could not verify schema:', verifyError.message)
    } else {
      console.log('\nColumn verification:')
      console.table(columns)
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Alternative: Direct SQL execution using Supabase SQL endpoint
async function runMigrationDirectSQL() {
  console.log('🚀 Running migration using direct SQL...\n')

  const migrationSQL = `
    -- Drop existing constraint
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'anonymous_feedback_status_check'
      ) THEN
        ALTER TABLE anonymous_feedback DROP CONSTRAINT anonymous_feedback_status_check;
      END IF;
    END $$;

    -- Add new columns
    ALTER TABLE anonymous_feedback ADD COLUMN IF NOT EXISTS status_comment TEXT;
    ALTER TABLE anonymous_feedback ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;

    -- Alter status type
    ALTER TABLE anonymous_feedback ALTER COLUMN status TYPE TEXT;

    -- Add new constraint
    ALTER TABLE anonymous_feedback
    ADD CONSTRAINT anonymous_feedback_status_check
    CHECK (status IN ('new', 'read', 'responded', 'done', 'in_progress', 'other'));

    -- Create index
    CREATE INDEX IF NOT EXISTS idx_feedback_task_id ON anonymous_feedback(task_id);

    -- Add comments
    COMMENT ON COLUMN anonymous_feedback.status_comment IS 'Custom status description when status is "other"';
    COMMENT ON COLUMN anonymous_feedback.task_id IS 'Reference to task created from this feedback';
  `

  try {
    // Try using PostgreSQL REST endpoint
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({ sql: migrationSQL })
    })

    if (response.ok) {
      console.log('✅ Migration executed successfully!')
    } else {
      const error = await response.text()
      console.error('❌ Migration failed:', error)
      console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:')
      console.log('   https://app.supabase.com/project/wkfxwnayexznjhcktwwu/sql\n')
      console.log(migrationSQL)
    }
  } catch (error) {
    console.error('❌ Error:', error)
    console.log('\n📋 Please run the SQL file manually:')
    console.log('   scripts/apply-feedback-migration.sql')
  }
}

// Run the migration
runMigrationDirectSQL()
