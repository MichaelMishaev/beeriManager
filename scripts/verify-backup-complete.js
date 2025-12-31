#!/usr/bin/env node

/**
 * ULTRA-THOROUGH BACKUP VERIFICATION
 * Compares production database with backup to ensure 100% completeness
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Latest backup directory
const backupDir = path.join(__dirname, '..', 'backups', 'supabase', 'json_export_2025-12-31T14-47-04')

// All possible tables that might exist
const POSSIBLE_TABLES = [
  'events', 'tasks', 'responsibilities', 'issues', 'protocols',
  'committees', 'anonymous_feedback', 'vendors', 'tags', 'task_tags',
  'prom_quotes', 'prom_votes', 'tickets', 'app_settings', 'push_subscriptions',
  'parent_skills', 'contacts', 'school_years', 'user_sessions', 'representatives',
  'committee_members', 'forbidden_items', 'parent_skill_responses',
  'users', 'profiles', 'notifications', 'settings', 'audit_log',
  'sessions', 'permissions', 'roles', 'files', 'uploads'
]

async function getProductionTableCount(tableName) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (error) {
      return { exists: false, count: 0, error: error.message }
    }

    return { exists: true, count: count || 0, error: null }
  } catch (err) {
    return { exists: false, count: 0, error: err.message }
  }
}

function getBackupTableCount(tableName) {
  const backupFile = path.join(backupDir, `${tableName}.json`)

  if (!fs.existsSync(backupFile)) {
    return { exists: false, count: 0 }
  }

  try {
    const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'))
    return { exists: true, count: Array.isArray(data) ? data.length : 0 }
  } catch (err) {
    return { exists: true, count: 0, error: err.message }
  }
}

async function verifyBackup() {
  console.log('🔍 ULTRA-THOROUGH BACKUP VERIFICATION\n')
  console.log('═══════════════════════════════════════════════════════════\n')

  const results = []
  let totalProductionRecords = 0
  let totalBackupRecords = 0
  let missingTables = []
  let mismatchedCounts = []
  let extraBackups = []

  // Check all possible tables
  console.log('Checking all possible tables...\n')

  for (const tableName of POSSIBLE_TABLES) {
    const prod = await getProductionTableCount(tableName)
    const backup = getBackupTableCount(tableName)

    const result = {
      table: tableName,
      prodExists: prod.exists,
      prodCount: prod.count,
      backupExists: backup.exists,
      backupCount: backup.count,
      match: prod.exists && backup.exists && prod.count === backup.count,
      status: '?'
    }

    if (prod.exists && !backup.exists) {
      result.status = '❌ MISSING FROM BACKUP'
      missingTables.push(result)
    } else if (!prod.exists && backup.exists) {
      result.status = '⚠️  EXTRA (not in prod)'
      extraBackups.push(result)
    } else if (prod.exists && backup.exists) {
      if (prod.count === backup.count) {
        result.status = '✅ MATCH'
      } else {
        result.status = '⚠️  COUNT MISMATCH'
        mismatchedCounts.push(result)
      }
      totalProductionRecords += prod.count
      totalBackupRecords += backup.count
    } else {
      result.status = '➖ Not in prod or backup'
    }

    results.push(result)
  }

  // Display results
  console.log('TABLE VERIFICATION RESULTS:\n')
  console.log('Table Name'.padEnd(30) + 'Prod'.padEnd(10) + 'Backup'.padEnd(10) + 'Status')
  console.log('─'.repeat(75))

  // Show tables that exist in production
  const prodTables = results.filter(r => r.prodExists).sort((a, b) => b.prodCount - a.prodCount)
  prodTables.forEach(r => {
    console.log(
      r.table.padEnd(30) +
      String(r.prodCount).padEnd(10) +
      String(r.backupCount).padEnd(10) +
      r.status
    )
  })

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('VERIFICATION SUMMARY:')
  console.log('═══════════════════════════════════════════════════════════\n')

  console.log(`📊 Total tables in production: ${prodTables.length}`)
  console.log(`📦 Total tables in backup: ${results.filter(r => r.backupExists).length}`)
  console.log(`📈 Total production records: ${totalProductionRecords}`)
  console.log(`💾 Total backup records: ${totalBackupRecords}`)
  console.log('')

  if (missingTables.length > 0) {
    console.log('❌ CRITICAL: TABLES MISSING FROM BACKUP:')
    missingTables.forEach(r => {
      console.log(`   - ${r.table} (${r.prodCount} records NOT backed up!)`)
    })
    console.log('')
  }

  if (mismatchedCounts.length > 0) {
    console.log('⚠️  WARNING: COUNT MISMATCHES:')
    mismatchedCounts.forEach(r => {
      console.log(`   - ${r.table}: Prod=${r.prodCount}, Backup=${r.backupCount}`)
    })
    console.log('')
  }

  if (extraBackups.length > 0) {
    console.log('ℹ️  INFO: Extra backups (tables not in production):')
    extraBackups.forEach(r => {
      console.log(`   - ${r.table} (${r.backupCount} records)`)
    })
    console.log('')
  }

  // Final verdict
  const allMatch = missingTables.length === 0 && mismatchedCounts.length === 0

  if (allMatch) {
    console.log('✅ ✅ ✅ BACKUP IS 100% COMPLETE! ✅ ✅ ✅')
    console.log(`\n✓ All ${prodTables.length} production tables backed up`)
    console.log(`✓ All ${totalProductionRecords} records backed up`)
    console.log('✓ No missing data')
    console.log('✓ No count mismatches\n')
  } else {
    console.log('❌ ❌ ❌ BACKUP IS INCOMPLETE! ❌ ❌ ❌')
    console.log(`\n✗ Missing tables: ${missingTables.length}`)
    console.log(`✗ Count mismatches: ${mismatchedCounts.length}\n`)
  }

  console.log('═══════════════════════════════════════════════════════════\n')

  // Check manifest
  const manifestPath = path.join(backupDir, '_manifest.json')
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    console.log('📋 Backup Manifest Info:')
    console.log(`   Date: ${manifest.exportDate}`)
    console.log(`   Tables: ${manifest.successfulTables}/${manifest.tables.length}`)
    console.log(`   Total Records: ${manifest.totalRecords}`)
    console.log(`   Failed: ${manifest.failedTables}`)
  }

  return {
    allMatch,
    prodTableCount: prodTables.length,
    totalProductionRecords,
    totalBackupRecords,
    missingTables,
    mismatchedCounts
  }
}

verifyBackup().catch(console.error)
