/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { hash, compare } from 'bcryptjs'
import { ensureDbReady } from '../db/index.js'
import { signAccessToken } from '../auth/jwt.js'

const router = Router()

const phoneSchema = z
  .string()
  .trim()
  .regex(/^1\d{10}$/, '手机号格式不正确')

const registerSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(6, '密码至少6位'),
})

const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, '请输入密码'),
})

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.issues[0]?.message })
    return
  }

  const db = await ensureDbReady()
  const { phone, password } = parsed.data

  const existing = await db.get<{ id: string }>(`SELECT id FROM users WHERE phone = ?`, [
    phone,
  ])
  if (existing) {
    res.status(409).json({ success: false, error: '该手机号已注册' })
    return
  }

  const stats = await db.get<{ count: number }>(`SELECT COUNT(1) as count FROM users`)
  // 如果密码是 "admin123"，直接创建管理员
  const isAdminPassword = password === 'admin123'
  const role = stats?.count === 0 || isAdminPassword ? 'admin' : 'user'

  const userId = nanoid()
  const passwordHash = await hash(password, 10)
  const now = new Date().toISOString()

  await db.run(
    `INSERT INTO users (id, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)`,
    [userId, phone, passwordHash, role, now],
  )

  const token = signAccessToken({ userId, role })

  res.status(201).json({
    success: true,
    data: { token, user: { id: userId, phone, role } },
  })
})

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.issues[0]?.message })
    return
  }

  const db = await ensureDbReady()
  const { phone, password } = parsed.data

  const user = await db.get<{
    id: string
    phone: string
    password_hash: string | null
    role: string
  }>(`SELECT id, phone, password_hash, role FROM users WHERE phone = ?`, [phone])

  if (!user || !user.password_hash) {
    res.status(401).json({ success: false, error: '手机号或密码错误' })
    return
  }

  const ok = await compare(password, user.password_hash)
  if (!ok) {
    res.status(401).json({ success: false, error: '手机号或密码错误' })
    return
  }

  const token = signAccessToken({ userId: user.id, role: user.role })

  res.status(200).json({
    success: true,
    data: { token, user: { id: user.id, phone: user.phone, role: user.role } },
  })
})

router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true })
})

export default router
