import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { ensureDbReady } from '../db/index.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { verifyAccessToken } from '../auth/jwt.js'

const router = Router()

const createSchema = z.object({
  storeId: z.string().min(1, '请选择门店'),
  title: z.string().trim().min(1, '请输入标题').max(60, '标题最多60字'),
  content: z.string().trim().min(1, '请输入推荐内容').max(2000, '内容最多2000字'),
  tags: z.array(z.string().trim().min(1)).max(10).optional(),
})

const updateSchema = z.object({
  title: z.string().trim().min(1, '请输入标题').max(60, '标题最多60字'),
  content: z.string().trim().min(1, '请输入推荐内容').max(2000, '内容最多2000字'),
  tags: z.array(z.string().trim().min(1)).max(10).optional(),
})

router.post('/', requireAuth(), async (req: Request, res: Response) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.issues[0]?.message })
    return
  }

  const db = await ensureDbReady()
  const { storeId, title, content, tags } = parsed.data
  const now = new Date().toISOString()
  const id = nanoid()

  const store = await db.get<{ id: string }>(`SELECT id FROM stores WHERE id = ?`, [storeId])
  if (!store) {
    res.status(404).json({ success: false, error: '门店不存在' })
    return
  }

  await db.run(
    `INSERT INTO posts (id, store_id, author_user_id, title, content, tags_json, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    [
      id,
      storeId,
      req.auth!.userId,
      title,
      content,
      JSON.stringify(tags ?? []),
      now,
      now,
    ],
  )

  res.status(201).json({
    success: true,
    data: {
      id,
      storeId,
      title,
      content,
      tags: tags ?? [],
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },
  })
})

router.get('/', async (req: Request, res: Response) => {
  const mine = String(req.query.mine ?? '') === '1'
  const status = String(req.query.status ?? 'approved')

  const db = await ensureDbReady()

  if (mine) {
    const authHeader = String(req.headers.authorization ?? '')
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
      res.status(401).json({ success: false, error: '未登录' })
      return
    }
  }

  const query: Array<string | number> = []
  const where: string[] = [`p.deleted_at IS NULL`]

  if (mine) {
    try {
      const token = String(req.headers.authorization).replace(/^Bearer\s+/i, '')
      const payload = verifyAccessToken(token)
      where.push(`p.author_user_id = ?`)
      query.push(payload.userId)
    } catch {
      res.status(401).json({ success: false, error: '登录已失效' })
      return
    }
  } else {
    where.push(`p.status = ?`)
    query.push(status)
  }

  const rows = await db.all<{
    id: string
    title: string
    content: string
    tags_json: string
    status: string
    reject_reason: string | null
    created_at: string
    updated_at: string
    store_id: string
    store_name: string
    store_address_text: string
    store_lat: number
    store_lng: number
    media_url: string | null
    media_type: string | null
  }>(
    `
    SELECT
      p.id,
      p.title,
      p.content,
      p.tags_json,
      p.status,
      p.reject_reason,
      p.created_at,
      p.updated_at,
      s.id as store_id,
      s.name as store_name,
      s.address_text as store_address_text,
      s.lat as store_lat,
      s.lng as store_lng,
      m.url as media_url,
      m.type as media_type
    FROM posts p
    JOIN stores s ON s.id = p.store_id
    LEFT JOIN media m ON m.id = (
      SELECT id FROM media WHERE post_id = p.id ORDER BY created_at ASC LIMIT 1
    )
    WHERE ${where.join(' AND ')}
    ORDER BY p.created_at DESC
    LIMIT 50
    `,
    query,
  )

  res.status(200).json({
    success: true,
    data: rows.map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      tags: JSON.parse(r.tags_json || '[]') as string[],
      status: r.status,
      rejectReason: r.reject_reason,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      store: {
        id: r.store_id,
        name: r.store_name,
        addressText: r.store_address_text,
        lat: r.store_lat,
        lng: r.store_lng,
      },
      cover: r.media_url ? { url: r.media_url, type: r.media_type } : null,
    })),
  })
})

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id
  const db = await ensureDbReady()

  const post = await db.get<{
    id: string
    store_id: string
    author_user_id: string
    title: string
    content: string
    tags_json: string
    status: string
    reject_reason: string | null
    created_at: string
    updated_at: string
    deleted_at: string | null
  }>(
    `SELECT id, store_id, author_user_id, title, content, tags_json, status, reject_reason, created_at, updated_at, deleted_at
     FROM posts WHERE id = ?`,
    [id],
  )

  if (!post || post.deleted_at) {
    res.status(404).json({ success: false, error: '内容不存在' })
    return
  }

  let viewer: { userId: string; role: string } | null = null
  const auth = String(req.headers.authorization ?? '')
  if (auth.toLowerCase().startsWith('bearer ')) {
    try {
      const payload = verifyAccessToken(auth.slice(7))
      viewer = { userId: payload.userId, role: payload.role }
    } catch {
      viewer = null
    }
  }

  const canView =
    post.status === 'approved' ||
    (viewer && (viewer.userId === post.author_user_id || viewer.role === 'admin'))
  if (!canView) {
    res.status(404).json({ success: false, error: '内容不存在' })
    return
  }

  const store = await db.get<{
    id: string
    name: string
    address_text: string
    lat: number
    lng: number
    city: string | null
  }>(`SELECT id, name, address_text, lat, lng, city FROM stores WHERE id = ?`, [
    post.store_id,
  ])

  const media = await db.all<{
    id: string
    type: string
    url: string
    cover_url: string | null
    created_at: string
  }>(`SELECT id, type, url, cover_url, created_at FROM media WHERE post_id = ?`, [id])

  res.status(200).json({
    success: true,
    data: {
      id: post.id,
      storeId: post.store_id,
      authorUserId: post.author_user_id,
      title: post.title,
      content: post.content,
      tags: JSON.parse(post.tags_json || '[]') as string[],
      status: post.status,
      rejectReason: post.reject_reason,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      store: store
        ? {
            id: store.id,
            name: store.name,
            addressText: store.address_text,
            lat: store.lat,
            lng: store.lng,
            city: store.city,
          }
        : null,
      media: media.map((m) => ({
        id: m.id,
        type: m.type,
        url: m.url,
        coverUrl: m.cover_url,
        createdAt: m.created_at,
      })),
    },
  })
})

router.put('/:id', requireAuth(), async (req: Request, res: Response) => {
  const id = req.params.id
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.issues[0]?.message })
    return
  }

  const db = await ensureDbReady()
  const post = await db.get<{
    id: string
    author_user_id: string
    status: string
    deleted_at: string | null
  }>(`SELECT id, author_user_id, status, deleted_at FROM posts WHERE id = ?`, [id])

  if (!post || post.deleted_at) {
    res.status(404).json({ success: false, error: '内容不存在' })
    return
  }

  if (post.author_user_id !== req.auth!.userId) {
    res.status(403).json({ success: false, error: '无权限' })
    return
  }

  if (!['pending', 'rejected'].includes(post.status)) {
    res.status(400).json({ success: false, error: '当前状态不可编辑' })
    return
  }

  const now = new Date().toISOString()
  const { title, content, tags } = parsed.data

  await db.run(
    `UPDATE posts SET title = ?, content = ?, tags_json = ?, updated_at = ? WHERE id = ?`,
    [title, content, JSON.stringify(tags ?? []), now, id],
  )

  res.status(200).json({ success: true, data: { id, updatedAt: now } })
})

router.delete('/:id', requireAuth(), async (req: Request, res: Response) => {
  const id = req.params.id
  const db = await ensureDbReady()
  const post = await db.get<{
    id: string
    author_user_id: string
    deleted_at: string | null
  }>(`SELECT id, author_user_id, deleted_at FROM posts WHERE id = ?`, [id])

  if (!post || post.deleted_at) {
    res.status(404).json({ success: false, error: '内容不存在' })
    return
  }

  if (post.author_user_id !== req.auth!.userId && req.auth!.role !== 'admin') {
    res.status(403).json({ success: false, error: '无权限' })
    return
  }

  const now = new Date().toISOString()
  await db.run(`UPDATE posts SET status = 'deleted', deleted_at = ?, updated_at = ? WHERE id = ?`, [
    now,
    now,
    id,
  ])

  res.status(200).json({ success: true })
})

export default router
