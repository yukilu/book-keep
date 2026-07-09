import type {
  Transaction, TransactionInput, GasRecord, GasRecordInput,
  MonthlySummary, DailyTransactions, CategoryStat, DailyTrend, OverviewStats,
  Category, CategoryInput, AuthResponse, LoginInput, RegisterInput, ResetPasswordInput,
} from '@shared/types'

const BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('token')
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${url}`, { headers, ...options })
  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
    throw new Error('登录已过期')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }))
    throw new Error(err.error || '请求失败')
  }
  return res.json()
}

export const api = {
  // 认证
  login: (data: LoginInput) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: RegisterInput) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () =>
    request<{ id: number; username: string; created_at: string }>('/auth/me'),
  resetPassword: (data: ResetPasswordInput) =>
    request<{ success: boolean }>('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

  // 交易
  getTransactions: (month: string) =>
    request<Transaction[]>(`/transactions?month=${month}`),
  getSummary: (month: string) =>
    request<MonthlySummary>(`/transactions/summary?month=${month}`),
  getDailyTransactions: (month: string) =>
    request<DailyTransactions[]>(`/transactions/by-day?month=${month}`),
  getTransaction: (id: number) =>
    request<Transaction>(`/transactions/${id}`),
  createTransaction: (data: TransactionInput) =>
    request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: (id: number, data: TransactionInput) =>
    request<Transaction>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTransaction: (id: number) =>
    request<{ success: boolean }>(`/transactions/${id}`, { method: 'DELETE' }),

  // 加油（从交易中筛选）
  getGasMonthly: () =>
    request<{ month: string; count: number; total_amount: number; total_liters: number; fuel_consumption: number | null }[]>('/transactions/gas/monthly'),
  getGasByMonth: (month: string) =>
    request<Transaction[]>(`/transactions/gas/${month}`),
  getTopExpenses: (period: 'week' | 'month' | 'year', limit: number = 10) =>
    request<Transaction[]>(`/transactions/top-expenses?period=${period}&limit=${limit}`),

  // 图表
  getCategoryStats: (month: string, type: string = 'expense') =>
    request<CategoryStat[]>(`/charts/category?month=${month}&type=${type}`),
  getTrend: (month: string) =>
    request<DailyTrend[]>(`/charts/trend?month=${month}`),
  getExpenseTrend: (period: 'week' | 'month' | 'year') =>
    request<{ total: number; trend: { label: string; expense: number }[] }>(`/charts/expense?period=${period}`),
  getCategoryByPeriod: (period: 'week' | 'month' | 'year') =>
    request<CategoryStat[]>(`/charts/category-by-period?period=${period}`),

  // 加油
  getGasRecords: () =>
    request<GasRecord[]>('/gas'),
  createGasRecord: (data: GasRecordInput) =>
    request<GasRecord>('/gas', { method: 'POST', body: JSON.stringify(data) }),
  deleteGasRecord: (id: number) =>
    request<{ success: boolean }>(`/gas/${id}`, { method: 'DELETE' }),

  // 总览
  getOverview: () =>
    request<OverviewStats>('/stats/overview'),

  // 分类
  getCategories: (type?: string) =>
    request<Category[]>(type ? `/categories?type=${type}` : '/categories'),
  createCategory: (data: CategoryInput & { bg_color?: string }) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number, data: CategoryInput & { bg_color?: string }) =>
    request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: number) =>
    request<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE' }),
}
