/**
 * Edge Runtime compatible JWT utilities using jose
 * For use in middleware and edge functions
 */

import { jwtVerify, SignJWT } from 'jose'

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

  // Convert expiresIn string to seconds
  const expMap: Record<string, number> = {
    '1h': 3600,
    '24h': 86400,
    '7d': 604800,
  }
  const exp = expMap[expiresIn] || 86400

  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + exp)
    .sign(secret)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch (error) {
    console.error('JWT verification failed (Edge):', error)
    return null
  }
}