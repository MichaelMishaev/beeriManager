-- Migration: Add parent_item_id to grocery_items for tracking partial claims
-- This enables merging back quantity when unclaiming partial items

-- Add column to track the parent item for split/partial claims
ALTER TABLE grocery_items
ADD COLUMN IF NOT EXISTS parent_item_id UUID REFERENCES grocery_items(id) ON DELETE SET NULL;

-- Add index for faster lookups when merging back to parent
CREATE INDEX IF NOT EXISTS idx_grocery_items_parent ON grocery_items(parent_item_id);

-- Add comment for documentation
COMMENT ON COLUMN grocery_items.parent_item_id IS 'Reference to the original item when this item was created via partial claim. Used for merging quantity back on unclaim.';
