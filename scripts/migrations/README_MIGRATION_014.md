# Migration 014: Create Tickets Table

## Overview
Creates the `tickets` table to manage parent committee perks like sports game tickets, theater shows, concerts, etc.

## Purpose
Enable parent committee to offer tickets to games and events as a benefit to parents. This is separate from school events.

## Changes

### New Table: `tickets`
- **Basic Info**: title, description
- **Game/Event Details**: event_type, sport_type, team_home, team_away, venue, event_date
- **Ticket Details**: image_url, purchase_url, quantity_available, quantity_sold, price_per_ticket
- **Status**: active, sold_out, expired, draft
- **Display**: featured flag, display_order

### Indexes
- `idx_tickets_status` - For filtering by status
- `idx_tickets_event_date` - For sorting by date
- `idx_tickets_featured` - For homepage featured tickets

### RLS Policies
- Public can view active and sold_out tickets
- Authenticated admins can manage all tickets

## How to Apply

### Option 1: Supabase Dashboard (Recommended)
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `014_create_tickets.sql`
3. Run the migration
4. Verify table creation

### Option 2: Supabase CLI
```bash
# Apply migration
supabase db push

# Or run the SQL file directly
psql $DATABASE_URL -f scripts/migrations/014_create_tickets.sql
```

## Verification
```sql
-- Check table exists
SELECT * FROM information_schema.tables WHERE table_name = 'tickets';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'tickets';

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename = 'tickets';
```

## Rollback
```sql
-- Drop table and all dependencies
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP FUNCTION IF EXISTS update_tickets_updated_at() CASCADE;
```

## Related Files
- Migration: `scripts/migrations/014_create_tickets.sql`
- Types: Will be added to `src/types/index.ts`
- API: `src/app/api/tickets/route.ts`
- Components: `src/components/features/tickets/`

## Next Steps
1. Apply this migration to Supabase
2. Add TypeScript types for Ticket
3. Create API endpoints
4. Build admin UI for ticket management
5. Create public-facing ticket display components
