import { Router, type Response } from 'express'
import { db } from '../db.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'
import type { TransactionInput, DailyTransactions, MonthlySummary, Transaction } from '@shared/types'

const router = Router()

// 所有路由都需要认证
router.use(authMiddleware)

// 获取月度交易列表
router.get('/', (req: AuthRequest, res: Response) => {
  const month = req.query.month as string
  if (!month) {
    res.status(400).json({ error: '缺少 month 参数' })
    return
  }
  const rows = db.prepare(
    'SELECT * FROM transactions WHERE user_id = ? AND date LIKE ? ORDER BY date DESC, created_at DESC'
  ).all(req.userId, `${month}%`) as unknown as Transaction[]
  res.json(rows)
})

// 获取月度汇总
router.get('/summary', (req: AuthRequest, res: Response) => {
  const month = req.query.month as string
  if (!month) {
    res.status(400).json({ error: '缺少 month 参数' })
    return
  }
  const incomeRow = db.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'income' AND date LIKE ?"
  ).get(req.userId, `${month}%`) as { total: number }
  const expenseRow = db.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'expense' AND date LIKE ?"
  ).get(req.userId, `${month}%`) as { total: number }

  const summary: MonthlySummary = {
    income: incomeRow.total,
    expense: expenseRow.total,
    balance: incomeRow.total - expenseRow.total,
  }
  res.json(summary)
})

// 获取按日聚合明细
router.get('/by-day', (req: AuthRequest, res: Response) => {
  const month = req.query.month as string
  if (!month) {
    res.status(400).json({ error: '缺少 month 参数' })
    return
  }
  const rows = db.prepare(
    'SELECT * FROM transactions WHERE user_id = ? AND date LIKE ? ORDER BY date DESC, created_at DESC'
  ).all(req.userId, `${month}%`) as unknown as Transaction[]

  const grouped: Record<string, Transaction[]> = {}
  for (const row of rows) {
    const dayKey = row.date.split(' ')[0]
    if (!grouped[dayKey]) grouped[dayKey] = []
    grouped[dayKey].push(row)
  }

  const result: DailyTransactions[] = Object.entries(grouped).map(([date, items]) => {
    const dayIncome = items.filter(i => i.type === 'income').reduce((s, i) => s + i.amount, 0)
    const dayExpense = items.filter(i => i.type === 'expense').reduce((s, i) => s + i.amount, 0)
    return { date, day_income: dayIncome, day_expense: dayExpense, items }
  })

  res.json(result)
})

// 加油月度汇总
router.get('/gas/monthly', (req: AuthRequest, res: Response) => {
  const rows = db.prepare(
    `SELECT id, amount, oil_price, mileage, date FROM transactions
     WHERE user_id = ? AND category = '加油' AND type = 'expense'
     ORDER BY date DESC`
  ).all(req.userId) as { id: number; amount: number; oil_price: number | null; mileage: number | null; date: string }[]

  // 按月聚合
  const grouped: Record<string, typeof rows> = {}
  for (const row of rows) {
    const monthKey = row.date.substring(0, 7) // YYYY-MM
    if (!grouped[monthKey]) grouped[monthKey] = []
    grouped[monthKey].push(row)
  }

  const result = Object.entries(grouped).map(([month, items]) => {
    const count = items.length
    const totalAmount = items.reduce((s, i) => s + i.amount, 0)
    const totalLiters = items.reduce((s, i) => {
      if (i.oil_price && i.oil_price > 0) return s + i.amount / i.oil_price
      return s
    }, 0)
    // 油耗计算：需要里程数据
    const mileages = items.filter(i => i.mileage && i.mileage > 0).map(i => i.mileage as number)
    let fuelConsumption: number | null = null
    if (mileages.length >= 2) {
      const distance = Math.max(...mileages) - Math.min(...mileages)
      if (distance > 0) fuelConsumption = (totalLiters / distance) * 100
    }
    return { month, count, total_amount: totalAmount, total_liters: totalLiters, fuel_consumption: fuelConsumption }
  })

  res.json(result)
})

// 加油月度明细
router.get('/gas/:month', (req: AuthRequest, res: Response) => {
  const month = req.params.month
  const rows = db.prepare(
    `SELECT * FROM transactions WHERE user_id = ? AND category = '加油' AND type = 'expense' AND date LIKE ? ORDER BY date ASC`
  ).all(req.userId, `${month}%`) as unknown as Transaction[]
  res.json(rows)
})

// 获取支出最多的N条记录
router.get('/top-expenses', (req: AuthRequest, res: Response) => {
  const period = (req.query.period as string) || 'month'
  const limit = parseInt(req.query.limit as string) || 10
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')

  let datePattern: string
  if (period === 'week') {
    const dayOfWeek = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const start = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`
    const end = `${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())} 23:59`
    const rows = db.prepare(
      `SELECT * FROM transactions WHERE user_id = ? AND type = 'expense' AND date >= ? AND date <= ? ORDER BY amount DESC LIMIT ?`
    ).all(req.userId, start, end, limit) as unknown as Transaction[]
    res.json(rows)
    return
  }
  if (period === 'year') {
    datePattern = `${now.getFullYear()}-%`
  } else {
    datePattern = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-%`
  }
  const rows = db.prepare(
    `SELECT * FROM transactions WHERE user_id = ? AND type = 'expense' AND date LIKE ? ORDER BY amount DESC LIMIT ?`
  ).all(req.userId, datePattern, limit) as unknown as Transaction[]
  res.json(rows)
})

// 获取单条交易详情
router.get('/:id', (req: AuthRequest, res: Response) => {
  const row = db.prepare(
    'SELECT * FROM transactions WHERE id = ? AND user_id = ?'
  ).get(Number(req.params.id), req.userId) as unknown as Transaction | undefined
  if (!row) {
    res.status(404).json({ error: '记录不存在' })
    return
  }
  res.json(row)
})

// 新增交易
router.post('/', (req: AuthRequest, res: Response) => {
  const { type, category, amount, note, date, oil_price, mileage } = req.body as TransactionInput
  if (!type || !category || !amount || !date) {
    res.status(400).json({ error: '参数不完整' })
    return
  }
  const result = db.prepare(
    'INSERT INTO transactions (user_id, type, category, amount, note, date, oil_price, mileage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(req.userId, type, category, amount, note || '', date, oil_price || null, mileage || null)

  const row = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid) as unknown as Transaction
  res.json(row)
})

// 编辑交易
router.put('/:id', (req: AuthRequest, res: Response) => {
  const { type, category, amount, note, date, oil_price, mileage } = req.body as TransactionInput
  if (!type || !category || !amount || !date) {
    res.status(400).json({ error: '参数不完整' })
    return
  }
  const existing = db.prepare('SELECT id FROM transactions WHERE id = ? AND user_id = ?').get(Number(req.params.id), req.userId)
  if (!existing) {
    res.status(404).json({ error: '记录不存在' })
    return
  }
  db.prepare(
    'UPDATE transactions SET type = ?, category = ?, amount = ?, note = ?, date = ?, oil_price = ?, mileage = ? WHERE id = ? AND user_id = ?'
  ).run(type, category, amount, note || '', date, oil_price || null, mileage || null, Number(req.params.id), req.userId)

  const row = db.prepare('SELECT * FROM transactions WHERE id = ?').get(Number(req.params.id)) as unknown as Transaction
  res.json(row)
})

// 删除交易
router.delete('/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(Number(req.params.id), req.userId)
  res.json({ success: true })
})

export default router
