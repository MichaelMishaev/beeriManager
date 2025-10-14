# Schema-Only Migration Guide

## Overview

Schema-only migration transfers **table structures, indexes, functions, triggers** WITHOUT data.

## When to Use Schema-Only Migration

- ✅ Setting up new environment
- ✅ Deploying to production (first time)
- ✅ Syncing development schema to production
- ✅ Creating staging environment
- ❌ NOT for updating existing production (use incremental migrations instead)

## Commands

### 1. Export Schema from Local DB

```bash
npm run db:export-schema
```

This creates: `scripts/schema/full_schema.sql`

### 2. Import Schema to Database

```bash
npm run db:import-schema
```

Options:
- Import to local database
- Show SQL for manual copy to Supabase

### 3. Compare Schemas

```bash
npm run db:compare-schemas
```

Shows differences between local and production schemas.

## Manual Export (Advanced)

### Export Only Tables (No Functions/Triggers)

```bash
docker exec beeri_dev_db pg_dump \
    -U beeri_dev \
    -d beeri_manager_dev \
    --schema-only \
    --no-owner \
    --table=vendors \
    --table=vendor_transactions \
    --table=vendor_reviews \
    > scripts/schema/vendors_schema.sql
```

### Export Only Functions

```bash
docker exec beeri_dev_db pg_dump \
    -U beeri_dev \
    -d beeri_manager_dev \
    --schema-only \
    --no-owner \
    --no-tablespaces \
    | grep -A 999 "CREATE FUNCTION" \
    > scripts/schema/functions_only.sql
```

### Export Specific Table

```bash
docker exec beeri_dev_db pg_dump \
    -U beeri_dev \
    -d beeri_manager_dev \
    --schema-only \
    --no-owner \
    --table=vendors \
    > scripts/schema/vendors_table.sql
```

## Workflow Example

### Scenario: Deploy Vendors Feature to Production

1. **Develop locally:**
   ```bash
   npm run db:start
   npm run db:migrate  # Run 004_add_vendors.sql
   ```

2. **Test feature:**
   ```bash
   npm run dev
   # Test vendors CRUD operations
   ```

3. **Export schema:**
   ```bash
   npm run db:export-schema
   ```

4. **Review the SQL:**
   ```bash
   cat scripts/schema/full_schema.sql
   ```

5. **Apply to Production:**
   - Open Supabase SQL Editor
   - Copy content from `scripts/schema/full_schema.sql`
   - Paste and run
   - OR just run the specific migration: `004_add_vendors.sql`

## Best Practices

### ✅ DO:
- Review exported schema before applying
- Test on staging first
- Backup production before schema changes
- Use incremental migrations for updates
- Keep schema files in git

### ❌ DON'T:
- Don't export schema with `--data` flag to production
- Don't run full schema export on existing production (will drop tables!)
- Don't skip testing

## Incremental vs Full Schema

### Full Schema Export
```sql
DROP TABLE IF EXISTS vendors CASCADE;
CREATE TABLE vendors (...);
-- Drops and recreates everything
```
**Use for:** Fresh setup

### Incremental Migration
```sql
CREATE TABLE IF NOT EXISTS vendors (...);
-- Only adds if missing
```
**Use for:** Production updates

## Schema Export Options

### Clean Schema (Drops Existing)
```bash
--clean --if-exists
```
Generates `DROP TABLE IF EXISTS` before `CREATE TABLE`

**⚠️ DANGEROUS for production with data!**

### Safe Schema (No Drops)
```bash
# Remove --clean flag
docker exec beeri_dev_db pg_dump \
    -U beeri_dev \
    -d beeri_manager_dev \
    --schema-only \
    --no-owner \
    > scripts/schema/safe_schema.sql
```

## Compare Schemas Tool

1. Export local schema
2. Download production schema from Supabase
3. Run comparison:
   ```bash
   npm run db:compare-schemas
   ```
4. Review differences in `scripts/schema/schema_diff.txt`

## Tips

### Extract Only New Tables

If you only want vendors tables:

```bash
docker exec beeri_dev_db pg_dump \
    -U beeri_dev \
    -d beeri_manager_dev \
    --schema-only \
    --no-owner \
    -t vendors \
    -t vendor_transactions \
    -t vendor_reviews \
    > scripts/schema/vendors_only.sql
```

### Generate CREATE IF NOT EXISTS

PostgreSQL's pg_dump doesn't support `IF NOT EXISTS` directly.
Use migration files instead (they have this flag).

### View Current Schema

```bash
npm run db:connect

# Then in psql:
\dt                    # List tables
\d vendors             # Describe vendors table
\df                    # List functions
\di                    # List indexes
```

## Troubleshooting

### Schema Export Empty

**Problem:** No tables found
**Solution:** Check database has tables:
```bash
npm run db:connect
\dt
```

### Import Fails with "Already Exists"

**Problem:** Table already exists
**Solution:** Either:
1. Use `--clean` flag to drop first (CAREFUL!)
2. Drop tables manually
3. Use incremental migration instead

### Permission Errors

**Problem:** `permission denied`
**Solution:** Check Docker container is running:
```bash
docker ps | grep beeri_dev_db
```
