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

<!-- Add bugs here as they occur -->

### Example Entry (Delete this when first real bug is added)

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
