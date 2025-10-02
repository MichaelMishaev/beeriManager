#!/usr/bin/env node
/**
 * Backup all Supabase data before i18n migration
 */
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const tables = [
  'events', 'tasks', 'issues', 'protocols', 'holidays', 'committees',
  'anonymous_feedback', 'vendors', 'vendor_transactions', 'vendor_reviews',
  'app_settings'
]

async function backupAllTables() {
  console.log('🔄 Creating full Supabase backup...\n')

  const backupDir = path.join(process.cwd(), 'backups')
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true })

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0]
  const fullBackup = { timestamp, tables: {} }

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*')

      if (error) {
        console.log(`⚠️  ${table}: ${error.message}`)
        fullBackup.tables[table] = { error: error.message }
      } else {
        console.log(`✅ ${table}: ${data?.length || 0} rows`)
        fullBackup.tables[table] = { rows: data?.length || 0, data }
      }
    } catch (error) {
      console.log(`❌ ${table}: ${error.message}`)
    }
  }

  const filename = `supabase_full_backup_${timestamp}.json`
  const filepath = path.join(backupDir, filename)

  fs.writeFileSync(filepath, JSON.stringify(fullBackup, null, 2))

  console.log(`\n✅ Full backup saved: ${filepath}`)
  console.log(`📦 Backup size: ${(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)} MB\n`)

  return filepath
}

backupAllTables().catch(console.error)
