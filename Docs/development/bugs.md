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