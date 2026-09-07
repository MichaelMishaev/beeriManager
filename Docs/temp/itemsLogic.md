# Grocery Items Quantity & Claiming Logic

> Complete technical documentation of how quantities and claims work in the BeeriManager grocery system.

---

## Table of Contents

1. [Data Structure](#data-structure)
2. [Full Claim (Taking All)](#full-claim-taking-all)
3. [Partial Claim (Taking Some)](#partial-claim-taking-some)
4. [Unclaiming Items](#unclaiming-items)
5. [Admin Updates Quantity](#admin-updates-quantity)
6. [UI Consolidation](#ui-consolidation)
7. [Edge Cases & Protections](#edge-cases--protections)
8. [Database Operations Summary](#database-operations-summary)
9. [Visual Diagrams](#visual-diagrams)

---

## Data Structure

### GroceryItem Table Schema

```typescript
interface GroceryItem {
  id: string                    // UUID
  grocery_event_id: string      // FK to grocery_events

  // Item details
  item_name: string             // e.g., "חטיפים"
  quantity: number              // e.g., 5
  notes?: string                // Optional notes

  // Claiming fields
  claimed_by?: string           // Name of claimer (null = unclaimed)
  claimed_at?: string           // ISO timestamp when claimed

  // Partial claim tracking
  parent_item_id?: string       // Reference to original item (for merging back)

  // Display
  display_order: number         // Sorting order in list

  // Timestamps
  created_at: string
  updated_at: string
}
```

### Key Fields for Quantity Logic

| Field | Purpose |
|-------|---------|
| `quantity` | How many of this item |
| `claimed_by` | Who claimed it (null = available) |
| `parent_item_id` | Links split items back to original |

---

## Full Claim (Taking All)

### Scenario
Admin created "5x חטיפים". User wants to bring all 5.

### Before Claim
```
┌─────────────────────────────────────────────┐
│ ID: item-001                                │
│ item_name: "חטיפים"                          │
│ quantity: 5                                 │
│ claimed_by: NULL                            │
│ parent_item_id: NULL                        │
└─────────────────────────────────────────────┘
```

### API Call
```http
POST /api/grocery/{token}/items/item-001/claim
Body: { "claimer_name": "דנה" }
```

### After Claim
```
┌─────────────────────────────────────────────┐
│ ID: item-001                                │
│ item_name: "חטיפים"                          │
│ quantity: 5          (unchanged)            │
│ claimed_by: "דנה"    (← updated)            │
│ claimed_at: "2025-01-21T10:30:00Z"          │
│ parent_item_id: NULL                        │
└─────────────────────────────────────────────┘
```

### Database Operation
```sql
UPDATE grocery_items
SET claimed_by = 'דנה',
    claimed_at = NOW()
WHERE id = 'item-001';
```

**Result**: One item, fully claimed. Simple update.

---

## Partial Claim (Taking Some)

### Scenario
Admin created "5x חטיפים". User wants to bring only 2.

### Before Claim
```
┌─────────────────────────────────────────────┐
│ ID: item-001                                │
│ item_name: "חטיפים"                          │
│ quantity: 5                                 │
│ claimed_by: NULL                            │
│ parent_item_id: NULL                        │
└─────────────────────────────────────────────┘
```

### API Call
```http
POST /api/grocery/{token}/items/item-001/claim
Body: { "claimer_name": "דנה", "quantity": 2 }
```

### What Happens (2 Operations)

**Step 1**: Reduce original item's quantity
```sql
UPDATE grocery_items
SET quantity = 3    -- Was 5, now 5-2=3
WHERE id = 'item-001';
```

**Step 2**: Create NEW claimed item for the taken portion
```sql
INSERT INTO grocery_items (
  grocery_event_id, item_name, quantity,
  claimed_by, claimed_at, parent_item_id, display_order
) VALUES (
  'event-xxx', 'חטיפים', 2,
  'דנה', NOW(), 'item-001', 1  -- parent_item_id links back!
);
```

### After Claim (2 rows now!)
```
┌─────────────────────────────────────────────┐
│ ID: item-001                                │
│ item_name: "חטיפים"                          │
│ quantity: 3          (reduced from 5)       │
│ claimed_by: NULL     (still unclaimed!)     │
│ parent_item_id: NULL                        │
└─────────────────────────────────────────────┘
            │
            │ (parent)
            ▼
┌─────────────────────────────────────────────┐
│ ID: item-002         (NEW!)                 │
│ item_name: "חטיפים"                          │
│ quantity: 2          (the claimed portion)  │
│ claimed_by: "דנה"                            │
│ parent_item_id: "item-001" ◄── IMPORTANT!   │
└─────────────────────────────────────────────┘
```

### Why Split Into Two Items?

1. **Allows multiple claimers** - Someone else can claim the remaining 3
2. **Clean unclaim** - Can merge back to original on unclaim
3. **Tracking** - Know exactly who committed to what

---

## Unclaiming Items

### Scenario A: Unclaim Full Claim

**Before**: item-001 is fully claimed by דנה (quantity=5)

```http
DELETE /api/grocery/{token}/items/item-001/claim
```

**Operation**:
```sql
UPDATE grocery_items
SET claimed_by = NULL,
    claimed_at = NULL
WHERE id = 'item-001';
```

**Result**: Item goes back to unclaimed state. Simple.

---

### Scenario B: Unclaim Partial Claim (with parent)

**Before**:
- item-001 has quantity=3 (unclaimed)
- item-002 has quantity=2 (claimed by דנה, parent_item_id='item-001')

```http
DELETE /api/grocery/{token}/items/item-002/claim
```

**What Happens (2 Operations)**:

**Step 1**: Add quantity back to parent
```sql
UPDATE grocery_items
SET quantity = quantity + 2  -- Parent gets 3+2=5
WHERE id = 'item-001';
```

**Step 2**: Delete the split item entirely
```sql
DELETE FROM grocery_items
WHERE id = 'item-002';
```

**After**: Back to single item!
```
┌─────────────────────────────────────────────┐
│ ID: item-001                                │
│ item_name: "חטיפים"                          │
│ quantity: 5          (restored!)            │
│ claimed_by: NULL                            │
│ parent_item_id: NULL                        │
└─────────────────────────────────────────────┘
```

### Why Merge Back?

- Prevents fragmentation (100 claims = 100 rows)
- Cleaner data model
- UI shows "5x חטיפים" again, not "3x + 2x"

---

## Admin Updates Quantity

### ⚠️ Critical Scenario: Increase Quantity on CLAIMED Item

**Situation**:
- Admin created "5x חטיפים"
- דנה claimed all 5
- Admin realizes they need 10 total, updates quantity from 5→10

### THE PROBLEM
If we just `UPDATE quantity = 10`:
- דנה is now committed to bringing 10 instead of 5!
- She never agreed to that!

### THE SOLUTION
**Create a NEW unclaimed item for the extra quantity!**

### API Call
```http
PATCH /api/grocery/{token}/items/item-001
Body: { "quantity": 10 }
```

### Detection Logic (in route.ts)
```typescript
const newQuantity = validation.data.quantity           // 10
const isClaimedItem = !!currentItem.claimed_by         // true (דנה)
const isQuantityIncrease = newQuantity > currentItem.quantity  // 10 > 5 = true

if (isClaimedItem && isQuantityIncrease) {
  // SPECIAL HANDLING - Don't increase claimer's commitment!
  const additionalQuantity = newQuantity - currentItem.quantity  // 10-5 = 5
  // Create new unclaimed item with additionalQuantity
}
```

### What Happens

**Before**:
```
┌─────────────────────────────────────────────┐
│ ID: item-001                                │
│ item_name: "חטיפים"                          │
│ quantity: 5                                 │
│ claimed_by: "דנה"                            │
└─────────────────────────────────────────────┘
```

**After Admin increases to 10**:
```
┌─────────────────────────────────────────────┐
│ ID: item-001                                │
│ item_name: "חטיפים"                          │
│ quantity: 5          (UNCHANGED!)           │
│ claimed_by: "דנה"    (Still bringing 5)     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ID: item-003         (NEW!)                 │
│ item_name: "חטיפים"                          │
│ quantity: 5          (The extra 5)          │
│ claimed_by: NULL     (Available!)           │
└─────────────────────────────────────────────┘
```

### Database Operations

**Step 1**: Check for existing unclaimed item with same name
```sql
SELECT * FROM grocery_items
WHERE grocery_event_id = 'event-xxx'
  AND item_name = 'חטיפים'
  AND claimed_by IS NULL
  AND id != 'item-001';
```

**Step 2a**: If found, add to existing unclaimed item
```sql
UPDATE grocery_items
SET quantity = quantity + 5
WHERE id = 'existing-unclaimed-id';
```

**Step 2b**: If not found, create new unclaimed item
```sql
INSERT INTO grocery_items (
  grocery_event_id, item_name, quantity, claimed_by, display_order
) VALUES (
  'event-xxx', 'חטיפים', 5, NULL, 2
);
```

### Why This Matters

| Approach | Problem |
|----------|---------|
| ❌ Just update quantity | Claimer unknowingly committed to more |
| ✅ Create new unclaimed | Claimer's commitment unchanged, extra is available |

---

## UI Consolidation

### The Problem
With partial claims, you can have:
- item-001: "חטיפים" qty=3, unclaimed
- item-002: "חטיפים" qty=2, claimed by דנה
- item-003: "חטיפים" qty=5, claimed by יוסי

Showing 3 separate rows is confusing!

### The Solution: ConsolidatedItem

The UI groups items by `item_name`:

```typescript
interface ConsolidatedItem {
  id: string                 // Primary item ID
  item_name: string          // "חטיפים"
  totalQuantity: number      // 3+2+5 = 10
  claims: Array<{
    claimerName: string      // "דנה", "יוסי"
    quantity: number         // 2, 5
    itemId: string           // For unclaim
  }>
  unclaimedItems: GroceryItem[]  // Items with claimed_by=NULL
  unclaimedQuantity: number      // 3
}
```

### How It's Built (GroceryPublicList.tsx)

```typescript
const consolidatedItems = useMemo(() => {
  const grouped = new Map<string, GroceryItem[]>()

  // Group ALL items by name (case-insensitive)
  items.forEach(item => {
    const key = item.item_name.toLowerCase().trim()
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(item)
  })

  // Convert to ConsolidatedItem
  return Array.from(grouped.values()).map(itemGroup => ({
    item_name: itemGroup[0].item_name,
    totalQuantity: itemGroup.reduce((sum, i) => sum + i.quantity, 0),
    claims: itemGroup.filter(i => i.claimed_by).map(i => ({
      claimerName: i.claimed_by!,
      quantity: i.quantity,
      itemId: i.id
    })),
    unclaimedQuantity: itemGroup
      .filter(i => !i.claimed_by)
      .reduce((sum, i) => sum + i.quantity, 0),
    // ... etc
  }))
}, [items])
```

### UI Display

Instead of 3 rows, user sees:
```
┌─────────────────────────────────────────────┐
│ 10x חטיפים                                   │
│                                             │
│ דנה (2) ✓  •  יוסי (5) ✓                     │
│ 3 remaining                                 │
│                                   [אני אביא] │
└─────────────────────────────────────────────┘
```

---

## Edge Cases & Protections

### 1. Cannot Claim More Than Available
```typescript
if (claimQuantity > existingItem.quantity) {
  return { error: 'לא ניתן לתפוס יותר פריטים מהכמות הזמינה' }
}
```

### 2. Cannot Delete Claimed Items
```typescript
// DELETE /api/grocery/{token}/items/{itemId}
if (item.claimed_by) {
  return { error: 'cannotDeleteClaimedItem' }
}
```
**Must unclaim first, then delete.**

### 3. Cannot Claim Already Claimed Item
```typescript
if (existingItem.claimed_by) {
  return { error: 'הפריט כבר נתפס על ידי מישהו אחר' }
}
```

### 4. Cannot Claim on Closed Event
```typescript
if (event.status !== 'active') {
  return { error: 'רשימת הקניות כבר נסגרה' }
}
```

### 5. Rollback on Partial Claim Failure
```typescript
// If INSERT of claimed item fails after UPDATE
await supabase
  .from('grocery_items')
  .update({ quantity: existingItem.quantity })  // Restore original
  .eq('id', itemId)
```

### 6. Parent Deleted Before Unclaim
If parent item was deleted, unclaim falls back to normal behavior:
```typescript
if (item.parent_item_id) {
  const { data: parent } = await supabase
    .from('grocery_items')
    .select('*')
    .eq('id', item.parent_item_id)
    .single()

  if (!parent) {
    // Parent was deleted, just clear claimed_by on this item
    // Don't try to merge
  }
}
```

---

## Database Operations Summary

### Claim Operations

| Action | Operation |
|--------|-----------|
| Full Claim | `UPDATE` set claimed_by |
| Partial Claim | `UPDATE` reduce quantity + `INSERT` new claimed item |

### Unclaim Operations

| Action | Operation |
|--------|-----------|
| Unclaim Full | `UPDATE` clear claimed_by |
| Unclaim Partial | `UPDATE` parent quantity + `DELETE` split item |

### Admin Operations

| Action | Operation |
|--------|-----------|
| Increase qty (unclaimed) | `UPDATE` quantity |
| Increase qty (claimed) | `INSERT` new unclaimed item |
| Decrease qty (unclaimed) | `UPDATE` quantity |
| Delete (unclaimed only) | `DELETE` item |

---

## Visual Diagrams

### Complete Flow: 5x חטיפים → Multiple Claims → Unclaim

```
INITIAL STATE
═══════════════════════════════════════════════════════════════

┌─────────────────────┐
│ item-001            │
│ חטיפים × 5          │
│ claimed_by: NULL    │
└─────────────────────┘


STEP 1: דנה claims 2
═══════════════════════════════════════════════════════════════

┌─────────────────────┐     ┌─────────────────────┐
│ item-001            │     │ item-002 (NEW)      │
│ חטיפים × 3          │────▶│ חטיפים × 2          │
│ claimed_by: NULL    │     │ claimed_by: דנה      │
└─────────────────────┘     │ parent: item-001    │
                            └─────────────────────┘


STEP 2: יוסי claims remaining 3
═══════════════════════════════════════════════════════════════

┌─────────────────────┐     ┌─────────────────────┐
│ item-001            │     │ item-002            │
│ חטיפים × 3          │     │ חטיפים × 2          │
│ claimed_by: יוסי ◄──│     │ claimed_by: דנה      │
└─────────────────────┘     │ parent: item-001    │
                            └─────────────────────┘


STEP 3: Admin adds 5 more (total needed = 10)
═══════════════════════════════════════════════════════════════

┌─────────────────────┐     ┌─────────────────────┐
│ item-001            │     │ item-002            │
│ חטיפים × 3          │     │ חטיפים × 2          │
│ claimed_by: יוסי     │     │ claimed_by: דנה      │
└─────────────────────┘     └─────────────────────┘

┌─────────────────────┐
│ item-003 (NEW)      │
│ חטיפים × 5          │
│ claimed_by: NULL    │  ◄── Extra 5 available!
└─────────────────────┘


STEP 4: דנה unclaims her 2
═══════════════════════════════════════════════════════════════

┌─────────────────────┐
│ item-001            │
│ חטיפים × 3          │
│ claimed_by: יוסי     │
└─────────────────────┘

┌─────────────────────┐
│ item-003            │
│ חטיפים × 7          │  ◄── 5 + 2 merged back!
│ claimed_by: NULL    │
└─────────────────────┘

(item-002 was DELETED, its qty merged to nearest unclaimed)


UI SHOWS
═══════════════════════════════════════════════════════════════

┌───────────────────────────────────────────────────┐
│  10x חטיפים                                        │
│                                                   │
│  יוסי (3) ✓                                        │
│  7 remaining                          [אני אביא]  │
└───────────────────────────────────────────────────┘
```

---

## API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/grocery/{token}/items` | List all items |
| `POST` | `/api/grocery/{token}/items` | Add item(s) |
| `GET` | `/api/grocery/{token}/items/{id}` | Get single item |
| `PATCH` | `/api/grocery/{token}/items/{id}` | Update item |
| `DELETE` | `/api/grocery/{token}/items/{id}` | Delete item (unclaimed only) |
| `POST` | `/api/grocery/{token}/items/{id}/claim` | Claim item |
| `DELETE` | `/api/grocery/{token}/items/{id}/claim` | Unclaim item |

---

## Code References

| File | Purpose |
|------|---------|
| `src/app/[locale]/grocery/[token]/items/page.tsx` | Items editor page |
| `src/app/api/grocery/[token]/items/route.ts` | List/Create items API |
| `src/app/api/grocery/[token]/items/[itemId]/route.ts` | Update/Delete item API |
| `src/app/api/grocery/[token]/items/[itemId]/claim/route.ts` | Claim/Unclaim API |
| `src/components/features/grocery/GroceryPublicList.tsx` | UI with consolidation |
| `src/components/features/grocery/ClaimDialog.tsx` | Claim modal with qty selector |
| `src/types/index.ts` | TypeScript interfaces |

---

*Last updated: January 2025*
