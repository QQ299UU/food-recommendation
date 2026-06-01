
import { VercelRequest, VercelResponse } from '@vercel/node'
import app from '../app.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 将 Vercel 的 request/response 适配给 Express
  return new Promise((resolve) => {
    app(req as any, res as any, () => {
      resolve(void 0)
    })
  })
}

