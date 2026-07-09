import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Delete, Check } from 'lucide-react'
import { api } from '@/api'
import { useAppStore } from '@/store'
import { cn, getCurrentDateTime } from '@/lib/utils'
import { dbCategoryToConfig, type CategoryConfig } from '@/constants/categories'
import type { TransactionType, TransactionInput } from '@shared/types'

// 转换：存储格式 YYYY-MM-DD HH:mm <-> input 格式 YYYY-MM-DDTHH:mm
const toInputDate = (s: string) => s.replace(' ', 'T')
const toStoredDate = (s: string) => s.replace('T', ' ')

export default function Add() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')
  const isEdit = !!editId
  const { triggerRefresh } = useAppStore()

  const [type, setType] = useState<TransactionType>('expense')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<CategoryConfig[]>([])
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(toInputDate(getCurrentDateTime()))
  const [oilPrice, setOilPrice] = useState('')
  const [mileage, setMileage] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  // 按类型加载分类
  useEffect(() => {
    api.getCategories(type).then((cats) => {
      setCategories(cats.map(dbCategoryToConfig))
    })
  }, [type])

  // 编辑模式：加载已有交易
  useEffect(() => {
    if (!editId) return
    api.getTransaction(Number(editId))
      .then((t) => {
        setType(t.type)
        setCategory(t.category)
        setAmount(String(t.amount))
        setNote(t.note || '')
        setDate(toInputDate(t.date))
        setOilPrice(t.oil_price != null ? String(t.oil_price) : '')
        setMileage(t.mileage != null ? String(t.mileage) : '')
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        alert('加载失败')
        navigate(-1)
      })
  }, [editId, navigate])

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType)
    setCategory('')
    setOilPrice('')
    setMileage('')
  }

  const handleDigit = (digit: string) => {
    if (digit === '.') {
      if (amount.includes('.')) return
      if (amount === '') { setAmount('0.'); return }
      setAmount(amount + '.')
      return
    }
    if (amount === '0') {
      setAmount(digit)
      return
    }
    // 限制小数点后两位
    if (amount.includes('.') && amount.split('.')[1]?.length >= 2) return
    setAmount(amount + digit)
  }

  const handleDelete = () => setAmount(amount.slice(0, -1))

  const handleSave = async () => {
    const value = parseFloat(amount)
    if (!category || !value || value <= 0) return
    setSaving(true)
    const data: TransactionInput = {
      type,
      category,
      amount: value,
      note,
      date: toStoredDate(date),
      oil_price: category === '加油' ? (oilPrice ? parseFloat(oilPrice) : null) : null,
      mileage: category === '加油' ? (mileage ? parseFloat(mileage) : null) : null,
    }
    try {
      if (isEdit && editId) {
        await api.updateTransaction(Number(editId), data)
      } else {
        await api.createTransaction(data)
      }
      triggerRefresh()
      navigate(-1)
    } catch {
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const padKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0']

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <span className="text-sm text-gray-400">加载中...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col">
      {/* 顶栏 */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <span className="text-base font-semibold text-gray-900">{isEdit ? '编辑' : '记一笔'}</span>
        <div className="w-8" />
      </div>

      {/* 收支切换 */}
      <div className="flex gap-2 px-4 py-2">
        <button
          onClick={() => handleTypeChange('expense')}
          className={cn(
            'flex-1 py-2 rounded-full text-sm font-medium transition-colors',
            type === 'expense' ? 'bg-red-500 text-white' : 'bg-white text-gray-500'
          )}
        >
          支出
        </button>
        <button
          onClick={() => handleTypeChange('income')}
          className={cn(
            'flex-1 py-2 rounded-full text-sm font-medium transition-colors',
            type === 'income' ? 'bg-green-600 text-white' : 'bg-white text-gray-500'
          )}
        >
          收入
        </button>
      </div>

      {/* 分类横向滚动 */}
      <div className="px-4 py-2">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon
            const selected = category === cat.name
            return (
              <button
                key={cat.name}
                onClick={() => {
                  setCategory(cat.name)
                  setOilPrice('')
                  setMileage('')
                }}
                className="flex flex-col items-center gap-1 shrink-0"
              >
                <span
                  className={cn(
                    'w-11 h-11 rounded-full flex items-center justify-center transition-all',
                    cat.bgColor,
                    selected && 'ring-2 ring-offset-2 ring-amber-600 scale-105'
                  )}
                >
                  <Icon className={cn('w-5 h-5', cat.color)} />
                </span>
                <span className={cn('text-xs whitespace-nowrap', selected ? 'text-gray-900 font-medium' : 'text-gray-500')}>
                  {cat.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 金额 + 日期 一行 */}
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="flex items-baseline shrink-0">
          <span className="text-xs text-gray-400 mr-1">¥</span>
          <span className={cn('text-3xl font-bold', amount ? 'text-gray-900' : 'text-gray-300')}>
            {amount || '0.00'}
          </span>
        </div>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 min-w-0 bg-white rounded-lg px-3 py-2 text-sm text-gray-700 outline-none"
        />
      </div>

      {/* 加油字段：里程 + 单价 一行 / 备注 */}
      <div className="px-4 space-y-2 pb-2">
        {category === '加油' && (
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={oilPrice}
              onChange={(e) => setOilPrice(e.target.value)}
              placeholder="单价(元/升)"
              className="flex-1 min-w-0 bg-white rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none"
            />
            <input
              type="number"
              inputMode="decimal"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="里程(km)"
              className="flex-1 min-w-0 bg-white rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none"
            />
          </div>
        )}
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="添加备注..."
          className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
      </div>

      {/* 数字键盘 */}
      <div className="mt-auto bg-white">
        <div className="grid grid-cols-3">
          {padKeys.map((key) => (
            <button
              key={key}
              onClick={() => handleDigit(key)}
              className="h-14 text-xl font-medium text-gray-800 active:bg-gray-100 border-b border-r border-gray-50"
            >
              {key}
            </button>
          ))}
          <button
            onClick={handleDelete}
            className="h-14 flex items-center justify-center active:bg-gray-100 border-b border-gray-50"
          >
            <Delete className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={!category || !amount || saving}
          className={cn(
            'w-full h-14 flex items-center justify-center gap-2 text-white font-medium transition-colors',
            !category || !amount ? 'bg-gray-300' : 'bg-amber-600 active:bg-amber-700'
          )}
        >
          <Check className="w-5 h-5" />
          <span>{isEdit ? '保存修改' : '确认记一笔'}</span>
        </button>
      </div>
    </div>
  )
}
