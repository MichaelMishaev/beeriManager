#!/usr/bin/env ts-node
/**
 * FULLY AUTOMATED i18n Database Migration
 * Works with Supabase without custom SQL functions
 *
 * Usage: npx ts-node scripts/auto-migrate-i18n.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
})

const log = {
  info: (msg: string) => console.log(`\x1b[34mℹ️  ${msg}\x1b[0m`),
  success: (msg: string) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  warn: (msg: string) => console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`),
  error: (msg: string) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
}

async function backupData(tableName: string): Promise<void> {
  log.info(`Backing up ${tableName}...`)

  const { data, error } = await supabase.from(tableName).select('*')
  if (error) throw new Error(`Backup failed: ${error.message}`)

  const backupDir = path.join(process.cwd(), 'backups')
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true })

  const timestamp = new Date().toISOString().split('T')[0]
  const file = path.join(backupDir, `${tableName}_${timestamp}.json`)

  fs.writeFileSync(file, JSON.stringify(data, null, 2))
  log.success(`Backed up ${data?.length || 0} rows → ${file}`)
}

async function migrateTableData(
  tableName: string,
  columns: { original: string; i18n: string }[]
): Promise<void> {
  log.info(`Migrating ${tableName}...`)

  // Get all rows
  const { data: rows, error } = await supabase.from(tableName).select('*')
  if (error) throw new Error(`Select failed: ${error.message}`)

  if (!rows || rows.length === 0) {
    log.warn(`No data in ${tableName}`)
    return
  }

  // Check if columns already exist
  const firstRow = rows[0]
  const hasI18nColumns = columns.some(col => col.i18n in firstRow)

  if (!hasI18nColumns) {
    log.error(`Missing i18n columns in ${tableName}. Run SQL migration first!`)
    throw new Error('i18n columns not found')
  }

  // Migrate each row
  let updated = 0
  for (const row of rows) {
    const updates: any = {}
    let needsUpdate = false

    for (const col of columns) {
      // Only migrate if i18n column is empty and original has data
      if (row[col.original] && (!row[col.i18n] || Object.keys(row[col.i18n]).length === 0)) {
        updates[col.i18n] = { he: row[col.original] }
        needsUpdate = true
      }
    }

    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', row.id)

      if (updateError) {
        log.error(`Update failed for ${tableName}.${row.id}: ${updateError.message}`)
      } else {
        updated++
      }
    }
  }

  log.success(`Migrated ${updated}/${rows.length} rows in ${tableName}`)
}

async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('🌍  BEERIMANAGER i18n DATABASE MIGRATION (AUTOMATED)')
  console.log('='.repeat(70) + '\n')

  log.warn('This script will migrate existing data to JSONB i18n columns')
  log.warn('Make sure you ran the SQL migration first!')
  console.log('')

  try {
    // Backup all tables
    log.info('STEP 1: Backing up data...\n')
    await backupData('events')
    await backupData('tasks')
    await backupData('issues')
    await backupData('protocols')
    await backupData('holidays')
    await backupData('committees')

    console.log('')
    log.info('STEP 2: Migrating data to i18n columns...\n')

    await migrateTableData('events', [
      { original: 'title', i18n: 'title_i18n' },
      { original: 'description', i18n: 'description_i18n' },
      { original: 'location', i18n: 'location_i18n' },
    ])

    await migrateTableData('tasks', [
      { original: 'title', i18n: 'title_i18n' },
      { original: 'description', i18n: 'description_i18n' },
    ])

    await migrateTableData('issues', [
      { original: 'title', i18n: 'title_i18n' },
      { original: 'description', i18n: 'description_i18n' },
    ])

    await migrateTableData('protocols', [
      { original: 'title', i18n: 'title_i18n' },
      { original: 'description', i18n: 'description_i18n' },
    ])

    await migrateTableData('holidays', [
      { original: 'name', i18n: 'name_i18n' },
      { original: 'description', i18n: 'description_i18n' },
    ])

    await migrateTableData('committees', [
      { original: 'name', i18n: 'name_i18n' },
      { original: 'description', i18n: 'description_i18n' },
    ])

    console.log('\n' + '='.repeat(70))
    log.success('MIGRATION COMPLETED SUCCESSFULLY!')
    console.log('='.repeat(70) + '\n')

  } catch (error: any) {
    console.log('\n' + '='.repeat(70))
    log.error('MIGRATION FAILED!')
    console.log('='.repeat(70) + '\n')
    log.error(error.message)
    if (error.stack) console.log(error.stack)
    process.exit(1)
  }
}

main()
