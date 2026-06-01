import fs from 'node:fs/promises'
import path from 'node:path'
import { type SqliteDb } from './sqlite.js'

export async function migrate(db: SqliteDb, migrationsDir: string): Promise<void> {
  await db.exec(
    `CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL);`,
  )

  const entries = await fs.readdir(migrationsDir, { withFileTypes: true })
  const files = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.sql'))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b))

  for (const file of files) {
    const existing = await db.get<{ id: string }>(
      `SELECT id FROM _migrations WHERE id = ? LIMIT 1`,
      [file],
    )

    if (existing) continue

    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf-8')
    await db.exec(sql)
    await db.run(`INSERT INTO _migrations (id, applied_at) VALUES (?, ?)`, [
      file,
      new Date().toISOString(),
    ])
  }
}
