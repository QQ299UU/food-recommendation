import sqlite3 from 'sqlite3'

export type RunResult = { lastID: number; changes: number }

export type SqliteDb = {
  run: (sql: string, params?: unknown[]) => Promise<RunResult>
  get: <T>(sql: string, params?: unknown[]) => Promise<T | undefined>
  all: <T>(sql: string, params?: unknown[]) => Promise<T[]>
  exec: (sql: string) => Promise<void>
  close: () => Promise<void>
}

export function openSqliteDb(filePath: string): SqliteDb {
  const db = new sqlite3.Database(filePath)

  const run: SqliteDb['run'] = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.run(sql, params as never[], function (err) {
        if (err) return reject(err)
        resolve({ lastID: this.lastID, changes: this.changes })
      })
    })

  const get: SqliteDb['get'] = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.get(sql, params as never[], (err, row) => {
        if (err) return reject(err)
        resolve(row as never)
      })
    })

  const all: SqliteDb['all'] = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.all(sql, params as never[], (err, rows) => {
        if (err) return reject(err)
        resolve((rows ?? []) as never)
      })
    })

  const exec: SqliteDb['exec'] = (sql) =>
    new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })

  const close: SqliteDb['close'] = () =>
    new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) return reject(err)
        resolve()
      })
    })

  return { run, get, all, exec, close }
}
