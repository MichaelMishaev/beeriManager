#!/usr/bin/env node

/**
 * Run AI Usage Tracking Migration - Direct Database Connection
 * Uses PostgreSQL connection to execute SQL directly
 */

import pkg from 'pg'
const { Client } = pkg
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL')
  process.exit(1)
}

// Extract project ref from URL (e.g., wkfxwnayexznjhcktwwu)
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

if (!projectRef) {
  console.error('❌ Could not extract project reference from Supabase URL')
  process.exit(1)
}

console.log('🚀 Running AI Usage Tracking Migration via Direct Connection...\n')
console.log(`📍 Project: ${projectRef}`)
console.log('')

// Construct connection string
// Note: This requires the database password which is not in .env.local
// We'll use the Supabase pooler endpoint instead
const connectionString = `postgresql://postgres.${projectRef}:${process.env.SUPABASE_DB_PASSWORD || '[PASSWORD]'}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`

console.log('⚠️  Direct database connection requires SUPABASE_DB_PASSWORD')
console.log('   You can find this in: Supabase Dashboard > Settings > Database\n')

if (!process.env.SUPABASE_DB_PASSWORD) {
  console.log('❌ SUPABASE_DB_PASSWORD not found in .env.local')
  console.log('')
  console.log('📋 Please add to .env.local:')
  console.log('   SUPABASE_DB_PASSWORD=your_database_password')
  console.log('')
  console.log('OR run the migration manually in Supabase SQL Editor:')
  console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new`)
  console.log('')
  process.exit(1)
}

// Read SQL file
const sqlPath = join(__dirname, 'migrations', '011_ai_usage_tracking.sql')
const sqlContent = readFileSync(sqlPath, 'utf8')

async function runMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('🔗 Connecting to Supabase database...')
    await client.connect()
    console.log('✅ Connected!\n')

    console.log('📝 Executing migration SQL...')
    console.log('─'.repeat(60))

    const result = await client.query(sqlContent)

    console.log('✅ Migration executed successfully!')
    console.log('')

    // Verify the table exists
    console.log('🔍 Verifying migration...\n')

    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'ai_usage_logs'
      );
    `)

    if (tableCheck.rows[0].exists) {
      console.log('✅ Table `ai_usage_logs` created successfully')

      // Check functions
      const functionCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_proc
          WHERE proname = 'get_ai_usage'
        );
      `)

      if (functionCheck.rows[0].exists) {
        console.log('✅ Function `get_ai_usage` created successfully')

        // Test the function
        const usageResult = await client.query('SELECT * FROM get_ai_usage()')
        console.log('✅ Current usage:', usageResult.rows[0])
      }
    }

    console.log('\n🎉 Migration complete!\n')

  } catch (error) {
    console.error('❌ Error running migration:', error.message)
    console.log('')
    console.log('💡 Try running manually in Supabase SQL Editor:')
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new`)
    console.log('')
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
