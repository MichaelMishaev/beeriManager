-- Migration 016: Create Tags System for Tasks
-- Purpose: Add multi-tag categorization system for flexible task organization
-- Date: 2025-10-14

BEGIN;

-- ============================================================================
-- 1. Create tags table
-- ============================================================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tag information
  name VARCHAR(50) NOT NULL UNIQUE,
  name_he VARCHAR(50) NOT NULL, -- Hebrew display name
  emoji VARCHAR(10), -- Optional emoji for visual indicator
  color VARCHAR(7) DEFAULT '#0D98BA', -- Hex color code

  -- Description
  description TEXT,

  -- Display order (for sorting in UI)
  display_order INTEGER DEFAULT 0,

  -- Usage tracking
  task_count INTEGER DEFAULT 0, -- Denormalized count for performance

  -- Meta
  is_system BOOLEAN DEFAULT FALSE, -- System tags (can't be deleted)
  is_active BOOLEAN DEFAULT TRUE,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(100),
  version INTEGER DEFAULT 1
);

-- Add indexes
CREATE INDEX idx_tags_name ON tags(name) WHERE is_active = TRUE;
CREATE INDEX idx_tags_display_order ON tags(display_order) WHERE is_active = TRUE;
CREATE INDEX idx_tags_task_count ON tags(task_count DESC) WHERE is_active = TRUE;

-- Add comments
COMMENT ON TABLE tags IS 'Task categorization tags - supports multiple tags per task';
COMMENT ON COLUMN tags.name IS 'Unique tag identifier (English, lowercase, no spaces)';
COMMENT ON COLUMN tags.name_he IS 'Hebrew display name for UI';
COMMENT ON COLUMN tags.emoji IS 'Optional emoji for visual identification';
COMMENT ON COLUMN tags.color IS 'Hex color code for UI display';
COMMENT ON COLUMN tags.is_system IS 'System tags cannot be deleted by users';
COMMENT ON COLUMN tags.task_count IS 'Denormalized count of tasks using this tag';

-- ============================================================================
-- 2. Create task_tags junction table (many-to-many relationship)
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(100),

  -- Prevent duplicate task-tag combinations
  UNIQUE(task_id, tag_id)
);

-- Add indexes for efficient queries
CREATE INDEX idx_task_tags_task ON task_tags(task_id);
CREATE INDEX idx_task_tags_tag ON task_tags(tag_id);
CREATE INDEX idx_task_tags_created ON task_tags(created_at DESC);

-- Add comments
COMMENT ON TABLE task_tags IS 'Junction table linking tasks to tags (many-to-many)';
COMMENT ON COLUMN task_tags.task_id IS 'Reference to task';
COMMENT ON COLUMN task_tags.tag_id IS 'Reference to tag';

-- ============================================================================
-- 3. Create function to update tag task_count
-- ============================================================================
CREATE OR REPLACE FUNCTION update_tag_task_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment task_count when tag is added to task
    UPDATE tags
    SET task_count = task_count + 1,
        updated_at = NOW()
    WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement task_count when tag is removed from task
    UPDATE tags
    SET task_count = GREATEST(task_count - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. Create trigger to maintain tag_count
-- ============================================================================
CREATE TRIGGER trigger_update_tag_task_count
  AFTER INSERT OR DELETE ON task_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_task_count();

-- ============================================================================
-- 5. Create helper functions for tag operations
-- ============================================================================

-- Function to get all tags for a task
CREATE OR REPLACE FUNCTION get_task_tags(p_task_id UUID)
RETURNS TABLE (
  tag_id UUID,
  tag_name VARCHAR,
  tag_name_he VARCHAR,
  emoji VARCHAR,
  color VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.name_he,
    t.emoji,
    t.color
  FROM tags t
  INNER JOIN task_tags tt ON t.id = tt.tag_id
  WHERE tt.task_id = p_task_id
    AND t.is_active = TRUE
  ORDER BY t.display_order, t.name_he;
END;
$$ LANGUAGE plpgsql;

-- Function to get all tasks with specific tag
CREATE OR REPLACE FUNCTION get_tasks_by_tag(p_tag_id UUID)
RETURNS TABLE (
  task_id UUID,
  title VARCHAR,
  status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.status
  FROM tasks t
  INNER JOIN task_tags tt ON t.id = tt.task_id
  WHERE tt.tag_id = p_tag_id
    AND t.archived_at IS NULL
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get tasks with multiple tags (AND logic)
CREATE OR REPLACE FUNCTION get_tasks_with_all_tags(p_tag_ids UUID[])
RETURNS TABLE (
  task_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT tt.task_id
  FROM task_tags tt
  INNER JOIN tasks t ON t.id = tt.task_id
  WHERE tt.tag_id = ANY(p_tag_ids)
    AND t.archived_at IS NULL
  GROUP BY tt.task_id
  HAVING COUNT(DISTINCT tt.tag_id) = array_length(p_tag_ids, 1);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. Seed initial system tags (Hebrew-focused)
-- ============================================================================
INSERT INTO tags (name, name_he, emoji, color, is_system, display_order, description) VALUES
  -- Main categories
  ('maintenance', 'תחזוקה', '🔧', '#FF8200', TRUE, 1, 'משימות תחזוקה ותיקונים'),
  ('events', 'אירועים', '🎉', '#FFBA00', TRUE, 2, 'משימות הקשורות לאירועים וחגיגות'),
  ('communication', 'תקשורת', '💬', '#0D98BA', TRUE, 3, 'תקשורת עם הורים ומורים'),
  ('budget', 'תקציב', '💰', '#003153', TRUE, 4, 'משימות כספיות ותקציביות'),
  ('education', 'חינוך', '📚', '#87CEEB', TRUE, 5, 'פעילויות חינוכיות והעשרה'),
  ('legal', 'משפטי', '⚖️', '#6B7280', TRUE, 6, 'עניינים משפטיים ומנהליים'),
  ('procurement', 'רכישות', '🛒', '#10B981', TRUE, 7, 'רכישות וציוד'),
  ('sports', 'ספורט', '🏃', '#EF4444', TRUE, 8, 'פעילויות ספורט'),
  ('culture', 'תרבות', '🎨', '#8B5CF6', TRUE, 9, 'פעילויות תרבות ואמנות'),

  -- Meta tags
  ('urgent', 'דחוף', '⚡', '#DC2626', TRUE, 10, 'משימות דחופות הדורשות טיפול מיידי'),
  ('recurring', 'חוזר', '🔄', '#F59E0B', TRUE, 11, 'משימות חוזרות'),
  ('unclear', 'לא ברור', '❓', '#9CA3AF', TRUE, 12, 'משימות הדורשות הבהרה');

-- Update version tracking
COMMENT ON TABLE tags IS 'Task categorization tags - Version 1.0.0';

COMMIT;

-- ============================================================================
-- Rollback instructions (save for reference, do not execute)
-- ============================================================================
-- To rollback this migration:
-- BEGIN;
-- DROP TRIGGER IF EXISTS trigger_update_tag_task_count ON task_tags;
-- DROP FUNCTION IF EXISTS update_tag_task_count();
-- DROP FUNCTION IF EXISTS get_task_tags(UUID);
-- DROP FUNCTION IF EXISTS get_tasks_by_tag(UUID);
-- DROP FUNCTION IF EXISTS get_tasks_with_all_tags(UUID[]);
-- DROP TABLE IF EXISTS task_tags;
-- DROP TABLE IF EXISTS tags;
-- COMMIT;
