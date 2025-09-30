import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET() {
  const hash = process.env.ADMIN_PASSWORD_HASH
  const testPassword = '6262'

  // Test the comparison
  const isValid = await bcrypt.compare(testPassword, hash || '')

  return NextResponse.json({
    hashExists: !!hash,
    hashLength: hash?.length,
    hashFirst10: hash?.substring(0, 10),
    testPassword,
    isValid,
  })
}