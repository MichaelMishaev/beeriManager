import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyPassword } from '@/lib/auth/password'
import { signJWT } from '@/lib/auth/jwt-edge'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    logger.apiCall('POST', '/api/auth/login', { attempt: true })

    const { password } = await req.json()

    if (!password) {
      logger.warning('Login attempt without password', { component: 'Auth' })
      return NextResponse.json(
        { success: false, error: 'סיסמה נדרשת' },
        { status: 400 }
      )
    }

    // Get hashed password from environment
    // Fallback hardcoded hash for production: admin1
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || '$2a$10$eenxWBA20s/sLN2afWNviOry2c79jAtN1PixMihV3djZUBVcmyhEC'

    if (!process.env.ADMIN_PASSWORD_HASH) {
      logger.warning('Using fallback password hash (env var not set)', { component: 'Auth' })
    }

    // Verify password
    const isValid = await verifyPassword(password, adminPasswordHash)

    if (!isValid) {
      logger.warning('Invalid password attempt', { component: 'Auth' })
      return NextResponse.json(
        { success: false, error: 'סיסמה שגויה' },
        { status: 401 }
      )
    }

    logger.success('Password verified successfully', { component: 'Auth' })

    // Create JWT token
    const token = await signJWT({ role: 'admin' }, '24h')
    logger.debug('JWT token created', { component: 'Auth' })

    // Set HTTP-only cookie
    const cookieStore = cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
      path: '/'
    })

    logger.success('Auth cookie set, login successful', { component: 'Auth' })

    return NextResponse.json({
      success: true,
      message: 'התחברת בהצלחה'
    })

  } catch (error) {
    logger.error('Login error', { component: 'Auth', error })
    return NextResponse.json(
      { success: false, error: 'שגיאה בהתחברות' },
      { status: 500 }
    )
  }
}