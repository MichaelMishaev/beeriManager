# Development Rules - BeeriManager

> **Last Updated:** 2025-12-16
> **Team Size:** 1 developer + Claude AI
> **Philosophy:** Maximum quality with minimum overhead
> **Lines:** ~450 (down from 2,574)

---

## 🎯 The 5 Golden Rules (If You Remember Nothing Else)

```
1. 📖 READ files before changing them (no guessing)
2. 🚦 CLASSIFY risk before running tests (Low/Med/High)
3. 🐛 For bugs: Write FAILING test FIRST, then fix
4. 🛡️ ADD runtime guards to critical invariants
5. ❓ WHEN uncertain: ASK (don't guess)
```

**These 5 rules prevent 95% of regressions and save hours per week.**

---

## 📋 Standard Workflow (Every Task)

Follow this sequence for **every task**:

```
1. READ relevant files
   → Never guess file contents, APIs, or schemas
   → Use Read tool, not assumptions

2. CLASSIFY risk (30 seconds)
   → 🔹 Low: Pure functions, styling, docs
   → 🔸 Medium: New features, non-critical APIs
   → 🔴 High: Auth, RBAC, schema, calendar sync

3. PLAN in bullet points
   → List files to change and why
   → Wait for approval if High risk

4. IMPLEMENT with minimal diffs
   → Change only what's necessary
   → No silent refactoring

5. VERIFY based on risk level
   → 🔹 Low: Type-check + unit tests
   → 🔸 Medium: + Integration tests
   → 🔴 High: + Full Playwright suite + manual QA
```

**Output format:** Show diffs (not full files) + commands run + results

---

## 🚦 Risk Classification (BeeriManager-Specific)

### 🔹 Low Risk → Type-check + Unit Tests Only

**Examples:**
- Date/phone formatters
- Pure utility functions
- UI text/label changes (non-Hebrew)
- CSS/styling tweaks
- Documentation updates
- Constants/config changes

**Test strategy:** `npm run type-check && npm run lint`
**Time:** 1-2 minutes

---

### 🔸 Medium Risk → Unit + Integration Tests

**Examples:**
- New UI components
- New API endpoints (non-auth)
- Database queries (non-critical)
- Tag system changes
- Vendor management features
- Feedback system updates

**Test strategy:** `npm run type-check && npm test -- [affected-tests]`
**Time:** 3-5 minutes

---

### 🔴 High Risk → Full Test Suite + Manual QA

**Examples (CRITICAL for BeeriManager):**
- Authentication logic (JWT, password verification)
- Admin route protection (middleware changes)
- Database schema migrations
- Google Calendar sync logic
- Hebrew/RTL layout changes
- Soft delete implementation
- Offline sync logic (IndexedDB ↔ Supabase)
- i18n changes affecting Hebrew text

**Test strategy:**
```bash
npm run type-check
npm run lint
npm test  # Full Playwright suite
# Manual QA in browser (Hebrew + RTL verification)
```
**Time:** 10-15 minutes + manual QA

---

## 🐛 Bug Fix Protocol (Test-First)

**For every production bug**, follow this strict sequence:

### Step 1: Write Failing Test
```typescript
// BEFORE fixing, write test that reproduces the bug
test('Bug: [description] - should [expected behavior]', async () => {
  // Test MUST FAIL before fix
  expect(actualBehavior).toBe(expectedBehavior);
});
```

### Step 2: Verify Test Fails
```bash
npm test -- [test-file]
# Test should FAIL (red)
```

### Step 3: Fix the Bug
- Minimal change to make test pass
- No unrelated refactoring

### Step 4: Verify Test Passes
```bash
npm test -- [test-file]
# Test should PASS (green)
```

### Step 5: Document in Bug Log
Add entry to `Docs/development/bugs.md`:

```markdown
## [YYYY-MM-DD] Bug Title

**Problem:** [What broke and how users were affected]

**Root Cause:** [WHY it happened - be specific]

**Solution:** [What was changed]

**Prevention Rule:** [How to avoid this pattern in future]

**Files Changed:** [List files]

**Test Added:** [Path to regression test]
```

**Why this matters:** Prevents fixing the same bug twice (saves 2-8 hours per bug).

---

## 🛡️ Runtime Guards (BeeriManager Critical Invariants)

Add runtime assertions to these **6 critical invariants**:

### 1. Admin Authentication
```typescript
// In middleware or auth routes
export async function verifyAdmin(token: string) {
  const decoded = await verifyJWT(token);

  if (!decoded) {
    logger.error('INVARIANT VIOLATION: Invalid admin token', { token });
    throw new Error('Authentication failed');
  }

  return decoded;
}
```

### 2. Required Fields (Database Integrity)
```typescript
// In API routes before DB operations
if (!data.title || !data.owner) {
  logger.error('INVARIANT VIOLATION: Missing required fields', { data });
  throw new Error('Missing required fields: title, owner');
}
```

### 3. Soft Delete Only (No Hard Deletes)
```typescript
// NEVER use .delete() on user-facing data
// ALWAYS use soft delete
async function deleteTask(id: string) {
  // ❌ await supabase.from('tasks').delete().eq('id', id)

  // ✅ Soft delete
  const { error } = await supabase
    .from('tasks')
    .update({ is_deleted: true, deleted_at: new Date() })
    .eq('id', id);

  if (error) {
    logger.error('INVARIANT VIOLATION: Soft delete failed', { id, error });
    throw error;
  }
}
```

### 4. Hebrew Text Encoding
```typescript
// Verify Hebrew text displays correctly
function validateHebrewText(text: string): boolean {
  // Check for Hebrew characters (U+0590 to U+05FF)
  const hasHebrew = /[\u0590-\u05FF]/.test(text);

  if (!hasHebrew && text.length > 0) {
    logger.warn('No Hebrew characters detected', { text });
  }

  return true; // Don't block, just log
}
```

### 5. Google Calendar Duplicate Prevention
```typescript
// Before creating calendar event
async function createCalendarEvent(event: Event) {
  // Check if event already exists by external_id
  const existing = await supabase
    .from('events')
    .select('id')
    .eq('google_calendar_id', event.google_calendar_id)
    .single();

  if (existing.data) {
    logger.error('INVARIANT VIOLATION: Duplicate calendar event', {
      eventId: event.id,
      googleCalendarId: event.google_calendar_id
    });
    throw new Error('Event already exists in Google Calendar');
  }

  // Proceed with creation
}
```

### 6. RTL Layout Direction
```typescript
// In layout components
export function Layout({ children, locale }: LayoutProps) {
  const isRTL = ['he', 'ar'].includes(locale);

  if (locale === 'he' && !isRTL) {
    logger.error('INVARIANT VIOLATION: Hebrew locale without RTL', { locale });
  }

  return (
    <html dir={isRTL ? 'rtl' : 'ltr'} lang={locale}>
      {children}
    </html>
  );
}
```

**Why runtime guards?** They catch bugs that slip through tests (saves 1-4 hours debugging).

---

## ⚠️ Stop Conditions (When to Ask User)

**STOP and ask before proceeding if:**

1. ❌ **Required file doesn't exist**
   - Don't hallucinate file contents
   - Ask: "Should I create this file?"

2. ❌ **Uncertain about API or schema**
   - Don't guess field names or types
   - Ask: "What's the correct schema?"

3. ❌ **Breaking change implied**
   - Don't assume backward compatibility is okay
   - Ask: "Is this breaking change acceptable?"

4. ❌ **Multiple approaches possible**
   - Don't pick arbitrarily
   - Ask: "Which approach do you prefer?"

5. ❌ **More than 3 files need large edits**
   - High regression risk
   - Ask: "Should I proceed with this scope?"

**Golden rule:** When uncertain, ASK. Never guess or hallucinate.

---

## 🧪 Testing Strategy (BeeriManager)

### Critical Paths (MUST Test on Every High-Risk Change)

1. **Authentication Flow**
   - Login with correct password → Success
   - Login with wrong password → Failure
   - Access admin route without token → Blocked
   - Access admin route with valid token → Allowed

2. **Hebrew/RTL Layout**
   - Hebrew text displays correctly (no squares/gibberish)
   - Layout is RTL (text-right, margin-inline-start/end)
   - UI components mirror correctly (buttons, cards)

3. **Data Integrity**
   - Creating record with required fields → Success
   - Creating record without required fields → Error
   - Soft delete → Record marked deleted, not removed
   - Hard delete → NEVER allowed on user data

4. **Google Calendar Sync**
   - Create event → Syncs to Google Calendar
   - Update event → Updates in Google Calendar
   - Delete event → Removed from Google Calendar
   - No duplicates created on multiple syncs

5. **Offline Mode**
   - Changes made offline → Stored in IndexedDB
   - Come back online → Syncs to Supabase
   - No data loss during sync
   - Conflicts handled gracefully

### Test Execution by Risk Level

| Risk | Tests to Run | Time |
|------|-------------|------|
| 🔹 Low | `npm run type-check` | 1-2 min |
| 🔸 Medium | Type-check + relevant tests | 3-5 min |
| 🔴 High | Full suite + manual QA | 10-15 min |

**Negative Testing (Auth/Security Only):**
- Test that unauthorized access is BLOCKED
- Test that invalid input is REJECTED
- Test that boundary violations FAIL

---

## 🚫 Never Do (Common Mistakes)

1. ❌ **Never edit without reading files first**
   - Use Read tool for every file you change
   - Check existing patterns and style

2. ❌ **Never skip tests for High Risk changes**
   - Auth, schema, calendar sync = ALWAYS test
   - No exceptions

3. ❌ **Never hard delete user data**
   - Use soft delete (is_deleted flag)
   - Preserve data for audit trail

4. ❌ **Never refactor silently**
   - Only refactor if requested
   - Keep diffs minimal

5. ❌ **Never show entire files in responses**
   - Use diffs/patches
   - Saves context window

6. ❌ **Never break RTL layout**
   - Test Hebrew locale after UI changes
   - Use logical CSS properties (margin-inline-start, not margin-left)

7. ❌ **Never guess schemas or APIs**
   - Read actual code
   - Ask if uncertain

8. ❌ **Never commit without explicit instruction**
   - Wait for user approval
   - Follow git workflow in CLAUDE.md

---

## ✅ Pre-Commit Checklist

Before committing, verify:

### For ALL Changes:
- [ ] Type-check passes: `npm run type-check`
- [ ] Linter passes: `npm run lint`
- [ ] Diffs are minimal (only necessary changes)
- [ ] No unrelated code modifications

### For Bug Fixes:
- [ ] Regression test added (fails before fix, passes after)
- [ ] Test execution verified
- [ ] Bug documented in Docs/development/bugs.md

### For High Risk Changes:
- [ ] Full Playwright suite passes: `npm test`
- [ ] Manual QA completed (Hebrew + RTL verified)
- [ ] No breaking changes (or documented if necessary)
- [ ] User approved the change

---

## 🎯 Output Format (Communication)

### When Showing Code Changes:

✅ **PREFERRED:** Diff format
```diff
- const users = await getUsers()
+ const users = await getUsers({ includeDeleted: false })
```

✅ **ACCEPTABLE:** Only changed functions/blocks
```typescript
// Changed function
async function getUsers(options = {}) {
  const { includeDeleted = false } = options;
  // ... rest of implementation
}
```

❌ **AVOID:** Showing entire files (wastes context)

### Always Include:

1. **Files modified:** List with reason for each
2. **Commands run:** Full commands with results
3. **Test results:** Pass/fail status

**Example:**
```markdown
## Changes Made

Files modified:
- `src/lib/auth.ts` - Added JWT expiration check
- `src/app/api/auth/route.ts` - Return 401 on expired token

Commands run:
- `npm run type-check` - ✅ Passed
- `npm test -- auth` - ✅ Passed (12 tests)

Risk Level: 🔴 High (authentication)
```

---

## 📊 Success Metrics

**After implementing these rules, you should see:**

- ✅ **95%+ of bugs caught before production** (via tests + guards)
- ✅ **2-5 min saved per task** (via risk classification)
- ✅ **Zero recurring bugs** (via test-first bug fixes)
- ✅ **Fast feedback loop** (run only necessary tests)
- ✅ **Clear communication** (diffs + results)

**If not seeing these results:**
- Review which rule is being skipped
- Adjust risk classification thresholds
- Add more runtime guards for critical invariants

---

## 🔄 Maintenance

### Weekly:
- Review bug log for patterns
- Update runtime guards if new invariants discovered

### Monthly:
- Audit test coverage for critical paths
- Update this document if new High Risk areas identified

### When Bugs Occur:
- Follow Bug Fix Protocol strictly
- Add runtime guard if data corruption risk
- Update "Never Do" list if new pattern emerges

---

## 📁 Related Documentation

- **Project Overview:** `/CLAUDE.md` (main project guide)
- **Bug Log:** `/Docs/development/bugs.md` (historical bugs + prevention)
- **Testing Guide:** `/tests/qaInstructions.md` (Playwright setup)
- **Architecture:** `/CLAUDE.md` (tech stack, patterns, conventions)

---

## 🎓 Philosophy

**This document is intentionally SHORT** (450 lines vs. 2,574 in enterprise version).

**Why?**
- Solo developer + AI = different needs than enterprise teams
- Focus on HIGH ROI practices only
- Skip ceremony, keep velocity
- Prevent regressions WITHOUT slowing down

**The 80/20 Rule:**
- These rules prevent 95% of regressions
- With 5% of the overhead of full enterprise protocols
- Perfect for production apps with 1-person teams

**When to revisit:**
- If team grows beyond 2-3 people → Consider full baseRules.md
- If critical bugs slip through → Add specific guards/tests
- If velocity drops → Remove low-value practices

---

**Last Updated:** 2025-12-16
**Status:** Active (will evolve based on actual bugs encountered)
**Effectiveness Target:** 95% regression prevention with minimal overhead
