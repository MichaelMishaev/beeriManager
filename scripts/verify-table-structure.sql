-- Verify the anonymous_feedback table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'anonymous_feedback'
ORDER BY ordinal_position;

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name = 'anonymous_feedback'
) as table_exists;

-- Try direct insert (bypasses PostgREST cache)
INSERT INTO public.anonymous_feedback (category, subject, message)
VALUES ('complaint', 'Direct SQL Test', 'This was inserted directly via SQL')
RETURNING *;

-- Query all records
SELECT * FROM public.anonymous_feedback ORDER BY created_at DESC LIMIT 5;

-- Force PostgREST schema reload
NOTIFY pgrst, 'reload schema';
