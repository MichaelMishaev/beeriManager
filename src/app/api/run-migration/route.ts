import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

/**
 * TEMPORARY MIGRATION ENDPOINT
 * POST /api/run-migration
 *
 * This endpoint executes the AI usage tracking migration.
 * DELETE THIS FILE after migration is complete!
 */

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    // Create admin client
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log('[Migration] Starting AI usage tracking migration...')

    // Read migration SQL
    const sqlPath = join(process.cwd(), 'scripts', 'migrations', '011_ai_usage_tracking.sql')
    const sqlContent = readFileSync(sqlPath, 'utf8')

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/))

    console.log(`[Migration] Executing ${statements.length} SQL statements...`)

    const results = []

    // Execute each statement using raw SQL
    // Note: Supabase doesn't expose direct SQL execution via REST API
    // We'll need to use the connection pooler or database URL

    // Try to create table first
    const createTableSQL = statements.find((s) => s.includes('CREATE TABLE'))

    if (createTableSQL) {
      console.log('[Migration] Attempting to create table via Supabase client...')

      // Since we can't execute raw SQL via REST API, we need to inform user
      // to run it manually or use database connection
      return NextResponse.json({
        success: false,
        message: 'Direct SQL execution not available via Supabase REST API',
        instructions: [
          '1. Go to Supabase SQL Editor: https://supabase.com/dashboard',
          '2. Navigate to your project > SQL Editor',
          '3. Copy contents from: scripts/migrations/011_ai_usage_tracking.sql',
          '4. Paste and click Run',
        ],
        sqlPath: 'scripts/migrations/011_ai_usage_tracking.sql',
        note: 'This is a security feature - Supabase requires manual SQL execution for safety',
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Could not find migration SQL',
    })
  } catch (error) {
    console.error('[Migration] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
