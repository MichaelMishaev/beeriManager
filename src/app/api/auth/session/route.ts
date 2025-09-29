import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/auth/jwt'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')

    if (!token?.value) {
      return NextResponse.json({
        authenticated: false,
        user: null
      })
    }

    // Verify the token
    const payload = verifyJWT(token.value)

    if (!payload) {
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
    return NextResponse.json({
      authenticated: true,
      user: {
        role: payload.role
      }
    })

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 200 } // Don't return error status for auth checks
    )
  }
}