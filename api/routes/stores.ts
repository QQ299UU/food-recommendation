import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { ensureDbReady } from '../db/index.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

const createSchema = z.object({
  name: z.string().trim().min(1, '请输入门店名称'),
  addressText: z.string().trim().min(1, '请输入门店地址'),
  lat: z.number(),
  lng: z.number(),
  city: z.string().trim().optional(),
})

router.post('/', requireAuth(), async (req: Request, res: Response) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.issues[0]?.message })
    return
  }

  const db = await ensureDbReady()
  const id = nanoid()
  const now = new Date().toISOString()
  const { name, addressText, lat, lng, city } = parsed.data

  await db.run(
    `INSERT INTO stores (id, name, address_text, lat, lng, city, created_by_user_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, addressText, lat, lng, city ?? null, req.auth!.userId, now],
  )

  res.status(201).json({
    success: true,
    data: { id, name, addressText, lat, lng, city: city ?? null, createdAt: now },
  })
})

router.get('/search', async (req: Request, res: Response) => {
  const keyword = String(req.query.keyword ?? '').trim()
  const db = await ensureDbReady()

  const rows = await db.all<{
    id: string
    name: string
    address_text: string
    lat: number
    lng: number
    city: string | null
  }>(
    `SELECT id, name, address_text, lat, lng, city
     FROM stores
     WHERE (? = '') OR (name LIKE ? OR address_text LIKE ?)
     ORDER BY created_at DESC
     LIMIT 20`,
    [keyword, `%${keyword}%`, `%${keyword}%`],
  )

  res.status(200).json({
    success: true,
    data: rows.map((r) => ({
      id: r.id,
      name: r.name,
      addressText: r.address_text,
      lat: r.lat,
      lng: r.lng,
      city: r.city,
    })),
  })
})

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id
  const db = await ensureDbReady()

  const store = await db.get<{
    id: string
    name: string
    address_text: string
    lat: number
    lng: number
    city: string | null
    created_at: string
  }>(
    `SELECT id, name, address_text, lat, lng, city, created_at
     FROM stores
     WHERE id = ?`,
    [id],
  )

  if (!store) {
    res.status(404).json({ success: false, error: '门店不存在' })
    return
  }

  res.status(200).json({
    success: true,
    data: {
      id: store.id,
      name: store.name,
      addressText: store.address_text,
      lat: store.lat,
      lng: store.lng,
      city: store.city,
      createdAt: store.created_at,
    },
  })
})

export default router

