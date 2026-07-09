import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { api } from '@/api'
import { useAppStore } from '@/store'
import CategoryIcon from '@/components/CategoryIcon'
import { formatAmount, cn } from '@/lib/utils'
import type { Transaction } from '@shared/types'

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { triggerRefresh } = useAppStore()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.getTransaction(Number(id))
      .then(setTransaction)
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.deleteTransaction(Number(id))
      triggerRefresh()
      navigate('/')
    } catch {
      alert('删除失败，请重试')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-amber-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-[#FAFAF7]">
        <div className="flex items-center justify-between px-4 py-3 bg-white">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <span className="text-base font-semibold text-gray-900">账单详情</span>
          <div className="w-8" />
        </div>
        <div className="flex items-center justify-center py-20 text-gray-400">
          <p className="text-sm">未找到该记录</p>
        </div>
      </div>
    )
  }

  const isIncome = transaction.type === 'income'

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col">
      {/* 顶栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <span className="text-base font-semibold text-gray-900">账单详情</span>
        <div className="w-8" />
      </div>

      {/* 详情卡片 */}
      <div className="flex-1 px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center">
          <CategoryIcon name={transaction.category} size="lg" />
          <p className="mt-3 text-sm text-gray-500">{transaction.category}</p>
          <p className={cn('mt-2 text-3xl font-bold', isIncome ? 'text-green-600' : 'text-red-500')}>
            {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
          </p>
          <p className="mt-1 text-xs text-gray-400">{isIncome ? '收入' : '支出'}</p>
        </div>

        {/* 信息行 */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-400">时间</span>
            <span className="text-sm text-gray-800">{transaction.date}</span>
          </div>
          {transaction.category === '加油' && transaction.oil_price != null && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-400">油价</span>
              <span className="text-sm text-gray-800">{transaction.oil_price.toFixed(2)} 元/升</span>
            </div>
          )}
          {transaction.category === '加油' && transaction.mileage != null && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-400">里程数</span>
              <span className="text-sm text-gray-800">{transaction.mileage} km</span>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-400">备注</span>
            <span className="text-sm text-gray-800 max-w-[60%] text-right break-all">
              {transaction.note || '无'}
            </span>
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="flex gap-3 px-4 py-3 bg-white border-t border-gray-50">
        <button
          onClick={() => navigate(`/add?id=${id}`)}
          className="flex-1 py-3 rounded-full border border-gray-200 text-sm font-medium text-gray-700 active:bg-gray-50"
        >
          编辑
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="flex-1 py-3 rounded-full bg-red-500 text-white text-sm font-medium active:bg-red-600"
        >
          删除
        </button>
      </div>

      {/* 删除确认弹窗 */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl w-72 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-base font-medium text-gray-900">确认删除</p>
            <p className="mt-2 text-center text-sm text-gray-500">删除后无法恢复，确定要删除吗？</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-full bg-gray-100 text-sm text-gray-600 active:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={cn(
                  'flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm active:bg-red-600',
                  deleting && 'opacity-60'
                )}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
