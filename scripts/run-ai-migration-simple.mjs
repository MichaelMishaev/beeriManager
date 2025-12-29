#!/usr/bin/env node

/**
 * Run AI Usage Tracking Migration
 * Simple version - creates table directly using Supabase client
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log('🚀 Running AI Usage Tracking Migration...\n')
console.log(`📍 Supabase URL: ${supabaseUrl}`)
console.log('')

// Read the SQL file
const sqlPath = join(__dirname, 'migrations', '011_ai_usage_tracking.sql')
const sqlContent = readFileSync(sqlPath, 'utf8')

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSql(sql) {
  try {
    // Supabase doesn't have a direct SQL execution endpoint via REST API
    // We need to use the PostgREST admin API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`HTTP ${response.status}: ${text}`)
    }

    return await response.json()
  } catch (error) {
    throw error
  }
}

async function runMigration() {
  console.log('📄 SQL Migration Content:')
  console.log('─'.repeat(60))
  console.log(sqlContent.substring(0, 200) + '...\n')

  console.log('⚠️  Supabase REST API does not support direct SQL execution.')
  console.log('📋 Please run this migration manually:\n')
  console.log('1. Go to: https://supabase.com/dashboard/project/wkfxwnayexznjhcktwwu/sql/new')
  console.log('2. Copy the SQL from: scripts/migrations/011_ai_usage_tracking.sql')
  console.log('3. Paste and click "Run"\n')

  console.log('🔄 Attempting to verify existing table...\n')

  // Try to check if table exists
  try {
    const { data, error } = await supabase
      .from('ai_usage_logs')
      .select('count')
      .limit(0)

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ Table `ai_usage_logs` does not exist yet')
        console.log('   ➡️  Please run the migration manually (see instructions above)\n')
      } else {
        console.log('⚠️  Error checking table:', error.message)
      }
    } else {
      console.log('✅ Table `ai_usage_logs` already exists!')
      console.log('   Migration may have already been run.\n')

      // Test get_ai_usage function
      const { data: usageData, error: usageError } = await supabase
        .rpc('get_ai_usage')

      if (usageError) {
        console.log('❌ Function `get_ai_usage` not found')
        console.log('   ➡️  Please run the migration manually to create functions\n')
      } else {
        console.log('✅ Function `get_ai_usage` is working!')
        console.log('   Current usage:', usageData)
        console.log('\n🎉 Migration is complete and working!\n')
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n📋 Manual migration required - see instructions above\n')
  }
}

runMigration()
