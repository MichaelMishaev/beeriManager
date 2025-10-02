require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Step 1: Check if i18n columns exist
 * Step 2: If not, provide manual migration instructions
 * Step 3: If yes, migrate existing Hebrew data to i18n columns
 */

async function checkI18nColumns() {
  console.log('🔍 Checking for i18n columns in database...\n')

  // Try to query with i18n columns to see if they exist
  const { data: testEvent, error } = await supabase
    .from('events')
    .select('id, title, title_i18n')
    .limit(1)

  if (error && error.message.includes('title_i18n')) {
    console.log('⚠️  i18n columns do NOT exist yet.\n')
    console.log('📋 Please run the database migration first:')
    console.log('   1. Open: https://supabase.com/dashboard/project/wkfxwnayexznjhcktwwu/sql')
    console.log('   2. Click "New Query"')
    console.log('   3. Paste the contents of: scripts/migrations/006_add_i18n_support.sql')
    console.log('   4. Click "Run"')
    console.log('   5. Then run this script again: node scripts/auto-migrate-i18n-data.js')
    return false
  } else if (error) {
    console.error('❌ Error checking columns:', error.message)
    return false
  }

  console.log('✅ i18n columns exist!\n')
  return true
}

async function migrateTableData(tableName, columns) {
  console.log(`\n📦 Migrating ${tableName}...`)

  // Get all rows
  const { data: rows, error: fetchError } = await supabase
    .from(tableName)
    .select('*')

  if (fetchError) {
    console.error(`❌ Error fetching ${tableName}:`, fetchError.message)
    return { success: 0, failed: 0, skipped: 0 }
  }

  if (!rows || rows.length === 0) {
    console.log(`   ℹ️  No rows to migrate`)
    return { success: 0, failed: 0, skipped: 0 }
  }

  console.log(`   Found ${rows.length} rows`)

  let successCount = 0
  let failedCount = 0
  let skippedCount = 0

  for (const row of rows) {
    const updates = {}
    let needsUpdate = false

    // Check each column that needs migration
    for (const col of columns) {
      const originalValue = row[col.original]
      const i18nValue = row[col.i18n]

      // Skip if original is empty
      if (!originalValue) continue

      // Skip if i18n already has Hebrew value
      if (i18nValue && i18nValue.he) {
        skippedCount++
        continue
      }

      // Add Hebrew value to i18n column
      updates[col.i18n] = { he: originalValue }
      needsUpdate = true
    }

    if (!needsUpdate) {
      skippedCount++
      continue
    }

    // Update the row
    const { error: updateError } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', row.id)

    if (updateError) {
      console.error(`   ❌ Failed to update row ${row.id}:`, updateError.message)
      failedCount++
    } else {
      successCount++
    }
  }

  console.log(`   ✅ Success: ${successCount}, ⏭️  Skipped: ${skippedCount}, ❌ Failed: ${failedCount}`)
  return { success: successCount, failed: failedCount, skipped: skippedCount }
}

async function main() {
  console.log('🌍 i18n Data Migration Tool\n')
  console.log('This will migrate existing Hebrew content to i18n JSONB columns\n')

  // Check if columns exist
  const columnsExist = await checkI18nColumns()

  if (!columnsExist) {
    console.log('\n❌ Migration aborted. Run database migration first.')
    process.exit(1)
  }

  console.log('🚀 Starting data migration...')

  const results = []

  // Migrate each table
  results.push(await migrateTableData('events', [
    { original: 'title', i18n: 'title_i18n' },
    { original: 'description', i18n: 'description_i18n' },
    { original: 'location', i18n: 'location_i18n' }
  ]))

  results.push(await migrateTableData('tasks', [
    { original: 'title', i18n: 'title_i18n' },
    { original: 'description', i18n: 'description_i18n' }
  ]))

  results.push(await migrateTableData('issues', [
    { original: 'title', i18n: 'title_i18n' },
    { original: 'description', i18n: 'description_i18n' }
  ]))

  results.push(await migrateTableData('protocols', [
    { original: 'title', i18n: 'title_i18n' },
    { original: 'description', i18n: 'description_i18n' }
  ]))

  results.push(await migrateTableData('holidays', [
    { original: 'name', i18n: 'name_i18n' },
    { original: 'description', i18n: 'description_i18n' }
  ]))

  results.push(await migrateTableData('committees', [
    { original: 'name', i18n: 'name_i18n' },
    { original: 'description', i18n: 'description_i18n' }
  ]))

  // Summary
  const totalSuccess = results.reduce((sum, r) => sum + r.success, 0)
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0)

  console.log('\n📊 Migration Complete!')
  console.log(`   ✅ Total migrated: ${totalSuccess}`)
  console.log(`   ⏭️  Total skipped: ${totalSkipped}`)
  console.log(`   ❌ Total failed: ${totalFailed}`)

  if (totalFailed > 0) {
    console.log('\n⚠️  Some rows failed to migrate. Check errors above.')
    process.exit(1)
  }

  console.log('\n✨ All done! Hebrew content is now in i18n columns.')
  console.log('\n📝 Next steps:')
  console.log('   1. Test the application in both Hebrew and Russian')
  console.log('   2. Add Russian translations to the i18n columns manually or via admin UI')
  console.log('   3. Update API routes to read from i18n columns')
}

main().catch(err => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
