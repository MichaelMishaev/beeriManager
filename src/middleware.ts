import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from '@/lib/auth/jwt-edge'
import { locales, defaultLocale } from '@/i18n/config'

const isDev = process.env.NODE_ENV === 'development'

function log(message: string, data?: any) {
  if (isDev) {
    console.log(`[Middleware] ${message}`, data || '')
  }
}

// Create the i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/manifest.json'
  ) {
    return NextResponse.next()
  }

  log(`Request to: ${pathname}`)

  // Handle i18n routing first
  const intlResponse = intlMiddleware(request)
  if (intlResponse) {
    // If intl middleware redirects, return early
    if (intlResponse.status === 307 || intlResponse.status === 308) {
      return intlResponse
    }
  }

  // Extract locale from pathname (e.g., /he/admin -> locale: 'he', path: '/admin')
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/'
  const locale = pathname.match(/^\/([a-z]{2})/)?.[1] || defaultLocale

  // Committee routes protection (admin + internal pages)
  const committeeRoutes = [
    '/admin',
    '/tasks',
    '/protocols',
    '/finances',
    '/issues',
    '/vendors'
  ]

  const isCommitteeRoute = committeeRoutes.some(route => pathnameWithoutLocale.startsWith(route))

  if (isCommitteeRoute) {
    log(`Protected route accessed: ${pathname}`)

    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      log(`No auth token found, redirecting to login`)
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}/login`
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    log(`Auth token found, verifying JWT`)

    // Verify JWT token
    try {
      const payload = await verifyJWT(token)
      if (!payload || payload.role !== 'admin') {
        log(`Invalid JWT payload`, { payload })
        throw new Error('Invalid token')
      }
      log(`JWT verified successfully`, { role: payload.role })
    } catch (error) {
      log(`JWT verification failed`, { error: error instanceof Error ? error.message : error })
      // Invalid token - redirect to login
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}/login`
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // CSP header for enhanced security
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://api.supabase.io https://*.supabase.co; " +
    "frame-ancestors 'none';"
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons/|fonts/).*)',
  ],
}