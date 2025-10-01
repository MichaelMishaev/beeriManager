-- Check what columns actually exist in anonymous_feedback table
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'anonymous_feedback'
ORDER BY ordinal_position;
