import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This endpoint runs the prom tables migration
// Only use in development or with proper authentication
export async function POST(_req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing Supabase credentials' 
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'public' },
      auth: { persistSession: false }
    })

    // Run each table creation separately
    const results: string[] = []

    // 1. Create prom_events table
    const { error: error1 } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.prom_events (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          title_ru TEXT,
          description TEXT,
          description_ru TEXT,
          event_date DATE,
          event_time TIME,
          venue_name TEXT,
          venue_address TEXT,
          total_budget DECIMAL(10,2) DEFAULT 0,
          student_count INTEGER DEFAULT 0,
          status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'voting', 'confirmed', 'completed', 'cancelled')),
          voting_enabled BOOLEAN DEFAULT false,
          voting_start_date TIMESTAMPTZ,
          voting_end_date TIMESTAMPTZ,
          selected_quote_id UUID,
          created_by TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    })
    
    if (error1) {
      // Try direct SQL via REST
      results.push(`prom_events: ${error1.message || 'RPC not available, trying alternative...'}`)
    } else {
      results.push('prom_events: Created')
    }

    // Since RPC might not be available, let's test if tables exist by trying to select from them
    const { error: testError } = await supabase.from('prom_events').select('id').limit(1)
    
    if (testError && testError.code === '42P01') {
      // Table doesn't exist - need to run migration manually
      return NextResponse.json({
        success: false,
        error: 'Tables do not exist yet. Please run the migration SQL manually in Supabase Studio.',
        instructions: [
          '1. Go to https://supabase.com/dashboard',
          '2. Select your project',
          '3. Go to SQL Editor',
          '4. Copy the content of supabase/migrations/20251125000000_create_prom_tables.sql',
          '5. Paste and run it'
        ],
        migration_file: '/supabase/migrations/20251125000000_create_prom_tables.sql'
      }, { status: 400 })
    }

    if (!testError) {
      return NextResponse.json({
        success: true,
        message: 'Tables already exist! You can start using the prom planning feature.',
        results
      })
    }

    return NextResponse.json({
      success: false,
      error: testError?.message || 'Unknown error',
      results
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Migration failed' 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to run the prom tables migration',
    warning: 'This will create database tables for the prom planning feature'
  })
}

