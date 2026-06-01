import jwt from 'jsonwebtoken'

export type AccessTokenPayload = {
  userId: string
  role: string
  iat: number
  exp: number
}

function getSecret(): string {
  return process.env.JWT_SECRET || 'dev-secret'
}

export function signAccessToken(input: { userId: string; role: string }): string {
  return jwt.sign(input, getSecret(), { expiresIn: '30d' })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, getSecret()) as AccessTokenPayload
}
