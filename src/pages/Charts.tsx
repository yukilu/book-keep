import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { api } from '@/api'
import { formatAmount } from '@/lib/utils'
import { CHART_COLORS, getCategoryConfig } from '@/constants/categories'
import { BarChart3 } from 'lucide-react'
import type { CategoryStat, Transaction } from '@shared/types'

type Period = 'week' | 'month' | 'year'

const TABS: { key: Period; label: string }[] = [
  { key: 'week', label: '周' },
  { key: 'month', label: '月' },
  { key: 'year', label: '年' },
]

export default function Charts() {
  const [period, setPeriod] = useState<Period>('month')
  const [data, setData] = useState<{ total: number; trend: { label: string; expense: number }[] } | null>(null)
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([])
  const [topExpenses, setTopExpenses] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.getExpenseTrend(period),
      api.getCategoryByPeriod(period),
      api.getTopExpenses(period, 10),
    ]).then(([d, cs, te]) => {
      setData(d)
      setCategoryStats(cs)
      setTopExpenses(te)
    }).finally(() => setLoading(false))
  }, [period])

  const isEmpty = data ? data.total === 0 && data.trend.every((t) => t.expense === 0) : true

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-20">
      {/* Tabs */}
      <div className="sticky top-0 z-40 bg-[#FAFAF7] px-4 py-3">
        <div className="flex gap-1 bg-gray-100 rounded-full p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${period === tab.key ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-amber-600 rounded-full animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <BarChart3 className="w-12 h-12 mb-3" strokeWidth={1.5} />
          <p className="text-sm">暂无数据</p>
        </div>
      ) : (
        <div className="mx-4 space-y-4">
          {/* 支出分类扇形图 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">支出分类</h3>
            {categoryStats.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="relative w-36 h-36 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryStats}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={68}
                        paddingAngle={2}
                      >
                        {categoryStats.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatAmount(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-gray-400">总支出</span>
                    <span className="text-sm font-semibold text-gray-800">{formatAmount(data?.total ?? 0)}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  {categoryStats.slice(0, 6).map((stat, i) => {
                    const config = getCategoryConfig(stat.category)
                    return (
                      <div key={stat.category} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-xs text-gray-600 flex-1 truncate">{config.name}</span>
                        <span className="text-xs text-gray-400">{stat.percentage.toFixed(1)}%</span>
                        <span className="text-xs font-medium text-gray-700">{formatAmount(stat.amount)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">暂无支出数据</p>
            )}
          </div>

          {/* 趋势折线图 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">支出趋势</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data?.trend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip formatter={(v: number) => formatAmount(v)} />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#D97706"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#D97706' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 支出排行 Top 10 */}
          {topExpenses.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">支出排行 Top 10</h3>
              <div className="space-y-3">
                {topExpenses.map((item, idx) => {
                  const dateStr = item.date.includes(' ') ? item.date.split(' ')[0] : item.date
                  const d = new Date(dateStr)
                  const dateLabel = `${d.getMonth() + 1}/${d.getDate()}`
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${idx < 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                        {idx + 1}
                      </span>
                      <span className="text-sm text-gray-700 shrink-0">{item.category}</span>
                      <span className="text-xs text-gray-400 flex-1 min-w-0 truncate">{dateLabel}{item.note ? ` · ${item.note}` : ''}</span>
                      <p className="text-sm font-semibold text-red-500">{formatAmount(item.amount)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
