import type { NextFunction, Request, Response } from 'express'
import { verifyAccessToken } from '../auth/jwt.js'

export type AuthContext = { userId: string; role: string }

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext
    }
  }
}

function getBearerToken(req: Request): string | null {
  const raw = req.headers.authorization
  if (!raw) return null
  const m = raw.match(/^Bearer\s+(.+)$/i)
  return m?.[1] ?? null
}

export function requireAuth(roles?: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = getBearerToken(req)
      if (!token) {
        res.status(401).json({ success: false, error: '未登录' })
        return
      }

      const payload = verifyAccessToken(token)
      req.auth = { userId: payload.userId, role: payload.role }

      if (roles && roles.length > 0 && !roles.includes(payload.role)) {
        res.status(403).json({ success: false, error: '无权限' })
        return
      }

      next()
    } catch {
      res.status(401).json({ success: false, error: '登录已失效' })
    }
  }
}

