import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Fuel } from 'lucide-react'
import { api } from '@/api'
import { formatAmount, formatDate } from '@/lib/utils'
import type { Transaction } from '@shared/types'

export default function GasDetail() {
  const { month } = useParams<{ month: string }>()
  const navigate = useNavigate()
  const [records, setRecords] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!month) return
    setLoading(true)
    api.getGasByMonth(month)
      .then(setRecords)
      .finally(() => setLoading(false))
  }, [month])

  const monthLabel = month ? formatMonthLabelLocal(month) : ''

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-20">
      {/* 顶栏 */}
      <div className="sticky top-0 z-40 bg-[#FAFAF7] px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <span className="text-base font-semibold text-gray-900">{monthLabel}加油明细</span>
        <div className="w-8" />
      </div>

      <div className="mx-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-amber-600 rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Fuel className="w-12 h-12 mb-3" strokeWidth={1.5} />
            <p className="text-sm">本月暂无加油记录</p>
          </div>
        ) : (
          records.map((r) => {
            const { day, weekday } = formatDate(r.date)
            const timePart = r.date.includes(' ') ? r.date.split(' ')[1] : ''
            const liters = r.oil_price ? r.amount / r.oil_price : 0
            return (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm p-4">
                <p className="text-sm font-medium text-gray-800 mb-3">{day} {weekday}{timePart && <span className="text-xs text-gray-400 ml-1">{timePart}</span>}</p>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <p className="text-xs text-gray-400">金额</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">¥{formatAmount(r.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">油价</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">
                      {r.oil_price ? `${r.oil_price.toFixed(2)}元/升` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">升数</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">
                      {r.oil_price ? `${liters.toFixed(1)}L` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">里程</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">
                      {r.mileage ? `${r.mileage}km` : '-'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function formatMonthLabelLocal(month: string): string {
  const [year, m] = month.split('-')
  return `${year}年${parseInt(m)}月`
}
