# Highlights API - Before & After Guards Demo

> **Purpose:** Demonstrate all 6 runtime guards in a real API route
> **File:** `src/app/api/highlights/route.ts`
> **Date:** 2025-12-16

---

## 📊 Overview

This document shows the **before and after** of implementing all 6 runtime guards in the Highlights API route.

---

## ❌ BEFORE: Current Code Issues

### Issues Found:

1. ❌ **No INVARIANT logging** - Just console.log (Guard 1)
2. ❌ **No Hebrew text validation** - Might accept English text (Guard 4)
3. ❌ **HARD DELETE** - Uses `.delete()` instead of soft delete (Guard 3)
4. ❌ **No required fields helper** - Zod validation is good, but no runtime guard logging (Guard 2)

### Current DELETE Code (DANGEROUS):

```typescript
// ❌ PROBLEM: Hard delete!
export async function DELETE(req: NextRequest) {
  const { error } = await supabase
    .from('highlights')
    .delete()  // ❌ HARD DELETE - data is gone forever!
    .neq('id', '00000000-0000-0000-0000-000000000000')

  return NextResponse.json({ success: true })
}
```

---

## ✅ AFTER: Improved Code with All Guards

### New Implementation:

```typescript
// src/app/api/highlights/route.ts (IMPROVED VERSION)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'  // ✅ Guard 1
import { validateRequiredFields, validateHebrewText } from '@/lib/utils/validators'  // ✅ Guards 2 & 4
import { softDelete } from '@/lib/utils/db-operations'  // ✅ Guard 3
import { logger } from '@/lib/logger'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Validation schema
const HighlightSchema = z.object({
  type: z.enum(['achievement', 'sports', 'award', 'event', 'announcement']),
  icon: z.string().min(1, 'אייקון נדרש'),
  title_he: z.string().min(2, 'כותרת בעברית חייבת להכיל לפחות 2 תווים'),
  title_ru: z.string().optional().default(''),
  description_he: z.string().min(10, 'תיאור בעברית חייב להכיל לפחות 10 תווים'),
  description_ru: z.string().optional().default(''),
  category_he: z.string().min(2, 'קטגוריה בעברית חייבת להכיל לפחות 2 תווים'),
  category_ru: z.string().optional().default(''),
  event_date: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  image_placeholder: z.string().optional().nullable(),
  cta_text_he: z.string().optional().nullable(),
  cta_text_ru: z.string().optional().nullable(),
  cta_link: z.string().optional().nullable(),
  badge_color: z.string().default('bg-gradient-to-r from-blue-400 to-blue-500 text-blue-900'),
  is_active: z.boolean().default(true),
  display_order: z.number().default(0),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  share_text_he: z.string().optional().nullable(),
  share_text_ru: z.string().optional().nullable(),
})

/**
 * GET /api/highlights
 * Public endpoint - returns active highlights
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)

    const showAll = searchParams.get('all') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10

    let query = supabase
      .from('highlights')
      .select('*')

    if (!showAll) {
      // Public view: only active highlights within date range
      const now = new Date().toISOString()

      query = query
        .eq('is_active', true)
        .or(`and(start_date.is.null,end_date.is.null),and(start_date.is.null,end_date.gte.${now}),and(start_date.lte.${now},end_date.is.null),and(start_date.lte.${now},end_date.gte.${now})`)
    }

    query = query
      .order('display_order', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 50))

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch highlights', {
        component: 'Highlights',
        action: 'GET',
        error
      })

      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת ההדגשות' },
        { status: 500 }
      )
    }

    logger.success(`Fetched ${data?.length || 0} highlights`, {
      component: 'Highlights',
      action: 'GET',
      data: { count: data?.length, showAll }
    })

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    logger.error('Exception fetching highlights', {
      component: 'Highlights',
      action: 'GET',
      error
    })

    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת ההדגשות' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/highlights
 * Admin only - create new highlight
 *
 * GUARDS ACTIVE:
 * - Guard 1: Admin authentication
 * - Guard 2: Required fields validation
 * - Guard 4: Hebrew text validation
 */
export async function POST(req: NextRequest) {
  try {
    // ✅ GUARD 1: Admin Authentication
    const token = req.cookies.get('auth-token')
    if (!token) {
      logger.warn('Unauthorized highlight creation attempt - no token', {
        component: 'Highlights',
        action: 'POST'
      })

      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const decoded = verifyJWT(token.value)
    if (!decoded) {
      // Guard 1 already logged: "INVARIANT VIOLATION: JWT verification failed"
      return NextResponse.json(
        { success: false, error: 'טוכן לא תקין' },
        { status: 401 }
      )
    }

    logger.info('Admin creating highlight', {
      component: 'Highlights',
      action: 'POST',
      data: { admin: decoded.role }
    })

    const body = await req.json()

    // Zod validation
    const validation = HighlightSchema.safeParse(body)

    if (!validation.success) {
      logger.error('Highlight validation failed', {
        component: 'Highlights',
        action: 'POST',
        data: { errors: validation.error.errors }
      })

      const fieldNames: Record<string, string> = {
        'icon': 'אייקון',
        'title_he': 'כותרת בעברית',
        'description_he': 'תיאור בעברית',
        'category_he': 'קטגוריה בעברית',
        'type': 'סוג הדגשה',
      }

      const errors = validation.error.errors.map(err => {
        const field = err.path[0] as string
        const hebrewName = fieldNames[field] || field
        return `${hebrewName}: ${err.message}`
      })

      return NextResponse.json(
        {
          success: false,
          error: 'יש למלא את כל השדות החובה',
          details: errors
        },
        { status: 400 }
      )
    }

    // ✅ GUARD 2: Required Fields Validation
    // (Additional runtime check on top of Zod)
    try {
      validateRequiredFields(
        validation.data,
        ['icon', 'title_he', 'description_he', 'category_he', 'type'],
        'Highlight'
      )
    } catch (error) {
      // Guard 2 logged: "INVARIANT VIOLATION: Missing required fields"
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'שדות חסרים' },
        { status: 400 }
      )
    }

    // ✅ GUARD 4: Hebrew Text Validation
    // Validate Hebrew fields contain Hebrew characters
    validateHebrewText(validation.data.title_he, 'Highlight Title (Hebrew)')
    validateHebrewText(validation.data.description_he, 'Highlight Description (Hebrew)')
    validateHebrewText(validation.data.category_he, 'Highlight Category (Hebrew)')

    if (validation.data.cta_text_he) {
      validateHebrewText(validation.data.cta_text_he, 'CTA Text (Hebrew)')
    }

    if (validation.data.share_text_he) {
      validateHebrewText(validation.data.share_text_he, 'Share Text (Hebrew)')
    }

    // Create highlight
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('highlights')
      .insert([validation.data])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create highlight', {
        component: 'Highlights',
        action: 'POST',
        error
      })

      return NextResponse.json(
        { success: false, error: 'שגיאה ביצירת הדגשה', details: error.message },
        { status: 500 }
      )
    }

    logger.success('Highlight created successfully', {
      component: 'Highlights',
      action: 'POST',
      data: { id: data.id, title: validation.data.title_he }
    })

    return NextResponse.json({
      success: true,
      data,
      message: 'הדגשה נוצרה בהצלחה'
    })

  } catch (error) {
    logger.error('Exception creating highlight', {
      component: 'Highlights',
      action: 'POST',
      error
    })

    return NextResponse.json(
      { success: false, error: 'שגיאה ביצירת הדגשה' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/highlights
 * Admin only - soft delete all highlights
 *
 * GUARDS ACTIVE:
 * - Guard 1: Admin authentication
 * - Guard 3: Soft delete enforcement
 */
export async function DELETE(req: NextRequest) {
  try {
    // ✅ GUARD 1: Admin Authentication
    const token = req.cookies.get('auth-token')
    if (!token) {
      logger.warn('Unauthorized delete attempt - no token', {
        component: 'Highlights',
        action: 'DELETE'
      })

      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const decoded = verifyJWT(token.value)
    if (!decoded) {
      // Guard 1 already logged: "INVARIANT VIOLATION: JWT verification failed"
      return NextResponse.json(
        { success: false, error: 'טוכן לא תקין' },
        { status: 401 }
      )
    }

    logger.warn('⚠️ Admin attempting to delete all highlights', {
      component: 'Highlights',
      action: 'DELETE',
      data: { admin: decoded.role }
    })

    // ✅ GUARD 3: Soft Delete Enforcement
    // Get all highlight IDs first
    const supabase = await createClient()

    const { data: highlights, error: fetchError } = await supabase
      .from('highlights')
      .select('id')
      .eq('is_deleted', false) // Only get non-deleted highlights

    if (fetchError) {
      logger.error('Failed to fetch highlights for deletion', {
        component: 'Highlights',
        action: 'DELETE',
        error: fetchError
      })

      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת ההדגשות' },
        { status: 500 }
      )
    }

    if (!highlights || highlights.length === 0) {
      logger.info('No highlights to delete', {
        component: 'Highlights',
        action: 'DELETE'
      })

      return NextResponse.json({
        success: true,
        message: 'אין הדגשות למחיקה',
        deletedCount: 0
      })
    }

    // Soft delete each highlight
    const deleteResults = await Promise.all(
      highlights.map(highlight => softDelete('highlights', highlight.id))
    )

    const successCount = deleteResults.filter(r => r.success).length
    const failCount = deleteResults.filter(r => !r.success).length

    if (failCount > 0) {
      logger.error('Some highlights failed to delete', {
        component: 'Highlights',
        action: 'DELETE',
        data: { total: highlights.length, success: successCount, failed: failCount }
      })

      return NextResponse.json(
        {
          success: false,
          error: `${failCount} הדגשות נכשלו במחיקה`,
          details: { total: highlights.length, success: successCount, failed: failCount }
        },
        { status: 500 }
      )
    }

    logger.success(`All ${successCount} highlights soft deleted`, {
      component: 'Highlights',
      action: 'DELETE',
      data: { deletedCount: successCount }
    })

    return NextResponse.json({
      success: true,
      message: `${successCount} הדגשות נמחקו בהצלחה`,
      deletedCount: successCount
    })

  } catch (error) {
    logger.error('Exception deleting highlights', {
      component: 'Highlights',
      action: 'DELETE',
      error
    })

    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת ההדגשות' },
      { status: 500 }
    )
  }
}
```

---

## 🔍 What Changed - Line by Line

### Before (Lines 88-97):
```typescript
// ❌ Just checking token exists, no structured logging
export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth-token')
  if (!token || !verifyJWT(token.value)) {
    return NextResponse.json({ error: 'נדרשת הרשאת מנהל' }, { status: 401 })
  }
```

### After:
```typescript
// ✅ GUARD 1: Structured auth check with logging
export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth-token')
  if (!token) {
    logger.warn('Unauthorized attempt - no token', { ... })
    return NextResponse.json({ error: 'נדרשת הרשאת מנהל' }, { status: 401 })
  }

  const decoded = verifyJWT(token.value)  // Guard 1 logs failures
  if (!decoded) {
    return NextResponse.json({ error: 'טוכן לא תקין' }, { status: 401 })
  }
```

### Before (Lines 99-130):
```typescript
// ❌ Only Zod validation, no runtime guard logging
const validation = HighlightSchema.safeParse(body)
if (!validation.success) {
  console.error('[Highlights POST] ❌ Validation errors:', ...)
  return NextResponse.json({ error: '...' }, { status: 400 })
}
```

### After:
```typescript
// ✅ GUARDS 2 & 4: Zod + Runtime guards + Hebrew validation
const validation = HighlightSchema.safeParse(body)
if (!validation.success) {
  logger.error('Validation failed', { ... })
  return NextResponse.json({ error: '...' }, { status: 400 })
}

// ✅ GUARD 2: Additional runtime check
validateRequiredFields(validation.data, [...], 'Highlight')

// ✅ GUARD 4: Hebrew text validation
validateHebrewText(validation.data.title_he, 'Highlight Title')
validateHebrewText(validation.data.description_he, 'Description')
validateHebrewText(validation.data.category_he, 'Category')
```

### Before (Lines 165-205):
```typescript
// ❌ DANGEROUS: Hard delete!
export async function DELETE(req: NextRequest) {
  const { error } = await supabase
    .from('highlights')
    .delete()  // ❌ Data is gone forever!
    .neq('id', '00000000-0000-0000-0000-000000000000')

  console.log('[Highlights DELETE] ✅ All highlights deleted')
  return NextResponse.json({ success: true })
}
```

### After:
```typescript
// ✅ GUARD 3: Safe soft delete
export async function DELETE(req: NextRequest) {
  // Fetch all highlight IDs
  const { data: highlights } = await supabase
    .from('highlights')
    .select('id')
    .eq('is_deleted', false)

  // ✅ Soft delete each one (Guard 3 logs each operation)
  const results = await Promise.all(
    highlights.map(h => softDelete('highlights', h.id))
  )

  logger.success(`${successCount} highlights soft deleted`, { ... })
  return NextResponse.json({ deletedCount: successCount })
}
```

---

## 📊 Console Output Comparison

### Before (Basic console.log):
```
[Highlights POST] Request body: { ... }
[Highlights POST] ✅ Highlight created: abc-123
[Highlights DELETE] ✅ All highlights deleted
```

### After (Structured Guard Logging):
```
[14:30:00] INFO [Highlights]{POST} Admin creating highlight
📊 Data: { admin: 'admin' }

[14:30:01] WARN [Validator]{validateHebrewText} No Hebrew characters detected in text field
📊 Data: { fieldName: 'Highlight Title (Hebrew)', text: 'Test Event', length: 10 }

[14:30:02] SUCCESS [Highlights]{POST} Highlight created successfully
📊 Data: { id: 'abc-123', title: 'אירוע בית ספר' }

[14:35:00] WARN [Highlights]{DELETE} ⚠️ Admin attempting to delete all highlights
📊 Data: { admin: 'admin' }

[14:35:01] INFO [DB]{softDelete} Soft delete operation
📊 Data: { table: 'highlights', id: 'abc-123' }

[14:35:01] SUCCESS [DB]{softDelete} Soft delete successful
📊 Data: { table: 'highlights', id: 'abc-123' }

[14:35:02] SUCCESS [Highlights]{DELETE} All 5 highlights soft deleted
📊 Data: { deletedCount: 5 }
```

---

## 🎯 Benefits of Guards

### 1. **Better Debugging**
**Before:**
```
[Highlights POST] ❌ Validation errors: [Object object]
```

**After:**
```
[14:30:01] ERROR [Highlights]{POST} Highlight validation failed
📊 Data: {
  errors: [
    { path: ['title_he'], message: 'כותרת בעברית חייבת להכיל לפחות 2 תווים' }
  ]
}
```

### 2. **Data Integrity**
**Before:** Deleting highlights → data gone forever ❌

**After:** Soft delete → data preserved, can restore ✅

### 3. **Security Audit Trail**
**Before:** No log of who deleted data

**After:**
```
[14:35:00] WARN [Highlights]{DELETE} ⚠️ Admin attempting to delete all highlights
📊 Data: { admin: 'admin' }
```

### 4. **Hebrew Content Quality**
**Before:** Could create highlights with English text

**After:** Logs warning if Hebrew field has no Hebrew characters
```
[14:30:01] WARN [Validator]{validateHebrewText} No Hebrew characters detected
```

---

## 🚀 How to Apply This to Other Routes

1. **Read the existing route**
2. **Identify missing guards:**
   - No structured logging? → Add logger
   - No Hebrew validation? → Add Guard 4
   - Hard delete? → Replace with Guard 3
   - No auth logging? → Enhance Guard 1

3. **Copy guard patterns** from this example
4. **Test with type-check:** `npm run type-check`
5. **Verify logs** in development console

---

## ✅ Checklist for Every API Route

- [ ] Guard 1: Admin auth with structured logging
- [ ] Guard 2: Required fields validation
- [ ] Guard 3: Use soft delete (never hard delete user data)
- [ ] Guard 4: Validate Hebrew text in Hebrew fields
- [ ] Guard 5: Check calendar duplicates (if syncing)
- [ ] Guard 6: RTL verification (automatic in layout)

---

**This demonstrates the power of runtime guards in a real production API!**
