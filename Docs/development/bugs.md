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