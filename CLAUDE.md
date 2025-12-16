# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BeeriManager** - A Hebrew-first PWA (Progressive Web App) for managing school parent committee activities, events, tasks, responsibilities, issues, and protocols. The app is optimized for mobile devices and uses WhatsApp link sharing as the primary distribution method.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router) with TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with RTL support (tailwindcss-rtl)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Internationalization**: next-intl (Hebrew, Russian, Arabic, English)
- **Calendar**: Google Calendar API v3 (bidirectional sync)
- **Testing**: Playwright for E2E automation
- **Hosting**: Vercel (primary: https://beeri.online)
- **PWA**: @ducanh2912/next-pwa with offline support
- **State Management**: Zustand + TanStack React Query
- **Forms**: React Hook Form + Zod validation
- **Analytics**: Google Analytics (G-9RS38VPXEZ)

## Commands

### Development
```bash
npm run dev              # Start dev server on port 4500
npm run dev:clean        # Clean .next and start fresh
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript checks (strict mode)
```

### Testing (Playwright)
```bash
npm test                 # Run all Playwright tests
npm run test:ui          # Run with Playwright UI mode
npm run test:debug       # Run in debug mode
npm run test:headed      # Run with browser visible
npm run test:mobile      # Run mobile-specific tests
npm run test:parallel    # Run with 4 workers
npm run test:report      # Show test report
npm run test:vendors     # Run vendor management tests
npm run automation:watch # Watch mode for test development
```

### Database
```bash
npm run db:start         # Start local Supabase (if using)
npm run db:stop          # Stop local Supabase
npm run db:migrate       # Run all migrations
npm run db:reset         # Reset database
npm run db:backup        # Create database backup
npm run db:connect       # Connect to database CLI
npm run db:export-schema # Export current schema
npm run db:compare-schemas # Compare schemas
```

### Other
```bash
npm run icons:generate   # Generate PWA icons from source
```

## Architecture Overview

### Directory Structure

```
src/
├── app/
│   ├── [locale]/              # Internationalized routes (he, ru, ar, en)
│   │   ├── (admin)/          # Admin-only routes (middleware protected)
│   │   │   └── admin/        # Admin dashboard and management
│   │   ├── (auth)/           # Authentication routes
│   │   ├── (public)/         # Public routes (no auth required)
│   │   ├── events/           # Events management
│   │   ├── tasks/            # Tasks management
│   │   ├── vendors/          # Vendor management
│   │   ├── feedback/         # Anonymous feedback
│   │   ├── tickets/          # Ticket system
│   │   └── prom/             # Prom planning (quotes, voting)
│   ├── api/                  # API routes (Next.js API handlers)
│   │   ├── auth/             # Authentication endpoints
│   │   ├── tasks/            # Task CRUD + bulk operations
│   │   ├── events/           # Event CRUD + Google Calendar sync
│   │   ├── vendors/          # Vendor management
│   │   ├── prom/             # Prom quotes and voting
│   │   └── tickets/          # Ticket system
│   └── manifest.json         # PWA manifest
├── components/
│   ├── ui/                   # shadcn/ui base components
│   ├── features/             # Feature-specific components
│   │   ├── tasks/            # Task components + tags system
│   │   ├── events/           # Event components
│   │   ├── vendors/          # Vendor components
│   │   ├── prom/             # Prom quotes components
│   │   ├── ai-assistant/     # AI assistant components
│   │   └── dashboard/        # Dashboard widgets
│   ├── layout/               # Layout components (Navigation, etc.)
│   └── pwa/                  # PWA-specific (install button, notifications)
├── lib/
│   ├── supabase/             # Supabase client & server utilities
│   ├── auth/                 # JWT auth utilities
│   ├── ai/                   # OpenAI integration
│   ├── utils/                # Shared utilities
│   ├── calendar/             # Google Calendar integration
│   ├── notifications.ts      # Push notifications
│   ├── offline-storage.ts    # IndexedDB utilities
│   └── search.ts             # Search functionality
├── i18n/
│   ├── config.ts             # Supported locales configuration
│   ├── request.ts            # Server-side locale resolution
│   └── navigation.ts         # Internationalized navigation
├── types/
│   └── index.ts              # TypeScript type definitions
├── hooks/                    # Custom React hooks
└── middleware.ts             # Next.js middleware (auth + i18n)
```

### Key Architecture Patterns

#### 1. Internationalization (i18n)
- **next-intl** handles all internationalization
- Routes are prefixed with locale: `/he/admin`, `/ru/feedback`
- Default locale: Hebrew (`he`)
- Supported locales: `he`, `ru`, `ar`, `en`
- Translation files in `messages/` (he.json, ru.json, ar.json, en.json)
- Middleware handles locale detection and routing

#### 2. Authentication & Authorization
- **Global password system** - One admin password for all editors
- JWT tokens stored in `auth-token` cookie
- Password hashed with bcrypt, stored in Supabase `app_settings` table
- Middleware protects routes: `/admin`, `/tasks`, `/finances`, `/issues`
- Public routes accessible without authentication
- Admin verification via `verifyJWT()` in middleware

#### 3. Database Architecture (Supabase)
- **Row Level Security (RLS)**: Public read, admin write
- **Core tables**:
  - `events` - Calendar events with Google Calendar sync
  - `tasks` - Actionable items with owners
  - `responsibilities` - Long-term role assignments
  - `issues` - Problem tracking with status workflow
  - `protocols` - Historical documents with external links
  - `committees` - Committee management
  - `anonymous_feedback` - Anonymous feedback system
  - `vendors` - Vendor management (password protected)
  - `tags` - Tag system for tasks
  - `task_tags` - Many-to-many junction table
  - `prom_quotes` - Prom vendor quotes
  - `prom_votes` - Voting system
  - `tickets` - Ticket tracking system
  - `app_settings` - Global app settings
  - `push_subscriptions` - PWA push notification subscriptions
- **Migrations**: Located in `scripts/migrations/`, run via `db:migrate`
- **Timestamps**: All tables have `created_at` and `updated_at`

#### 4. API Route Patterns
All API routes follow REST conventions:
```typescript
// Standard CRUD pattern
GET    /api/tasks          - List all tasks
POST   /api/tasks          - Create task (admin only)
GET    /api/tasks/[id]     - Get single task
PATCH  /api/tasks/[id]     - Update task (admin only)
DELETE /api/tasks/[id]     - Delete task (admin only)

// Bulk operations
POST   /api/tasks/bulk/tags     - Add tags to multiple tasks
DELETE /api/tasks/bulk/tags     - Remove tags from tasks

// Nested resources
GET    /api/tasks/[id]/tags     - Get task tags
POST   /api/tasks/[id]/tags     - Add tags to task
```

#### 5. Component Architecture
- **shadcn/ui** provides base components in `components/ui/`
- **Feature components** in `components/features/[feature]/`
- **RTL support** built into all components
- **Hebrew-first** - all labels, errors, messages in Hebrew
- **Mobile-first** - responsive design prioritizing mobile
- **Component structure**:
  ```
  features/
    tasks/
      TaskCard.tsx         # Display component
      TaskForm.tsx         # Create/edit form
      TaskList.tsx         # List view
      tags/                # Tags subsystem
        Tag.tsx            # Tag display
        TagSelector.tsx    # Multi-select tags
        TagManager.tsx     # Admin tag management
  ```

#### 6. State Management
- **TanStack React Query** for server state (fetching, caching, mutations)
- **Zustand** for client state (UI state, filters, selections)
- **React Hook Form** for form state
- **IndexedDB** for offline state (via `lib/offline-storage.ts`)

#### 7. PWA Architecture
- **Service Worker**: Auto-generated by next-pwa
- **Offline support**: IndexedDB caching via `offline-storage.ts`
- **Push notifications**: Web Push API with VAPID keys
- **Install prompt**: Custom install button component
- **Manifest**: `/app/manifest.json` with icons and theme
- **Background sync**: Queued operations synced when online

## Critical Development Patterns

### 1. Strict TypeScript
The project uses **strict TypeScript mode** with all flags enabled:
```typescript
// tsconfig.json enforces:
"strict": true,
"noImplicitAny": true,
"strictNullChecks": true,
"noUnusedLocals": true,
"noUnusedParameters": true,
"noImplicitReturns": true,
"noFallthroughCasesInSwitch": true
```
**All code must pass type-check** before committing.

### 2. Cache Busting Pattern
For dynamic content requiring real-time updates:
```typescript
const response = await fetch(`/api/endpoint?_t=${Date.now()}`, {
  cache: 'no-store',
  headers: { 'Cache-Control': 'no-cache' }
})
```
Use this for: urgent messages, real-time data, admin dashboards.

### 3. API Route Structure
```typescript
// Standard API route pattern
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת המשימות', success: false },
      { status: 500 }
    )
  }
}
```

### 4. Internationalization Pattern
```typescript
// In server components
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('Tasks')
  return <h1>{t('title')}</h1>
}

// In client components
'use client'
import { useTranslations } from 'next-intl'

export default function TaskCard() {
  const t = useTranslations('Tasks')
  return <button>{t('createNew')}</button>
}
```

### 5. Supabase Query Pattern
```typescript
// Server-side (API routes, server components)
import { supabase } from '@/lib/supabase/client'

const { data, error } = await supabase
  .from('tasks')
  .select('*, tags(*)')  // Join with tags
  .eq('status', 'active')
  .order('created_at', { ascending: false })

// Client-side with React Query
import { useQuery } from '@tanstack/react-query'

const { data, isLoading } = useQuery({
  queryKey: ['tasks'],
  queryFn: async () => {
    const res = await fetch('/api/tasks')
    return res.json()
  }
})
```

### 6. Form Validation Pattern
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const taskSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  description: z.string().optional(),
  due_date: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

export function TaskForm() {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '' }
  })

  const onSubmit = async (data: TaskFormData) => {
    // Handle submission
  }
}
```

## Development Guidelines

### 1. Hebrew-First Development
- All UI text in Hebrew
- RTL layout throughout (use `dir="rtl"`)
- Error messages in Hebrew
- Use `text-right` instead of `text-left`
- Date formatting: Hebrew locale via date-fns

### 2. Mobile-First Design
- Design for mobile screens first (375px baseline)
- Use Tailwind responsive classes: `sm:`, `md:`, `lg:`
- Test on mobile browsers (Chrome Mobile, Safari iOS)
- Touch-friendly targets (min 44x44px)
- Optimize for 3G connections

### 3. Testing with Playwright
- Write tests alongside feature development
- Test file naming: `[feature].spec.ts`
- Test mobile and desktop viewports
- Use page object pattern for complex flows
- Always test RTL layout correctness

### 4. Performance Optimization
- Use Next.js Image component for images
- Implement lazy loading for lists
- Use React Query for caching
- Minimize bundle size (check with `npm run build`)
- Leverage PWA caching for static assets

### 5. Security Practices
- Never commit secrets (.env files in .gitignore)
- Validate all user input with Zod
- Use RLS policies in Supabase
- Sanitize data before database insertion
- JWT tokens expire after 7 days

### 6. Git Workflow
- **Never push without explicit instruction**
- Exclude temp files, logs, .env
- Write descriptive commit messages in English
- Reference issue numbers when applicable
- Test locally before committing

## Important Context

### Project Constraints
- **Timeline**: 7-day MVP initially, now in production
- **Users**: School parent committee members
- **Primary distribution**: WhatsApp link sharing
- **Authentication**: Single global password (no user accounts)
- **Data privacy**: No personal child data stored
- **Offline support**: PWA with IndexedDB caching

### Critical Features
1. **Google Calendar Sync** - Bidirectional sync via API v3
2. **Tags System** - Multi-tag categorization for tasks
3. **Vendor Management** - Password-protected supplier database
4. **Anonymous Feedback** - Multi-language feedback system
5. **Prom Planning** - Quote comparison and voting system
6. **PWA Notifications** - Push notifications for updates
7. **Offline Mode** - Full offline capability with sync

### Design System
- **Color Palette**:
  - Sky Blue: #87CEEB
  - Blue-Green: #0D98BA
  - Prussian Blue: #003153
  - Selective Yellow: #FFBA00
  - UT Orange: #FF8200

### Documentation
Comprehensive documentation in `Docs/`:
- `PWA_COMPLETE_GUIDE.md` - PWA implementation
- `UX_COMPLETE_GUIDE.md` - UX analysis and improvements
- `TAGS_COMPLETE_GUIDE.md` - Tags system guide
- `QA_COMPLETE_GUIDE.md` - Testing guide
- `FEATURES_IMPLEMENTATION.md` - Feature status
- `development/bugs.md` - Known bugs and solutions

### Common Patterns to Check

**When changing code, always check for regression risks in:**
- Related components using the same API
- Tests that may need updating
- Internationalization keys
- Mobile responsiveness
- RTL layout correctness
- Cache invalidation
- Database migrations if schema changes

**Before committing:**
1. Run `npm run type-check` (must pass)
2. Run `npm run lint`
3. Run relevant Playwright tests
4. Test on mobile device or mobile viewport
5. Verify RTL layout works correctly

## Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Authentication
JWT_SECRET=
ADMIN_PASSWORD_HASH=  # bcrypt hash of admin password

# Google Calendar (optional)
GOOGLE_CALENDAR_API_KEY=
GOOGLE_CALENDAR_ID=

# PWA Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@beeri.online

# Analytics
NEXT_PUBLIC_GA_ID=G-9RS38VPXEZ

# OpenAI (optional, for AI assistant)
OPENAI_API_KEY=
```

## Notes for AI Development

- Always prioritize Hebrew language and RTL layout
- Test changes on both desktop and mobile
- Maintain strict TypeScript compliance
- Write Playwright tests for new features
- Check for regression bugs in related features
- Update documentation when adding features
- Never delete data from production database
- Only commit when explicitly instructed
- Use latest technologies unless technical conflicts exist
