# Ticket "Finished" Status Feature

## Overview
Added a new "finished" status for tickets representing games/events that have already occurred. This allows admins to mark past events without showing them to parents.

## User Story
**As an admin**, when a game/event is over, I want to mark the ticket as "finished" so that **parents don't see it anymore** on the main page (it's the same as if the game never existed for them).

## Implementation

### 1. New Status: "finished" (אזל מהתקף)
Added to the status dropdown in ticket edit form:
- טיוטה (draft)
- פעיל (active)
- אזל מהמלאי (sold_out)
- פג תוקף (expired)
- **אזל מהתקף (finished)** ← NEW

### 2. Parent View Filtering
Parents only see tickets with status:
- `active` ✅
- `sold_out` ✅

Parents do NOT see:
- `draft` ❌
- `expired` ❌
- `finished` ❌ (NEW - games that are over)

### 3. Admin View
Admins can see ALL statuses including `finished` in the admin panel.

## Files Modified

### Code Files
1. **src/components/features/tickets/TicketForm.tsx**
   - Added 'finished' to status enum
   - Added "אזל מהתקף" dropdown option

2. **src/app/api/tickets/route.ts**
   - Added 'finished' to validation schema
   - Updated filtering: public only sees 'active' and 'sold_out' (NOT finished)

3. **src/types/index.ts**
   - Updated Ticket type: added 'finished' to status union type

### Database Files
4. **scripts/migrations/014_create_tickets.sql**
   - Updated status comment to include 'finished'
   - Updated CHECK constraint to include 'finished'

5. **scripts/migrations/015_add_finished_status.sql** (NEW)
   - Migration to add 'finished' status to existing database
   - Updates RLS policy to exclude 'finished' from public view

6. **scripts/migrations/README_MIGRATION_015.md** (NEW)
   - Documentation for migration 015
   - Instructions for applying and verifying
   - Rollback procedure if needed

7. **Docs/TICKET_FINISHED_STATUS.md** (THIS FILE)
   - Feature documentation

## How to Use

### For Admins
1. Navigate to `/admin/tickets`
2. Click edit on a ticket for a past game
3. Change status to "אזל מהתקף" (finished)
4. Save
5. **Result**: Ticket no longer appears on parent homepage

### For Parents
- Automatically see only current/relevant tickets (`active` and `sold_out`)
- Finished games are hidden - cleaner, more relevant view

## Database Migration

### Apply Migration
Run the migration in Supabase:
```sql
\i scripts/migrations/015_add_finished_status.sql
```

Or copy-paste the contents into Supabase SQL Editor.

### Verify
```sql
-- Check constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'valid_status';
```

Should show: `CHECK (status IN ('active', 'sold_out', 'expired', 'draft', 'finished'))`

## Benefits
1. **Cleaner Parent View**: Parents only see relevant, current tickets
2. **Historical Record**: Admins can keep finished tickets for records
3. **Better UX**: Less clutter, more focused content
4. **Clear Intent**: "finished" explicitly means "game is over"

## Testing Checklist
- [ ] Edit ticket in admin panel
- [ ] See "אזל מהתקף" option in status dropdown
- [ ] Set ticket to "finished" status
- [ ] Verify ticket does NOT appear on parent homepage
- [ ] Verify ticket IS visible in admin panel
- [ ] Verify other statuses still work correctly

## API Behavior

### GET /api/tickets (no status param - PUBLIC)
Returns only: `active`, `sold_out`
Does NOT return: `draft`, `expired`, `finished`

### GET /api/tickets?status=all (ADMIN)
Returns all statuses including `finished`

### GET /api/tickets?status=finished (ADMIN)
Returns only tickets with `finished` status

## Notes
- The Hebrew text "אזל מהתקף" literally means "out of validity" - indicating the time period is over
- This is different from "פג תוקף" (expired) which implies the ticket itself expired
- "finished" is semantic - it means the event has occurred and is now in the past
