// 收支类型
export type TransactionType = 'income' | 'expense'

// 用户
export interface User {
  id: number
  username: string
  created_at: string
}

// 交易记录
export interface Transaction {
  id: number
  user_id: number
  type: TransactionType
  category: string
  amount: number
  note: string
  date: string // YYYY-MM-DD HH:mm
  created_at: string
}

// 新增/编辑交易输入
export interface TransactionInput {
  type: TransactionType
  category: string
  amount: number
  note?: string
  date: string // YYYY-MM-DD HH:mm
}

// 月度汇总
export interface MonthlySummary {
  income: number
  expense: number
  balance: number
}

// 按日聚合的交易
export interface DailyTransactions {
  date: string
  day_income: number
  day_expense: number
  items: Transaction[]
}

// 分类统计
export interface CategoryStat {
  category: string
  amount: number
  percentage: number
}

// 每日趋势
export interface DailyTrend {
  date: string
  income: number
  expense: number
}

// 总览统计
export interface OverviewStats {
  count: number
  income: number
  expense: number
}

// 自定义分类
export interface Category {
  id: number
  user_id: number
  type: TransactionType
  name: string
  icon: string
  color: string
  bg_color: string
  sort_order: number
}

export interface CategoryInput {
  type: TransactionType
  name: string
  icon: string
  color: string
  sort_order?: number
}

// 认证相关
export interface AuthResponse {
  token: string
  user: User
}

export interface LoginInput {
  username: string
  password: string
}

export interface RegisterInput {
  username: string
  password: string
}

export interface ResetPasswordInput {
  old_password: string
  new_password: string
}
