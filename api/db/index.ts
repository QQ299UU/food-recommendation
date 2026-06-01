import fs from 'node:fs/promises'
import path from 'node:path'
import { openSqliteDb, type SqliteDb } from './sqlite.js'
import { migrate } from './migrate.js'

let db: SqliteDb | null = null
let initPromise: Promise<SqliteDb> | null = null

export async function ensureDbReady(): Promise<SqliteDb> {
  if (db) return db
  if (initPromise) return initPromise

  initPromise = (async () => {
    const dbPath = process.env.DB_PATH
      ? path.resolve(process.env.DB_PATH)
      : path.join(process.cwd(), 'data', 'app.db')

    const migrationsDir = path.join(process.cwd(), 'migrations')
    const candidates = [dbPath, ':memory:']

    for (const candidate of candidates) {
      try {
        if (candidate !== ':memory:') {
          await fs.mkdir(path.dirname(candidate), { recursive: true })
        }
        const instance = openSqliteDb(candidate)
        await instance.exec('PRAGMA foreign_keys = ON;')
        await migrate(instance, migrationsDir)
        db = instance
        return instance
      } catch (err) {
        if (candidate === ':memory:') throw err
      }
    }

    throw new Error('DB init failed')
  })()

  return initPromise
}
