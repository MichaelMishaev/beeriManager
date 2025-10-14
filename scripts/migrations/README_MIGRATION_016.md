# Migration 016: Create Tags System

## Overview
Adds a comprehensive multi-tag categorization system for tasks, allowing flexible organization and filtering.

## What This Migration Does

### 1. Creates `tags` Table
- Stores tag definitions (name, Hebrew name, emoji, color)
- Tracks usage count (denormalized for performance)
- Supports system tags (cannot be deleted)
- Includes display ordering

### 2. Creates `task_tags` Junction Table
- Many-to-many relationship between tasks and tags
- Each task can have multiple tags
- Each tag can be on multiple tasks
- Prevents duplicate tag assignments

### 3. Automatic Task Counting
- Trigger maintains accurate `task_count` on tags
- Updates automatically when tags are added/removed
- Ensures data consistency

### 4. Helper Functions
- `get_task_tags(task_id)` - Get all tags for a task
- `get_tasks_by_tag(tag_id)` - Get all tasks with a specific tag
- `get_tasks_with_all_tags(tag_ids[])` - Get tasks with ALL specified tags (AND logic)

### 5. Initial System Tags (Hebrew)
Pre-seeded with 12 essential tags:
- 🔧 תחזוקה (Maintenance)
- 🎉 אירועים (Events)
- 💬 תקשורת (Communication)
- 💰 תקציב (Budget)
- 📚 חינוך (Education)
- ⚖️ משפטי (Legal)
- 🛒 רכישות (Procurement)
- 🏃 ספורט (Sports)
- 🎨 תרבות (Culture)
- ⚡ דחוף (Urgent)
- 🔄 חוזר (Recurring)
- ❓ לא ברור (Unclear)

## How to Run

### Using Supabase Dashboard
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `016_create_tags_system.sql`
3. Execute the script
4. Verify tables created:
   ```sql
   SELECT * FROM tags ORDER BY display_order;
   SELECT * FROM task_tags LIMIT 10;
   ```

### Using Supabase CLI
```bash
supabase db reset
# Or apply specific migration
supabase migration up 016_create_tags_system
```

### Using psql
```bash
psql -h <db-host> -U <db-user> -d <db-name> -f scripts/migrations/016_create_tags_system.sql
```

## Verification

After running the migration, verify:

```sql
-- Check tags table
SELECT name_he, emoji, color, task_count
FROM tags
WHERE is_active = TRUE
ORDER BY display_order;

-- Should return 12 system tags

-- Check task_tags table
SELECT COUNT(*) FROM task_tags;
-- Should return 0 (no tasks tagged yet)

-- Test helper function
SELECT * FROM get_task_tags('00000000-0000-0000-0000-000000000000'::uuid);
-- Should return empty result
```

## Usage Examples

### Tag a Task
```sql
-- Add "תחזוקה" and "דחוף" tags to a task
INSERT INTO task_tags (task_id, tag_id)
VALUES
  ('task-uuid', (SELECT id FROM tags WHERE name = 'maintenance')),
  ('task-uuid', (SELECT id FROM tags WHERE name = 'urgent'));
```

### Query Tasks by Tag
```sql
-- Get all maintenance tasks
SELECT * FROM get_tasks_by_tag(
  (SELECT id FROM tags WHERE name = 'maintenance')
);

-- Get tasks with BOTH maintenance AND urgent tags
SELECT * FROM get_tasks_with_all_tags(
  ARRAY[
    (SELECT id FROM tags WHERE name = 'maintenance'),
    (SELECT id FROM tags WHERE name = 'urgent')
  ]::uuid[]
);
```

### Add Custom Tag
```sql
INSERT INTO tags (name, name_he, emoji, color, display_order)
VALUES ('custom', 'קטגוריה מותאמת', '🌟', '#FF69B4', 100);
```

## Database Schema Changes

### New Tables
1. **tags** - Tag definitions
2. **task_tags** - Task-Tag relationships

### New Functions
1. `update_tag_task_count()` - Trigger function
2. `get_task_tags(uuid)` - Get tags for task
3. `get_tasks_by_tag(uuid)` - Get tasks by tag
4. `get_tasks_with_all_tags(uuid[])` - Multi-tag AND filter

### New Indexes
- `idx_tags_name` - Fast tag lookup by name
- `idx_tags_display_order` - Sorted tag display
- `idx_tags_task_count` - Popular tags query
- `idx_task_tags_task` - Tasks → Tags lookup
- `idx_task_tags_tag` - Tags → Tasks lookup

## Impact Assessment

### Performance
- ✅ Denormalized `task_count` for fast popular tags query
- ✅ Proper indexes on junction table
- ✅ Helper functions use indexes efficiently
- ⚠️ Multi-tag queries may be slower with 100+ active tags

### Storage
- Minimal: ~1KB per tag, ~200 bytes per task-tag relationship
- Expected: ~50 tags × 1KB + (1000 tasks × 3 tags × 200 bytes) = ~650KB

### Backward Compatibility
- ✅ Non-breaking: Adds new tables, doesn't modify existing
- ✅ Tasks without tags work normally
- ✅ Can be rolled back cleanly

## Rollback Procedure

If needed, rollback with:

```sql
BEGIN;
DROP TRIGGER IF EXISTS trigger_update_tag_task_count ON task_tags;
DROP FUNCTION IF EXISTS update_tag_task_count();
DROP FUNCTION IF EXISTS get_task_tags(UUID);
DROP FUNCTION IF EXISTS get_tasks_by_tag(UUID);
DROP FUNCTION IF EXISTS get_tasks_with_all_tags(UUID[]);
DROP TABLE IF EXISTS task_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
COMMIT;
```

## Next Steps

After migration:
1. Update TypeScript types to include tags
2. Create API routes for tag management
3. Build admin UI for tag management
4. Add tag filtering to tasks dashboard
5. Implement drag-and-drop tag assignment

## Notes

- System tags (`is_system = TRUE`) cannot be deleted by users
- Tags are soft-deleted by setting `is_active = FALSE`
- Tag names are unique and lowercase English
- Hebrew names (`name_he`) are for UI display
- Colors follow the app's design system

## Related Files

- Migration: `scripts/migrations/016_create_tags_system.sql`
- Types: Will update `src/types/index.ts`
- API: Will create `src/app/api/tags/`
- UI: Will create `src/components/features/tasks/tags/`

---

**Migration Version:** 016
**Created:** 2025-10-14
**Status:** Ready to apply
**Breaking Changes:** None
