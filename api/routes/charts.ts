import { Router, type Response } from 'express'
import { db } from '../db.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'
import type { CategoryStat, DailyTrend } from '@shared/types'

const router = Router()

router.use(authMiddleware)

// 获取分类统计
router.get('/category', (req: AuthRequest, res: Response) => {
  const month = req.query.month as string
  const type = (req.query.type as string) || 'expense'
  if (!month) {
    res.status(400).json({ error: '缺少 month 参数' })
    return
  }
  const rows = db.prepare(
    `SELECT category, SUM(amount) as amount FROM transactions
     WHERE user_id = ? AND type = ? AND date LIKE ?
     GROUP BY category ORDER BY amount DESC`
  ).all(req.userId, type, `${month}%`) as { category: string; amount: number }[]

  const total = rows.reduce((s, r) => s + r.amount, 0)
  const result: CategoryStat[] = rows.map(r => ({
    category: r.category,
    amount: r.amount,
    percentage: total > 0 ? (r.amount / total) * 100 : 0,
  }))

  res.json(result)
})

// 获取每日趋势
router.get('/trend', (req: AuthRequest, res: Response) => {
  const month = req.query.month as string
  if (!month) {
    res.status(400).json({ error: '缺少 month 参数' })
    return
  }
  const rows = db.prepare(
    'SELECT date, type, amount FROM transactions WHERE user_id = ? AND date LIKE ? ORDER BY date ASC'
  ).all(req.userId, `${month}%`) as { date: string; type: string; amount: number }[]

  const grouped: Record<string, { income: number; expense: number }> = {}
  for (const row of rows) {
    const dayKey = row.date.split(' ')[0]
    if (!grouped[dayKey]) grouped[dayKey] = { income: 0, expense: 0 }
    if (row.type === 'income') grouped[dayKey].income += row.amount
    else grouped[dayKey].expense += row.amount
  }

  const result: DailyTrend[] = Object.entries(grouped).map(([date, v]) => ({
    date,
    income: v.income,
    expense: v.expense,
  }))

  res.json(result)
})

// 按周/月/年统计支出趋势
router.get('/expense', (req: AuthRequest, res: Response) => {
  const period = (req.query.period as string) || 'month'
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')

  if (period === 'week') {
    // 获取本周周一到周日
    const dayOfWeek = now.getDay() // 0=Sunday
    const monday = new Date(now)
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const startDate = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`
    const endDate = `${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())}`

    const rows = db.prepare(
      `SELECT substr(date, 1, 10) as day, SUM(amount) as expense FROM transactions
       WHERE user_id = ? AND type = 'expense' AND date >= ? AND date <= ?
       GROUP BY day`
    ).all(req.userId, startDate, endDate + ' 23:59') as { day: string; expense: number }[]

    const expenseMap: Record<string, number> = {}
    for (const row of rows) expenseMap[row.day] = row.expense

    const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    let total = 0
    const trend: { label: string; expense: number }[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const dayKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      const expense = expenseMap[dayKey] || 0
      total += expense
      trend.push({ label: weekdays[i], expense })
    }
    res.json({ total, trend })
    return
  }

  if (period === 'year') {
    const year = now.getFullYear()
    const rows = db.prepare(
      `SELECT substr(date, 1, 7) as month, SUM(amount) as expense FROM transactions
       WHERE user_id = ? AND type = 'expense' AND date LIKE ?
       GROUP BY month ORDER BY month ASC`
    ).all(req.userId, `${year}-%`) as { month: string; expense: number }[]

    const expenseMap: Record<string, number> = {}
    for (const row of rows) expenseMap[row.month] = row.expense

    let total = 0
    const trend: { label: string; expense: number }[] = []
    for (let m = 1; m <= 12; m++) {
      const monthKey = `${year}-${pad(m)}`
      const expense = expenseMap[monthKey] || 0
      total += expense
      trend.push({ label: `${m}月`, expense })
    }
    res.json({ total, trend })
    return
  }

  // 默认 month
  const month = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
  const rows = db.prepare(
    `SELECT substr(date, 1, 10) as day, SUM(amount) as expense FROM transactions
     WHERE user_id = ? AND type = 'expense' AND date LIKE ?
     GROUP BY day ORDER BY day ASC`
  ).all(req.userId, `${month}-%`) as { day: string; expense: number }[]

  const expenseMap: Record<string, number> = {}
  for (const row of rows) expenseMap[row.day] = row.expense

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  let total = 0
  const trend: { label: string; expense: number }[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    const dayKey = `${month}-${pad(d)}`
    const expense = expenseMap[dayKey] || 0
    total += expense
    trend.push({ label: String(d), expense })
  }
  res.json({ total, trend })
})

// 按周/月/年统计分类支出占比
router.get('/category-by-period', (req: AuthRequest, res: Response) => {
  const period = (req.query.period as string) || 'month'
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')

  let datePattern: string
  let rows: { category: string; amount: number }[]

  if (period === 'week') {
    const dayOfWeek = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const start = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`
    const end = `${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())} 23:59`
    rows = db.prepare(
      `SELECT category, SUM(amount) as amount FROM transactions
       WHERE user_id = ? AND type = 'expense' AND date >= ? AND date <= ?
       GROUP BY category ORDER BY amount DESC`
    ).all(req.userId, start, end) as { category: string; amount: number }[]
  } else if (period === 'year') {
    datePattern = `${now.getFullYear()}-%`
    rows = db.prepare(
      `SELECT category, SUM(amount) as amount FROM transactions
       WHERE user_id = ? AND type = 'expense' AND date LIKE ?
       GROUP BY category ORDER BY amount DESC`
    ).all(req.userId, datePattern) as { category: string; amount: number }[]
  } else {
    datePattern = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-%`
    rows = db.prepare(
      `SELECT category, SUM(amount) as amount FROM transactions
       WHERE user_id = ? AND type = 'expense' AND date LIKE ?
       GROUP BY category ORDER BY amount DESC`
    ).all(req.userId, datePattern) as { category: string; amount: number }[]
  }

  const total = rows.reduce((s, r) => s + r.amount, 0)
  const result: CategoryStat[] = rows.map(r => ({
    category: r.category,
    amount: r.amount,
    percentage: total > 0 ? (r.amount / total) * 100 : 0,
  }))

  res.json(result)
})

export default router
