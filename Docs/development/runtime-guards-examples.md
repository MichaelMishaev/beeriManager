# Runtime Guards - Usage Examples

> **Created:** 2025-12-16
> **Purpose:** Practical examples of using runtime guards in BeeriManager
> **Reference:** `/Docs/infrustructure/baseRules.md`

---

## 📚 Table of Contents

1. [Guard 1: Admin Authentication](#guard-1-admin-authentication)
2. [Guard 2: Required Fields Validation](#guard-2-required-fields-validation)
3. [Guard 3: Soft Delete Enforcement](#guard-3-soft-delete-enforcement)
4. [Guard 4: Hebrew Text Validation](#guard-4-hebrew-text-validation)
5. [Guard 5: Calendar Duplicate Prevention](#guard-5-calendar-duplicate-prevention)
6. [Guard 6: RTL Layout Verification](#guard-6-rtl-layout-verification)
7. [Complete API Route Examples](#complete-api-route-examples)

---

## Guard 1: Admin Authentication

**Location:** `src/lib/auth/jwt.ts`

### ✅ How It Works

The guard automatically logs JWT verification failures with context.

### 📖 Usage in Middleware

```typescript
// src/middleware.ts
import { verifyJWT } from '@/lib/auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Guard 1 is active here - logs failures automatically
  const decoded = verifyJWT(token)

  if (!decoded) {
    // Token invalid - guard already logged the violation
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
```

### 📖 Usage in API Routes

```typescript
// src/app/api/admin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    return NextResponse.json(
      { error: 'לא מאומת' },
      { status: 401 }
    )
  }

  // Guard 1: Verify admin authentication
  const decoded = verifyJWT(token)

  if (!decoded) {
    // Guard logged: "INVARIANT VIOLATION: JWT verification failed"
    return NextResponse.json(
      { error: 'טוקן לא תקין' },
      { status: 401 }
    )
  }

  // Admin verified - proceed
  return NextResponse.json({ success: true })
}
```

### 🔍 What Gets Logged

```
[14:23:45] ERROR [Auth]{verifyJWT} INVARIANT VIOLATION: JWT verification failed
📊 Data: { tokenExists: true, decoded: null }
❌ Error: JsonWebTokenError: invalid signature
```

---

## Guard 2: Required Fields Validation

**Location:** `src/lib/utils/validators.ts`

### ✅ How It Works

Validates that all required fields are present and non-empty. Throws error if validation fails.

### 📖 Example: Creating a Task

```typescript
// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateRequiredFields } from '@/lib/utils/validators'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Guard 2: Validate required fields
    validateRequiredFields(
      body,
      ['title', 'owner_name', 'priority', 'status'],
      'Task'
    )

    // All required fields present - proceed with creation
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tasks')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing required fields')) {
      // Guard threw error - field validation failed
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'שגיאה ביצירת משימה' },
      { status: 500 }
    )
  }
}
```

### 📖 Example: Creating an Event

```typescript
// src/app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateRequiredFields } from '@/lib/utils/validators'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Guard 2: Validate required fields for events
    validateRequiredFields(
      body,
      ['title', 'start_date', 'event_type'],
      'Event'
    )

    const supabase = createClient()
    const { data, error } = await supabase
      .from('events')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing required fields')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'שגיאה ביצירת אירוע' },
      { status: 500 }
    )
  }
}
```

### 🔍 What Gets Logged

```
[14:25:10] ERROR [Validator]{validateRequiredFields} INVARIANT VIOLATION: Missing required fields
📊 Data: {
  entityType: 'Task',
  missingFields: ['title', 'owner_name'],
  receivedData: { priority: 'high', status: 'pending' }
}
```

---

## Guard 3: Soft Delete Enforcement

**Location:** `src/lib/utils/db-operations.ts`

### ✅ How It Works

Enforces soft delete policy. Hard deletes require explicit confirmation + reason.

### 📖 Example: Deleting a Task (CORRECT)

```typescript
// src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { softDelete } from '@/lib/utils/db-operations'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Guard 3: Use soft delete (ALWAYS for user data)
    const result = await softDelete('tasks', params.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'המשימה נמחקה בהצלחה'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'שגיאה במחיקת משימה' },
      { status: 500 }
    )
  }
}
```

### 📖 Example: Custom Deleted Columns

```typescript
// For tables with different column names
const result = await softDelete('custom_table', recordId, {
  deletedAtColumn: 'removed_at',
  isDeletedColumn: 'archived'
})
```

### 📖 Example: Restoring a Deleted Record

```typescript
// src/app/api/tasks/[id]/restore/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { restoreDeleted } from '@/lib/utils/db-operations'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await restoreDeleted('tasks', params.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'המשימה שוחזרה בהצלחה'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'שגיאה בשחזור משימה' },
      { status: 500 }
    )
  }
}
```

### ⚠️ Example: Hard Delete (DANGEROUS - Rarely Used)

```typescript
// ONLY use for system cleanup, NOT user data!
import { hardDelete } from '@/lib/utils/db-operations'

// Example: Admin cleanup of system logs
export async function POST(request: NextRequest) {
  try {
    // Hard delete requires confirmation + reason
    const result = await hardDelete('system_logs', logId, {
      confirmed: true,
      reason: 'Admin cleanup: logs older than 90 days'
    })

    return NextResponse.json({ success: result.success })
  } catch (error) {
    // Guard will throw if confirmed: false
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'שגיאה' },
      { status: 400 }
    )
  }
}
```

### 🔍 What Gets Logged

**Soft Delete (Success):**
```
[14:30:15] INFO [DB]{softDelete} Soft delete operation
📊 Data: { table: 'tasks', id: 'abc-123' }

[14:30:15] SUCCESS [DB]{softDelete} Soft delete successful
📊 Data: { table: 'tasks', id: 'abc-123' }
```

**Hard Delete (Warning):**
```
[14:35:20] WARN [DB]{hardDelete} ⚠️ HARD DELETE OPERATION
📊 Data: {
  table: 'system_logs',
  id: 'xyz-789',
  reason: 'Admin cleanup: logs older than 90 days',
  timestamp: '2025-12-16T14:35:20.000Z'
}
```

---

## Guard 4: Hebrew Text Validation

**Location:** `src/lib/utils/validators.ts`

### ✅ How It Works

Validates Hebrew text contains Hebrew characters. Logs warning (doesn't block).

### 📖 Example: Validating Task Title

```typescript
// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateRequiredFields, validateHebrewText } from '@/lib/utils/validators'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Guard 2: Validate required fields
    validateRequiredFields(
      body,
      ['title', 'owner_name'],
      'Task'
    )

    // Guard 4: Validate Hebrew text (logs warning if no Hebrew)
    validateHebrewText(body.title, 'Task Title')

    if (body.description) {
      validateHebrewText(body.description, 'Task Description')
    }

    // Proceed with creation (even if no Hebrew - just warned)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tasks')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'שגיאה ביצירת משימה' },
      { status: 500 }
    )
  }
}
```

### 📖 Example: Validating Event Details

```typescript
// src/app/api/events/route.ts
import { validateHebrewText } from '@/lib/utils/validators'

export async function POST(request: NextRequest) {
  try {
    const { title, description, location } = await request.json()

    // Guard 4: Validate Hebrew in event fields
    validateHebrewText(title, 'Event Title')

    if (description) {
      validateHebrewText(description, 'Event Description')
    }

    if (location) {
      validateHebrewText(location, 'Event Location')
    }

    // Proceed with event creation...
  } catch (error) {
    // Handle error
  }
}
```

### 📖 Example: Validating Feedback

```typescript
// src/app/api/feedback/route.ts
import { validateHebrewText } from '@/lib/utils/validators'

export async function POST(request: NextRequest) {
  try {
    const { message, category } = await request.json()

    // Guard 4: Validate Hebrew feedback
    // (category might be English enum, skip validation)
    validateHebrewText(message, 'Feedback Message')

    // Create feedback...
  } catch (error) {
    // Handle error
  }
}
```

### 🔍 What Gets Logged

```
[14:40:25] WARN [Validator]{validateHebrewText} No Hebrew characters detected in text field
📊 Data: {
  fieldName: 'Task Title',
  text: 'Buy groceries',
  length: 13
}
```

**Note:** Guard 4 logs warnings but **doesn't block** the operation. It helps you spot potential issues during development.

---

## Guard 5: Calendar Duplicate Prevention

**Location:** `src/lib/utils/calendar-guards.ts`

### ✅ How It Works

Prevents creating duplicate Google Calendar events by checking `google_calendar_id`.

### 📖 Example: Safe Event Creation

```typescript
// src/app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { safeCreateEvent } from '@/lib/utils/calendar-guards'
import { validateRequiredFields } from '@/lib/utils/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Guard 2: Validate required fields
    validateRequiredFields(
      body,
      ['title', 'start_date', 'event_type'],
      'Event'
    )

    // Guard 5: Safe create with duplicate prevention
    const result = await safeCreateEvent({
      title: body.title,
      description: body.description,
      start_date: body.start_date,
      end_date: body.end_date,
      location: body.location,
      event_type: body.event_type,
      google_calendar_id: body.google_calendar_id // From Google Calendar API
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    if (result.isDuplicate) {
      // Event already exists - return existing ID
      return NextResponse.json({
        success: true,
        data: { id: result.eventId },
        message: 'האירוע כבר קיים במערכת',
        isDuplicate: true
      })
    }

    // New event created
    return NextResponse.json({
      success: true,
      data: { id: result.eventId },
      message: 'האירוע נוצר בהצלחה',
      isDuplicate: false
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'שגיאה ביצירת אירוע' },
      { status: 500 }
    )
  }
}
```

### 📖 Example: Manual Duplicate Check

```typescript
// src/app/api/events/sync/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { preventDuplicateEvent } from '@/lib/utils/calendar-guards'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { googleCalendarId, eventData } = await request.json()

    // Guard 5: Check for duplicates (throws if found)
    await preventDuplicateEvent(googleCalendarId, eventData.title)

    // No duplicate - safe to create
    const supabase = createClient()
    const { data, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        google_calendar_id: googleCalendarId
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      // Guard threw error - duplicate found
      return NextResponse.json(
        { error: 'האירוע כבר קיים במערכת' },
        { status: 409 } // Conflict
      )
    }

    return NextResponse.json(
      { error: 'שגיאה בסנכרון אירוע' },
      { status: 500 }
    )
  }
}
```

### 📖 Example: Batch Sync with Duplicate Handling

```typescript
// src/app/api/events/sync-batch/route.ts
import { safeCreateEvent } from '@/lib/utils/calendar-guards'

export async function POST(request: NextRequest) {
  try {
    const { events } = await request.json() // Array of events from Google Calendar

    const results = await Promise.all(
      events.map(async (event: any) => {
        // Guard 5: Safe create (handles duplicates automatically)
        const result = await safeCreateEvent({
          title: event.summary,
          description: event.description,
          start_date: event.start.dateTime,
          end_date: event.end.dateTime,
          location: event.location,
          event_type: 'school_event',
          google_calendar_id: event.id
        })

        return {
          googleId: event.id,
          success: result.success,
          isDuplicate: result.isDuplicate,
          eventId: result.eventId
        }
      })
    )

    const created = results.filter(r => r.success && !r.isDuplicate).length
    const duplicates = results.filter(r => r.isDuplicate).length
    const failed = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      summary: {
        total: events.length,
        created,
        duplicates,
        failed
      },
      results
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'שגיאה בסנכרון אירועים' },
      { status: 500 }
    )
  }
}
```

### 🔍 What Gets Logged

**Duplicate Found:**
```
[14:45:30] ERROR [Calendar]{checkDuplicate} INVARIANT VIOLATION: Duplicate calendar event detected
📊 Data: {
  googleCalendarId: 'xyz123',
  existingEventId: 'abc-456',
  existingEventTitle: 'אירוע בית ספר'
}
```

**Safe Create (Duplicate Skipped):**
```
[14:45:35] INFO [Calendar]{safeCreateEvent} Calendar event already exists, returning existing ID
📊 Data: {
  googleCalendarId: 'xyz123',
  existingId: 'abc-456'
}
```

---

## Guard 6: RTL Layout Verification

**Location:** `src/app/[locale]/layout.tsx`

### ✅ How It Works

Automatically verifies Hebrew/Arabic locales have RTL direction. Runs on every page load.

### 📖 Implementation

Guard is already active in the root layout component:

```typescript
// src/app/[locale]/layout.tsx
export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const direction = localeDirections[locale as Locale]

  // RUNTIME GUARD 6: RTL Layout Verification
  if ((locale === 'he' || locale === 'ar') && direction !== 'rtl') {
    logger.error('INVARIANT VIOLATION: Hebrew/Arabic locale without RTL direction', {
      component: 'Layout',
      action: 'LocaleLayout',
      data: { locale, direction }
    })
  }

  return (
    <html dir={direction} lang={locale}>
      {children}
    </html>
  )
}
```

### 📖 No Action Needed

This guard runs automatically on every page load. You don't need to call it manually.

### 🔍 What Gets Logged (If Bug Occurs)

```
[14:50:00] ERROR [Layout]{LocaleLayout} INVARIANT VIOLATION: Hebrew/Arabic locale without RTL direction
📊 Data: {
  locale: 'he',
  direction: 'ltr'  // BUG: Should be 'rtl'
}
```

**This would indicate a serious bug in locale configuration.**

---

## Complete API Route Examples

### Example 1: Full Task Creation with All Guards

```typescript
// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { validateRequiredFields, validateHebrewText } from '@/lib/utils/validators'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    // GUARD 1: Admin Authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'לא מאומת' },
        { status: 401 }
      )
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      // Guard 1 logged: "INVARIANT VIOLATION: JWT verification failed"
      return NextResponse.json(
        { error: 'טוקן לא תקין' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // GUARD 2: Required Fields Validation
    validateRequiredFields(
      body,
      ['title', 'owner_name', 'priority', 'status'],
      'Task'
    )

    // GUARD 4: Hebrew Text Validation
    validateHebrewText(body.title, 'Task Title')
    if (body.description) {
      validateHebrewText(body.description, 'Task Description')
    }

    // Create task
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tasks')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      data,
      success: true,
      message: 'המשימה נוצרה בהצלחה'
    })

  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing required fields')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'שגיאה ביצירת משימה' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // GUARD 1: Admin Authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: 'טוכן לא תקין' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'חסר מזהה משימה' },
        { status: 400 }
      )
    }

    // GUARD 3: Soft Delete Enforcement
    const { softDelete } = await import('@/lib/utils/db-operations')
    const result = await softDelete('tasks', id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'המשימה נמחקה בהצלחה'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'שגיאה במחיקת משימה' },
      { status: 500 }
    )
  }
}
```

### Example 2: Calendar Event with Duplicate Prevention

```typescript
// src/app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { validateRequiredFields, validateHebrewText } from '@/lib/utils/validators'
import { safeCreateEvent } from '@/lib/utils/calendar-guards'

export async function POST(request: NextRequest) {
  try {
    // GUARD 1: Admin Authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'לא מאומת' }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: 'טוקן לא תקין' }, { status: 401 })
    }

    const body = await request.json()

    // GUARD 2: Required Fields Validation
    validateRequiredFields(
      body,
      ['title', 'start_date', 'event_type'],
      'Event'
    )

    // GUARD 4: Hebrew Text Validation
    validateHebrewText(body.title, 'Event Title')
    if (body.description) {
      validateHebrewText(body.description, 'Event Description')
    }

    // GUARD 5: Calendar Duplicate Prevention
    const result = await safeCreateEvent({
      title: body.title,
      description: body.description,
      start_date: body.start_date,
      end_date: body.end_date,
      location: body.location,
      event_type: body.event_type,
      google_calendar_id: body.google_calendar_id
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { id: result.eventId },
      isDuplicate: result.isDuplicate,
      message: result.isDuplicate
        ? 'האירוע כבר קיים במערכת'
        : 'האירוע נוצר בהצלחה'
    })

  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing required fields')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'שגיאה ביצירת אירוע' },
      { status: 500 }
    )
  }
}
```

---

## 🎯 Best Practices

### ✅ **DO:**

1. **Always use soft delete for user data**
   ```typescript
   await softDelete('tasks', id)  // ✅ CORRECT
   ```

2. **Validate required fields before DB operations**
   ```typescript
   validateRequiredFields(data, ['title', 'owner'], 'Task')  // ✅ CORRECT
   await supabase.from('tasks').insert(data)
   ```

3. **Check Hebrew text in Hebrew fields**
   ```typescript
   validateHebrewText(title, 'Task Title')  // ✅ CORRECT
   ```

4. **Use safe create for calendar events**
   ```typescript
   await safeCreateEvent(eventData)  // ✅ CORRECT
   ```

5. **Verify JWT in protected routes**
   ```typescript
   const decoded = verifyJWT(token)  // ✅ CORRECT
   if (!decoded) return unauthorized()
   ```

### ❌ **DON'T:**

1. **Never hard delete user data**
   ```typescript
   await supabase.from('tasks').delete()  // ❌ WRONG
   ```

2. **Don't skip field validation**
   ```typescript
   // ❌ WRONG - No validation
   await supabase.from('tasks').insert(untrustedData)
   ```

3. **Don't create events without duplicate check**
   ```typescript
   // ❌ WRONG - Might create duplicates
   await supabase.from('events').insert({ google_calendar_id: id })
   ```

4. **Don't skip auth in admin routes**
   ```typescript
   // ❌ WRONG - No auth check
   export async function DELETE(request: NextRequest) {
     await deleteData()  // Anyone can delete!
   }
   ```

---

## 🔍 Monitoring Guards in Development

All guards log to console in **development mode only** via the logger.

### Check for Violations

```bash
# In terminal while dev server is running
# Watch for these messages:
[ERROR] INVARIANT VIOLATION: ...
```

### Example Console Output

```
[14:23:45] ERROR [Auth]{verifyJWT} INVARIANT VIOLATION: JWT verification failed
[14:25:10] ERROR [Validator]{validateRequiredFields} INVARIANT VIOLATION: Missing required fields
[14:30:15] INFO [DB]{softDelete} Soft delete operation
[14:35:20] WARN [DB]{hardDelete} ⚠️ HARD DELETE OPERATION
[14:40:25] WARN [Validator]{validateHebrewText} No Hebrew characters detected
[14:45:30] ERROR [Calendar]{checkDuplicate} INVARIANT VIOLATION: Duplicate calendar event
[14:50:00] ERROR [Layout]{LocaleLayout} INVARIANT VIOLATION: Hebrew locale without RTL
```

---

## 📚 Related Documentation

- **Development Rules:** `/Docs/infrustructure/baseRules.md`
- **Bug Log:** `/Docs/development/bugs.md`
- **Project Guide:** `/CLAUDE.md`

---

## 🚀 Quick Start Checklist

When creating a new API route:

- [ ] Add admin auth check (Guard 1)
- [ ] Validate required fields (Guard 2)
- [ ] Use soft delete for deletions (Guard 3)
- [ ] Validate Hebrew text (Guard 4)
- [ ] Check calendar duplicates if syncing (Guard 5)
- [ ] RTL verification runs automatically (Guard 6)

---

**Last Updated:** 2025-12-16
**Status:** Active - All guards implemented and monitoring
