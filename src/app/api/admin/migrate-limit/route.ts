import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createClient()

    // Execute SQL to update increment_ai_usage function
    const sql1 = `
CREATE OR REPLACE FUNCTION increment_ai_usage()
RETURNS TABLE(current_count INTEGER, limit_reached BOOLEAN) AS $$
DECLARE
  today DATE := CURRENT_DATE;
  current_count INTEGER;
  daily_limit INTEGER := 50;
BEGIN
  INSERT INTO ai_usage_logs (date, request_count, last_request_at)
  VALUES (today, 1, NOW())
  ON CONFLICT (date)
  DO UPDATE SET
    request_count = ai_usage_logs.request_count + 1,
    last_request_at = NOW(),
    updated_at = NOW()
  RETURNING ai_usage_logs.request_count INTO current_count;
  RETURN QUERY SELECT current_count, (current_count > daily_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    const { error: error1 } = await supabase.rpc('exec', { query: sql1 })

    if (error1) {
      console.error('Error updating increment_ai_usage:', error1)
      return NextResponse.json({
        success: false,
        error: 'Failed to update increment_ai_usage function',
        details: error1.message
      }, { status: 500 })
    }

    // Execute SQL to update get_ai_usage function
    const sql2 = `
CREATE OR REPLACE FUNCTION get_ai_usage()
RETURNS TABLE(current_count INTEGER, daily_limit INTEGER, remaining INTEGER) AS $$
DECLARE
  today DATE := CURRENT_DATE;
  count INTEGER;
  limit_val INTEGER := 50;
BEGIN
  SELECT request_count INTO count
  FROM ai_usage_logs
  WHERE date = today;
  IF count IS NULL THEN
    count := 0;
  END IF;
  RETURN QUERY SELECT count, limit_val, GREATEST(0, limit_val - count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    const { error: error2 } = await supabase.rpc('exec', { query: sql2 })

    if (error2) {
      console.error('Error updating get_ai_usage:', error2)
      return NextResponse.json({
        success: false,
        error: 'Failed to update get_ai_usage function',
        details: error2.message
      }, { status: 500 })
    }

    // Verify by calling get_ai_usage
    const { data: stats, error: verifyError } = await supabase.rpc('get_ai_usage')

    if (verifyError) {
      console.error('Verification error:', verifyError)
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully!',
      newLimit: 50,
      currentStats: stats?.[0] || null
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
