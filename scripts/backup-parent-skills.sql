-- =====================================================
-- BACKUP: parent_skill_responses table
-- Created: 2025-12-30
-- Purpose: Full backup before schema changes
-- =====================================================

-- Export all data from parent_skill_responses
-- Run this in Supabase SQL Editor to create a backup

-- Step 1: Create backup table
CREATE TABLE IF NOT EXISTS parent_skill_responses_backup_20251230 AS
SELECT * FROM parent_skill_responses;

-- Step 2: Verify backup
SELECT
  'Original table' as source,
  count(*) as row_count
FROM parent_skill_responses
UNION ALL
SELECT
  'Backup table' as source,
  count(*) as row_count
FROM parent_skill_responses_backup_20251230;

-- Step 3: Add comment
COMMENT ON TABLE parent_skill_responses_backup_20251230 IS 'Backup created on 2025-12-30 before soft-delete feature';

-- =====================================================
-- To restore from this backup later:
-- =====================================================
-- TRUNCATE parent_skill_responses;
-- INSERT INTO parent_skill_responses SELECT * FROM parent_skill_responses_backup_20251230;
-- =====================================================
