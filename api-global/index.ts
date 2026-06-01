
import { createServer } from 'http'
import app from './api/app.js'

export default async function handler(req: any, res: any) {
  return new Promise((resolve, reject) => {
    const server = createServer(app)
    server.emit('request', req, res)
    res.on('finish', () => resolve(void 0))
    res.on('error', reject)
  })
}

