# Items Pickup (Grocery List) Feature

## Overview

A public-facing grocery list sharing system that allows anyone to:
1. Create grocery events (no login required)
2. Add items to a shopping list
3. Generate shareable links
4. Share via WhatsApp
5. Have others claim items by entering their name

This feature is designed for standalone migration in the future.

## User Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Create Event   │────▶│   Add Items     │────▶│  Success Page   │
│  /grocery       │     │  /grocery/[t]/  │     │  /grocery/      │
│                 │     │     items       │     │   success/[t]   │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │  Share via      │
                                               │  WhatsApp       │
                                               └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐                            ┌─────────────────┐
│ Admin Dashboard │◀───────────────────────────│  Public View    │
│ /grocery/admin  │                            │  /grocery/[t]   │
└─────────────────┘                            └─────────────────┘
```

## Database Schema

### Table: grocery_events

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| share_token | VARCHAR(12) | Unique URL-friendly token |
| class_name | VARCHAR(100) | Class name (e.g., "ג׳3") |
| event_name | VARCHAR(200) | Event name (e.g., "טיול שנתי") |
| event_date | DATE | Event date (optional) |
| event_time | TIME | Event time (optional) |
| event_address | TEXT | Event address (optional) |
| creator_name | VARCHAR(100) | Creator name (optional) |
| status | VARCHAR(20) | 'active', 'completed', 'archived' |
| total_items | INTEGER | Computed: total items count |
| claimed_items | INTEGER | Computed: claimed items count |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### Table: grocery_items

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| grocery_event_id | UUID | Foreign key to grocery_events |
| item_name | VARCHAR(200) | Item name |
| quantity | INTEGER | Quantity (default: 1) |
| notes | TEXT | Optional notes |
| claimed_by | VARCHAR(100) | Name of person who claimed |
| claimed_at | TIMESTAMPTZ | When item was claimed |
| display_order | INTEGER | Display order |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### RLS Policies

```sql
-- Public read access
CREATE POLICY "Public can view grocery events" ON grocery_events
  FOR SELECT USING (true);

-- Public write access (anyone can create)
CREATE POLICY "Public can create grocery events" ON grocery_events
  FOR INSERT WITH CHECK (true);

-- Similar policies for grocery_items
```

## API Routes

### Events API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/grocery | List all events | Admin |
| POST | /api/grocery | Create event | Public |
| GET | /api/grocery/[token] | Get event details | Public |
| PATCH | /api/grocery/[token] | Update event status | Admin |

### Items API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/grocery/[token]/items | Get items | Public |
| POST | /api/grocery/[token]/items | Add item(s) | Public |
| PATCH | /api/grocery/[token]/items/[id] | Update item | Public |
| DELETE | /api/grocery/[token]/items/[id] | Delete item | Public |

### Claims API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/grocery/[token]/items/[id]/claim | Claim item | Public |
| DELETE | /api/grocery/[token]/items/[id]/claim | Unclaim item | Public |

## File Structure

```
src/
├── app/
│   ├── [locale]/
│   │   └── grocery/
│   │       ├── page.tsx              # Create event form
│   │       ├── [token]/
│   │       │   ├── page.tsx          # Public claim view
│   │       │   └── items/
│   │       │       └── page.tsx      # Add/edit items
│   │       ├── success/
│   │       │   └── [token]/
│   │       │       └── page.tsx      # Success + share
│   │       └── admin/
│   │           └── page.tsx          # Admin dashboard
│   └── api/
│       └── grocery/
│           ├── route.ts              # GET list, POST create
│           └── [token]/
│               ├── route.ts          # GET event, PATCH status
│               └── items/
│                   ├── route.ts      # GET/POST items
│                   └── [itemId]/
│                       ├── route.ts  # GET/PATCH/DELETE item
│                       └── claim/
│                           └── route.ts # POST/DELETE claim
├── components/
│   └── features/
│       └── grocery/
│           ├── index.ts              # Barrel exports
│           ├── GroceryCreateForm.tsx # Event creation form
│           ├── GroceryItemEditor.tsx # Add/edit items
│           ├── GroceryShareSuccess.tsx # Success page
│           ├── GroceryPublicList.tsx # Public claim view
│           ├── GroceryProgressBar.tsx # Progress indicator
│           ├── GroceryItem.tsx       # Single item display
│           └── ClaimDialog.tsx       # Name entry dialog
└── types/
    └── index.ts                      # GroceryEvent, GroceryItem types
```

## Components

### GroceryCreateForm
Creates a new grocery event with class name, event name, date, time, address.

### GroceryItemEditor
Allows adding items with name and quantity. Uses stepper for quantity.

### GroceryShareSuccess
Success screen with WhatsApp share button and copy link functionality.

### GroceryPublicList
Public view showing all items with claim buttons. Includes filters.

### GroceryProgressBar
Visual progress bar showing claimed/total items.

### GroceryItem
Single item display with claim/unclaim button and claimer info.

### ClaimDialog
Modal dialog to enter name when claiming an item.

## Design System

```css
/* Primary Colors */
--primary: #13ec80;      /* Green accent */
--background-light: #f6f8f7;
--background-dark: #102219;
--whatsapp: #25D366;

/* Typography */
font-family: 'Plus Jakarta Sans', sans-serif;

/* Border Radius */
border-radius: 0.75rem; /* xl */

/* Effects */
backdrop-blur: blur(12px); /* iOS-style header blur */
```

## Migration to Standalone App

To extract this feature as a standalone application:

### 1. Database
- Export migration: `scripts/migrations/021_create_grocery_events.sql`
- Create new Supabase project
- Run migration

### 2. Types
- Copy from `src/types/index.ts`:
  - `GroceryEvent`
  - `GroceryItem`

### 3. API Routes
- Copy entire `src/app/api/grocery/` directory
- Update Supabase client imports

### 4. Components
- Copy entire `src/components/features/grocery/` directory
- Install required dependencies:
  - `react-hook-form`
  - `zod`
  - `@hookform/resolvers`
  - UI components from shadcn/ui

### 5. Pages
- Copy entire `src/app/[locale]/grocery/` directory
- Update routing if not using Next.js i18n

### 6. Translations
- Copy `grocery` section from `messages/he.json` and `messages/ru.json`

### 7. Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.2",
    "next-intl": "^3.0.0"
  }
}
```

## Testing

### Manual Testing Checklist

1. **Create Event Flow**
   - [ ] Navigate to `/grocery`
   - [ ] Fill in class name and event name
   - [ ] Click "Continue to items"
   - [ ] Verify redirect to items page

2. **Add Items Flow**
   - [ ] Add item with name
   - [ ] Adjust quantity with +/- buttons
   - [ ] Add multiple items
   - [ ] Remove an item
   - [ ] Click "Done"
   - [ ] Verify redirect to success page

3. **Share Flow**
   - [ ] Click "Share on WhatsApp"
   - [ ] Verify WhatsApp opens with correct message
   - [ ] Click "Copy Link"
   - [ ] Verify link is copied

4. **Claim Flow**
   - [ ] Open public link
   - [ ] Click "I'll bring" on unclaimed item
   - [ ] Enter name in dialog
   - [ ] Confirm claim
   - [ ] Verify item shows as claimed

5. **Unclaim Flow**
   - [ ] Click "Cancel" on claimed item
   - [ ] Verify item is unclaimed

6. **Admin Dashboard**
   - [ ] Navigate to `/grocery/admin`
   - [ ] Verify events list loads
   - [ ] Filter by status
   - [ ] Click "Send reminder"
   - [ ] Verify WhatsApp opens

## Security Considerations

- No authentication required (public feature)
- RLS policies allow public read/write
- No sensitive data stored
- Share tokens are URL-safe random strings
- No PII collected (name is optional)

## Performance Considerations

- Polling every 5 seconds for real-time updates
- Cache busting with timestamp query parameter
- Minimal API payload (only necessary fields)
- Optimistic UI updates for better UX

## Known Limitations

1. No real-time updates (polling-based)
2. No edit capability for event details after creation
3. No duplicate claim prevention (same person can claim multiple items)
4. No notification system for claim updates
