-- ================================================
-- Fix Script: Remove incorrect Simchat Torah entry for Oct 15, 2025
-- Issue: Students return on Oct 15 (school OPEN), but DB has Simchat Torah marked as closed
-- Date: 2025-10-02
-- ================================================

-- Delete the incorrect Simchat Torah entry for October 15, 2025
-- According to the school calendar: "התלמודים יתחדשו ביום רביעי כ״ג בתשרי 15 באוקטובר"
-- (Students resume on Wednesday, October 15)
DELETE FROM public.holidays
WHERE hebrew_name = 'שמחת תורה'
  AND start_date = '2025-10-15'
  AND is_school_closed = true;

-- Verify deletion
SELECT
  hebrew_name,
  start_date,
  end_date,
  is_school_closed
FROM public.holidays
WHERE start_date BETWEEN '2025-10-01' AND '2025-10-20'
ORDER BY start_date;
