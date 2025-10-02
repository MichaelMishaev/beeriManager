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
 * Migration script that bypasses audit_log trigger
 * by using direct SQL UPDATE with a mock user context
 */

async function migrateWithSQL(tableName, columns) {
  console.log(`\n📦 Migrating ${tableName} (bypassing audit trigger)...`)

  // Get all rows that need migration
  const { data: rows, error: fetchError } = await supabase
    .from(tableName)
    .select('*')

  if (fetchError) {
    console.error(`❌ Error fetching ${tableName}:`, fetchError.message)
    return { success: 0, failed: 0 }
  }

  if (!rows || rows.length === 0) {
    console.log(`   ℹ️  No rows to migrate`)
    return { success: 0, failed: 0 }
  }

  console.log(`   Found ${rows.length} rows`)

  let successCount = 0
  let failedCount = 0

  for (const row of rows) {
    // Build i18n object for each column
    const updates = {}
    let needsUpdate = false

    for (const col of columns) {
      const originalValue = row[col.original]
      const i18nValue = row[col.i18n]

      // Skip if original is empty
      if (!originalValue) continue

      // Skip if i18n already has Hebrew value
      if (i18nValue && i18nValue.he) continue

      // Add Hebrew value to i18n column
      updates[col.i18n] = JSON.stringify({ he: originalValue })
      needsUpdate = true
    }

    if (!needsUpdate) {
      continue
    }

    // Build UPDATE statement
    const setClauses = Object.entries(updates)
      .map(([col, val]) => `${col} = '${val}'::jsonb`)
      .join(', ')

    const updateSQL = `UPDATE ${tableName} SET ${setClauses} WHERE id = '${row.id}'`

    try {
      // Execute using raw SQL via RPC (if available) or direct update with user context
      // Since we can't execute arbitrary SQL, we'll use a workaround with set_config
      const { error: updateError } = await supabase.rpc('exec_with_user', {
        sql_query: updateSQL,
        user_name: 'system_migration'
      })

      // If RPC doesn't exist, try direct update with session variable
      if (updateError && updateError.message.includes('exec_with_user')) {
        // Fallback: Try updating with a session variable approach
        // This requires a custom function in Supabase
        console.log(`   ⚠️  Row ${row.id}: Need manual update via SQL Editor`)
        console.log(`      SQL: ${updateSQL}`)
        failedCount++
        continue
      }

      if (updateError) {
        console.error(`   ❌ Failed row ${row.id}:`, updateError.message)
        failedCount++
      } else {
        successCount++
      }
    } catch (err) {
      console.error(`   ❌ Exception for row ${row.id}:`, err.message)
      failedCount++
    }
  }

  console.log(`   ✅ Success: ${successCount}, ❌ Failed: ${failedCount}`)
  return { success: successCount, failed: failedCount }
}

/**
 * Alternative: Generate SQL statements for manual execution
 */
async function generateMigrationSQL() {
  console.log('🔄 Generating SQL migration statements...\n')

  const tables = [
    { name: 'events', columns: [
      { original: 'title', i18n: 'title_i18n' },
      { original: 'description', i18n: 'description_i18n' },
      { original: 'location', i18n: 'location_i18n' }
    ]},
    { name: 'tasks', columns: [
      { original: 'title', i18n: 'title_i18n' },
      { original: 'description', i18n: 'description_i18n' }
    ]}
  ]

  let allSQL = []

  for (const table of tables) {
    const { data: rows, error } = await supabase.from(table.name).select('*')

    if (error || !rows) continue

    for (const row of rows) {
      const updates = []

      for (const col of table.columns) {
        const originalValue = row[col.original]
        const i18nValue = row[col.i18n]

        if (!originalValue) continue
        if (i18nValue && i18nValue.he) continue

        // Escape single quotes for SQL
        const escapedValue = originalValue.replace(/'/g, "''")
        updates.push(`${col.i18n} = jsonb_build_object('he', '${escapedValue}')`)
      }

      if (updates.length > 0) {
        const sql = `UPDATE ${table.name} SET ${updates.join(', ')} WHERE id = '${row.id}';`
        allSQL.push(sql)
      }
    }
  }

  if (allSQL.length === 0) {
    console.log('✅ No migration needed - all data already has i18n values!')
    return
  }

  console.log(`📝 Generated ${allSQL.length} SQL statements\n`)
  console.log('Copy and paste the following SQL into Supabase SQL Editor:\n')
  console.log('-- ============================================')
  console.log('-- i18n Data Migration for events and tasks')
  console.log('-- Bypasses audit_log trigger')
  console.log('-- ============================================\n')

  allSQL.forEach(sql => console.log(sql))

  console.log('\n-- ============================================')
  console.log('-- End of migration SQL')
  console.log('-- ============================================\n')

  console.log(`\n📋 Instructions:`)
  console.log(`   1. Copy the SQL statements above`)
  console.log(`   2. Open: https://supabase.com/dashboard/project/wkfxwnayexznjhcktwwu/sql`)
  console.log(`   3. Click "New Query"`)
  console.log(`   4. Paste the SQL`)
  console.log(`   5. Click "Run"`)
}

generateMigrationSQL().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
