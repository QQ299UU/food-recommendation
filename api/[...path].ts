
import { VercelRequest, VercelResponse } from '@vercel/node'
import app from '../api/app.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise((resolve) => {
    app(req as any, res as any, () => {
      resolve(void 0)
    })
  })
}

