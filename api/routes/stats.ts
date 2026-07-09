import { Router, type Response } from 'express'
import { db } from '../db.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'
import type { OverviewStats } from '@shared/types'

const router = Router()

router.use(authMiddleware)

// 获取总览统计
router.get('/overview', (req: AuthRequest, res: Response) => {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE user_id = ?').get(req.userId) as { count: number }
  const incomeRow = db.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'income'"
  ).get(req.userId) as { total: number }
  const expenseRow = db.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'expense'"
  ).get(req.userId) as { total: number }

  const stats: OverviewStats = {
    count: countRow.count,
    income: incomeRow.total,
    expense: expenseRow.total,
  }
  res.json(stats)
})

export default router
