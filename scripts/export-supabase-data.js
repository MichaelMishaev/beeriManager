#!/usr/bin/env node

/**
 * Supabase Data Export Script
 * Exports all data from Supabase tables to JSON files
 */

const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Missing Supabase credentials in .env.local')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Import Supabase client
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Tables to export
const TABLES = [
  'events',
  'tasks',
  'responsibilities',
  'issues',
  'protocols',
  'committees',
  'anonymous_feedback',
  'vendors',
  'tags',
  'task_tags',
  'prom_votes',
  'tickets',
  'app_settings',
  'push_subscriptions',
  'contacts',
  'parent_skill_responses',
]

// Create backup directory
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
const backupDir = path.join(__dirname, '..', 'backups', 'supabase', `json_export_${timestamp}`)

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true })
}

console.log('🔄 Starting Supabase data export...')
console.log(`📁 Export directory: ${backupDir}`)
console.log('')

async function exportTable(tableName) {
  try {
    console.log(`   Exporting ${tableName}...`)

    // Try to order by created_at first
    let { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false })

    // If ordering by created_at fails (column doesn't exist), try without ordering
    if (error && error.message.includes('created_at does not exist')) {
      const result = await supabase
        .from(tableName)
        .select('*')
      data = result.data
      error = result.error
    }

    if (error) {
      console.error(`   ❌ Error exporting ${tableName}:`, error.message)
      return { tableName, success: false, count: 0 }
    }

    const filename = path.join(backupDir, `${tableName}.json`)
    fs.writeFileSync(filename, JSON.stringify(data, null, 2))

    console.log(`   ✓ ${tableName}: ${data.length} records`)
    return { tableName, success: true, count: data.length }

  } catch (error) {
    console.error(`   ❌ Unexpected error exporting ${tableName}:`, error.message)
    return { tableName, success: false, count: 0 }
  }
}

async function exportAllTables() {
  const results = []

  for (const tableName of TABLES) {
    const result = await exportTable(tableName)
    results.push(result)
  }

  return results
}

async function createManifest(results) {
  const manifest = {
    exportDate: new Date().toISOString(),
    supabaseUrl: SUPABASE_URL,
    tables: results,
    totalRecords: results.reduce((sum, r) => sum + r.count, 0),
    successfulTables: results.filter(r => r.success).length,
    failedTables: results.filter(r => !r.success).length,
  }

  const manifestPath = path.join(backupDir, '_manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

  console.log('')
  console.log('📋 Manifest created')
  return manifest
}

async function main() {
  const startTime = Date.now()

  console.log('═══════════════════════════════════════════')
  console.log('   Supabase Data Export')
  console.log('═══════════════════════════════════════════')
  console.log('')

  // Export all tables
  const results = await exportAllTables()

  // Create manifest
  const manifest = await createManifest(results)

  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log('')
  console.log('═══════════════════════════════════════════')
  console.log('   Export Summary')
  console.log('═══════════════════════════════════════════')
  console.log(`✓ Total tables exported: ${manifest.successfulTables}/${TABLES.length}`)
  console.log(`✓ Total records: ${manifest.totalRecords}`)
  console.log(`⏱ Duration: ${duration}s`)
  console.log(`📁 Location: ${backupDir}`)
  console.log('')

  if (manifest.failedTables > 0) {
    console.log('⚠️  Some tables failed to export:')
    results
      .filter(r => !r.success)
      .forEach(r => console.log(`   - ${r.tableName}`))
    console.log('')
  }

  console.log('💡 Tips:')
  console.log('   - This is a JSON export, not a SQL backup')
  console.log('   - For full SQL backup, use pg_dump or Supabase CLI')
  console.log('   - Store backups securely')
  console.log('')
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
