# Known Bugs and Solutions

## Authentication Issues

### Bug #1: Login redirects back to login page after successful authentication

**Date**: 2025-09-30

**Symptoms**:
- User enters correct password (6262)
- Login API returns success
- Cookie is set with JWT token
- User is redirected to `/admin`
- Immediately redirected back to `/login?redirect=%2Fadmin`

**Root Causes** (3 issues):

1. **Dollar signs in `.env.local` bcrypt hash**
   - Bcrypt hashes contain `$` characters (e.g., `$2a$10$...`)
   - Shell/dotenv interprets `$` as variable substitution
   - Hash was truncated from 60 chars to 10 chars
   - Password verification always failed

2. **Edge Runtime incompatibility with `jsonwebtoken` library**
   - Next.js middleware runs in Edge Runtime
   - `jsonwebtoken` requires Node.js `crypto` module
   - JWT verification in middleware failed silently
   - Middleware couldn't verify auth tokens

3. **Duplicate auth check in admin layout**
   - Middleware already protected `/admin` routes
   - Admin layout component did redundant client-side auth check
   - Race condition: cookie not immediately available in client
   - Layout redirected to login even though middleware verified auth

**Solutions**:

1. **Escape dollar signs in `.env.local`**
   ```bash
   # Wrong:
   ADMIN_PASSWORD_HASH=$2a$10$umBWkRR9LEnCDvbIBq5vyeIhQdT8qkjm7NYYiM9nNYf.0Z4zxUFTi

   # Correct:
   ADMIN_PASSWORD_HASH=\$2a\$10\$umBWkRR9LEnCDvbIBq5vyeIhQdT8qkjm7NYYiM9nNYf.0Z4zxUFTi
   ```

2. **Created Edge-compatible JWT functions**
   - Added `src/lib/auth/jwt-edge.ts` using `jose` library
   - `jose` works in both Node.js and Edge Runtime
   - Updated middleware to use `jwt-edge.ts` instead of `jwt.ts`
   - Updated login/session routes to use same JWT implementation

3. **Removed duplicate auth check**
   - Simplified `src/app/(admin)/layout.tsx`
   - Removed client-side `useEffect` auth check
   - Trust middleware for authentication
   - Admin layout now just renders UI banner

**Files Modified**:
- `.env.local` - Escaped dollar signs in hash
- `src/lib/auth/jwt-edge.ts` - New Edge-compatible JWT functions
- `src/middleware.ts` - Use jwt-edge, added logging
- `src/app/api/auth/login/route.ts` - Use jwt-edge, added logging
- `src/app/api/auth/session/route.ts` - Use jwt-edge, added logging
- `src/app/(admin)/layout.tsx` - Removed duplicate auth check
- `src/app/(auth)/login/page.tsx` - Changed redirect to `window.location.href`

**Testing**:
```bash
# Test login flow
npx playwright test tests/test-login-flow.spec.ts --project=chromium

# Manual test
1. Go to http://localhost:4500/login
2. Enter password: 6262
3. Click login
4. Should redirect to /admin successfully
```

**Lessons Learned**:
- Always escape special characters in `.env` files
- Check runtime compatibility when using Node.js libraries in middleware
- Avoid duplicate auth checks - trust your middleware
- Use comprehensive logging for authentication debugging
- Test auth flow end-to-end with Playwright

**Prevention**:
- Add comment in `.env.local.example` about escaping `$`
- Use `jose` library by default for all JWT operations
- Document that middleware handles auth, no need for client checks
- Include auth flow test in CI/CD pipeline

---

### Bug #2: Login fails with "סיסמה שגויה" for correct "admin1" password

**Date**: 2025-10-02

**Symptoms**:
- User enters correct password "admin1" on login page
- Login API returns 401 error with "סיסמה שגויה" (Wrong password)
- bcrypt verification consistently returns false
- Password hash verification works correctly when tested standalone with Node.js

**Root Cause**:
- **Shell variable substitution in `.env.local`** for bcrypt hash
  - Bcrypt hashes contain `$` characters (e.g., `$2a$10$...`)
  - Without proper escaping, shell/dotenv interprets `$2a`, `$10`, etc. as variable names
  - Hash was truncated from:
    - **Expected**: `$2a$10$eenxWBA20s/sLN2afWNviOry2c79jAtN1PixMihV3djZUBVcmyhEC` (60 chars)
    - **Actual**: `/sLN2afWNviOry2c79jAtN1PixMihV3djZUBVcmyhEC` (43 chars - first 17 chars missing!)
  - Missing prefix made hash invalid for bcrypt verification

**Debugging Process**:
1. Tested hash offline with bcryptjs - verified hash is correct for "admin1"
2. Added debug logging to login route to inspect hash value at runtime
3. Discovered hash was truncated (43 chars vs 60 chars expected)
4. Identified that `$2a$10$een` was being interpreted as shell variables
5. Tested with single quotes `'$2a...'` - still truncated
6. Fixed with backslash escaping `\$2a\$10\$...` - success!

**Solution**:
Escape all dollar signs in bcrypt hash with backslashes in `.env.local`:

```bash
# ❌ Wrong - causes variable substitution:
ADMIN_PASSWORD_HASH=$2a$10$eenxWBA20s/sLN2afWNviOry2c79jAtN1PixMihV3djZUBVcmyhEC

# ❌ Wrong - single quotes don't prevent substitution in .env files:
ADMIN_PASSWORD_HASH='$2a$10$eenxWBA20s/sLN2afWNviOry2c79jAtN1PixMihV3djZUBVcmyhEC'

# ✅ Correct - backslash escapes prevent substitution:
ADMIN_PASSWORD_HASH=\$2a\$10\$eenxWBA20s/sLN2afWNviOry2c79jAtN1PixMihV3djZUBVcmyhEC
```

**Files Modified**:
- `.env.local` - Escaped all `$` in ADMIN_PASSWORD_HASH with `\$`
- `.env.example` - Updated example with escaped hash
- `src/app/api/auth/login/route.ts` - Added debug logging for hash verification

**Testing**:
```bash
# Test bcrypt hash locally
node -e "const bcrypt = require('bcryptjs'); bcrypt.compare('admin1', '\$2a\$10\$eenxWBA20s/sLN2afWNviOry2c79jAtN1PixMihV3djZUBVcmyhEC').then(r => console.log(r))"
# Should output: true

# Test login via API
curl -X POST http://localhost:4500/api/auth/login -H "Content-Type: application/json" -d '{"password":"admin1"}'
# Should return: {"success":true,"message":"התחברת בהצלחה"}
```

**Lessons Learned**:
- Always escape `$` characters in `.env` files with backslashes
- Single quotes don't prevent variable substitution in dotenv
- Debug logging in API routes is essential for environment variable issues
- Test environment variable values at runtime, not just in isolation
- Bcrypt hashes ALWAYS start with `$2a$` or `$2b$` followed by cost and salt

**Prevention**:
- Updated `.env.example` with properly escaped hash example
- Added note in `.env.example` about escaping special characters
- Consider using `.env.local` validator script to check for common issues
- Add integration test for login with actual password (not mocked)

---

## Urgent Messages Feature

### Bug #3: Urgent messages not appearing on public homepage after creation

**Date**: 2025-10-30

**Symptoms**:
- Admin creates urgent message in `/admin/urgent` panel
- Message appears in admin panel (shows as active with correct dates)
- Message is successfully saved to database (confirmed via API)
- **BUT**: Message does not appear on public homepage at `/he`
- Parents cannot see the urgent message banner

**Root Cause**:
- **Browser fetch cache** was preventing fresh data from loading
- The `UrgentMessagesBanner` component was using default fetch behavior
- Browser cached the API response from `/api/urgent-messages`
- Even after creating new messages, the cached response (with 0 messages) was being returned
- `loadMessages()` function had no cache-busting mechanism

**Initial Investigation**:
1. Created messages via admin panel - verified in database ✓
2. Checked API endpoint directly - returned correct data ✓
3. Checked public homepage - no banner visible ✗
4. Suspected caching issue in browser

**Debugging Process**:
1. Created comprehensive Playwright tests to verify end-to-end flow
2. Tests revealed messages were in database but not appearing on frontend
3. Added cache-busting timestamp to admin panel `loadMessages()` - worked for admin
4. Discovered public `UrgentMessagesBanner` component also needed cache-busting
5. Console logs showed API calls were returning stale cached data

**Solution**:

**Part 1: Admin Panel Cache-Busting** (`src/app/[locale]/(admin)/admin/urgent/page.tsx`)
```typescript
async function loadMessages() {
  try {
    console.log('[LoadMessages] Fetching messages...')
    // Add cache-busting timestamp
    const response = await fetch(`/api/urgent-messages?all=true&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    const data = await response.json()
    if (data.success) {
      setMessages(data.data || [])
    }
  } catch (error) {
    logger.error('Failed to load urgent messages', { error })
  }
}
```

**Part 2: Public Banner Cache-Busting** (`src/components/features/urgent/UrgentMessagesBanner.tsx`)
```typescript
async function loadMessages() {
  try {
    // Add cache-busting timestamp to ensure fresh data
    const response = await fetch(`/api/urgent-messages?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    const data = await response.json()
    if (data.success) {
      setMessages(data.data || [])
    }
  } catch (error) {
    logger.error('Failed to load urgent messages', { error })
  }
}
```

**Files Modified**:
- `src/app/[locale]/(admin)/admin/urgent/page.tsx` - Added cache-busting to loadMessages()
- `src/components/features/urgent/UrgentMessagesBanner.tsx` - Added cache-busting to loadMessages()

**Testing**:
Created comprehensive Playwright tests:
```bash
# Test full workflow: create → save → verify display
npx playwright test urgent-create-and-verify.spec.ts --project=chromium

# Test public display
npx playwright test urgent-public-display-test.spec.ts --project=chromium
```

**Test Coverage**:
1. **urgent-delete-test.spec.ts** - Verifies delete functionality
2. **urgent-comprehensive-test.spec.ts** - Full CRUD workflow
3. **urgent-create-and-verify.spec.ts** - End-to-end: admin creates → public sees
4. **urgent-public-display-test.spec.ts** - Public homepage display verification

**Manual Testing**:
```bash
# Step 1: Create message
1. Go to http://localhost:4500/he/admin/urgent
2. Click "הוסף הודעה" (Add Message)
3. Fill in Hebrew title, description, and dates
4. Click "שמור שינויים" (Save Changes)

# Step 2: Verify in public homepage
5. Open incognito/private window (to avoid localStorage dismissals)
6. Go to http://localhost:4500/he
7. Message should appear at top of page in banner

# Step 3: Verify API directly
curl -s 'http://localhost:4500/api/urgent-messages' | jq '.'
```

**Lessons Learned**:
- Always implement cache-busting for dynamic content that needs real-time updates
- Browser fetch caching can cause stale data even when database is updated
- Use `cache: 'no-store'` and `Cache-Control: 'no-cache'` headers together
- Add timestamp query parameter `?_t=${Date.now()}` for additional cache prevention
- Test both admin and public views separately - they may have different caching behaviors
- Comprehensive E2E tests catch caching issues that unit tests miss

**Prevention**:
- Standardize cache-busting pattern across all data-fetching functions
- Create reusable `fetchWithNoCache()` utility function
- Add cache-busting by default for admin CRUD operations
- Document caching strategy in developer guide
- Include cache-busting checks in code review checklist

**Related Issues Fixed**:
- Also reverted premature UI modernization changes that didn't match system design
- Restored original clean UI design for urgent messages admin panel
- Kept functionality improvements (delete, cache-busting) while reverting cosmetic changes