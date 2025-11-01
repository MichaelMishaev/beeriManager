import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()

    // Add attendees column to protocols table
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE protocols
        ADD COLUMN IF NOT EXISTS attendees jsonb DEFAULT '[]'::jsonb;
      `
    })

    if (alterError) {
      console.error('Error adding column:', alterError)
      // Try direct query instead
      const { error } = await supabase
        .from('protocols')
        .select('id')
        .limit(1)

      if (error) {
        return NextResponse.json({
          error: 'Database connection error',
          details: error.message
        }, { status: 500 })
      }

      // Column might already exist, return success
      return NextResponse.json({
        success: true,
        message: 'Column may already exist or manual migration needed',
        sql: `
ALTER TABLE protocols
ADD COLUMN IF NOT EXISTS attendees jsonb DEFAULT '[]'::jsonb;

-- Run this SQL in your Supabase SQL Editor
        `
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Attendees column added successfully'
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      sql: `
-- Run this SQL manually in Supabase SQL Editor:

ALTER TABLE protocols
ADD COLUMN IF NOT EXISTS attendees jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN protocols.attendees IS 'List of meeting attendees (names)';

CREATE INDEX IF NOT EXISTS idx_protocols_attendees ON protocols USING gin(attendees);
      `
    }, { status: 500 })
  }
}
