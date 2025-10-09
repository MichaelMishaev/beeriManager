# Migration 015: Add Finished Status to Tickets

## Purpose
Add a new "finished" status for tickets representing games/events that have already occurred. Tickets with "finished" status should NOT be displayed to parents on the main page.

## What Changed

### Status Options
- **Before**: `active`, `sold_out`, `expired`, `draft`
- **After**: `active`, `sold_out`, `expired`, `draft`, `finished`

### Behavior
- **finished**: Game/event is over - NOT shown to parents (same as if no game exists)
- Parents only see: `active` and `sold_out` tickets
- Admins can see all statuses including `finished`

## How to Apply

### Option 1: Supabase Dashboard (Recommended)
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `015_add_finished_status.sql`
3. Click "Run"

### Option 2: Command Line
```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run migration
\i scripts/migrations/015_add_finished_status.sql
```

## Verification

After running the migration:

```sql
-- Check constraint was updated
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'valid_status';

-- Should show: CHECK (status IN ('active', 'sold_out', 'expired', 'draft', 'finished'))
```

## Usage

### Admin: Mark a game as finished
1. Go to `/admin/tickets/[id]/edit`
2. Change status dropdown to "אזל מהתקף" (finished)
3. Save
4. Ticket will no longer appear on parent homepage

### Parents
- Will only see tickets with status: `active` or `sold_out`
- Will NOT see: `draft`, `expired`, or `finished` tickets

## Rollback (if needed)

```sql
-- Drop new constraint
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS valid_status;

-- Restore old constraint
ALTER TABLE public.tickets
  ADD CONSTRAINT valid_status
  CHECK (status IN ('active', 'sold_out', 'expired', 'draft'));

-- Update any finished tickets to expired
UPDATE public.tickets SET status = 'expired' WHERE status = 'finished';
```

## Notes
- The RLS policy ensures parents can only see `active` and `sold_out` tickets
- `finished` tickets are only visible to admins
- This is by design - finished games shouldn't clutter the parent view
