#!/usr/bin/env node

/**
 * Supabase Database Backup Script
 * Creates a complete JSON backup of all tables
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// List of all tables to backup
const TABLES = [
  'app_settings',
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
  'prom_quotes',
  'prom_votes',
  'tickets',
  'push_subscriptions',
]

async function backupTable(tableName) {
  console.log(`  📦 Backing up table: ${tableName}`)

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')

    if (error) {
      console.error(`    ❌ Error backing up ${tableName}:`, error.message)
      return { table: tableName, data: [], error: error.message }
    }

    console.log(`    ✅ Backed up ${data?.length || 0} rows from ${tableName}`)
    return { table: tableName, data: data || [], rowCount: data?.length || 0 }
  } catch (err) {
    console.error(`    ❌ Exception backing up ${tableName}:`, err.message)
    return { table: tableName, data: [], error: err.message }
  }
}

async function createBackup() {
  console.log('🚀 Starting Supabase database backup...\n')

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(__dirname, '..', 'backups')
  const backupFile = path.join(backupDir, `supabase_backup_${timestamp}.json`)

  // Ensure backups directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  const backup = {
    timestamp: new Date().toISOString(),
    supabaseUrl: supabaseUrl,
    tables: {}
  }

  let totalRows = 0

  // Backup all tables
  for (const table of TABLES) {
    const result = await backupTable(table)
    backup.tables[table] = {
      data: result.data,
      rowCount: result.rowCount || 0,
      error: result.error || null
    }
    totalRows += result.rowCount || 0
  }

  // Write backup to file
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))

  const fileSize = (fs.statSync(backupFile).size / 1024).toFixed(2)

  console.log('\n✨ Backup completed successfully!')
  console.log(`📁 File: ${backupFile}`)
  console.log(`📊 Total rows: ${totalRows}`)
  console.log(`💾 File size: ${fileSize} KB`)
  console.log(`📅 Timestamp: ${backup.timestamp}`)

  // Also create a "latest" symlink or copy
  const latestFile = path.join(backupDir, 'latest.json')
  fs.writeFileSync(latestFile, JSON.stringify(backup, null, 2))
  console.log(`🔗 Latest backup: ${latestFile}`)

  return backupFile
}

// Run backup
createBackup()
  .then((file) => {
    console.log('\n✅ Backup process completed!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\n❌ Backup failed:', err)
    process.exit(1)
  })
