/**
 * JWT utilities using jose (same lib as jwt-edge.ts)
 * All functions are async — call sites must use await
 */

import { jwtVerify, SignJWT } from 'jose'
import { logger } from '@/lib/logger'

export interface JWTPayload {
  role: 'admin'
  iat?: number
  exp?: number
}

const getSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return new TextEncoder().encode(secret)
}

export async function signJWT(payload: { role: 'admin' }, expiresIn: string = '24h'): Promise<string> {
  const secret = getSecret()

  const expMap: Record<string, number> = {
    '1h': 3600,
    '24h': 86400,
    '7d': 604800,
  }
  const exp = expMap[expiresIn] || 86400

  return await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + exp)
    .sign(secret)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)

    if (!payload) {
      logger.error('INVARIANT VIOLATION: Invalid admin token', {
        component: 'Auth',
        action: 'verifyJWT',
        data: { tokenExists: !!token, decoded: null }
      })
      return null
    }

    return payload as unknown as JWTPayload
  } catch (error) {
    logger.error('INVARIANT VIOLATION: JWT verification failed', {
      component: 'Auth',
      action: 'verifyJWT',
      error
    })
    return null
  }
}

export async function isTokenExpired(token: string): Promise<boolean> {
  try {
    const decoded = await verifyJWT(token)
    if (!decoded || !decoded.exp) return true

    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch {
    return true
  }
}
