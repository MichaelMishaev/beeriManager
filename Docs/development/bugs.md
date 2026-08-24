# Bug Log - BeeriManager

> **Purpose:** Track production bugs with root cause analysis and prevention rules
> **Updated:** As bugs occur
> **Format:** Chronological (newest first)

---

## How to Use This Log

When a production bug is fixed:

1. Write failing test FIRST
2. Fix the bug
3. Verify test passes
4. Add entry to this log (use template below)

**Template:**
```markdown
## [YYYY-MM-DD] Bug Title

**Problem:** [What broke and how users were affected]

**Root Cause:** [WHY it happened - be specific]

**Solution:** [What was changed]

**Prevention Rule:** [How to avoid this pattern in future]

**Files Changed:** [List files]

**Test Added:** [Path to regression test]
```

---

## Bugs (Newest First)

## [2026-08-24] Share/close buttons overlapping modal title on mobile

**Problem:** On mobile, the "Highlight details" modal (`HighlightsCarousel.tsx`) and the "Event details" modal (`PublicHomepage.tsx`) rendered the `ShareButton` inside the `DialogHeader` flex row next to `DialogTitle`. In RTL, that row places the second flex child (`ShareButton`) at the visual top-left — the exact same corner where `dialog.tsx`'s built-in `DialogPrimitive.Close` (`absolute left-4 top-4`) is rendered. The two controls stacked/overlapped each other and crowded a two-line wrapped title, and the close button's tap target (~16px icon, no padding) was well under the 44x44px minimum touch target.

**Root Cause:** `DialogContent` always renders its own absolutely-positioned close button in the top-left (RTL) corner, but callers were independently placing another action button (`ShareButton`) in that same corner via normal flex flow, with no reserved spacing for either control.

**Solution:**
1. `dialog.tsx`: increased `DialogPrimitive.Close` hit area to `h-10 w-10` (44px-adjacent) at `left-2 top-2`.
2. `HighlightsCarousel.tsx` / `PublicHomepage.tsx`: removed `ShareButton` from the `DialogHeader` row, added `pl-12` to `DialogHeader` to clear the close button, and moved `ShareButton` into its own row below the title (next to the category badge, or in a dedicated row) so it never competes with the close button regardless of title length.

**Prevention Rule:** Never place a second header action button in the same flex row as `DialogTitle` — `DialogContent` already owns the top-left (RTL) corner for its close button. Any extra header actions (share, more, etc.) belong in a separate row inside the dialog body, with the header given enough `pl-*` clearance for the close button.

**Files Changed:**
- `src/components/ui/dialog.tsx`
- `src/components/features/highlights/HighlightsCarousel.tsx`
- `src/components/features/homepage/PublicHomepage.tsx`

**Test Added:** None (visual/layout fix, verified manually via Chrome mobile viewport 390x844)

## [2025-01-16] Grocery claim 500 error on partial claiming

**Problem:** Users get HTTP 500 error when trying to partially claim a grocery item (e.g., claiming 1 out of 3 items). Error message: "שגיאה ביצירת פריט חדש"

**Root Cause:** Two issues in the partial claim flow:
1. Used object syntax `.insert({...})` instead of array syntax `.insert([{...}])` - inconsistent with other routes
2. Used `||` operator for null check on `display_order` instead of `??` (nullish coalescing)
3. `notes` field passed as undefined instead of explicit null

**Solution:**
1. Changed to array syntax `.insert([insertData])` for consistency with other routes
2. Changed `(existingItem.display_order || 0)` to `(existingItem.display_order ?? 0)`
3. Changed `notes: existingItem.notes` to `notes: existingItem.notes || null`

**Prevention Rule:**
- Always use array syntax for Supabase inserts: `.insert([{...}])`
- Use nullish coalescing (`??`) instead of OR (`||`) when 0 is a valid value
- Explicitly pass `null` for nullable fields instead of `undefined`

**Files Changed:**
- `src/app/api/grocery/[token]/items/[itemId]/claim/route.ts`

**Test Added:** Manual test - verify partial claiming works

---

### Example Entry (Reference only)

## [2025-12-16] Example: Admin authentication bypass

**Problem:** Users could access admin routes without valid JWT token by manipulating cookie directly.

**Root Cause:** Middleware checked for token existence but didn't verify token signature.

**Solution:** Added `verifyJWT()` call in middleware to validate token signature and expiration.

**Prevention Rule:** Always verify JWT signature and expiration, not just token existence.

**Files Changed:**
- `src/middleware.ts` - Added JWT verification
- `src/lib/auth.ts` - Created `verifyJWT()` helper

**Test Added:** `tests/auth-middleware.spec.ts` - Test admin route protection

---

## Bug Patterns (Update as patterns emerge)

**Common root causes to watch for:**
- Missing input validation
- Unchecked null/undefined
- Missing authorization checks
- Hard deletes instead of soft deletes
- RTL layout assumptions
- Hebrew text encoding issues
- Calendar sync race conditions

**Prevention strategies:**
- Add runtime guards for critical invariants
- Write negative tests for auth/security
- Test RTL layout after UI changes
- Verify soft delete implementation
- Check for duplicate prevention in sync logic
