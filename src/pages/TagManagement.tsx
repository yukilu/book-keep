import { useEffect, useState } from 'react'
import { Trash2, Plus, X, Check } from 'lucide-react'
import { api } from '@/api'
import { cn } from '@/lib/utils'
import { dbCategoryToConfig, AVAILABLE_ICONS, AVAILABLE_COLORS } from '@/constants/categories'
import type { TransactionType, Category } from '@shared/types'

export default function TagManagement() {
  const [type, setType] = useState<TransactionType>('expense')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState(AVAILABLE_ICONS[0].name)
  const [newColorIdx, setNewColorIdx] = useState(0)
  const [saving, setSaving] = useState(false)

  const loadCategories = () => {
    setLoading(true)
    api.getCategories(type)
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCategories()
  }, [type])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`确定删除「${name}」标签吗？`)) return
    try {
      await api.deleteCategory(id)
      loadCategories()
    } catch {
      alert('删除失败')
    }
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    setSaving(true)
    const color = AVAILABLE_COLORS[newColorIdx]
    try {
      await api.createCategory({
        type,
        name: newName.trim(),
        icon: newIcon,
        color: color.color,
        bg_color: color.bgColor,
      })
      setShowAdd(false)
      setNewName('')
      setNewIcon(AVAILABLE_ICONS[0].name)
      setNewColorIdx(0)
      loadCategories()
    } catch {
      alert('添加失败')
    } finally {
      setSaving(false)
    }
  }

  const handleCloseAdd = () => {
    setShowAdd(false)
    setNewName('')
    setNewIcon(AVAILABLE_ICONS[0].name)
    setNewColorIdx(0)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-20">
      {/* 标题 */}
      <div className="px-4 py-3">
        <h1 className="text-base font-semibold text-gray-900">标签管理</h1>
      </div>

      {/* 收支切换 */}
      <div className="flex gap-2 px-4 pb-3">
        <button
          onClick={() => setType('expense')}
          className={cn(
            'flex-1 py-2.5 rounded-full text-sm font-medium transition-colors',
            type === 'expense' ? 'bg-red-500 text-white' : 'bg-white text-gray-500'
          )}
        >
          支出
        </button>
        <button
          onClick={() => setType('income')}
          className={cn(
            'flex-1 py-2.5 rounded-full text-sm font-medium transition-colors',
            type === 'income' ? 'bg-green-600 text-white' : 'bg-white text-gray-500'
          )}
        >
          收入
        </button>
      </div>

      {/* 标签网格 */}
      <div className="px-4">
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat) => {
            const cfg = dbCategoryToConfig(cat)
            const Icon = cfg.icon
            return (
              <div key={cat.id} className="flex flex-col items-center gap-1.5 relative">
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center z-10 active:bg-gray-500"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
                <span className={cn('w-12 h-12 rounded-full flex items-center justify-center', cfg.bgColor)}>
                  <Icon className={cn('w-5 h-5', cfg.color)} />
                </span>
                <span className="text-xs text-gray-500">{cfg.name}</span>
              </div>
            )
          })}
          {/* 添加标签 */}
          <button onClick={() => setShowAdd(true)} className="flex flex-col items-center gap-1.5">
            <span className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 border border-dashed border-gray-300">
              <Plus className="w-5 h-5 text-gray-400" />
            </span>
            <span className="text-xs text-gray-400">添加标签</span>
          </button>
        </div>
        {loading && <p className="text-center text-sm text-gray-400 mt-8">加载中...</p>}
        {!loading && categories.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-8">暂无标签，点击添加</p>
        )}
      </div>

      {/* 添加标签弹窗 */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          onClick={handleCloseAdd}
        >
          <div
            className="w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">添加标签</h3>
              <button onClick={handleCloseAdd} className="w-8 h-8 flex items-center justify-center">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* 名称 */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-2 block">标签名称</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="输入标签名称"
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none"
              />
            </div>

            {/* 图标选择 */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-2 block">选择图标</label>
              <div className="grid grid-cols-5 gap-2">
                {AVAILABLE_ICONS.map((item) => {
                  const Icon = item.icon
                  const selected = newIcon === item.name
                  return (
                    <button
                      key={item.name}
                      onClick={() => setNewIcon(item.name)}
                      className={cn(
                        'aspect-square rounded-xl flex items-center justify-center',
                        selected ? 'bg-amber-100 ring-2 ring-amber-600' : 'bg-gray-50'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', selected ? 'text-amber-600' : 'text-gray-500')} />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 颜色选择 */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-2 block">选择颜色</label>
              <div className="grid grid-cols-6 gap-2">
                {AVAILABLE_COLORS.map((c, idx) => {
                  const selected = newColorIdx === idx
                  return (
                    <button
                      key={c.color}
                      onClick={() => setNewColorIdx(idx)}
                      className={cn(
                        'aspect-square rounded-xl flex items-center justify-center',
                        c.bgColor,
                        selected && 'ring-2 ring-offset-1 ring-amber-600'
                      )}
                    >
                      {selected && <Check className={cn('w-4 h-4', c.color)} />}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!newName.trim() || saving}
              className={cn(
                'w-full py-3 rounded-xl text-white text-sm font-medium transition-colors',
                !newName.trim() ? 'bg-gray-300' : 'bg-amber-600 active:bg-amber-700'
              )}
            >
              {saving ? '提交中...' : '确认添加'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
