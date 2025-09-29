import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

// Utility to generate admin password hash for environment setup
export async function generateAdminPasswordHash(password: string): Promise<void> {
  const hash = await hashPassword(password)
  console.log('Admin password hash for .env.local:')
  console.log(`ADMIN_PASSWORD_HASH=${hash}`)
}