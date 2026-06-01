import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { ensureDbReady } from '../db/index.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

router.get('/reviews', requireAuth(['admin']), async (req: Request, res: Response) => {
  const status = String(req.query.status ?? 'pending')
  const db = await ensureDbReady()

  const rows = await db.all<{
    id: string
    title: string
    content: string
    status: string
    reject_reason: string | null
    created_at: string
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
      p.status,
      p.reject_reason,
      p.created_at,
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
    WHERE p.deleted_at IS NULL AND p.status = ?
    ORDER BY p.created_at ASC
    LIMIT 200
    `,
    [status],
  )

  res.status(200).json({
    success: true,
    data: rows.map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      status: r.status,
      rejectReason: r.reject_reason,
      createdAt: r.created_at,
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

router.get('/reviews/:id', requireAuth(['admin']), async (req: Request, res: Response) => {
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

router.post('/reviews/:id/approve', requireAuth(['admin']), async (req: Request, res: Response) => {
  const id = req.params.id
  const db = await ensureDbReady()
  const now = new Date().toISOString()

  const r = await db.run(
    `UPDATE posts SET status = 'approved', reject_reason = NULL, updated_at = ? WHERE id = ? AND deleted_at IS NULL`,
    [now, id],
  )

  if (r.changes === 0) {
    res.status(404).json({ success: false, error: '内容不存在' })
    return
  }

  res.status(200).json({ success: true })
})

const rejectSchema = z.object({
  reason: z.string().trim().min(1, '请输入驳回原因').max(200, '原因最多200字'),
})

router.post('/reviews/:id/reject', requireAuth(['admin']), async (req: Request, res: Response) => {
  const id = req.params.id
  const parsed = rejectSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.issues[0]?.message })
    return
  }

  const db = await ensureDbReady()
  const now = new Date().toISOString()

  const r = await db.run(
    `UPDATE posts SET status = 'rejected', reject_reason = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL`,
    [parsed.data.reason, now, id],
  )

  if (r.changes === 0) {
    res.status(404).json({ success: false, error: '内容不存在' })
    return
  }

  res.status(200).json({ success: true })
})

router.post('/reviews/:id/off-shelf', requireAuth(['admin']), async (req: Request, res: Response) => {
  const id = req.params.id
  const db = await ensureDbReady()
  const now = new Date().toISOString()

  const r = await db.run(
    `UPDATE posts SET status = 'off_shelf', updated_at = ? WHERE id = ? AND deleted_at IS NULL`,
    [now, id],
  )

  if (r.changes === 0) {
    res.status(404).json({ success: false, error: '内容不存在' })
    return
  }

  res.status(200).json({ success: true })
})

router.delete('/posts/:id', requireAuth(['admin']), async (req: Request, res: Response) => {
  const id = req.params.id
  const db = await ensureDbReady()
  const now = new Date().toISOString()

  const r = await db.run(
    `UPDATE posts SET status = 'deleted', deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL`,
    [now, now, id],
  )

  if (r.changes === 0) {
    res.status(404).json({ success: false, error: '内容不存在' })
    return
  }

  res.status(200).json({ success: true })
})

export default router

