import type { MonthlySummary } from '@shared/types'
import { formatAmount } from '@/lib/utils'

export default function SummaryCard({ summary }: { summary: MonthlySummary | null }) {
  return (
    <div className="mx-4 mb-4 bg-white rounded-2xl p-5 shadow-sm">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-gray-400 mb-1">收入</p>
          <p className="text-sm font-semibold text-green-600">
            {summary ? formatAmount(summary.income) : '0.00'}
          </p>
        </div>
        <div className="border-x border-gray-100">
          <p className="text-xs text-gray-400 mb-1">支出</p>
          <p className="text-sm font-semibold text-red-500">
            {summary ? formatAmount(summary.expense) : '0.00'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">结余</p>
          <p className="text-sm font-semibold text-gray-900">
            {summary ? formatAmount(summary.balance) : '0.00'}
          </p>
        </div>
      </div>
    </div>
  )
}
