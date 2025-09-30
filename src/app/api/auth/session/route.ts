import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/auth/jwt-edge'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    logger.apiCall('GET', '/api/auth/session', {})

    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')

    if (!token?.value) {
      logger.info('No auth token found in session check', { component: 'Session' })
      return NextResponse.json({
        authenticated: false,
        user: null
      })
    }

    logger.debug('Token found, verifying', { component: 'Session', data: { tokenLength: token.value.length } })

    // Verify the token
    const payload = await verifyJWT(token.value)

    if (!payload) {
      logger.warning('Invalid token in session check, clearing cookie', { component: 'Session' })
      // Token is invalid, clear it
      cookieStore.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      })

      return NextResponse.json({
        authenticated: false,
        user: null
      })
    }

    // Token is valid
    logger.success('Session verified successfully', { component: 'Session', data: { role: payload.role } })
    return NextResponse.json({
      authenticated: true,
      user: {
        role: payload.role
      }
    })

  } catch (error) {
    logger.error('Session check error', { component: 'Session', error })
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 200 } // Don't return error status for auth checks
    )
  }
}