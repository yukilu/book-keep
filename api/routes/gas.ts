import { Router, type Response } from 'express'
import { db } from '../db.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'
import type { GasRecord, GasRecordInput } from '@shared/types'

const router = Router()

router.use(authMiddleware)

// 获取加油记录
router.get('/', (req: AuthRequest, res: Response) => {
  const rows = db.prepare(
    'SELECT * FROM gas_records WHERE user_id = ? ORDER BY date DESC, created_at DESC'
  ).all(req.userId) as unknown as GasRecord[]
  res.json(rows)
})

// 新增加油记录
router.post('/', (req: AuthRequest, res: Response) => {
  const { date, amount, liters, price_per_liter, mileage, station, note } = req.body as GasRecordInput
  if (!date || !amount || !liters || !price_per_liter) {
    res.status(400).json({ error: '参数不完整' })
    return
  }
  const result = db.prepare(
    `INSERT INTO gas_records (user_id, date, amount, liters, price_per_liter, mileage, station, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(req.userId, date, amount, liters, price_per_liter, mileage || 0, station || '', note || '')

  const row = db.prepare('SELECT * FROM gas_records WHERE id = ?').get(result.lastInsertRowid) as unknown as GasRecord
  res.json(row)
})

// 删除加油记录
router.delete('/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM gas_records WHERE id = ? AND user_id = ?').run(Number(req.params.id), req.userId)
  res.json({ success: true })
})

export default router
