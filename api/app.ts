/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import storeRoutes from './routes/stores.js'
import postRoutes from './routes/posts.js'
import postMediaRoutes from './routes/postMedia.js'
import adminRoutes from './routes/admin.js'
import { ensureDbReady } from './db/index.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

/**
 * API Routes
 */
app.use('/api', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureDbReady()
    next()
  } catch (err) {
    next(err)
  }
})
app.use('/api/auth', authRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/posts', postMediaRoutes)
app.use('/api/admin', adminRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error)
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
