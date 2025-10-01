# Database Migration Strategy

## Environment Setup

### Development Database
- **Provider**: Supabase (separate project) or Local PostgreSQL
- **Purpose**: Testing new features, breaking changes OK
- **URL**: Set in `.env.local`

### Production Database
- **Provider**: Supabase (main project)
- **Purpose**: Live data, requires careful migrations
- **URL**: Set in `.env.production`

## Migration File Structure

```
scripts/migrations/
├── 001_initial_schema.sql
├── 002_add_committees.sql
├── 003_add_feedback.sql
├── 004_add_vendors.sql
└── README.md
```

### Naming Convention
```
{version}_{description}.sql

Examples:
001_initial_schema.sql
002_add_vendors_table.sql
003_alter_events_add_photos.sql
```

## Migration Workflow

### 1. Development Phase
```bash
# Create new migration file
touch scripts/migrations/005_add_new_feature.sql

# Write SQL (with UP and DOWN sections)
# Test locally
npm run db:migrate:dev
```

### 2. Testing Phase
```bash
# Run on development database
npm run db:migrate:dev

# Test the feature
# If bugs found, rollback
npm run db:rollback:dev

# Fix and retry
```

### 3. Production Deployment
```bash
# Review migration carefully
# Run on production (with backup!)
npm run db:migrate:prod

# If issues, rollback
npm run db:rollback:prod
```

## Migration File Template

```sql
-- ================================================
-- Migration: 005_add_feature_name
-- Description: What this migration does
-- Author: Your Name
-- Date: 2025-10-01
-- ================================================

-- ==================== UP ====================
-- Apply changes

CREATE TABLE IF NOT EXISTS your_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- columns...
);

-- ==================== DOWN ====================
-- Rollback changes (commented by default)

/*
DROP TABLE IF EXISTS your_table;
*/
```

## Safety Checklist

Before running production migrations:

- [ ] Migration tested in development
- [ ] Database backup created
- [ ] Migration is idempotent (safe to run multiple times)
- [ ] Rollback script prepared
- [ ] Team notified of downtime (if needed)
- [ ] Migration file committed to git

## Common Patterns

### 1. Adding a Column (Safe)
```sql
ALTER TABLE events
ADD COLUMN IF NOT EXISTS photos_url TEXT;
```

### 2. Dropping a Column (Dangerous!)
```sql
-- DON'T: DROP COLUMN immediately
-- DO: Two-step migration

-- Step 1: Stop using column in code (deploy)
-- Step 2: Drop column after 1 week
ALTER TABLE events DROP COLUMN old_field;
```

### 3. Renaming a Column (Tricky)
```sql
-- DON'T: RENAME COLUMN
-- DO: Create new, copy data, deprecate old

-- Migration 1: Add new column
ALTER TABLE events ADD COLUMN new_name TEXT;
UPDATE events SET new_name = old_name;

-- Migration 2 (later): Drop old column
-- ALTER TABLE events DROP COLUMN old_name;
```

### 4. Adding Foreign Key (Be Careful)
```sql
-- Check data validity first!
ALTER TABLE vendor_transactions
ADD CONSTRAINT fk_vendor
FOREIGN KEY (vendor_id)
REFERENCES vendors(id)
ON DELETE CASCADE;
```

## Automated Migration Runner

Create `scripts/run-migration.js`:
```javascript
// Read migration files in order
// Track which migrations ran
// Apply only new ones
```

## Environment Variables

```bash
# .env.local (development)
DATABASE_URL=postgresql://localhost:5432/beeri_dev

# .env.production (production)
DATABASE_URL=your_supabase_production_url
```

## Rollback Strategy

Each migration should have:
1. **UP**: Apply changes
2. **DOWN**: Revert changes

Example:
```sql
-- UP
CREATE TABLE vendors (...);

-- DOWN (commented)
/*
DROP TABLE vendors;
*/
```

To rollback:
1. Uncomment DOWN section
2. Run manually
3. Or use automated rollback script

## Tools

### Option 1: Manual (Current)
- SQL files in `scripts/migrations/`
- Run manually in Supabase SQL Editor
- Track versions manually

### Option 2: Prisma (Advanced)
```bash
npm install prisma
npx prisma migrate dev
npx prisma migrate deploy
```

### Option 3: Supabase CLI (Recommended)
```bash
# Install
npm install -g supabase

# Initialize
supabase init

# Create migration
supabase migration new add_vendors

# Apply locally
supabase db push

# Deploy to production
supabase db push --db-url YOUR_PROD_URL
```

## Troubleshooting

### Migration Failed Mid-Way
1. Check error in logs
2. Rollback manually
3. Fix migration file
4. Retry

### Production Data Lost
1. **ALWAYS** backup before migration
2. Restore from Supabase backup
3. Point-in-time recovery if available

### Version Mismatch
Track applied migrations in a table:
```sql
CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT NOW()
);
```

## Best Practices

1. **Always Test Locally First**
2. **Backup Before Production Migration**
3. **Make Migrations Idempotent** (IF NOT EXISTS)
4. **Keep Migrations Small** (one change per file)
5. **Document Why** (not just what)
6. **Version Control** (commit before deploy)
7. **Monitor After Deploy** (watch logs)

## Current Setup (To Do)

- [ ] Create development Supabase project
- [ ] Set up migration numbering system
- [ ] Create migration tracking table
- [ ] Write migration runner script
- [ ] Document current schema state
- [ ] Create backup automation
