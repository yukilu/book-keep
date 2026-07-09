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

  CREATE TABLE IF NOT EXISTS gas_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    liters REAL NOT NULL,
    price_per_liter REAL NOT NULL,
    mileage REAL DEFAULT 0,
    station TEXT DEFAULT '',
    note TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_gas_user_date ON gas_records(user_id, date);

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
try { db.exec(`ALTER TABLE gas_records ADD COLUMN user_id INTEGER DEFAULT 1;`) } catch (_e) { /* 已存在 */ }

// 迁移：添加 oil_price 和 mileage 列
try { db.exec(`ALTER TABLE transactions ADD COLUMN oil_price REAL;`) } catch (_e) { /* 已存在 */ }
try { db.exec(`ALTER TABLE transactions ADD COLUMN mileage REAL;`) } catch (_e) { /* 已存在 */ }
