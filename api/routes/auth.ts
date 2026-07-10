import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import { db } from '../db.js'
import { generateToken, authMiddleware, type AuthRequest } from '../middleware/auth.js'
import type { User } from '@shared/types'

const router = Router()

// 注册
router.post('/register', (req: Request, res: Response) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).json({ error: '用户名和密码不能为空' })
    return
  }
  if (username.length < 2 || username.length > 20) {
    res.status(400).json({ error: '用户名长度2-20个字符' })
    return
  }
  if (password.length < 6) {
    res.status(400).json({ error: '密码至少6个字符' })
    return
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) {
    res.status(409).json({ error: '用户名已存在' })
    return
  }

  const hash = bcrypt.hashSync(password, 10)
  const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash)
  const user = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(result.lastInsertRowid) as unknown as User

  // 为新用户初始化默认分类
  initDefaultCategories(result.lastInsertRowid as number)

  const token = generateToken(user.id)
  res.json({ token, user })
})

// 登录
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).json({ error: '用户名和密码不能为空' })
    return
  }

  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as { id: number; username: string; password_hash: string; created_at: string } | undefined
  if (!row) {
    res.status(401).json({ error: '用户名或密码错误' })
    return
  }

  if (!bcrypt.compareSync(password, row.password_hash)) {
    res.status(401).json({ error: '用户名或密码错误' })
    return
  }

  const user: User = { id: row.id, username: row.username, created_at: row.created_at }
  const token = generateToken(user.id)
  res.json({ token, user })
})

// 获取当前用户信息
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const row = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(req.userId) as unknown as User | undefined
  if (!row) {
    res.status(404).json({ error: '用户不存在' })
    return
  }
  res.json(row)
})

// 重置密码
router.post('/reset-password', authMiddleware, (req: AuthRequest, res: Response) => {
  const { old_password, new_password } = req.body
  if (!old_password || !new_password) {
    res.status(400).json({ error: '请填写旧密码和新密码' })
    return
  }
  if (new_password.length < 6) {
    res.status(400).json({ error: '新密码至少6个字符' })
    return
  }

  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.userId) as { password_hash: string }
  if (!bcrypt.compareSync(old_password, row.password_hash)) {
    res.status(401).json({ error: '旧密码错误' })
    return
  }

  const hash = bcrypt.hashSync(new_password, 10)
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.userId)
  res.json({ success: true })
})

// 默认分类定义
function initDefaultCategories(userId: number) {
  const defaults = [
    // 支出
    { type: 'expense', name: '餐饮', icon: 'UtensilsCrossed', color: 'text-orange-600', bg_color: 'bg-orange-100', sort_order: 0 },
    { type: 'expense', name: '交通', icon: 'Bus', color: 'text-blue-600', bg_color: 'bg-blue-100', sort_order: 1 },
    { type: 'expense', name: '购物', icon: 'ShoppingBag', color: 'text-pink-600', bg_color: 'bg-pink-100', sort_order: 2 },
    { type: 'expense', name: '娱乐', icon: 'Gamepad2', color: 'text-purple-600', bg_color: 'bg-purple-100', sort_order: 3 },
    { type: 'expense', name: '居住', icon: 'Home', color: 'text-teal-600', bg_color: 'bg-teal-100', sort_order: 4 },
    { type: 'expense', name: '医疗', icon: 'HeartPulse', color: 'text-red-600', bg_color: 'bg-red-100', sort_order: 5 },
    { type: 'expense', name: '教育', icon: 'GraduationCap', color: 'text-indigo-600', bg_color: 'bg-indigo-100', sort_order: 6 },
    { type: 'expense', name: '通讯', icon: 'Smartphone', color: 'text-cyan-600', bg_color: 'bg-cyan-100', sort_order: 7 },
    { type: 'expense', name: '其他', icon: 'MoreHorizontal', color: 'text-gray-600', bg_color: 'bg-gray-100', sort_order: 8 },
    // 收入
    { type: 'income', name: '工资', icon: 'Wallet', color: 'text-green-600', bg_color: 'bg-green-100', sort_order: 0 },
    { type: 'income', name: '奖金', icon: 'Gift', color: 'text-amber-600', bg_color: 'bg-amber-100', sort_order: 1 },
    { type: 'income', name: '兼职', icon: 'Briefcase', color: 'text-blue-600', bg_color: 'bg-blue-100', sort_order: 2 },
    { type: 'income', name: '投资', icon: 'TrendingUp', color: 'text-teal-600', bg_color: 'bg-teal-100', sort_order: 3 },
    { type: 'income', name: '红包', icon: 'Mail', color: 'text-pink-600', bg_color: 'bg-pink-100', sort_order: 4 },
    { type: 'income', name: '其他', icon: 'MoreHorizontal', color: 'text-gray-600', bg_color: 'bg-gray-100', sort_order: 5 },
  ]

  const stmt = db.prepare(
    'INSERT OR IGNORE INTO categories (user_id, type, name, icon, color, bg_color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  for (const c of defaults) {
    stmt.run(userId, c.type, c.name, c.icon, c.color, c.bg_color, c.sort_order)
  }
}

export default router
