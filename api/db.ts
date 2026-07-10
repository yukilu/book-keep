import { DatabaseSync } from 'node:sqlite'
import path from 'path'

const dbPath = path.join(process.cwd(), 'data.db')

export const db = new DatabaseSync(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    note TEXT DEFAULT '',
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'MoreHorizontal',
    color TEXT NOT NULL DEFAULT 'text-gray-600',
    bg_color TEXT NOT NULL DEFAULT 'bg-gray-100',
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, type, name)
  );
`)

// 迁移：添加 user_id 列
try { db.exec(`ALTER TABLE transactions ADD COLUMN user_id INTEGER DEFAULT 1;`) } catch (_e) { /* 已存在 */ }

// 迁移：移除 oil_price 和 mileage 列（如存在）
try { db.exec(`ALTER TABLE transactions DROP COLUMN oil_price;`) } catch (_e) { /* 不存在 */ }
try { db.exec(`ALTER TABLE transactions DROP COLUMN mileage;`) } catch (_e) { /* 不存在 */ }

// 迁移：删除 gas_records 表（如存在）
try { db.exec(`DROP TABLE IF EXISTS gas_records;`) } catch (_e) { /* 忽略 */ }
