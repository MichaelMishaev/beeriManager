import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth/password'

// This is a utility endpoint to generate password hashes for admin setup
// Should be removed or secured in production
export async function GET(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(req.url)
  const password = searchParams.get('password')

  if (!password) {
    return NextResponse.json({
      error: 'Password parameter required',
      example: '/api/generate-hash?password=YourAdminPassword123!'
    }, { status: 400 })
  }

  try {
    const hash = await hashPassword(password)

    return NextResponse.json({
      success: true,
      password: password,
      hash: hash,
      envVariable: `ADMIN_PASSWORD_HASH=${hash}`,
      instructions: [
        '1. Copy the hash above',
        '2. Add it to your .env.local file as ADMIN_PASSWORD_HASH',
        '3. Restart your development server',
        '4. Test login at /login'
      ]
    })
  } catch (error) {
    console.error('Hash generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate hash' },
      { status: 500 }
    )
  }
}