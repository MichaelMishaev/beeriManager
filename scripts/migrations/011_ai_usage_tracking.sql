-- Migration: AI Usage Tracking
-- Purpose: Track daily AI assistant usage to enforce rate limits
-- Daily limit: 20 requests per day
-- Character limit: 400 characters per message

-- Create AI usage tracking table
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  request_count INTEGER NOT NULL DEFAULT 0,
  last_request_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on date to ensure one row per day
CREATE UNIQUE INDEX IF NOT EXISTS ai_usage_logs_date_idx ON ai_usage_logs(date);

-- Enable RLS
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read (to check limits)
CREATE POLICY "Anyone can read AI usage"
  ON ai_usage_logs
  FOR SELECT
  USING (true);

-- Policy: Service role can insert/update (API will handle this)
CREATE POLICY "Service role can manage AI usage"
  ON ai_usage_logs
  FOR ALL
  USING (true);

-- Function to increment daily usage count
CREATE OR REPLACE FUNCTION increment_ai_usage()
RETURNS TABLE(current_count INTEGER, limit_reached BOOLEAN) AS $$
DECLARE
  today DATE := CURRENT_DATE;
  current_count INTEGER;
  daily_limit INTEGER := 20;
BEGIN
  -- Insert or update today's record
  INSERT INTO ai_usage_logs (date, request_count, last_request_at)
  VALUES (today, 1, NOW())
  ON CONFLICT (date)
  DO UPDATE SET
    request_count = ai_usage_logs.request_count + 1,
    last_request_at = NOW(),
    updated_at = NOW()
  RETURNING ai_usage_logs.request_count INTO current_count;

  -- Return current count and whether limit is reached
  RETURN QUERY SELECT current_count, (current_count > daily_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current usage
CREATE OR REPLACE FUNCTION get_ai_usage()
RETURNS TABLE(current_count INTEGER, daily_limit INTEGER, remaining INTEGER) AS $$
DECLARE
  today DATE := CURRENT_DATE;
  count INTEGER;
  limit_val INTEGER := 20;
BEGIN
  SELECT request_count INTO count
  FROM ai_usage_logs
  WHERE date = today;

  -- If no record exists for today, return 0
  IF count IS NULL THEN
    count := 0;
  END IF;

  RETURN QUERY SELECT count, limit_val, GREATEST(0, limit_val - count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert initial record for today (optional)
INSERT INTO ai_usage_logs (date, request_count)
VALUES (CURRENT_DATE, 0)
ON CONFLICT (date) DO NOTHING;

-- Add comment
COMMENT ON TABLE ai_usage_logs IS 'Tracks daily AI assistant usage for rate limiting (20 requests/day max)';
