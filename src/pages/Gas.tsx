import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Fuel } from 'lucide-react'
import { api } from '@/api'
import { useAppStore } from '@/store'
import { formatAmount, formatMonthLabel } from '@/lib/utils'

interface GasMonthly {
  month: string
  count: number
  total_amount: number
  total_liters: number
  fuel_consumption: number | null
}

export default function Gas() {
  const navigate = useNavigate()
  const { refreshKey } = useAppStore()
  const [months, setMonths] = useState<GasMonthly[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getGasMonthly()
      .then((data) => setMonths([...data].sort((a, b) => b.month.localeCompare(a.month))))
      .finally(() => setLoading(false))
  }, [refreshKey])

  return (
    <div className="bg-[#FAFAF7] pb-20 min-h-screen overflow-hidden">
      <div className="mx-4 mt-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-amber-600 rounded-full animate-spin" />
          </div>
        ) : months.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Fuel className="w-12 h-12 mb-3" strokeWidth={1.5} />
            <p className="text-sm">暂无加油记录</p>
          </div>
        ) : (
          months.map((m) => (
            <button
              key={m.month}
              onClick={() => navigate(`/gas/${m.month}`)}
              className="w-full bg-white rounded-2xl shadow-sm p-4 text-left active:bg-gray-50 transition-colors"
            >
              <div className="mb-3">
                <span className="text-base font-semibold text-gray-900">{formatMonthLabel(m.month)}</span>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                <div>
                  <p className="text-xs text-gray-400">加油次数</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{m.count}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">总油费</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">¥{formatAmount(m.total_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">总升数</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{m.total_liters.toFixed(1)}L</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">油耗</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    {m.fuel_consumption !== null ? `${m.fuel_consumption.toFixed(1)} L/100km` : '-'}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
