#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const tablesToCheck = [
  'events', 'tasks', 'responsibilities', 'issues', 'protocols',
  'committees', 'anonymous_feedback', 'vendors', 'tags', 'task_tags',
  'prom_quotes', 'prom_votes', 'tickets', 'app_settings', 'push_subscriptions',
  'parent_skills', 'contacts', 'school_years', 'user_sessions', 'representatives',
  'committee_members', 'forbidden_items', 'parent_skill_responses'
]

async function checkTables() {
  console.log('🔍 Checking ALL possible tables in production database:\n')
  const existing = []
  const missing = []

  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select('id').limit(0)
    if (!error) {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
      console.log(`✓ ${table.padEnd(30)} - EXISTS (${count || 0} records)`)
      existing.push({ table, count: count || 0 })
    } else {
      console.log(`✗ ${table.padEnd(30)} - DOES NOT EXIST`)
      missing.push(table)
    }
  }

  console.log(`\n══════════════════════════════════════════════`)
  console.log(`SUMMARY:`)
  console.log(`✓ Existing tables: ${existing.length}`)
  console.log(`✗ Missing tables: ${missing.length}`)
  console.log(`══════════════════════════════════════════════\n`)

  console.log('✅ Tables that EXIST in production:')
  existing.forEach(t => console.log(`   - ${t.table} (${t.count} records)`))

  console.log('\n❌ Tables that DO NOT EXIST:')
  missing.forEach(t => console.log(`   - ${t}`))

  return { existing, missing }
}

checkTables().catch(console.error)
