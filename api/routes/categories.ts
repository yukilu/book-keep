import { Router, type Response } from 'express'
import { db } from '../db.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'
import type { Category, CategoryInput } from '@shared/types'

const router = Router()

router.use(authMiddleware)

// 获取用户的所有分类
router.get('/', (req: AuthRequest, res: Response) => {
  const type = req.query.type as string | undefined
  let rows: Category[]
  if (type) {
    rows = db.prepare(
      'SELECT * FROM categories WHERE user_id = ? AND type = ? ORDER BY sort_order ASC'
    ).all(req.userId, type) as unknown as Category[]
  } else {
    rows = db.prepare(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY type, sort_order ASC'
    ).all(req.userId) as unknown as Category[]
  }
  res.json(rows)
})

// 新增分类
router.post('/', (req: AuthRequest, res: Response) => {
  const { type, name, icon, color, bg_color, sort_order } = req.body as CategoryInput & { bg_color?: string }
  if (!type || !name) {
    res.status(400).json({ error: '类型和名称不能为空' })
    return
  }
  // 检查是否已存在
  const existing = db.prepare('SELECT id FROM categories WHERE user_id = ? AND type = ? AND name = ?').get(req.userId, type, name)
  if (existing) {
    res.status(409).json({ error: '该分类已存在' })
    return
  }
  const result = db.prepare(
    'INSERT INTO categories (user_id, type, name, icon, color, bg_color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(req.userId, type, name, icon || 'MoreHorizontal', color || 'text-gray-600', bg_color || 'bg-gray-100', sort_order || 0)

  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid) as unknown as Category
  res.json(row)
})

// 编辑分类
router.put('/:id', (req: AuthRequest, res: Response) => {
  const { type, name, icon, color, bg_color, sort_order } = req.body as CategoryInput & { bg_color?: string }
  const existing = db.prepare('SELECT id FROM categories WHERE id = ? AND user_id = ?').get(Number(req.params.id), req.userId)
  if (!existing) {
    res.status(404).json({ error: '分类不存在' })
    return
  }
  db.prepare(
    'UPDATE categories SET type = ?, name = ?, icon = ?, color = ?, bg_color = ?, sort_order = ? WHERE id = ? AND user_id = ?'
  ).run(type, name, icon || 'MoreHorizontal', color || 'text-gray-600', bg_color || 'bg-gray-100', sort_order || 0, Number(req.params.id), req.userId)

  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(req.params.id)) as unknown as Category
  res.json(row)
})

// 删除分类
router.delete('/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').run(Number(req.params.id), req.userId)
  res.json({ success: true })
})

export default router
