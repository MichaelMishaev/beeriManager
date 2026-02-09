# Performance Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all P0 and P1 performance issues found in the 4-agent audit — removing dead weight (~7.6MB), parallelizing sequential DB queries, and laying groundwork for React Query adoption.

**Architecture:** Surgical, file-by-file fixes grouped into phases. Phase 1 is pure removal (zero risk). Phase 2 is query optimization (low risk). Phase 3 is dynamic imports and font cleanup (medium risk). Each task is independently committable and testable.

**Tech Stack:** Next.js 14, Supabase, TypeScript, Playwright for verification

---

## Phase 1: Remove Dead Weight (Zero Risk)

### Task 1: Remove 7 unused dependencies from package.json

**Files:**
- Modify: `package.json:106,109-111,74,121,92`

**Step 1: Remove unused production dependencies**

Run:
```bash
npm uninstall recharts react-big-calendar react-intersection-observer react-pull-to-refresh @tanstack/react-virtual zustand ical-generator
```

These packages have ZERO imports anywhere in `src/`. Verified by grep.

**Step 2: Move misplaced packages to devDependencies**

Run:
```bash
npm uninstall @tanstack/react-query-devtools concurrently @types/bcryptjs @types/jsonwebtoken @types/node @types/qrcode @types/react @types/react-dom @types/web-push
npm install -D @tanstack/react-query-devtools concurrently @types/bcryptjs @types/jsonwebtoken @types/node @types/qrcode @types/react @types/react-dom @types/web-push
```

**Step 3: Verify the build still works**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 4: Verify type-check passes**

Run: `npm run type-check`
Expected: No TypeScript errors.

**Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "perf: remove 7 unused dependencies and move @types to devDependencies"
```

---

### Task 2: Remove dead Material Symbols font (3.8MB)

**Files:**
- Delete: `public/fonts/material-symbols-outlined.woff2`
- Delete: `src/components/MaterialSymbols.tsx`
- Modify: `src/app/globals.css:1-29` (remove @font-face and .material-symbols-outlined class)

**Step 1: Verify Material Symbols is not used anywhere**

Search for any usage of `material-symbols` class in JSX/HTML (excluding the component file itself and CSS definition). Expected: zero matches in components/pages.

**Step 2: Remove the font file**

```bash
rm public/fonts/material-symbols-outlined.woff2
```

**Step 3: Remove the MaterialSymbols component**

```bash
rm src/components/MaterialSymbols.tsx
```

**Step 4: Remove the @font-face and .material-symbols-outlined CSS from globals.css**

In `src/app/globals.css`, delete lines 1-29 (the `@font-face` block for Material Symbols and the `.material-symbols-outlined` class). The file should start with `@tailwind base;` (currently line 10).

**Step 5: Remove the phantom HebrewFont @font-face**

In `src/app/globals.css`, delete lines 190-196 (after previous edit, line numbers will shift). This references `/fonts/hebrew.woff2` which does NOT exist in the filesystem, causing a silent 404 on every page load. Heebo via `next/font/google` already handles Hebrew text.

```css
/* DELETE THIS BLOCK */
@font-face {
  font-family: 'HebrewFont';
  src: url('/fonts/hebrew.woff2') format('woff2');
  font-display: swap;
  unicode-range: U+0590-05FF, U+FB1D-FB4F;
}
```

**Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 7: Commit**

```bash
git add -u src/app/globals.css src/components/MaterialSymbols.tsx public/fonts/material-symbols-outlined.woff2
git commit -m "perf: remove unused Material Symbols font (3.8MB) and phantom HebrewFont reference"
```

---

### Task 3: Remove old service worker backup files

**Files:**
- Delete: `public/sw 2.js` through `public/sw 17.js` (16 files)
- Delete: all `public/sw.js *.map` and `public/sw *.js.map` files

**Step 1: List and remove old SW backup files**

```bash
rm "public/sw 2.js" "public/sw 3.js" "public/sw 4.js" "public/sw 5.js" "public/sw 6.js" "public/sw 7.js" "public/sw 8.js" "public/sw 9.js" "public/sw 10.js" "public/sw 11.js" "public/sw 12.js" "public/sw 13.js" "public/sw 14.js" "public/sw 15.js" "public/sw 16.js" "public/sw 17.js"
```

Also remove any `.map` files associated with old SWs.

**Step 2: Verify sw.js and sw-custom.js still exist**

```bash
ls public/sw.js public/sw-custom.js
```
Expected: Both files exist.

**Step 3: Commit**

```bash
git add -u public/
git commit -m "chore: remove 16 old service worker backup files"
```

---

### Task 4: Move logo-source.png out of public/

**Files:**
- Move: `public/logo-source.png` to project root or `assets/` (not served by CDN)

**Step 1: Check if logo-source.png is referenced anywhere in code**

Search `src/` for `logo-source`. Expected: zero matches (it's a raw design source file).

**Step 2: Move to assets directory (outside public)**

```bash
mkdir -p assets
mv public/logo-source.png assets/logo-source.png
```

**Step 3: Commit**

```bash
git add assets/logo-source.png
git rm public/logo-source.png
git commit -m "perf: move 3.6MB logo source file out of public directory"
```

---

## Phase 2: Parallelize Sequential Database Queries

### Task 5: Parallelize search queries with Promise.all

**Files:**
- Modify: `src/lib/search.ts:54-162` (performSearch function)
- Modify: `src/lib/search.ts:213-251` (getSearchSuggestions function)

**Step 1: Refactor performSearch to use Promise.all**

Replace the 5 sequential Supabase queries (events, tasks, issues, protocols, vendors) with `Promise.all()`. Each query is independent — they search different tables with the same `searchTerm`.

Current pattern (lines 54-162):
```typescript
// Sequential - each waits for the previous
const { data: events } = await supabase.from('events')...
const { data: tasks } = await supabase.from('tasks')...
const { data: issues } = await supabase.from('issues')...
const { data: protocols } = await supabase.from('protocols')...
const { data: vendors } = await supabase.from('vendors')...
```

New pattern:
```typescript
// Build query promises array based on searchTypes
const queries: Promise<any>[] = []
const queryTypes: SearchType[] = []

if (searchTypes.includes('events')) {
  queries.push(
    supabase.from('events')
      .select('id, title, description, start_datetime, location')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .eq('status', 'published')
      .limit(limit)
  )
  queryTypes.push('events')
}
// ... same for tasks, issues, protocols, vendors

const results = await Promise.all(queries)

// Map results back to SearchResult[]
results.forEach((result, index) => {
  const { data } = result
  if (!data) return
  const type = queryTypes[index]
  // ... existing mapping logic per type
})
```

**Step 2: Refactor getSearchSuggestions to use Promise.all**

Same pattern for lines 213-251. The 3 sequential queries (events, tasks, protocols) become parallel.

```typescript
const [eventsResult, tasksResult, protocolsResult] = await Promise.all([
  supabase.from('events').select('title').ilike('title', searchTerm).eq('status', 'published').limit(limit),
  supabase.from('tasks').select('title').ilike('title', searchTerm).limit(limit),
  supabase.from('protocols').select('title').ilike('title', searchTerm).eq('is_public', true).limit(limit),
])
```

**Step 3: Verify type-check**

Run: `npm run type-check`
Expected: No errors.

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add src/lib/search.ts
git commit -m "perf: parallelize search queries with Promise.all (~400-800ms faster)"
```

---

### Task 6: Parallelize notification count queries

**Files:**
- Modify: `src/app/api/notifications/counts/route.ts:34-85`

**Step 1: Refactor to use Promise.all**

The 3 count queries (tasks, ideas, feedback) on lines 34-85 are independent. They currently execute sequentially. Wrap them in `Promise.all()`.

Build queries first (lines 34-43, 52-61, 69-78 remain the same), then execute together:

```typescript
// Build queries (existing code)
const tasksQuery = supabase.from('tasks').select('id, created_at', { count: 'exact', head: false })...
const ideasQuery = supabase.from('ideas').select('id, created_at', { count: 'exact', head: false })...
const feedbackQuery = supabase.from('anonymous_feedback').select('id, created_at', { count: 'exact', head: false })...

// Execute in parallel (NEW)
const [
  { data: tasksData, count: tasksCount, error: tasksError },
  { data: ideasData, count: ideasCount, error: ideasError },
  { data: feedbackData, count: feedbackCount, error: feedbackError }
] = await Promise.all([tasksQuery, ideasQuery, feedbackQuery])
```

**Step 2: Verify type-check**

Run: `npm run type-check`

**Step 3: Commit**

```bash
git add src/app/api/notifications/counts/route.ts
git commit -m "perf: parallelize notification count queries (~100-200ms faster)"
```

---

### Task 7: Fix N+1 DELETE loop in tasks route

**Files:**
- Modify: `src/app/api/tasks/route.ts:208-221`

**Step 1: Replace the for-loop delete with bulk delete**

Current code (lines 208-221):
```typescript
// Delete each task individually to satisfy audit trigger
let deletedCount = 0
for (const task of allTasks) {
  const { error } = await supabase.from('tasks').delete().eq('id', task.id)
  if (!error) deletedCount++
}
```

New code:
```typescript
const taskIds = allTasks.map(t => t.id)
const { error: deleteError, count } = await supabase
  .from('tasks')
  .delete()
  .in('id', taskIds)

if (deleteError) {
  console.error('Bulk delete error:', deleteError)
  return NextResponse.json(
    { success: false, error: 'שגיאה במחיקת המשימות' },
    { status: 500 }
  )
}
const deletedCount = count || taskIds.length
```

**NOTE**: The comment says "to satisfy audit trigger". If there IS a per-row audit trigger in Supabase that needs to fire per-row, Supabase's `.in()` bulk delete DOES fire row-level triggers for each deleted row. So this is safe.

**Step 2: Apply same pattern to events and vendors DELETE routes**

Check `src/app/api/events/route.ts` and `src/app/api/vendors/route.ts` for the same N+1 delete loop and apply the same `.in('id', ids)` fix.

**Step 3: Verify type-check**

Run: `npm run type-check`

**Step 4: Commit**

```bash
git add src/app/api/tasks/route.ts src/app/api/events/route.ts src/app/api/vendors/route.ts
git commit -m "perf: replace N+1 DELETE loops with bulk .in() deletes (100x faster)"
```

---

## Phase 3: Dynamic Imports & Bundle Optimization

### Task 8: Convert html2canvas + jspdf to dynamic imports

**Files:**
- Modify: `src/components/features/protocols/RegulationsModalContent.tsx:11-12`
- Modify: `src/app/[locale]/(admin)/admin/meetings/[id]/page.tsx:13-14`

**Step 1: Fix RegulationsModalContent.tsx**

Remove static imports at top:
```typescript
// DELETE these lines (11-12):
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
```

In the export function (around line 58 where `html2canvas` is used), convert to dynamic:
```typescript
const handleExportPDF = async () => {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf')
  ])
  // ... rest of existing export logic unchanged
}
```

**Step 2: Fix meetings/[id]/page.tsx**

Same pattern — remove static imports (lines 13-14), convert to dynamic imports inside the handler (around line 97).

**Step 3: Verify type-check**

Run: `npm run type-check`

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds. The meetings and protocols pages should have smaller client bundles.

**Step 5: Commit**

```bash
git add src/components/features/protocols/RegulationsModalContent.tsx src/app/[locale]/(admin)/admin/meetings/[id]/page.tsx
git commit -m "perf: dynamic import html2canvas + jspdf (~300KB saved from client bundle)"
```

---

### Task 9: Replace googleapis with @googleapis/drive

**Files:**
- Modify: `src/app/api/upload/google-drive/route.ts:2`
- Modify: `package.json` (swap dependency)

**Step 1: Install the single-service package**

```bash
npm uninstall googleapis
npm install @googleapis/drive
```

**Step 2: Update the import in the route file**

Read `src/app/api/upload/google-drive/route.ts` fully to understand the usage pattern.

Replace:
```typescript
import { google } from 'googleapis'
```

With:
```typescript
import { drive_v3, auth as googleAuth } from '@googleapis/drive'
```

Then update the Drive client instantiation. The exact change depends on how `google.drive()` is called. Typically:
```typescript
// Old: const drive = google.drive({ version: 'v3', auth })
// New: const drive = new drive_v3.Drive({ auth })
```

Read the file carefully and adjust the auth setup accordingly.

**Step 3: Verify type-check**

Run: `npm run type-check`

**Step 4: Test the Google Drive upload endpoint**

If possible, test with a real upload. Otherwise verify build passes.

Run: `npm run build`

**Step 5: Commit**

```bash
git add package.json package-lock.json src/app/api/upload/google-drive/route.ts
git commit -m "perf: replace googleapis (186MB) with @googleapis/drive (~5MB)"
```

---

### Task 10: Consolidate JWT libraries (jsonwebtoken -> jose)

**Files:**
- Modify: `src/lib/auth/jwt.ts` (currently uses `jsonwebtoken`)
- Reference: `src/lib/auth/jwt-edge.ts` (already uses `jose`)
- Modify: `package.json` (remove jsonwebtoken)

**Step 1: Read both JWT files to understand the API surface**

Read `src/lib/auth/jwt.ts` and `src/lib/auth/jwt-edge.ts`. Identify all exported functions from `jwt.ts` (sign, verify, decode).

**Step 2: Rewrite jwt.ts to use jose instead of jsonwebtoken**

The `jose` API is:
```typescript
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function signJWT(payload: object): Promise<string> {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyJWT(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload
}
```

**IMPORTANT**: `jose` functions are async while `jsonwebtoken` functions are sync. Check all call sites of `jwt.ts` functions and add `await` if needed.

**Step 3: Find all imports of jwt.ts and verify they handle async**

```bash
grep -rn "from '@/lib/auth/jwt'" src/ --include="*.ts" --include="*.tsx"
```

Update any call sites that expect synchronous results.

**Step 4: Remove jsonwebtoken**

```bash
npm uninstall jsonwebtoken @types/jsonwebtoken
```

**Step 5: Verify type-check and build**

Run: `npm run type-check && npm run build`

**Step 6: Commit**

```bash
git add src/lib/auth/jwt.ts package.json package-lock.json
git commit -m "refactor: consolidate JWT to jose only (remove jsonwebtoken duplicate)"
```

---

## Phase 4: Quick React Performance Wins

### Task 11: Add React.memo to list item components

**Files:**
- Modify: `src/components/features/tasks/TaskCard.tsx`
- Modify: `src/components/features/events/EventCard.tsx`
- Modify: `src/components/features/grocery/GroceryItem.tsx`
- Modify: `src/components/features/prom/quotes/QuoteCard.tsx`

**Step 1: Wrap each component export with React.memo**

For each file, change:
```typescript
export function TaskCard({ task, ... }: TaskCardProps) {
```
To:
```typescript
export const TaskCard = memo(function TaskCard({ task, ... }: TaskCardProps) {
  // ... existing body
})
```

Add `import { memo } from 'react'` at the top of each file.

Do this for: `TaskCard`, `EventCard`, `GroceryItem`, `QuoteCard`.

**Step 2: Verify type-check**

Run: `npm run type-check`

**Step 3: Commit**

```bash
git add src/components/features/tasks/TaskCard.tsx src/components/features/events/EventCard.tsx src/components/features/grocery/GroceryItem.tsx src/components/features/prom/quotes/QuoteCard.tsx
git commit -m "perf: add React.memo to list item components to prevent unnecessary re-renders"
```

---

### Task 12: Wrap inline callbacks with useCallback in TasksPageClient

**Files:**
- Modify: `src/components/features/tasks/TasksPageClient.tsx`

**Step 1: Read the file to identify inline arrow functions in .map() loops**

Look for patterns like:
```typescript
onComplete={(comment) => handleTaskComplete(task.id, comment)}
```

**Step 2: Create stable callback factories or use useCallback**

For callbacks that receive an `id` parameter, create a stable handler pattern:

```typescript
const handleComplete = useCallback((taskId: string, comment?: string) => {
  handleTaskComplete(taskId, comment)
}, [handleTaskComplete])
```

Then in JSX:
```typescript
onComplete={(comment) => handleComplete(task.id, comment)}
```

Note: The inner `(comment) => handleComplete(task.id, comment)` still creates a new reference per item. For full optimization, the child component (TaskCard) should accept `taskId` as a prop and call `onComplete(taskId, comment)` internally. But React.memo (Task 11) already helps significantly here.

**Step 3: Verify type-check**

Run: `npm run type-check`

**Step 4: Commit**

```bash
git add src/components/features/tasks/TasksPageClient.tsx
git commit -m "perf: stabilize callbacks with useCallback in TasksPageClient"
```

---

## Verification

### Task 13: Final build verification and size comparison

**Step 1: Run full build**

```bash
npm run build
```

Expected: Build succeeds. Note the page sizes reported by Next.js build output.

**Step 2: Run type-check**

```bash
npm run type-check
```

Expected: No errors.

**Step 3: Run lint**

```bash
npm run lint
```

Expected: No new lint errors.

**Step 4: Run Playwright tests**

```bash
npm test
```

Expected: All existing tests pass.

**Step 5: Final commit (if any lint/type fixes needed)**

```bash
git commit -m "perf: fix any lint/type issues from performance optimization"
```

---

## Summary of Expected Impact

| Phase | Tasks | Key Savings |
|-------|-------|-------------|
| Phase 1 (Remove) | Tasks 1-4 | -7.6MB first load, -200MB node_modules |
| Phase 2 (Parallelize) | Tasks 5-7 | -400-800ms search, -5-10s bulk delete |
| Phase 3 (Dynamic) | Tasks 8-10 | -300KB client bundle, -180MB disk |
| Phase 4 (React) | Tasks 11-12 | Fewer re-renders on list interactions |
| Verify | Task 13 | Confirm everything works |
