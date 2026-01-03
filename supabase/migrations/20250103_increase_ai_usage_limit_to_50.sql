-- Migration: Increase AI Usage Limit from 20 to 50
-- Date: 2025-01-03
-- Purpose: Increase daily AI assistant usage limit from 20 to 50 requests

-- Update increment_ai_usage function with new limit
CREATE OR REPLACE FUNCTION increment_ai_usage()
RETURNS TABLE(current_count INTEGER, limit_reached BOOLEAN) AS $$
DECLARE
  today DATE := CURRENT_DATE;
  current_count INTEGER;
  daily_limit INTEGER := 50;
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

-- Update get_ai_usage function with new limit
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

  -- If no record exists for today, return 0
  IF count IS NULL THEN
    count := 0;
  END IF;

  RETURN QUERY SELECT count, limit_val, GREATEST(0, limit_val - count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update table comment
COMMENT ON TABLE ai_usage_logs IS 'Tracks daily AI assistant usage for rate limiting (50 requests/day max)';
