import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Delete, Plus, Minus } from 'lucide-react'
import { api } from '@/api'
import { useAppStore } from '@/store'
import { cn, getCurrentDateTime } from '@/lib/utils'
import { dbCategoryToConfig, type CategoryConfig } from '@/constants/categories'
import type { TransactionType, TransactionInput } from '@shared/types'

// 转换：存储格式 YYYY-MM-DD HH:mm <-> input 格式 YYYY-MM-DDTHH:mm
const toInputDate = (s: string) => s.replace(' ', 'T')
const toStoredDate = (s: string) => s.replace('T', ' ')

// 格式化数字显示：去掉多余的零
const formatNum = (n: number): string => {
  return parseFloat(n.toFixed(2)).toString()
}

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
  const [result, setResult] = useState<number | null>(null)
  const [pendingOp, setPendingOp] = useState<'+' | '-' | null>(null)
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

  const handleOp = (op: '+' | '-') => {
    const cur = parseFloat(amount) || 0
    if (result === null) {
      setResult(cur)
    } else if (amount !== '') {
      setResult(pendingOp === '-' ? result - cur : result + cur)
    }
    setAmount('')
    setPendingOp(op)
  }

  const handleClear = () => {
    setAmount('')
    setResult(null)
    setPendingOp(null)
  }

  // 等号：完成当前运算，结果显示在金额区
  const handleEquals = () => {
    if (result === null || pendingOp === null) return
    const cur = parseFloat(amount)
    if (!isNaN(cur) && amount !== '') {
      setResult(pendingOp === '-' ? result - cur : result + cur)
    }
    setAmount('')
    setPendingOp(null)
  }

  // 显示值：有运算结果且当前无输入时显示结果，否则显示当前输入
  const displayValue = result !== null && amount === ''
    ? formatNum(result)
    : (amount || '0.00')

  // 计算最终金额
  const getFinalAmount = (): number => {
    if (result !== null) {
      const cur = parseFloat(amount)
      if (!isNaN(cur) && amount !== '') {
        return pendingOp === '-' ? result - cur : result + cur
      }
      return result
    }
    return parseFloat(amount) || 0
  }

  const handleSave = async () => {
    const value = getFinalAmount()
    if (!category || !value || value <= 0) return
    setSaving(true)
    const data: TransactionInput = {
      type,
      category,
      amount: value,
      note,
      date: toStoredDate(date),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <span className="text-sm text-gray-400">加载中...</span>
      </div>
    )
  }

  const canSave = !!category && getFinalAmount() > 0 && !saving
  // 有未完成的运算时显示等号，运算完成后显示完成
  const hasPendingOp = pendingOp !== null && (amount !== '' || result !== null)
  const doneLabel = hasPendingOp ? '=' : '完成'
  const doneAction = hasPendingOp ? handleEquals : handleSave
  const doneDisabled = hasPendingOp ? (result === null || amount === '') : !canSave

  // 键盘布局：4列，最后一列为 +/-/C/完成(或=)
  const keypad = [
    { label: '1', action: () => handleDigit('1') },
    { label: '2', action: () => handleDigit('2') },
    { label: '3', action: () => handleDigit('3') },
    { label: '+', action: () => handleOp('+'), icon: Plus },
    { label: '4', action: () => handleDigit('4') },
    { label: '5', action: () => handleDigit('5') },
    { label: '6', action: () => handleDigit('6') },
    { label: '-', action: () => handleOp('-'), icon: Minus },
    { label: '7', action: () => handleDigit('7') },
    { label: '8', action: () => handleDigit('8') },
    { label: '9', action: () => handleDigit('9') },
    { label: 'C', action: handleClear, isClear: true },
    { label: '.', action: () => handleDigit('.') },
    { label: '0', action: () => handleDigit('0') },
    { label: 'del', action: handleDelete, icon: Delete },
    { label: doneLabel, action: doneAction, isDone: true, disabled: doneDisabled },
  ]

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

      {/* 标签平铺 */}
      <div className="px-4 py-2">
        <div className="grid grid-cols-5 gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon
            const selected = category === cat.name
            return (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                className="flex flex-col items-center gap-1"
              >
                <span
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    cat.bgColor,
                    selected && 'ring-2 ring-offset-2 ring-amber-600 scale-105'
                  )}
                >
                  <Icon className={cn('w-4 h-4', cat.color)} />
                </span>
                <span className={cn('text-[10px] truncate w-full text-center', selected ? 'text-gray-900 font-medium' : 'text-gray-500')}>
                  {cat.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 金额单独一行 */}
      <div className="px-4 py-3 text-center">
        {pendingOp && (
          <span className="text-sm text-gray-400 mr-1">
            {result !== null ? formatNum(result) : ''} {pendingOp}
          </span>
        )}
        <span className="text-xs text-gray-400 mr-1">¥</span>
        <span className={cn('text-3xl font-bold', displayValue !== '0.00' ? 'text-gray-900' : 'text-gray-300')}>
          {displayValue}
        </span>
      </div>

      {/* 日期 + 备注 */}
      <div className="px-4 space-y-2 pb-2">
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-700 outline-none"
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="添加备注..."
          className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
      </div>

      {/* 计算器键盘 4列 */}
      <div className="mt-auto bg-white">
        <div className="grid grid-cols-4">
          {keypad.map((key, idx) => {
            const Icon = key.icon
            if (key.isDone) {
              return (
                <button
                  key={idx}
                  onClick={key.action}
                  disabled={key.disabled}
                  className={cn(
                    'h-14 flex items-center justify-center text-sm font-medium transition-colors',
                    key.disabled ? 'bg-gray-200 text-gray-400' : 'bg-amber-600 text-white active:bg-amber-700'
                  )}
                >
                  {key.label}
                </button>
              )
            }
            return (
              <button
                key={idx}
                onClick={key.action}
                className={cn(
                  'h-14 flex items-center justify-center text-xl font-medium text-gray-800 active:bg-gray-100 border-b border-r border-gray-50',
                  key.isClear && 'text-amber-600'
                )}
              >
                {Icon ? <Icon className="w-5 h-5 text-gray-600" /> : key.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
