import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, TrendingUp, TrendingDown, FileText, Lock, LogOut, X } from 'lucide-react'
import { api } from '@/api'
import { useAppStore } from '@/store'
import { formatAmount, cn } from '@/lib/utils'
import type { OverviewStats } from '@shared/types'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAppStore()
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [showPwdModal, setShowPwdModal] = useState(false)
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)

  useEffect(() => {
    api.getOverview().then(setStats)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleResetPassword = async () => {
    if (!oldPwd || !newPwd || !confirmPwd) return
    if (newPwd !== confirmPwd) {
      alert('两次输入的新密码不一致')
      return
    }
    setPwdLoading(true)
    try {
      await api.resetPassword({ old_password: oldPwd, new_password: newPwd })
      alert('密码修改成功')
      setShowPwdModal(false)
      setOldPwd('')
      setNewPwd('')
      setConfirmPwd('')
    } catch {
      alert('密码修改失败，请检查原密码是否正确')
    } finally {
      setPwdLoading(false)
    }
  }

  const items = [
    { label: '记账笔数', value: stats?.count ?? 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: '总收入', value: `¥${formatAmount(stats?.income ?? 0)}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { label: '总支出', value: `¥${formatAmount(stats?.expense ?? 0)}`, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-100' },
  ]

  const menus = [
    { label: '重置密码', icon: Lock, color: 'text-blue-600', bg: 'bg-blue-100', onClick: () => setShowPwdModal(true) },
    { label: '退出登录', icon: LogOut, color: 'text-red-500', bg: 'bg-red-100', onClick: handleLogout },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-20 pt-3">
      {/* 用户卡片 */}
      <div className="mx-4 mb-3 bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base font-semibold">{user?.username || '记账用户'}</p>
            <p className="text-xs text-amber-100">坚持记账，理财有道</p>
          </div>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="mx-4 mb-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">数据概览</h3>
          <div className="space-y-2.5">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.bg}`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 菜单 */}
      <div className="mx-4 mb-3">
        <div className="bg-white rounded-2xl p-1.5 shadow-sm">
          {menus.map((m) => {
            const Icon = m.icon
            return (
              <button
                key={m.label}
                onClick={m.onClick}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl active:bg-gray-50"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.bg}`}>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <span className="text-sm text-gray-700 flex-1 text-left">{m.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 关于 */}
      <div className="mx-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">关于</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">应用名称</span>
              <span className="text-gray-700">记账本</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">版本</span>
              <span className="text-gray-700">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">技术栈</span>
              <span className="text-gray-700">React + Node.js</span>
            </div>
          </div>
        </div>
      </div>

      {/* 重置密码弹窗 */}
      {showPwdModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          onClick={() => setShowPwdModal(false)}
        >
          <div
            className="w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">重置密码</h3>
              <button onClick={() => setShowPwdModal(false)} className="w-8 h-8 flex items-center justify-center">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="password"
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
                placeholder="原密码"
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none"
              />
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="新密码"
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none"
              />
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="确认新密码"
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none"
              />
            </div>
            <button
              onClick={handleResetPassword}
              disabled={!oldPwd || !newPwd || !confirmPwd || pwdLoading}
              className={cn(
                'w-full py-3 rounded-xl text-white text-sm font-medium mt-4 transition-colors',
                !oldPwd || !newPwd || !confirmPwd ? 'bg-gray-300' : 'bg-amber-600 active:bg-amber-700'
              )}
            >
              {pwdLoading ? '提交中...' : '确认修改'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
