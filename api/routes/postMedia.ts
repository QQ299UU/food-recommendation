import { Router } from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import multer from 'multer'
import { nanoid } from 'nanoid'
import { ensureDbReady } from '../db/index.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const postId = req.params.id
    const dir = path.join(process.cwd(), 'uploads', postId)
    fs.mkdir(dir, { recursive: true })
      .then(() => cb(null, dir))
      .catch((err) => cb(err, dir))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '')
    cb(null, `${nanoid()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
})

router.post('/:id/media', requireAuth(), upload.array('files', 12), async (req, res) => {
  const postId = req.params.id
  const db = await ensureDbReady()
  const post = await db.get<{
    id: string
    author_user_id: string
    deleted_at: string | null
  }>(`SELECT id, author_user_id, deleted_at FROM posts WHERE id = ?`, [postId])

  if (!post || post.deleted_at) {
    res.status(404).json({ success: false, error: '内容不存在' })
    return
  }

  if (post.author_user_id !== req.auth!.userId) {
    res.status(403).json({ success: false, error: '无权限' })
    return
  }

  const files = (req.files ?? []) as Express.Multer.File[]
  if (files.length === 0) {
    res.status(400).json({ success: false, error: '请选择文件' })
    return
  }

  const now = new Date().toISOString()
  const items: Array<{ id: string; type: string; url: string }> = []

  for (const f of files) {
    const type = f.mimetype.startsWith('video/') ? 'video' : 'image'
    const url = `/uploads/${postId}/${path.basename(f.path)}`
    const id = nanoid()
    await db.run(
      `INSERT INTO media (id, post_id, type, url, created_at) VALUES (?, ?, ?, ?, ?)`,
      [id, postId, type, url, now],
    )
    items.push({ id, type, url })
  }

  res.status(201).json({ success: true, data: items })
})

export default router

