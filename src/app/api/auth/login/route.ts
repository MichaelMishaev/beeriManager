import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyPassword } from '@/lib/auth/password'
import { signJWT } from '@/lib/auth/jwt'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'סיסמה נדרשת' },
        { status: 400 }
      )
    }

    // Get hashed password from environment
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
    if (!adminPasswordHash) {
      console.error('ADMIN_PASSWORD_HASH environment variable not set')
      return NextResponse.json(
        { success: false, error: 'שגיאה בהגדרות השרת' },
        { status: 500 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, adminPasswordHash)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'סיסמה שגויה' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = signJWT({ role: 'admin' }, '24h')

    // Set HTTP-only cookie
    const cookieStore = cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
      path: '/'
    })

    return NextResponse.json({
      success: true,
      message: 'התחברת בהצלחה'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בהתחברות' },
      { status: 500 }
    )
  }
}