import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store'
import { api } from '@/api'
import type { MonthlySummary, DailyTransactions } from '@shared/types'
import MonthSelector from '@/components/MonthSelector'
import SummaryCard from '@/components/SummaryCard'
import CategoryIcon from '@/components/CategoryIcon'
import { formatAmount, formatDate } from '@/lib/utils'
import { Inbox } from 'lucide-react'

export default function Transactions() {
  const navigate = useNavigate()
  const { selectedMonth, refreshKey } = useAppStore()
  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [daily, setDaily] = useState<DailyTransactions[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.getSummary(selectedMonth),
      api.getDailyTransactions(selectedMonth),
    ]).then(([s, d]) => {
      setSummary(s)
      setDaily(d)
    }).finally(() => setLoading(false))
  }, [selectedMonth, refreshKey])

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-20">
      <div className="sticky top-0 z-40 bg-[#FAFAF7]">
        <MonthSelector />
        <SummaryCard summary={summary} />
      </div>

      {/* 按日聚合明细 */}
      <div className="mx-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-amber-600 rounded-full animate-spin" />
          </div>
        ) : daily.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Inbox className="w-12 h-12 mb-3" strokeWidth={1.5} />
            <p className="text-sm">本月暂无记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {daily.map((day) => {
              const { day: dayLabel, weekday } = formatDate(day.date)
              return (
                <div key={day.date} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  {/* 日期头 */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">{dayLabel}</span>
                      <span className="text-xs text-gray-400">{weekday}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {day.day_income > 0 && <span className="text-green-500 mr-2">{formatAmount(day.day_income)}</span>}
                      {day.day_expense > 0 && <span className="text-red-500">{formatAmount(day.day_expense)}</span>}
                    </div>
                  </div>
                  {/* 交易列表 */}
                  <div className="divide-y divide-gray-50">
                    {day.items.map((item) => {
                      const timePart = item.date.includes(' ') ? item.date.split(' ')[1] : ''
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigate(`/transaction/${item.id}`)}
                          className="w-full flex items-center gap-3 px-4 py-3 active:bg-gray-50 text-left"
                        >
                          <CategoryIcon name={item.category} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-800">{item.category}</p>
                              {timePart && (
                                <span className="text-xs text-gray-400">{timePart}</span>
                              )}
                            </div>
                            {item.note && <p className="text-xs text-gray-400 truncate">{item.note}</p>}
                          </div>
                          <p className={`text-sm font-semibold ${item.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                            {formatAmount(item.amount)}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
