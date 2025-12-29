import jwt from 'jsonwebtoken'
import { logger } from '@/lib/logger'

export interface JWTPayload {
  role: 'admin'
  iat: number
  exp: number
}

export function signJWT(payload: { role: 'admin' }, expiresIn: string = '24h'): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions)
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required')
    }

    const decoded = jwt.verify(token, secret) as JWTPayload

    // RUNTIME GUARD: Verify token is valid
    if (!decoded) {
      logger.error('INVARIANT VIOLATION: Invalid admin token', {
        component: 'Auth',
        action: 'verifyJWT',
        data: { tokenExists: !!token, decoded: null }
      })
      return null
    }

    return decoded
  } catch (error) {
    logger.error('INVARIANT VIOLATION: JWT verification failed', {
      component: 'Auth',
      action: 'verifyJWT',
      error
    })
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = verifyJWT(token)
    if (!decoded) return true

    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch {
    return true
  }
}