-- Update all holiday dates from 2024-2025 to 2025-2026
-- This adds one year to all dates

UPDATE public.holidays
SET
  start_date = start_date + INTERVAL '1 year',
  end_date = end_date + INTERVAL '1 year',
  updated_at = CURRENT_TIMESTAMP
WHERE
  EXTRACT(YEAR FROM start_date) IN (2024, 2025);

-- Verify the update
SELECT id, hebrew_name, start_date, end_date
FROM public.holidays
ORDER BY start_date;
