CREATE TABLE IF NOT EXISTS _migrations (
  id TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address_text TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  city TEXT,
  created_by_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(created_by_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  author_user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending',
  reject_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY(store_id) REFERENCES stores(id),
  FOREIGN KEY(author_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_store ON posts(store_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_user_id);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  cover_url TEXT,
  width INTEGER,
  height INTEGER,
  duration_ms INTEGER,
  created_at TEXT NOT NULL,
  FOREIGN KEY(post_id) REFERENCES posts(id)
);

CREATE INDEX IF NOT EXISTS idx_media_post ON media(post_id);
