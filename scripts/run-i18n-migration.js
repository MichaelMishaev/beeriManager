require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'OK' : 'MISSING')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'OK' : 'MISSING')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🔄 Running i18n database migration...\n')

  // Read the migration SQL file
  const migrationPath = path.join(__dirname, 'migrations', '006_add_i18n_support.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

  // Split into individual statements (simple split on semicolon)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && !s.includes('DOWN (Rollback)') && !s.includes('VERIFICATION'))

  console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i].trim()
    if (!statement) continue

    // Get a preview of the statement
    const preview = statement.split('\n')[0].substring(0, 80) + (statement.length > 80 ? '...' : '')

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' })

      // If rpc doesn't exist, try direct execution
      if (error && error.message.includes('exec_sql')) {
        // Supabase doesn't allow arbitrary SQL via RPC by default
        // We need to use the REST API or pgAdmin
        console.log(`⚠️  Cannot execute via Supabase client: ${preview}`)
        console.log(`   Please run manually via Supabase SQL Editor or psql`)
        continue
      }

      if (error) {
        console.error(`❌ Error [${i + 1}/${statements.length}]:`, preview)
        console.error(`   ${error.message}`)
        errorCount++
      } else {
        console.log(`✅ Success [${i + 1}/${statements.length}]:`, preview)
        successCount++
      }
    } catch (err) {
      console.error(`❌ Exception [${i + 1}/${statements.length}]:`, preview)
      console.error(`   ${err.message}`)
      errorCount++
    }
  }

  console.log(`\n📊 Migration Summary:`)
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ❌ Failed: ${errorCount}`)

  if (errorCount > 0) {
    console.log(`\n⚠️  Some statements failed. You may need to run them manually via Supabase SQL Editor:`)
    console.log(`   1. Go to https://supabase.com/dashboard/project/${supabaseUrl.split('//')[1].split('.')[0]}/sql`)
    console.log(`   2. Paste the contents of: scripts/migrations/006_add_i18n_support.sql`)
    console.log(`   3. Click "Run"`)
  }
}

// Alternative: Provide instructions for manual migration
async function checkTablesExist() {
  console.log('🔍 Checking database tables...\n')

  const tables = ['events', 'tasks', 'issues', 'protocols', 'holidays', 'committees', 'anonymous_feedback']

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.log(`❌ Table '${table}': ${error.message}`)
    } else {
      console.log(`✅ Table '${table}': exists (${data?.length || 0} row sample)`)
    }
  }

  console.log(`\n📋 To run the migration, use one of these methods:`)
  console.log(`\n1️⃣  Supabase SQL Editor (Recommended):`)
  console.log(`   - Go to: https://supabase.com/dashboard/project/${supabaseUrl.split('//')[1].split('.')[0]}/sql`)
  console.log(`   - Create new query`)
  console.log(`   - Paste contents of: scripts/migrations/006_add_i18n_support.sql`)
  console.log(`   - Click "Run"`)

  console.log(`\n2️⃣  Using psql (if you have connection string):`)
  console.log(`   psql "your-connection-string" < scripts/migrations/006_add_i18n_support.sql`)

  console.log(`\n3️⃣  Using Supabase CLI:`)
  console.log(`   supabase db reset --linked`)
}

checkTablesExist().catch(console.error)
