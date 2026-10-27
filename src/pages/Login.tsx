import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, User, Lock } from 'lucide-react'
import { api } from '@/api'
import { useAppStore } from '@/store'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAppStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!username || !password) {
      setError('请输入用户名和密码')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = mode === 'login'
        ? await api.login({ username, password })
        : await api.register({ username, password })
      setAuth(res.token, res.user)
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-600/20 mb-4">
          <Wallet className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">钱迹</h1>
        <p className="text-sm text-gray-400 mt-1">坚持记账，理财有道</p>
      </div>

      {/* 表单卡片 */}
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm">
        {/* 切换 */}
        <div className="flex gap-2 mb-6 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'login' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'}`}
          >
            登录
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'register' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'}`}
          >
            注册
          </button>
        </div>

        {/* 输入框 */}
        <div className="space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="用户名"
              className="w-full bg-gray-50 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:bg-gray-100"
              maxLength={20}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={mode === 'register' ? '密码（至少6位）' : '密码'}
              className="w-full bg-gray-50 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:bg-gray-100"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-amber-600 text-white font-medium active:bg-amber-700 mt-4 disabled:opacity-50"
        >
          {loading ? '请稍候...' : mode === 'login' ? '登录' : '注册'}
        </button>
      </div>

    </div>
  )
}
