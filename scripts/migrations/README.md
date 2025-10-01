# Database Migrations

## Quick Start

1. **Create new migration:**
   ```bash
   touch scripts/migrations/XXX_description.sql
   ```

2. **Write migration using template below**

3. **Test in development database**

4. **Commit to git**

5. **Apply to production carefully**

## Migration Template

```sql
-- ================================================
-- Migration: XXX_feature_name
-- Description: Brief description of what this does
-- Date: YYYY-MM-DD
-- ================================================

-- ==================== UP ====================

CREATE TABLE IF NOT EXISTS your_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== DOWN ====================
-- (Keep commented, uncomment only for rollback)

/*
DROP TABLE IF EXISTS your_table;
*/
```

## Current Migrations

| Version | File | Description | Status |
|---------|------|-------------|--------|
| 001 | initial_schema.sql | Base tables (events, tasks, etc.) | ✅ Applied |
| 002 | add_committees.sql | Committees table | ✅ Applied |
| 003 | add_feedback.sql | Anonymous feedback system | ✅ Applied |
| 004 | add_vendors.sql | Vendors management | 🔄 Pending |

## Rules

1. **Never edit applied migrations** - Create new one instead
2. **Always use IF NOT EXISTS** - Make idempotent
3. **Test before production** - No exceptions
4. **Backup first** - Always
5. **Small changes** - One feature per migration
